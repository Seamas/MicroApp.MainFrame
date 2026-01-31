import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login';
import { LayoutComponent } from './layout/layout';
import { RegisterComponent } from './auth/register/register';

const authGuard = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    return true; // 允许访问登录/注册
  }
  // 已登录用户重定向到主页
  window.location.href = '/';
  return false;
};


const mainGuard = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  if (!isLoggedIn) {
    window.location.href = '/login';
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
