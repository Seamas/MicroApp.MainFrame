import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule} from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NzIconModule, NzLayoutModule, NzMenuModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  isCollapsed = false;
}
