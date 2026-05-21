import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { Menu } from '../models/requests/menu.model';

interface RolePermissionDto {
  roleId: number;
  menuIds: number[];
  endpointIds: number[];
}

interface UserPermissionDto {
  userId: number;
  menuIds: number[];
  endpointIds: number[];
}

const VISIBLE_MENUS_KEY = 'user_visible_menus';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private visibleMenus: Menu[] | null = null;

  constructor(private http: HttpClient) {}

  setRolePermissions(dto: RolePermissionDto): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/permissions/set-role-permissions', dto);
  }

  setUserPermissions(dto: UserPermissionDto): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/permissions/set-user-permissions', dto);
  }

  getUserVisibleMenus(): Observable<Menu[]> {
    if (this.visibleMenus) {
      return of(this.visibleMenus);
    }

    const cached = sessionStorage.getItem(VISIBLE_MENUS_KEY);
    if (cached) {
      this.visibleMenus = JSON.parse(cached);
      return of(this.visibleMenus!);
    }

    return this.http.get<Menu[]>('/api/rbac/permissions/get-user-visible-menus').pipe(
      tap((menus) => {
        this.visibleMenus = menus;
        sessionStorage.setItem(VISIBLE_MENUS_KEY, JSON.stringify(menus));
      }),
    );
  }

  clearMenuCache(): void {
    this.visibleMenus = null;
    sessionStorage.removeItem(VISIBLE_MENUS_KEY);
  }
}
