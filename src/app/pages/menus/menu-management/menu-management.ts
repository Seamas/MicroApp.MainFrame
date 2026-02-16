// src/app/pages/user-management/user-management.component.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';

import { MenuEditComponent } from '../menu-edit/menu-edit';
import { Menu } from '../../../core/models/requests/menu.model';
import { MenuService } from '../../../core/services/menu.service';

import { firstValueFrom } from 'rxjs';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-menu-management',
  templateUrl: './menu-management.html',
  styleUrls: ['./menu-management.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSwitchModule,
    NzPaginationModule,
    NzModalModule,
    FormsModule,
    NzFormModule,
    NzSelectModule,
  ],
})
export class MenuManagementComponent implements OnInit {
  menus: Menu[] = [];

  searchForm;

  menuCodeTypes = [
    { label: '管理节点', value: 'link' },
    { label: '本地应用', value: 'router' },
    { label: '微应用', value: 'microapp' },
  ];

  menuCodeMap: Record<'link' | 'router' | 'microapp', string> = {
    link: '管理节点',
    router: '本地应用',
    microapp: '微应用',
  };

  pageIndex = 1;
  pageSize = 10;
  total = 0;

  constructor(
    private fb: FormBuilder,
    private menuService: MenuService,
    private msg: NzMessageService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef,
  ) {
    this.searchForm = this.fb.group({ name: [''], code: [''], isEnabled: [null] });
  }

  ngOnInit() {
    this.loadMenus(1, this.pageSize);
  }

  getCodeMap(key: string): string {
    return this.menuCodeMap[key as 'link' | 'router' | 'microapp'] || key;
  }

  onPageIndexChanged(pageIndex: number) {
    this.pageIndex = pageIndex;
    this.loadMenus();
  }

  onPageSizeChanged(pageSize: number) {
    this.pageSize = pageSize;
    // 计算最大页码
    const maxPage = Math.ceil(this.total / pageSize);
    // 重新计算页码，并且至少要确保页码为1
    this.pageIndex = Math.max(1, Math.min(this.pageIndex, maxPage));

    this.loadMenus();
  }

  loadMenus(pageIndex?: number, pageSize?: number) {
    const { name, code, isEnabled } = this.searchForm.value;

    this.menuService
      .searchMenus({
        pageIndex: pageIndex || this.pageIndex,
        pageSize: pageSize || this.pageSize,
        name: name || '',
        code: code || '',
        isEnabled: isEnabled,
      })
      .subscribe((res) => {
        this.total = res.totalCount;
        this.menus = res.items;

        this.cdr.detectChanges();
      });
  }

  async openMenuModal(id?: number) {
    let menu: Menu | null = null;
    try {
      if (id) {
        menu = await firstValueFrom(this.menuService.getMenu(id));
      }
    } catch (error) {
      this.msg.error('获取最新菜单信息出错', { nzDuration: 3000 });
      return;
    }

    let firstLevelMenus: Menu[] = [];
    try {
      firstLevelMenus = await firstValueFrom(this.menuService.firstLevelMenus());
    } catch (error) {
      this.msg.error('获取父级菜单列表出错', { nzDuration: 3000 });
      return;
    }

    const title = menu != null ? '编辑菜单' : '新增菜单';

    const modalRef = this.modal.create({
      nzTitle: title,
      nzContent: MenuEditComponent,
      nzData: { menu: menu || null, firstLevelMenus },
      nzFooter: null,
      nzMaskClosable: false,
      nzClosable: true,
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.msg.success(title + '成功!', { nzDuration: 3000 });
        this.loadMenus();
      }
    });
  }

  async toggleStatus(newValue: boolean, menu: Menu) {
    const originalValue = menu.isEnabled;
    try {
      let res: boolean = false;
      if (newValue) {
        res = await firstValueFrom(this.menuService.enable(menu.id!));
      } else {
        res = await firstValueFrom(this.menuService.disable(menu.id!));
      }
      const message = newValue ? '菜单启用成功' : '菜单禁用成功';
      menu.isEnabled = newValue;
      this.msg.success(message, {
        nzDuration: 3000,
      });
    } catch (error) {
      menu.isEnabled = originalValue;
      this.msg.error('操作失败');
    }
    this.cdr.detectChanges();
  }

  deleteMenu(menu: Menu) {
    this.modal.confirm({
      nzTitle: '确定要删除菜单吗?',
      nzContent: `菜单: ${menu.name}`,
      nzOnOk: async () => {
        try {
          const res = await firstValueFrom(this.menuService.deleteMenu(menu.id!));
          if (res) {
            this.msg.success('菜单删除成功');
            this.loadMenus();
          } else {
            this.msg.error('删除菜单失败');
          }
        } catch (error) {
          this.msg.error('删除菜单失败');
        }
      },
    });
  }
}
