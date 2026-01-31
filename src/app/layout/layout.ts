import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule} from 'ng-zorro-antd/menu';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [ RouterModule, NzIconModule, NzLayoutModule, NzMenuModule ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LayoutComponent  {

  isCollapsed = false;

  apps = [
    { name: 'sina', url: 'http://localhost:5173/#/' },
    { name: '163', url: 'http://localhost:5173/#/' }
  ];

  currentApp: (typeof this.apps)[0] | null = null;

  selectApp(app: (typeof this.apps)[0]) {
    console.log("micro-app clicked")
    this.currentApp = app;
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    window.location.href = '/login';
  }

}
