import { Routes, Router } from '@angular/router';
import { inject } from '@angular/core';

import { LoginComponent } from './auth/login/login';
import { LayoutComponent } from './layout/layout';
import { RegisterComponent } from './auth/register/register';

const authGuard = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    return true; // 允许访问登录/注册
  }
  // 已登录用户重定向到主页
  const router = inject(Router);
  router.navigate(["/"])
  return false;
};


const mainGuard = () => {
  return true;
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    const router = inject(Router);
    router.navigate(["/login"])
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
    canActivate: [mainGuard]
  },
  { path: '**', redirectTo: '' }
];
