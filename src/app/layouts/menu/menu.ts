import { Component, Input, Output, EventEmitter } from '@angular/core';

import { NzMenuModule, NzMenuThemeType } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { MenuDto } from '../../core/models/menu-dto.model';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [NzMenuModule, NzIconModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class MenuComponent {
  @Input() menus: MenuDto[] = [];
  @Input() isCollapsed = false;
  @Output() menuSelect = new EventEmitter<MenuDto>();

  @Input() theme: NzMenuThemeType = 'light';

  expandedKeys = new Set<string>();

  selectItem(menu: MenuDto): void {
    if (!menu.children || menu.children.length === 0) {
      this.menuSelect.emit(menu);
    }
    // 如果有子菜单，NG-ZORRO 会自动展开，无需 emit（除非你需要额外逻辑）
  }

  toggleSubmenu(item: MenuDto, isOpen: boolean): void {
    if (isOpen) {
      this.expandedKeys.add(item.name); // 或 item.key（建议用唯一 ID）
    } else {
      this.expandedKeys.delete(item.name);
    }
  }

  getSubmenuIcon(item: MenuDto): string {
    return this.expandedKeys.has(item.name) ? 'menu-unfold' : 'menu-fold';
  }
}
