import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { QueryRole } from '../models/requests/query-role.model';
import { Observable } from 'rxjs';
import { PageResultModel } from '../models/responses/page-result.model';
import { Role } from '../models/requests/role.model';
import { User } from '../models/requests/user.model';
import { Menu } from '../models/requests/menu.model';
import { ApiEndpoint } from '../models/api-endpoint.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  constructor(private http: HttpClient) {}

  getRole(id: number): Observable<Role> {
    return this.http.post<Role>('/api/rbac/roles/get', { id });
  }

  listRoles(): Observable<Role[]> {
    return this.http.get<Role[]>('/api/rbac/roles/list');
  }

  searchRoles(query: QueryRole): Observable<PageResultModel<Role>> {
    return this.http.post<PageResultModel<Role>>('/api/rbac/roles/search', query);
  }

  createRole(name: string, code: string): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/roles/create', { name, code });
  }

  updateRole(id: number, name: string, code: string): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/roles/update', { id, name, code });
  }

  enable(id: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/roles/enable', { id });
  }

  disable(id: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/roles/disable', { id });
  }

  delete(id: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/roles/delete', { id });
  }

  checkCode(code: string, id?: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/roles/check-code', { id, code });
  }

  getUsersByRoleId(id: number): Observable<User[]> {
    return this.http.post<User[]>('/api/rbac/roles/get-users-by-role', { id });
  }

  assignUsersToRole(roleId: number, userIds: number[]): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/roles/assign-users-to-role', { roleId, userIds });
  }

  getMenusByRole(id: number): Observable<Menu[]> {
    return this.http.post<Menu[]>('/api/rbac/roles/get-menus-by-role', { id });
  }

  getEndpointsByRole(id: number): Observable<ApiEndpoint[]> {
    return this.http.post<ApiEndpoint[]>(`/api/rbac/roles/get-endpoints-by-role`, { id });
  }
}
