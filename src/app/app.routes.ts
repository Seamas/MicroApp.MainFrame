import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';

import { LoginComponent } from './pages/auth/login/login';
import { LayoutComponent } from './layouts/layout/layout';
import { RegisterComponent } from './pages/auth/register/register';
import { ChangepwdComponent } from './pages/user/changepwd/changepwd';
import { ProfileComponent } from './pages/user/profile/profile';
import { UserManagementComponent } from './pages/user-management/user-management';

const authGuard = () => {
  const isLoggedIn = localStorage.getItem('token') !== null;
  if (!isLoggedIn) {
    return true; // 允许访问登录/注册
  }
  // 已登录用户重定向到主页
  const router = inject(Router);
  router.navigate(['/']);
  return false;
};

const mainGuard = () => {
  const isLoggedIn = localStorage.getItem('token') !== null;
  if (!isLoggedIn) {
    const router = inject(Router);
    router.navigate(['/login']);
    return false;
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
          import('./pages/user-management/user-management').then((m) => m.UserManagementComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
