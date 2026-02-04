// src/app/pages/user-management/user-management.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';

import { User } from '../../core/models/requests/user.model';
import { UserService } from '../../core/services/user.service';
import { UserEditFormComponent } from '../user-edit/user-edit';
import { NzFormModule } from 'ng-zorro-antd/form';
import { firstValueFrom } from 'rxjs';

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
  loading = false;

  searchForm;

  pageIndex = 1;
  pageSize = 10;
  total = 100;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private msg: NzMessageService,
    private modal: NzModalService,
  ) {
    this.searchForm = this.fb.group({ keyword: [''] });
  }

  async ngOnInit() {
    await this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    try {
      const res = await firstValueFrom(
        this.userService.listUsers({
          pageIndex: 1,
          pageSize: 10,
          keyword: this.searchForm.get('keyword')?.value || '',
        }),
      );
      this.pageIndex = res.pageIndex;
      this.pageSize = res.pageSize;
      this.total = res.totalCount;
      this.users = res.items;
    } catch (error) {
      console.log(error);
    }
    this.loading = false;
  }

  openUserModal(user?: User): void {
    const form = this.createUserForm(user);

    const modalRef = this.modal.create({
      nzTitle: user != null ? '编辑用户' : '新增用户',
      nzContent: UserEditFormComponent,
      nzData: { user: user || null },
      nzFooter: null,
      nzMaskClosable: false,
      nzClosable: true,
    });

    modalRef.afterClose.subscribe((result) => {
      if (result) {
      }
    });
  }

  createUserForm(user?: User): FormGroup {
    return this.fb.group({
      username: [user?.username || '', [Validators.required, Validators.minLength(3)]],
      nickname: [user?.nickname || '', [Validators.required]],
      email: [user?.email || '', [Validators.required, Validators.email]],
    });
  }

  async toggleStatus(user: User) {
    try {
      const res = await firstValueFrom(this.userService.enable(user.id, !user.isEnabled));
      const message = user.isEnabled ? '用户禁用成功' : '用户启用成功';
      user.isEnabled = !user.isEnabled;

      this.msg.success(message, {
        nzDuration: 3000,
      });
    } catch (error) {}
  }

  resetPassword(user: User): void {
    this.modal.confirm({
      nzTitle: '重置密码',
      nzContent: `确定要重置 "${user.nickname}" 的密码吗？新密码将启用默认密码,请及时进行修改。`,
      nzOkText: '确认重置',
      nzOnOk: async () => {
        try {
          const res = await firstValueFrom(this.userService.resetPassword(user.id));
          if (res) {
            this.msg.success(`${user.nickname} 密码重置成功, 请及时进行修改`);
          }
        } catch (error) {
          this.msg.error(`${user.nickname} 密码重置失败`);
        }
      },
    });
  }
}
