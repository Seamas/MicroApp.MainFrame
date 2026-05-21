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

import { User } from '../../../core/models/requests/user.model';
import { UserService } from '../../../core/services/user.service';
import { UserEditFormComponent } from '../user-edit/user-edit';

import { firstValueFrom } from 'rxjs';
import { UserPermissionComponent } from '../user-permission/user-permission';
import { UserRoleAssignmentComponent } from '../user-role-assignment/user-role-assignment';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss'],
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
  ],
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];

  searchForm;

  pageIndex = 1;
  pageSize = 10;
  total = 0;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private msg: NzMessageService,
    private modal: NzModalService,
    private cdr: ChangeDetectorRef,
  ) {
    this.searchForm = this.fb.group({ username: [''], nickname: [''], email: [''] });
  }

  ngOnInit() {
    this.loadUsers(1, this.pageSize);
  }

  onPageIndexChanged(pageIndex: number) {
    this.pageIndex = pageIndex;
    this.loadUsers();
  }

  onPageSizeChanged(pageSize: number) {
    this.pageSize = pageSize;
    // 计算最大页码
    const maxPage = Math.ceil(this.total / pageSize);
    // 重新计算页码，并且至少要确保页码为1
    this.pageIndex = Math.max(1, Math.min(this.pageIndex, maxPage));

    this.loadUsers();
  }

  loadUsers(pageIndex?: number, pageSize?: number) {
    this.userService
      .searchUsers({
        pageIndex: pageIndex || this.pageIndex,
        pageSize: pageSize || this.pageSize,
        username: this.searchForm.get('username')?.value || '',
        nickname: this.searchForm.get('nickname')?.value || '',
        email: this.searchForm.get('email')?.value || '',
      })
      .subscribe((res) => {
        this.total = res.totalCount;
        this.users = res.items;

        this.cdr.detectChanges();
      });
  }

  async openUserModal(id?: number) {
    let user: User | null = null;
    try {
      if (id) {
        user = await firstValueFrom(this.userService.getUser(id));
      }
    } catch (error) {
      this.msg.error('获取最新用户信息出错', { nzDuration: 3000 });
      return;
    }

    const title = user != null ? '编辑用户' : '新增用户';

    const modalRef = this.modal.create({
      nzTitle: title,
      nzContent: UserEditFormComponent,
      nzData: { user: user || null },
      nzFooter: null,
      nzMaskClosable: false,
      nzClosable: true,
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.msg.success(title + '成功!', { nzDuration: 3000 });
        this.loadUsers();
      }
    });
  }

  async openRoleAssignModal(user: User) {
    const modalRef = this.modal.create({
      nzTitle: `分配角色给用户-${user.username}`,
      nzContent: UserRoleAssignmentComponent,
      nzData: { user },
      nzWidth: 800,
      nzFooter: null,
      nzMaskClosable: false,
      nzClosable: true,
    });

    modalRef.afterClose.subscribe((result) => {});
  }

  async openPermissionsModal(user: User) {
    const modalRef = this.modal.create({
      nzTitle: `用户权限分配-${user.username}`,
      nzContent: UserPermissionComponent,
      nzData: { user },
      nzFooter: null,
      nzMaskClosable: false,
      nzClosable: true,
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
        this.msg.success('权限分配成功!', { nzDuration: 3000 });
        this.loadUsers();
      }
    });
  }

  async toggleStatus(newValue: boolean, user: User) {
    const originalValue = user.isEnabled;
    try {
      let res: boolean = false;
      if (newValue) {
        res = await firstValueFrom(this.userService.enable(user.id));
      } else {
        res = await firstValueFrom(this.userService.disable(user.id));
      }
      const message = newValue ? '用户启用成功' : '用户禁用成功';
      user.isEnabled = newValue;
      this.msg.success(message, {
        nzDuration: 3000,
      });
    } catch (error) {
      user.isEnabled = originalValue;
      this.msg.error('操作失败');
    }
    this.cdr.detectChanges();
  }

  resetPassword(user: User): void {
    this.modal.confirm({
      nzTitle: '重置密码',
      nzContent: `确定要重置 "${user.nickname}" 的密码吗？新密码将启用默认密码,请及时进行修改。`,
      nzOkText: '确认重置',
      nzOnOk: async () => {
        try {
          const res = await firstValueFrom(this.userService.resetPassword(user.id));
          if (res === true) {
            this.msg.success(`${user.nickname} 密码重置成功, 请及时进行修改`);
          }
        } catch (error) {
          this.msg.error(`${user.nickname} 密码重置失败`);
        }
      },
    });
  }
}
