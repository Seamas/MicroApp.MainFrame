import { ChangeDetectorRef, Component, Inject, Input, OnInit } from '@angular/core';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzFormatEmitEvent, NzTreeModule, NzTreeNode, NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { firstValueFrom } from 'rxjs';
import { MenuService } from '../../../core/services/menu.service';
import { Menu } from '../../../core/models/requests/menu.model';
import { ApiEndpointService } from '../../../core/services/endpoint.service';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { Role } from '../../../core/models/requests/role.model';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { PermissionService } from '../../../core/services/permission.service';
import { RoleService } from '../../../core/services/role.service';
import { ApiGroup } from '../../../core/models/api-group.model';
import { ApiEndpoint } from '@app/core/models/api-endpoint.model';

interface MenuDto {
  id: number;
  name: string;
  parentId?: number | null;
  sortOrder: number;
  children?: MenuDto[];
}

@Component({
  selector: 'app-role-permission',
  templateUrl: './role-permission.html',
  styleUrls: ['./role-permission.scss'],
  standalone: true,
  imports: [
    NzTabsModule,
    NzButtonModule,
    NzPageHeaderModule,
    NzSpinModule,
    NzAlertModule,
    NzTreeModule,
    NzCheckboxModule,
  ],
})
export class RolePermissionComponent implements OnInit {
  roleId!: number;

  activeTab = 0;

  loading = false;

  // ===== 菜单权限 =====
  menuTree: NzTreeNodeOptions[] = [];
  checkedMenuIds: string[] = [];


  // ===== API 权限 =====

  apiGroupTree: NzTreeNodeOptions[] = [];
  checkedApiIds: string[] = [];

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: { role: Role },
    private msg: NzMessageService,
    private menuService: MenuService,
    private endpointService: ApiEndpointService,
    private cdr: ChangeDetectorRef,
    private permissionService: PermissionService,
    private roleService: RoleService,
  ) {
    this.roleId = this.data.role.id;
  }

  async ngOnInit() {
    await this.loadPermissions();
  }

  private async loadPermissions() {
    this.loading = true;

    try {
      const [allMenus, grantedMenus, allApis, grantedApis] = await Promise.all([
        firstValueFrom(this.roleService.getMenusByRole(this.roleId)),
        firstValueFrom(this.roleService.getMenusByRole(this.roleId)),
        firstValueFrom(this.roleService.getEndpointsByRole(this.roleId)),
        firstValueFrom(this.roleService.getEndpointsByRole(this.roleId))
      ]);

      this.makeMenus(allMenus, grantedMenus);
      this.makeApis(allApis, grantedApis);

    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }

  }

  private makeMenus(allMenus: Menu[], grantedMenus: Menu[]) {
    this.checkedMenuIds = grantedMenus.map((item) => item.id.toString());
    this.menuTree = this.buildMenuTree(allMenus);
  }

  private buildMenuTree(menus: Menu[]): NzTreeNodeOptions[] {
    const map = new Map<number, MenuDto>();
    const tree: MenuDto[] = [];

    menus.forEach((menu) => {
      map.set(menu.id, {
        ...menu,
        children: [],
      });
    });

    menus.forEach((menu) => {
      const menuNode = map.get(menu.id);
      if (menu.parentId == null) {
        tree.push(menuNode!);
      } else {
        const parentNode = map.get(menu.parentId);
        if (parentNode) {
          parentNode.children?.push(menuNode!);
        }
      }
    });

    function sortChildren(node: MenuDto) {
      if (node.children && node.children.length > 0) {
        node.children.sort((a, b) => a.sortOrder - b.sortOrder);
      }
    }

    tree.sort((a, b) => a.sortOrder - b.sortOrder);
    tree.forEach((node) => sortChildren(node));

    const resTree: NzTreeNodeOptions[] = [];

    function mapToTreeNode(node: MenuDto): NzTreeNodeOptions {
      const isLeaf = node.children?.length ? node.children.length == 0 : true;

      const children = node.children?.map((item) => mapToTreeNode(item));
      return { key: node.id.toString(), title: node.name, isLeaf, children };
    }

    tree.forEach((node) => {
      const item = mapToTreeNode(node);
      resTree.push(item);
    });

    return resTree;
  }

  private makeApis(allApis: ApiEndpoint[], grantedApis: ApiEndpoint[]) {
      this.checkedApiIds = grantedApis.map((item) => item.id.toString());
      const apiGroups = allApis.reduce((groups, api) => {
        let group = groups.find((g) => g.name === api.apiGroup);
        if (!group) {
          group = { name: api.apiGroup, children: [] };
          groups.push(group);
        }
        group.children.push(api);
        return groups;
      }, [] as ApiGroup[]);

      this.apiGroupTree = apiGroups.map((group) => ({
        title: `${group.name} 接口 (${group.children.length})`,
        key: 'group_' + group.name,
        children: group.children.map((api) => ({
          title: api.description,
          key: api.id.toString(),
          data: { url: api.url, description: api.description },
          isLeaf: true,
        })),
      }));
  }

  // ===== 保存 =====
  async save() {
    const menuIds = this.checkedMenuIds.map((item) => parseInt(item));
    const apiIds = this.checkedApiIds
      .filter((item) => !item.startsWith('group_'))
      .map((item) => parseInt(item));

    try {
      const res = await firstValueFrom(
        this.permissionService.setRolePermissions({
          roleId: this.roleId,
          menuIds: menuIds,
          endpointIds: apiIds,
        }),
      );
      this.msg.success('角色权限已保存');
    } catch (err) {
      this.msg.error('保存失败');
    }
  }
}
