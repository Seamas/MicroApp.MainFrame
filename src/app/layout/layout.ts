import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, AfterViewInit, OnDestroy, Renderer2 } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule} from 'ng-zorro-antd/menu';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [ RouterModule, NzIconModule, NzLayoutModule, NzMenuModule ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class LayoutComponent implements AfterViewInit, OnDestroy  {
  @ViewChild("microapp", { static: true }) container!: ElementRef;

  isCollapsed = false;

  subappUrl: string = `${window.location.origin}`

  private microAppElement: any;

  apps = [
    { name: 'sina', url: 'http://localhost:8080/subapp/' },
    { name: 'wy163', url: 'http://localhost:8080/subapp/' }
  ];


  constructor(private router: Router,
    private renderer: Renderer2,
    private el: ElementRef
  ){}



  currentApp: (typeof this.apps)[0] | null = null;

  selectApp(app: (typeof this.apps)[0]) {
    this.currentApp = app;

    this.createMicroApp(this.currentApp.url, this.currentApp.name);
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    this.router.navigate(["/login"]);
  }

  createMicroApp(url: string, name: string = 'dynamic-app') {
    // 清理现有元素
    this.destroyMicroApp();

    // 创建新的 micro-app 元素
    this.microAppElement = this.renderer.createElement('micro-app');
    
    // 设置属性
    this.renderer.setAttribute(this.microAppElement, 'name', name);
    this.renderer.setAttribute(this.microAppElement, 'url', url);
    this.renderer.setAttribute(this.microAppElement, 'data', JSON.stringify({
      // 传递数据
    }));

    // 添加到 DOM
    this.renderer.appendChild(this.container.nativeElement, this.microAppElement);
  }

  updateUrl(newUrl: string) {
    if (this.microAppElement) {
      this.renderer.setAttribute(this.microAppElement, 'url', newUrl);
    }
  }

    destroyMicroApp() {
    if (this.microAppElement) {
      this.renderer.removeChild(this.container.nativeElement, this.microAppElement);
      this.microAppElement = null;
    }
  }

    ngOnDestroy(): void {
    this.destroyMicroApp();
    }
    ngAfterViewInit(): void {
      // this.createMicroApp();
    }

}
