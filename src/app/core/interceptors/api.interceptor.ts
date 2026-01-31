// src/app/core/interceptors/api.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  // 可选：添加默认 headers
  const clonedReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json'
    }
  });

  return next(clonedReq).pipe(
    map(event => {
      if (event.type === 0) {
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
        errorMsg = '未授权，请重新登录';
      } else if (error.status === 500) {
        errorMsg = '服务器内部错误';
      } else {
        errorMsg = error.message || `错误 ${error.status}`;
      }
      return throwError(() => new Error(errorMsg));
    })
  );
};