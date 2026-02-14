import { Routes, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';

import { LoginComponent } from './pages/auth/login/login';
import { LayoutComponent } from './layouts/layout/layout';
import { RegisterComponent } from './pages/auth/register/register';
import { ChangepwdComponent } from './pages/user/changepwd/changepwd';
import { ProfileComponent } from './pages/user/profile/profile';

const authGuard = (): boolean | UrlTree => {
  const isLoggedIn = localStorage.getItem('token') !== null;
  const router = inject(Router);

  if (isLoggedIn) {
    // 已登录用户不能访问登录/注册页，重定向到主页
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
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./pages/roles/role-management/role-management').then(
            (m) => m.RoleManagementComponent,
          ),
      },
      {
        path: 'menus',
        loadComponent: () =>
          import('./pages/menus/menu-management/menu-management').then(
            (m) => m.MenuManagementComponent,
          ),
      },
      {
        path: 'endpoints',
        loadComponent: () =>
          import('./pages/endpoints/api-management/api-management').then(
            (m) => m.ApiManagementComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
