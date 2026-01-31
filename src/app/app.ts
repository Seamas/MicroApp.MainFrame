import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule} from 'ng-zorro-antd/menu';

import { UserOutline, LockOutline, MenuFoldOutline, MenuUnfoldOutline  } from '@ant-design/icons-angular/icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    NzIconModule, 
    NzLayoutModule, 
    NzMenuModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class AppComponent {
  isCollapsed = false;

  constructor() {
    NzIconModule.forRoot([
      UserOutline,
      LockOutline,
      MenuFoldOutline,
      MenuUnfoldOutline
    ]);
  }
}
