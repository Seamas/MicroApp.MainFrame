import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/requests/user.model';
import { PageResultModel } from '../models/responses/page-result.model';
import { QueryUser } from '../models/requests/query-user.model';
import { Role } from '../models/requests/role.model';
import { Menu } from '../models/requests/menu.model';
import { ApiEndpoint } from '../models/api-endpoint.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: number): Observable<User> {
    return this.http.post<User>('/api/rbac/users/get', { id });
  }

  searchUsers(query: QueryUser): Observable<PageResultModel<User>> {
    return this.http.post<PageResultModel<User>>('/api/rbac/users/search', query);
  }

  createUser(username: string, nickname: string, email: string): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/users/create', { username, nickname, email });
  }

  enable(id: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/users/enable', { id });
  }

  disable(id: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/users/disable', { id });
  }

  updateUser(id: number, nickname: string, email: string): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/users/update', { id, nickname, email });
  }

  resetPassword(id: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/users/reset-password', { id });
  }

  checkUsername(username: string, id?: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/users/check-username', { id, username });
  }

  assignRoles(userId: number, roleIds: number[]): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/users/assign-roles', { userId, roleIds });
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/rbac/users/all-users');
  }

  getRoleByUserId(userId: number): Observable<Role[]> {
    return this.http.post<Role[]>('/api/rbac/users/get-roles-by-user', { userId });
  }

  getMenusByUserId(userId: number): Observable<Menu[]> {
    return this.http.post<Menu[]>('/api/rbac/users/get-menus-by-user', { userId });
  }

  getMenuPermissionByUserId(userId: number): Observable<Menu[]> {
    return this.http.post<Menu[]>('/api/rbac/users/get-menu-permissions-by-user', { userId });
  }

  getApisByUserId(userId: number): Observable<ApiEndpoint[]> {
    return this.http.post<ApiEndpoint[]>('/api/rbac/users/get-apis-by-user', { userId });
  }

  getApiPermissionByUserId(userId: number): Observable<ApiEndpoint[]> {
    return this.http.post<ApiEndpoint[]>('/api/rbac/users/get-api-permissions-by-user', { userId });
  }
}
