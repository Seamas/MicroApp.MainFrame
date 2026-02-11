import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzFormModule } from 'ng-zorro-antd/form';

import { Role } from '../../../core/models/requests/role.model';
import { RoleService } from '../../../core/services/role.service';
import { RoleEditComponent } from '../role-edit/role-edit';

import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [
    NzPaginationModule,
    NzModalModule,
    NzTableModule,
    NzButtonModule,
    NzInputModule,
    NzSwitchModule,
    NzFormModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './role-management.html',
  styleUrl: './role-management.scss',
})
export class RoleManagement implements OnInit {
  roles: Role[] = [];

  searchForm;

  total = 0;
  pageIndex = 1;
  pageSize = 10;
  loading = false;

  constructor(
    private modal: NzModalService,
    private message: NzMessageService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private roleService: RoleService,
  ) {
    this.searchForm = this.fb.group({ name: [''], code: [''] });
  }

  ngOnInit(): void {
    this.loadRoles();
  }

  async loadRoles(pageIndex?: number, pageSize?: number) {
    this.loading = true;
    const query = {
      name: this.searchForm.value.name || '',
      code: this.searchForm.value.code || '',
      pageIndex: pageIndex || this.pageIndex,
      pageSize: pageSize || this.pageSize,
    };
    try {
      const res = await firstValueFrom(this.roleService.searchRoles(query));
      this.roles = res.items;
      this.total = res.totalCount;
    } catch (error) {}
    this.loading = false;
    this.cdr.detectChanges();
  }

  onPageIndexChanged(page: number): void {
    this.pageIndex = page;
    this.loadRoles();
  }

  onPageSizeChanged(pageSize: number) {
    this.pageSize = pageSize;
    // 计算最大页码
    const maxPage = Math.ceil(this.total / pageSize);
    // 重新计算页码，并且至少要确保页码为1
    this.pageIndex = Math.max(1, Math.min(this.pageIndex, maxPage));

    this.loadRoles();
  }

  async openRoleModal(id?: number) {
    let role: Role | null = null;
    try {
      if (id) {
        role = await firstValueFrom(this.roleService.getRole(id));
      }
    } catch (error) {
      this.message.error('获取角色信息出错', { nzDuration: 3000 });
      return;
    }

    const title = role ? '编辑角色' : '添加角色';
    const modalRef = this.modal.create({
      nzTitle: title,
      nzContent: RoleEditComponent,
      nzData: { role: role || null },
      nzFooter: null,
      nzMaskClosable: false,
      nzClosable: true,
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.message.success(title + '成功!', { nzDuration: 3000 });
        this.loadRoles();
      }
    });
  }

  async toggleStatus(newValue: boolean, role: Role) {
    const originalValue = role.isEnabled;
    try {
      const res = await firstValueFrom(this.roleService.enable(role.id, newValue));
      const message = newValue ? '角色启用成功' : '角色禁用成功';
      role.isEnabled = newValue;
      this.message.success(message, {
        nzDuration: 3000,
      });
    } catch (error) {
      role.isEnabled = originalValue;
      this.cdr.detectChanges();
      this.message.error('操作失败');
    }
  }

  deleteRole(role: Role): void {
    this.modal.confirm({
      nzTitle: '确定要删除角色吗?',
      nzContent: `角色: ${role.name}`,
      nzOnOk: async () => {
        try {
          const res = await firstValueFrom(this.roleService.delete(role.id));
          this.message.success('角色删除成功');
          this.loadRoles();
        } catch (error) {
          this.message.error('删除角色失败');
        }
      },
    });
  }
}
