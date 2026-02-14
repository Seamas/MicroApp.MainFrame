import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Renderer2,
  OnInit,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { removeUserInfo } from '../../core/stores/userstore';
import { AuthService } from '../../core/services/auth.service';

import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { finalize, firstValueFrom } from 'rxjs';
import { Menu } from '../menu.mode';

import { MenuComponent } from '../menu/menu';

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

  apps: Menu[] = [
    {
      type: 'dashboard',
      name: '仪表盘',
      icon: 'dashboard',
      url: '/',
    },
    {
      type: 'user',
      name: '系统管理',
      icon: 'user',
      children: [
        { type: 'route', name: '用户列表', icon: 'user', url: '/users' },
        { type: 'route', name: '角色管理', icon: 'team', url: '/roles' },
        { type: 'route', name: '菜单管理', icon: 'menu', url: '/menus' },
        { type: 'route', name: '接口管理', icon: 'api', url: '/endpoints' },
      ],
    },
  ];

  constructor(
    private router: Router,
    private renderer: Renderer2,
    public authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.appName = localStorage.getItem('appName') || '微应用';
  }

  onMenuSelect(menu: Menu): void {
    this.destroyMicroApp();

    if (menu.type == 'route') {
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
