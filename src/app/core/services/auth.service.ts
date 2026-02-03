import { Injectable, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  token: string;
  username: string;
  nickname: string;
}


interface RegisterRequest {
  username: string;
  nickname: string;
  email: string;
  password: string;
}


interface RegisterResponse {
}

interface ProfileResponse {
  username: string;
  nickname: string;
  email: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}


interface ChangePasswordResponse {

}

interface UpdateProfileRequest {
  nickname: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  public nickname: string = "";

  constructor(private http: HttpClient) {
    this.nickname = localStorage.getItem("nickname") || ""
  }
  ngOnInit(): void {
    
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    // 注意：这里直接返回 LoginResponse，因为拦截器已提取 data
    return this.http.post<LoginResponse>(`/api/rbac/auth/login`, credentials);
  }

  register(user: RegisterRequest): Observable<RegisterResponse> {
      return this.http.post<RegisterResponse>(`/api/rbac/auth/register`, user);
  }

  logout() {
    return this.http.post<boolean>(`/api/rbac/auth/logout`, {});
  }

  profile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`/api/rbac/auth/profile`)
  }

  updateProfile(req: UpdateProfileRequest): Observable<ProfileResponse> {
    return this.http.post<ProfileResponse>(`/api/rbac/auth/update-profile`, req)
  }

  changePassword(req: ChangePasswordRequest): Observable<ChangePasswordResponse> {
    return this.http.post<ChangePasswordResponse>(`/api/rbac/auth/change-password`, req);
  }
}