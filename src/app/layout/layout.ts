import { Component, CUSTOM_ELEMENTS_SCHEMA, ViewChild, ElementRef, AfterViewInit, OnDestroy, Renderer2, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule} from 'ng-zorro-antd/menu';
import { removeUserInfo } from '../core/stores/userstore';
import { AuthService } from '../core/services/auth.service';

import { NzDropdownModule } from 'ng-zorro-antd/dropdown';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
     RouterModule, 
     NzIconModule, 
     NzLayoutModule, 
     NzMenuModule, 
     NzDropdownModule 
    ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class LayoutComponent implements AfterViewInit, OnDestroy, OnInit  {
  @ViewChild("microapp", { static: true }) container!: ElementRef;

  isCollapsed = false;

  subappUrl: string = `${window.location.origin}`

  private microAppElement: any;
  currentApp: (typeof this.apps)[0] | null = null;


  apps = [
    { name: 'sina', url: 'http://localhost:8080/subapp/' },
    { name: 'wy163', url: 'http://localhost:8080/subapp/' }
  ];


  constructor(private router: Router,
    private renderer: Renderer2,
    public authService: AuthService
  ){}


  ngOnInit(): void {
  }

  selectApp(app: (typeof this.apps)[0]) {
    this.currentApp = app;
    this.createMicroApp(this.currentApp.url, this.currentApp.name);
  }

  goToProfile() {
    this.router.navigate(["/profile"])
  }

  changePassword() {
    this.router.navigate(["/changePwd"])
  }

  logout() {
    this.authService.logout()
    .pipe(
      finalize (() => 
        setTimeout(() =>{
          removeUserInfo();
          this.router.navigate(["/login"]);
        }, 1000)
      )
    )
    .subscribe(res => {})
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
