// src/app/core/services/raw-http-client.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class RawHttpClient {
  private httpClient: HttpClient;

  constructor(handler: HttpBackend) {
    // 使用 HttpBackend 创建不经过拦截器的 HttpClient
    this.httpClient = new HttpClient(handler);
  }

  get<T>(url: string) {
    return this.httpClient.get<T>(url);
  }

  // 可按需添加 post、put 等方法
}
