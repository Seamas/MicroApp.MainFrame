import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
// import { provideRouter, withHashLocation } from '@angular/router';

import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { apiInterceptor } from './core/interceptors/api.interceptor';
import { tokenInterceptor } from './core/interceptors/token.interceptor';


import { routes } from './app.routes';
import { icons } from './icons-provider';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';


// import { GlobalErrorHandler } from './core/handlers/global-error.handler';
// import { ErrorHandler } from '@angular/core';




registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // provideRouter(routes, withHashLocation()), 
    provideRouter(routes), 
    provideHttpClient(withInterceptors([tokenInterceptor, apiInterceptor])),
    provideNzIcons(icons), 
    provideNzI18n(en_US),
    {provide: NzMessageService},
    // {provide: ErrorHandler, useClass: GlobalErrorHandler}
  ]
};
