import { Routes } from '@angular/router';

import { LoginComponent } from './pages/auth/login/login';
import { LayoutComponent } from './layouts/layout/layout';
import { RegisterComponent } from './pages/auth/register/register';
import { ChangepwdComponent } from './pages/user/changepwd/changepwd';
import { ProfileComponent } from './pages/user/profile/profile';
import { authGuard, mainGuard, menuGuard } from './core/guards/route.guards';

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
