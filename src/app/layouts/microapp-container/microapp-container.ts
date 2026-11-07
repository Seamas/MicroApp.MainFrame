import {
  Component,
  ElementRef,
  ViewChild,
  Renderer2,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { PermissionService } from '../../core/services/permission.service';
import { Menu } from '../../core/models/requests/menu.model';

@Component({
  selector: 'app-microapp-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './microapp-container.html',
  styleUrls: ['./microapp-container.scss'],
})
export class MicroAppContainerComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef;

  private microAppElement: any;
  private microAppName = 'sub-app';
  private basePath = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2,
    private permissionService: PermissionService,
  ) {}

  async ngOnInit(): Promise<void> {
    let microAppUrl = this.route.snapshot.data['microAppUrl'];
    let microAppName = this.route.snapshot.data['microAppName'];

    if (!microAppUrl) {
      const menu = await this.resolveMenu();
      if (!menu?.path) {
        return;
      }

      this.basePath = menu.path.replace(/^\//, '');
      microAppName = this.basePath.replace(/\//g, '-');
      microAppUrl = menu.microAppUrl?.startsWith('http')
        ? menu.microAppUrl
        : menu.microAppUrl?.startsWith('/')
          ? `${window.location.origin}${menu.microAppUrl}`
          : `${window.location.origin}/${this.basePath}`;
    } else {
      this.basePath = (microAppName || '').replace(/\//g, '-');
    }

    this.microAppName = microAppName || 'sub-app';
    const basePath = this.ensureTrailingSlash(microAppUrl);
    this.createMicroApp(basePath, this.microAppName);
  }

  private async resolveMenu(): Promise<Menu | null> {
    try {
      const menus = await firstValueFrom(this.permissionService.getUserVisibleMenus());
      const currentPath = this.router.url.split('?')[0].split('#')[0].replace(/^\//, '');
      const microAppMenus = menus.filter((menu) => menu.code === 'microapp' && menu.path);

      const exact = microAppMenus.find(
        (menu) => menu.path!.replace(/^\//, '') === currentPath,
      );
      if (exact) {
        return exact;
      }

      return (
        microAppMenus.find((menu) =>
          currentPath.startsWith(menu.path!.replace(/^\//, '') + '/'),
        ) || null
      );
    } catch {
      return null;
    }
  }

  private ensureTrailingSlash(url: string): string {
    try {
      const parsed = new URL(url, window.location.origin);
      if (!parsed.pathname.endsWith('/')) {
        parsed.pathname += '/';
      }
      return parsed.toString();
    } catch {
      return url.endsWith('/') ? url : url + '/';
    }
  }

  private createMicroApp(url: string, name: string): void {
    this.microAppElement = this.renderer.createElement('micro-app');
    this.renderer.setAttribute(this.microAppElement, 'name', name);
    this.renderer.setAttribute(this.microAppElement, 'url', url);
    this.renderer.setAttribute(this.microAppElement, 'router-mode', 'pure');

    this.microAppElement.addEventListener('mounted', () => {
      this.dispatchRouteToSubApp(name);
    });

    this.renderer.appendChild(
      this.container.nativeElement,
      this.microAppElement,
    );
  }

  private dispatchRouteToSubApp(name: string): void {
    const subRoute = this.getSubRoute();
    if ((window as any).microApp) {
      (window as any).microApp.setData(name, { path: subRoute });
    }
  }

  private getSubRoute(): string {
    if (!this.basePath) {
      return '/';
    }

    const fullUrl = this.router.url.split('?')[0].split('#')[0];
    const base = '/' + this.basePath;
    const baseIndex = fullUrl.indexOf(base);
    if (baseIndex === -1) {
      return '/';
    }

    const subPath = fullUrl.substring(baseIndex + base.length);
    return subPath ? (subPath.startsWith('/') ? subPath : '/' + subPath) : '/';
  }

  ngOnDestroy(): void {
    const microApp = (window as any).microApp;
    if (microApp?.unmount) {
      try {
        microApp.unmount(this.microAppName);
      } catch {
        // ignore unmount failures
      }
    }

    if (this.microAppElement) {
      try {
        this.renderer.removeChild(
          this.container.nativeElement,
          this.microAppElement,
        );
      } catch {
        // element may already be removed by micro-app
      }
      this.microAppElement = null;
    }
  }
}
