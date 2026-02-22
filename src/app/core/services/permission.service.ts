import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private http: HttpClient) {}

  setRolePermissions(dto: RolePermissionDto): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/permissions/set-role-permissions', dto);
  }

  setUserPermissions(dto: UserPermissionDto): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/permissions/set-user-permissions', dto);
  }

  getUserVisibleMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>('/api/rbac/permissions/get-user-visible-menus');
  }
}
