import { ErrorHandler, Injectable, inject } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message'; // 可选：用于显示错误提示

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private message = inject(NzMessageService); // 使用 inject()（Angular 14+）

  handleError(error: any): void {
    // 1. 打印到控制台（开发时保留）
    console.error('Global error caught:', error);

    // 2. 提取用户友好的错误信息
    let errorMsg = '系统发生未知错误，请稍后重试';

    if (error instanceof Error) {
      errorMsg = error.message || errorMsg;
    } else if (typeof error === 'string') {
      errorMsg = error;
    }

    // 3. 避免重复提示（可选）
    if (!errorMsg.includes('ResizeObserver loop limit exceeded')) {
      // 显示用户提示（使用 NG-ZORRO）
      this.message.error(errorMsg, {
        nzDuration: 3000
      });
    }

    // 4. 【可选】上报错误到监控系统（如 Sentry、自建日志）
    // this.reportErrorToServer(error);
  }

  // 【可选】上报错误
  // private reportErrorTo_server(error: any): void {
  //   // 示例：发送到后端
  //   fetch('/api/logs/error', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({
  //       message: error.message,
  //       stack: error.stack,
  //       url: window.location.href,
  //       timestamp: new Date().toISOString()
  //     })
  //   }).catch(() => {});
  // }
}