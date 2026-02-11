import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { QueryRole } from '../models/requests/query-role.model';
import { Observable } from 'rxjs';
import { PageResultModel } from '../models/responses/page-result.model';
import { Role } from '../models/requests/role.model';

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

  enable(id: number, enabled: boolean): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/roles/enable', { id, enabled });
  }

  delete(id: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/roles/delete', { id });
  }

  checkCode(code: string, id?: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/roles/check-code', { id, code });
  }
}
