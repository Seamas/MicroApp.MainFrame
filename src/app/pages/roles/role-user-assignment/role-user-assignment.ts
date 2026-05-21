import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { User } from '../../../core/models/requests/user.model';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { Role } from '../../../core/models/requests/role.model';
import { UserService } from '../../../core/services/user.service';
import { RoleService } from '../../../core/services/role.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-role-user-assignment',
  standalone: true,
  imports: [NzListModule, NzInputModule, FormsModule, NzSpinModule, NzButtonModule],
  templateUrl: './role-user-assignment.html',
  styleUrl: './role-user-assignment.scss',
})
export class RoleUserAssignmentComponent implements OnInit {
  roleId!: number;
  // 所有用户（左侧）
  allUsers: User[] = [];
  filteredAllUsers: User[] = [];
  selectedAllUserIds = new Set<number>();
  searchAll = '';

  // 已授权用户（右侧）
  assignedUsers: User[] = [];
  filteredAssignedUsers: User[] = [];
  selectedAssignedUserIds = new Set<number>();
  searchAssigned = '';

  loading = false;

  constructor(
    private msg: NzMessageService,
    @Inject(NZ_MODAL_DATA) public data: { role: Role },
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private roleService: RoleService,
  ) {
    this.roleId = this.data.role.id;
  }

  async ngOnInit() {
    await this.loadUsers();
  }

  private async loadUsers() {
    this.loading = true;
    try {
        const [allUsers, assignedUsers] = await Promise.all([
          firstValueFrom(this.userService.getAllUsers()),
          firstValueFrom(this.roleService.getUsersByRoleId(this.roleId)),
        ]);
        this.allUsers = allUsers;
        this.assignedUsers = assignedUsers;

        this.applyAllSearch();
        this.applyAssignedSearch();
    } finally {
        this.loading = false;
        this.cdr.detectChanges();
    }
  }

  applyAllSearch(): void {
    const term = this.searchAll.trim().toLowerCase();
    this.filteredAllUsers = term
      ? this.allUsers.filter(
          (u) =>
            u.username.toLowerCase().includes(term) ||
            u.nickname.toLowerCase().includes(term) ||
            (u.email && u.email.toLowerCase().includes(term)),
        )
      : this.allUsers;
  }

  applyAssignedSearch(): void {
    const term = this.searchAssigned.trim().toLowerCase();
    this.filteredAssignedUsers = term
      ? this.assignedUsers.filter(
          (u) =>
            u.username.toLowerCase().includes(term) ||
            u.nickname.toLowerCase().includes(term) ||
            (u.email && u.email.toLowerCase().includes(term)),
        )
      : this.assignedUsers;
  }

  addSelectedUsers(): void {
    const toAdd = this.filteredAllUsers.filter((u) => this.selectedAllUserIds.has(u.id));
    this.assignedUsers.push(...toAdd);
    this.assignedUsers = [...new Map(this.assignedUsers.map((u) => [u.id, u])).values()]; // 去重
    this.selectedAllUserIds.clear();
    this.applyAssignedSearch();
  }

  removeSelectedUsers(): void {
    const toRemove = new Set(
      this.filteredAssignedUsers
        .filter((u) => this.selectedAssignedUserIds.has(u.id))
        .map((u) => u.id),
    );
    this.assignedUsers = this.assignedUsers.filter((u) => !toRemove.has(u.id));
    this.selectedAssignedUserIds.clear();
    this.applyAssignedSearch();
  }

  addAllUsers(): void {
    const currentIds = new Set(this.assignedUsers.map((u) => u.id));
    const newUsers = this.filteredAllUsers.filter((u) => !currentIds.has(u.id));
    this.assignedUsers.push(...newUsers);
    this.assignedUsers = [...new Map(this.assignedUsers.map((u) => [u.id, u])).values()];
    this.applyAssignedSearch();
  }

  removeAllUsers(): void {
    this.assignedUsers = [];
    this.selectedAssignedUserIds.clear();
    this.applyAssignedSearch();
  }

  leftListClick(id: number) {
    if (this.selectedAllUserIds.has(id)) {
      this.selectedAllUserIds.delete(id);
    } else {
      this.selectedAllUserIds.add(id);
    }
  }


  rightListClick(id: number) {
    if (this.selectedAssignedUserIds.has(id)) {
      this.selectedAssignedUserIds.delete(id);
    } else {
      this.selectedAssignedUserIds.add(id);
    }

  }


  // ========== 保存 ==========
  async save() {
    const assignedUserIds = this.assignedUsers.map((u) => u.id);

    try {
      const res = await firstValueFrom(
        this.roleService.assignUsersToRole(this.roleId, assignedUserIds),
      );
      if (res === true) {
        this.msg.success('管理用户范围已更新成功');
      } else {
        this.msg.error('管理用户范围更新失败');
      }
    } catch (err) {
      this.msg.error('更新失败');
    }
  }
}
