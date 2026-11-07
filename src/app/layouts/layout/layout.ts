import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  OnDestroy,
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
import { firstValueFrom } from 'rxjs';
import { MenuDto } from '../../core/models/menu-dto.model';

import { MenuComponent } from '../menu/menu';
import { PermissionService } from '../../core/services/permission.service';

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
export class LayoutComponent implements OnDestroy, OnInit {
  isCollapsed = false;
  appName: string = '';
  menus: MenuDto[] = [];

  constructor(
    private router: Router,
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
        } else {
          tree.push(menuNode!);
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
    if (menu.type === 'router' || menu.type === 'microapp') {
      this.router.navigate([menu.url || '/']);
    }
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  changePassword() {
    this.router.navigate(['/changePwd']);
  }

  async logout() {
    try {
      await firstValueFrom(this.authService.logout());
    } catch (error) {
      // ignore
    }
    this.permissionService.clearMenuCache();
    removeUserInfo();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {}
}
