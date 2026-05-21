import { Component, OnInit, Input, Inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { User } from '../../../core/models/requests/user.model';
import { RoleService } from '../../../core/services/role.service';
import { UserService } from '../../../core/services/user.service';
import { firstValueFrom } from 'rxjs';
import { NzButtonModule } from 'ng-zorro-antd/button';

interface Role {
  id: number;
  name: string;
  code?: string;
  description?: string;
}

@Component({
  selector: 'app-user-role-assignment',
  templateUrl: './user-role-assignment.html',
  styleUrls: ['./user-role-assignment.scss'],
  standalone: true,
  imports: [
    NzListModule,
    NzInputModule,
    NzSpinModule,
    NzPageHeaderModule,
    NzButtonModule,
    FormsModule,
  ],
})
export class UserRoleAssignmentComponent implements OnInit {
  user: User;

  allRoles: Role[] = [];
  filteredAllRoles: Role[] = [];
  selectedAllRoleIds = new Set<number>();

  // 已分配角色（右侧）
  assignedRoles: Role[] = [];
  filteredAssignedRoles: Role[] = [];
  selectedAssignedRoleIds = new Set<number>();

  searchAll = '';
  searchAssigned = '';

  loading = false;

  constructor(
    private modalRef: NzModalRef,
    private msg: NzMessageService,
    private cdr: ChangeDetectorRef,
    @Inject(NZ_MODAL_DATA) public data: { user: User },
    private roleService: RoleService,
    private userService: UserService,
  ) {
    this.user = this.data?.user;
  }

  async ngOnInit() {
    await this.loadRoles();
  }

  private async loadRoles() {
    this.loading = true;
    try {

      const [allRoles, assignedRoles] = await Promise.all([
         firstValueFrom(this.roleService.listRoles()),
         firstValueFrom(this.userService.getRoleByUserId(this.user.id)),
      ]);

      this.allRoles = allRoles;
      this.assignedRoles = assignedRoles;

      this.applyAllSearch();
      this.applyAssignedSearch();
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  applyAllSearch(): void {
    const term = this.searchAll.trim().toLowerCase();
    this.filteredAllRoles = term
      ? this.allRoles.filter(
          (r) =>
            r.name.toLowerCase().includes(term) || (r.code && r.code.toLowerCase().includes(term)),
        )
      : this.allRoles;
  }

  applyAssignedSearch(): void {
    const term = this.searchAssigned.trim().toLowerCase();
    this.filteredAssignedRoles = term
      ? this.assignedRoles.filter(
          (r) =>
            r.name.toLowerCase().includes(term) || (r.code && r.code.toLowerCase().includes(term)),
        )
      : this.assignedRoles;
  }

  addSelectedRoles(): void {
    const toAdd = this.filteredAllRoles.filter((r) => this.selectedAllRoleIds.has(r.id));
    this.assignedRoles.push(...toAdd);
    this.assignedRoles = [...new Map(this.assignedRoles.map((r) => [r.id, r])).values()]; // 去重
    this.selectedAllRoleIds.clear();
    this.applyAssignedSearch(); // 刷新右侧过滤
  }

  removeSelectedRoles(): void {
    const toRemove = new Set(
      this.filteredAssignedRoles
        .filter((r) => this.selectedAssignedRoleIds.has(r.id))
        .map((r) => r.id),
    );
    this.assignedRoles = this.assignedRoles.filter((r) => !toRemove.has(r.id));
    this.selectedAssignedRoleIds.clear();
    this.applyAssignedSearch();
  }

  addAllRoles(): void {
    const currentIds = new Set(this.assignedRoles.map((r) => r.id));
    const newRoles = this.filteredAllRoles.filter((r) => !currentIds.has(r.id));
    this.assignedRoles.push(...newRoles);
    this.assignedRoles = [...new Map(this.assignedRoles.map((r) => [r.id, r])).values()];
    this.applyAssignedSearch();
  }

  removeAllRoles(): void {
    this.assignedRoles = [];
    this.selectedAssignedRoleIds.clear();
    this.applyAssignedSearch();
  }

  leftRoleClick(id: number) {
    if (this.selectedAllRoleIds.has(id)) {
      this.selectedAllRoleIds.delete(id);
    } else {
      this.selectedAllRoleIds.add(id);
    }
  }

  rightRoleClick(id: number) {
    if (this.selectedAssignedRoleIds.has(id)) {
      this.selectedAssignedRoleIds.delete(id);
    } else {
      this.selectedAssignedRoleIds.add(id);
    }
  }

  async save() {
    const assignedIds = this.assignedRoles.map((r) => r.id);
    try {
      const res = await firstValueFrom(this.userService.assignRoles(this.user.id, assignedIds));
      if (res === true) {
        this.msg.success('角色分配已保存');
      } else {
        this.msg.error('角色分配失败');
      }
    } catch (err) {
      this.msg.error('保存失败');
    }
  }
}
