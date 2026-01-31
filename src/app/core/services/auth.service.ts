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

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api/'; // 替换为你的 API 地址

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // 注意：这里直接返回 LoginResponse，因为拦截器已提取 data
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials);
  }

  register(credentials: LoginRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/auth/register`, credentials);
  }
}