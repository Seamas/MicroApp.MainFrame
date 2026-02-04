import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

// 👇 必须导入 micro-app（注册 Web Component）
import 'zone.js';

import microApp from '@micro-zoe/micro-app';

microApp.start();

// 启动应用，并提供全局错误处理器
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error('Bootstrap failed:', err),
);
