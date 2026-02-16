import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay, firstValueFrom } from 'rxjs';
import { User } from '../models/requests/user.model';
import { PageResultModel } from '../models/responses/page-result.model';
import { QueryUser } from '../models/requests/query-user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: number): Observable<User> {
    return this.http.post<User>('/api/rbac/users/get', { id });
  }

  listUsers(query: QueryUser): Observable<PageResultModel<User>> {
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
}
