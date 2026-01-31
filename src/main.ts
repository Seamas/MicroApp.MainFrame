import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// 👇 必须导入 micro-app（注册 Web Component）
import 'micro-app';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
