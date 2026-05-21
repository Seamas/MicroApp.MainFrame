import { Routes, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';

import { LoginComponent } from './pages/auth/login/login';
import { LayoutComponent } from './layouts/layout/layout';
import { RegisterComponent } from './pages/auth/register/register';
import { ChangepwdComponent } from './pages/user/changepwd/changepwd';
import { ProfileComponent } from './pages/user/profile/profile';
import { PermissionService } from './core/services/permission.service';
import { firstValueFrom } from 'rxjs';
import { Menu } from './core/models/requests/menu.model';

const authGuard = (): boolean | UrlTree => {
  const isLoggedIn = localStorage.getItem('token') !== null;  
  const router = inject(Router);

  if (isLoggedIn) {
    return router.parseUrl('/');
  }

  return true;
};

const mainGuard = (): boolean | UrlTree => {
  const isLoggedIn = localStorage.getItem('token') !== null;  
  const router = inject(Router);
  if (!isLoggedIn) {
    return router.parseUrl('/login');
  }
  return true;
};

const ALLOWED_PATHS_WITHOUT_MENU = ['changePwd', 'profile'];

const menuGuard = async (): Promise<boolean | UrlTree> => {
  const router = inject(Router);
  const permissionService = inject(PermissionService);

  const targetPath = router.getCurrentNavigation()?.finalUrl?.toString();
  if (!targetPath) {
    return true;
  }

  const segments = targetPath.split('/').filter(Boolean);
  const firstSegment = segments[0] || '';

  if (ALLOWED_PATHS_WITHOUT_MENU.includes(firstSegment)) {
    return true;
  }

  let menus: Menu[];
  try {
    menus = await firstValueFrom(permissionService.getUserVisibleMenus());
  } catch {
    return router.parseUrl('/');
  }

  const allowedPaths = menus
    .filter((m) => m.path)
    .map((m) => m.path!.replace(/^\//, '').split('/')[0])
    .filter(Boolean);

  const uniqueAllowed = [...new Set(allowedPaths)];

  if (uniqueAllowed.includes(firstSegment)) {
    return true;
  }

  return router.parseUrl('/');
};

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [authGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [authGuard] },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [mainGuard],
    children: [
      {
        path: 'changePwd',
        component: ChangepwdComponent,
      },
      {
        path: 'profile',
        component: ProfileComponent,
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/user-management/user-management').then(
            (m) => m.UserManagementComponent,
          ),
        canActivate: [menuGuard],
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./pages/roles/role-management/role-management').then(
            (m) => m.RoleManagementComponent,
          ),
        canActivate: [menuGuard],
      },
      {
        path: 'menus',
        loadComponent: () =>
          import('./pages/menus/menu-management/menu-management').then(
            (m) => m.MenuManagementComponent,
          ),
        canActivate: [menuGuard],
      },
      {
        path: 'endpoints',
        loadComponent: () =>
          import('./pages/endpoints/api-management/api-management').then(
            (m) => m.ApiManagementComponent,
          ),
        canActivate: [menuGuard],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
