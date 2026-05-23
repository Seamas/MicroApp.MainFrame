import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { NzMenuModule, NzMenuThemeType } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Subject, takeUntil } from 'rxjs';
import { MenuDto } from '../../core/models/menu-dto.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NzMenuModule, NzIconModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class MenuComponent implements OnInit, OnDestroy {
  @Input() menus: MenuDto[] = [];
  @Input() isCollapsed = false;
  @Output() menuSelect = new EventEmitter<MenuDto>();
  @Input() theme: NzMenuThemeType = 'light';

  selectedUrl: string = '';

  private destroy$ = new Subject<void>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.selectedUrl = this.router.url;

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.selectedUrl = event.urlAfterRedirects;
      }
    });
  }

  isSelected(menu: MenuDto): boolean {
    if (!menu.url) return false;
    return this.selectedUrl === menu.url || this.selectedUrl.startsWith(menu.url + '/');
  }

  selectItem(menu: MenuDto): void {
    if (!menu.children || menu.children.length === 0) {
      this.menuSelect.emit(menu);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
