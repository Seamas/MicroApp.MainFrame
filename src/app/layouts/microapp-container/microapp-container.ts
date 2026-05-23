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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {
    const microAppUrl = this.route.snapshot.data['microAppUrl'];
    const microAppName = this.route.snapshot.data['microAppName'] || 'sub-app';

    if (microAppUrl) {
      const basePath = this.ensureTrailingSlash(microAppUrl);
      this.createMicroApp(basePath, microAppName);
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
    const parentRoute = this.route.parent;
    if (!parentRoute) return '/';

    const basePath = parentRoute.routeConfig?.path;
    if (!basePath) return '/';

    const fullUrl = this.router.url;
    const baseIndex = fullUrl.indexOf('/' + basePath);
    if (baseIndex === -1) return '/';

    const subPath = fullUrl.substring(baseIndex + basePath.length + 1);
    return subPath ? '/' + subPath : '/';
  }

  ngOnDestroy(): void {
    if (this.microAppElement) {
      this.renderer.removeChild(
        this.container.nativeElement,
        this.microAppElement,
      );
      this.microAppElement = null;
    }
  }
}
