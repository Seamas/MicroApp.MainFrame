// src/app/core/interceptors/api.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { removeUserInfo } from '../stores/userstore';
import { PermissionService } from '../services/permission.service';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(NzMessageService);
  let clonedReq = req;
  if (req.body !== null && req.body !== undefined && !(req.body instanceof FormData)) {
    clonedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
    });
  }
  return next(clonedReq).pipe(
    map((event) => {
      // event.type 的含义
      // Sent = 0,                 // ✅ 请求已发送（刚发出）
      // UploadProgress = 1,       // 上传进度
      // ResponseHeader = 2,       // 收到响应头
      // DownloadProgress = 3,     // 下载进度
      // Response = 4,             // ✅ 完整响应（成功）
      // User = 5                  // 自定义事件（很少用）
      if (event.type === 4) {
        const response = event as any;
        if (response.body && typeof response.body === 'object') {
          const apiResult = response.body;

          // 检查是否为 ApiResult 结构
          if (apiResult.hasOwnProperty('success')) {
            if (apiResult.success) {
              return response.clone({ body: apiResult.data });
            } else {
              throw new Error(apiResult.message || '请求失败');
            }
          }
        }
      }
      return event;
    }),
    catchError((error: any) => {
      let errorMsg = '网络请求失败';
      if (error.error instanceof ErrorEvent) {
        errorMsg = `客户端错误: ${error.error.message}`;
      } else if (error.status === 0) {
        errorMsg = '无法连接到服务器';
      } else if (error.status === 401) {
        inject(PermissionService).clearMenuCache();
        removeUserInfo();
        errorMsg = '未授权，请重新登录';
      } else if (error.status == 403) {
        errorMsg = '当前用户无权限';
      } else if (error.status === 500) {
        errorMsg = '服务器内部错误';
      } else {
        errorMsg = error.message || `错误 ${error.status}`;
      }
      messageService.error(errorMsg, {
        nzDuration: 3000,
      });
      return throwError(() => new Error(errorMsg));
    }),
  );
};
