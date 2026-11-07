import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { tokenInterceptor } from './core/interceptors/token.interceptor';

import { routes } from './app.routes';
import { icons } from './icons-provider';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { zh_CN, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { firstValueFrom } from 'rxjs';
import { AppConfigService } from './core/services/appconfig.service';
import { GlobalErrorHandler } from './core/handlers/global-error.handler';

registerLocaleData(zh);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(() => {
      const configService = inject(AppConfigService);
      const title = inject(Title);

      return firstValueFrom(configService.loadConfig())
        .then((res) => {
          title.setTitle(res.appTitle || '微应用基座');
          localStorage.setItem('appName', res.appName);
        })
        .catch(() => undefined);
    }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([tokenInterceptor, apiInterceptor])),
    provideNzIcons(icons),
    provideNzI18n(zh_CN),
    { provide: NzMessageService },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
