import {
  Component,
  ElementRef,
  ViewChild,
  Renderer2,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-microapp-container',
  standalone: true,
  imports: [CommonModule],
  template: `<div #container class="microapp-container"></div>`,
  styles: [
    `
      .microapp-container {
        width: 100%;
        height: 100%;
      }
      micro-app {
        display: block;
        width: 100%;
        height: 100%;
      }
    `,
  ],
})
export class MicroAppContainerComponent implements OnInit, OnDestroy {
  @ViewChild('container', { static: true }) container!: ElementRef;

  private microAppElement: any;

  constructor(
    private route: ActivatedRoute,
    private renderer: Renderer2,
  ) {}

  ngOnInit(): void {

    const microAppUrl = this.route.snapshot.data['microAppUrl'];
    const microAppName = this.route.snapshot.data['microAppName'] || 'sub-app';
    console.log('microAppUrl:', microAppUrl);
    console.log('microAppName:', microAppName);

    if (microAppUrl) {
      this.createMicroApp(microAppUrl, microAppName);
    }
  }

  private createMicroApp(url: string, name: string): void {
    this.microAppElement = this.renderer.createElement('micro-app');
    this.renderer.setAttribute(this.microAppElement, 'name', name);
    this.renderer.setAttribute(this.microAppElement, 'url', url);
    this.renderer.appendChild(
      this.container.nativeElement,
      this.microAppElement,
    );
  }

  ngOnDestroy(): void {
    if (this.microAppElement) {
      this.renderer.removeChild(
        this.container.nativeElement,
        this.microAppElement,
      );
      this.microAppElement = null;
    }
  }
}
