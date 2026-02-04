import { Observable } from 'rxjs';
import { RawHttpClient } from './raw.http';
import { Injectable } from '@angular/core';

interface AppNameConfig {
  appTitle: string;
  appName: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  constructor(private http: RawHttpClient) {}

  loadConfig(): Observable<AppNameConfig> {
    return this.http.get<AppNameConfig>('config/app.config.json');
  }
}
