import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzTreeModule, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { firstValueFrom } from 'rxjs';
import { UserService } from '../../../core/services/user.service';
import { ApiGroup } from '../../../core/models/api-group.model';
import { ApiEndpoint } from '../../../core/models/api-endpoint.model';
import { PermissionService } from '../../../core/services/permission.service';

interface User {
  id: number;
  username: string;
  email: string;
  enabled: boolean;
}

interface Menu {
  id: number;
  name: string;
  code?: string;
  parentId?: number | null;
  children?: Menu[];
}

interface Role {
  id: number;
  name: string;
}

@Component({
  selector: 'app-user-permission',
  templateUrl: './user-permission.html',
  styleUrls: ['./user-permission.scss'],
  standalone: true,
  imports: [
    NzTreeModule,
    NzTableModule,
    NzTabsModule,
    NzAlertModule,
    NzSwitchModule,
    NzTagModule,
    NzSpinModule,
    NzDescriptionsModule,
    NzButtonModule,
    NzPageHeaderModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class UserPermissionComponent {
  activeTabIndex = 0; // 用于 nz-tabs

  checkedMenuKeys: string[] = []; // 已选中的菜单 ID 字符串列表

  allMenus: Menu[] = []; // 扁平列表
  userDeniedMenuIds: Set<string> = new Set(); // 用户显式禁用的菜单 ID
  menuTree: NzTreeNodeOptions[] = []; // 转为 nz-tree 格式

  // APIs
  allApis: ApiEndpoint[] = [];
  checkedApiKeys: string[] = [];

  apiTree: NzTreeNodeOptions[] = [];
  userDeniedApiIds: Set<string> = new Set(); // 用户显式禁用的 API ID

  loading = false;

  constructor(
    private modalRef: NzModalRef,
    private msg: NzMessageService,
    @Inject(NZ_MODAL_DATA) public data: { user: User },
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private permissionService: PermissionService,
  ) {}

  async ngOnInit() {
    await this.loadPermissions();
  }

  private async loadPermissions() {
    this.loading = true;
    try {
      // 根据用户角色获取菜单
      this.allMenus = await firstValueFrom(this.userService.getMenusByUserId(this.data.user.id));
      // 获取用户禁用的菜单
      const userMenus = await firstValueFrom(
        this.userService.getMenuPermissionByUserId(this.data.user.id),
      );
      const deniedMenus = userMenus.map((item) => item.id.toString());
      this.userDeniedMenuIds = new Set(deniedMenus);
      // 构建树
      this.buildMenuTree();

      this.checkedMenuKeys = this.allMenus
        .map((item) => item.id.toString())
        .filter((item) => !this.userDeniedMenuIds.has(item));

      // 3. 获取所有 API
      this.allApis = await firstValueFrom(this.userService.getApisByUserId(this.data.user.id));

      const apiGroups = this.allApis.reduce((groups, api) => {
        let group = groups.find((g: ApiGroup) => g.name === api.apiGroup);
        if (!group) {
          group = { name: api.apiGroup, children: [] };
          groups.push(group);
        }
        group.children.push(api);
        return groups;
      }, [] as ApiGroup[]);

      this.apiTree = apiGroups.map((group: ApiGroup) => ({
        title: `${group.name} 接口 (${group.children.length})`,
        key: 'group_' + group.name,
        children: group.children.map((api: ApiEndpoint) => ({
          title: api.description,
          key: api.id.toString(),
          data: { url: api.url, description: api.description },
        })),
      }));

      // 4. 获取用户被禁用的 API
      const userApis = await firstValueFrom(
        this.userService.getApiPermissionByUserId(this.data.user.id),
      );
      const deniedApis = userApis.map((item) => item.id.toString());
      this.userDeniedApiIds = new Set(deniedApis);

      this.checkedApiKeys = this.allApis
        .map((item) => item.id.toString())
        .filter((item) => !this.userDeniedApiIds.has(item));
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private buildMenuTree() {
    const map = new Map<number, NzTreeNodeOptions>();

    // 先创建所有节点
    this.allMenus.forEach((menu) => {
      map.set(menu.id, {
        title: menu.name,
        key: menu.id.toString(),
        isLeaf: !this.allMenus.some((m) => m.parentId === menu.id),
      });
    });

    // 构建父子关系
    const roots: NzTreeNodeOptions[] = [];
    this.allMenus.forEach((menu) => {
      const node = map.get(menu.id)!;
      if (menu.parentId && map.has(menu.parentId)) {
        const parent = map.get(menu.parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    this.menuTree = roots;
  }

  resetMenuPermissions() {
    this.checkedMenuKeys = this.allMenus.map((item) => item.id.toString());
  }

  resetApiPermissions() {
    this.checkedApiKeys = this.allApis.map((item) => item.id.toString());
  }

  async savePermissions() {
    const checkedMenus = new Set<string>(this.checkedMenuKeys);
    const checkedApis = new Set<string>(this.checkedApiKeys);

    const deniedMenus = this.allMenus
      .map((item) => item.id.toString())
      .filter((item) => !checkedMenus.has(item))
      .map((item) => parseInt(item));

    const deniedApis = this.allApis
      .map((item) => item.id.toString())
      .filter((item) => !item.startsWith('group_'))
      .filter((item) => !checkedApis.has(item))
      .map((item) => parseInt(item));

    try {
      const res = await firstValueFrom(
        this.permissionService.setUserPermissions({
          userId: this.data.user.id,
          menuIds: deniedMenus,
          endpointIds: deniedApis,
        }),
      );

      if (res) {
        this.msg.success('权限配置保存成功');
      } else {
        this.msg.error('权限配置保存失败');
      }
    } catch (err) {
      this.msg.error('保存失败');
    }
  }
}
