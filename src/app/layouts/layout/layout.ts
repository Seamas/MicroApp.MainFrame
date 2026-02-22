import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Renderer2,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { removeUserInfo } from '../../core/stores/userstore';
import { AuthService } from '../../core/services/auth.service';

import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { finalize, firstValueFrom } from 'rxjs';
import { MenuDto } from '../../core/models/menu-dto.mode';

import { MenuComponent } from '../menu/menu';
import { PermissionService } from '../../core/services/permission.service';
import { Menu } from '../../core/models/requests/menu.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterModule,
    NzIconModule,
    NzLayoutModule,
    NzMenuModule,
    NzDropdownModule,
    MenuComponent,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LayoutComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('microapp', { static: true }) container!: ElementRef;

  isCollapsed = false;

  subappUrl: string = `${window.location.origin}`;

  private microAppElement: any;
  appName: string = '';
  isMicroapp: boolean = false;

  menus: MenuDto[] = [];

  constructor(
    private router: Router,
    private renderer: Renderer2,
    public authService: AuthService,
    private permissionService: PermissionService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit() {
    this.appName = localStorage.getItem('appName') || '微应用';
    try {
      const allMenus = await firstValueFrom(this.permissionService.getUserVisibleMenus());
      this.menus = this.buildMenuTree(allMenus);
    } finally {
      this.cdr.detectChanges();
    }
  }

  private buildMenuTree(menus: Menu[]): MenuDto[] {
    const map = new Map<number, MenuDto>();
    const tree: MenuDto[] = [];

    menus.forEach((menu) => {
      map.set(menu.id, {
        type: menu.code,
        name: menu.name,
        icon: menu.icon,
        url: menu.path,
        sortOrder: menu.sortOrder,
        children: [],
      });
    });

    menus.forEach((menu) => {
      const menuNode = map.get(menu.id);
      if (menu.parentId == null) {
        tree.push(menuNode!);
      } else {
        const parentNode = map.get(menu.parentId);
        if (parentNode) {
          parentNode.children?.push(menuNode!);
        }
      }
    });

    tree.sort((a, b) => a.sortOrder - b.sortOrder);
    tree.forEach((item) => {
      item.children?.sort((a, b) => a.sortOrder - b.sortOrder);
    });

    return tree;
  }

  onMenuSelect(menu: MenuDto): void {
    this.destroyMicroApp();

    if (menu.type == 'router') {
      this.isMicroapp = false;
      this.router.navigate([menu.url || '/']);
    } else if (menu.type == 'microapp') {
      this.isMicroapp = true;
    } else {
      console.log('menu.type is not supported: ', menu.type);
    }
  }

  goToProfile() {
    this.resetRouterOutlet();
    this.router.navigate(['/profile']);
  }

  changePassword() {
    this.resetRouterOutlet();
    this.router.navigate(['/changePwd']);
  }

  // 重置router-outlet
  resetRouterOutlet() {
    this.destroyMicroApp();
    this.isMicroapp = false;
  }

  async logout() {
    try {
      await firstValueFrom(this.authService.logout());
    } catch (error) {
      console.log(error);
    }
    removeUserInfo();
    this.router.navigate(['/login']);
  }

  createMicroApp(url: string, name: string = 'dynamic-app') {
    // 清理现有元素
    this.destroyMicroApp();
    // 创建新的 micro-app 元素
    this.microAppElement = this.renderer.createElement('micro-app');

    // 设置属性
    this.renderer.setAttribute(this.microAppElement, 'name', name);
    this.renderer.setAttribute(this.microAppElement, 'url', url);
    this.renderer.setAttribute(
      this.microAppElement,
      'data',
      JSON.stringify({
        // 传递数据
      }),
    );

    // 添加到 DOM
    this.renderer.appendChild(this.container.nativeElement, this.microAppElement);
  }

  destroyMicroApp() {
    if (this.microAppElement) {
      this.renderer.removeChild(this.container.nativeElement, this.microAppElement);
      this.microAppElement = null;
    }
  }

  ngOnDestroy(): void {
    this.destroyMicroApp();
  }

  ngAfterViewInit(): void {
    // this.createMicroApp();
  }
}
