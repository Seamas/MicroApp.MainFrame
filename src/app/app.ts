import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';

import { AppConfigService } from './core/services/appconfig.service';

import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NzIconModule, NzLayoutModule, NzMenuModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent implements OnInit {
  constructor(
    private title: Title,
    private configService: AppConfigService,
  ) {}

  async ngOnInit() {
    const res = await firstValueFrom(this.configService.loadConfig());
    this.title.setTitle(res.appTitle || '微应用基座');
    localStorage.setItem('appName', res.appName);
  }
}
