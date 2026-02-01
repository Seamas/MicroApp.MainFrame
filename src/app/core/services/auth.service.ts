import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  username: string;
}


interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}


interface RegisterResponse {

}


@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // 注意：这里直接返回 LoginResponse，因为拦截器已提取 data
    return this.http.post<LoginResponse>(`/rbac/auth/login`, credentials);
  }

  register(user: RegisterRequest): Observable<RegisterResponse> {
      return this.http.post<RegisterRequest>(`/rbac/users/create`, user);

  }
}