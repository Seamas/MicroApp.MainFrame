import { Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { isLoggedIn } from '../stores/userstore';
import { PermissionService } from '../services/permission.service';
import { firstValueFrom } from 'rxjs';
import { Menu } from '../models/requests/menu.model';

export const authGuard = (): boolean | UrlTree => {
  const loggedIn = isLoggedIn();
  const router = inject(Router);

  if (loggedIn) {
    return router.parseUrl('/');
  }

  return true;
};

export const mainGuard = (): boolean | UrlTree => {
  const loggedIn = isLoggedIn();
  const router = inject(Router);
  if (!loggedIn) {
    return router.parseUrl('/login');
  }
  return true;
};

const ALLOWED_PATHS_WITHOUT_MENU = ['changePwd', 'profile'];

export const menuGuard = async (): Promise<boolean | UrlTree> => {
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
