# AI Agent Skills - 开发新功能技能指南

## 目录

1. [新增实体维护模块](#1-新增实体维护模块)
2. [新增管理页面](#2-新增管理页面)
3. [新增编辑弹窗](#3-新增编辑弹窗)
4. [新增路由配置](#4-新增路由配置)
5. [新增服务接口](#5-新增服务接口)
6. [新增表单验证](#6-新增表单验证)
7. [新增下拉选项](#7-新增下拉选项数据)
8. [完整功能开发流程](#8-完整功能开发流程)

---

## 1. 新增实体维护模块

**技能名称**: `create_entity_module`
**技能描述**: 为新实体创建完整的 CRUD 维护功能

**前置条件**: 已确定实体名称和字段

**执行步骤**:

### Step 1: 创建实体 Model
```
文件路径: src/app/core/models/requests/{entity-name}.model.ts
```
- 创建实体类，包含所有字段
- 定义字段类型（string/number/boolean/Date）
- 可选：添加可选字段标记（?）

```typescript
export class {EntityName} {
  id?: number;
  name: string;
  code: string;
  status: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### Step 2: 创建查询请求 Model
```
文件路径: src/app/core/models/requests/query-{entity-name}.model.ts
```
- 创建分页查询参数类
- 包含分页参数（pageIndex, pageSize）
- 包含筛选条件字段

```typescript
export class Query{EntityName} {
  pageIndex: number = 1;
  pageSize: number = 10;
  name?: string;
  status?: boolean;
}
```

### Step 3: 创建服务接口
```
文件路径: src/app/core/services/{entity-name}.service.ts
```
- 创建 Injectable 服务
- 实现 CRUD 方法：
  - `getEntity(id)` - 获取单个实体
  - `searchEntities(query)` - 分页查询
  - `createEntity(data)` - 创建实体
  - `updateEntity(data)` - 更新实体
  - `deleteEntity(id)` - 删除实体

### Step 4: 创建管理页面组件
```
文件路径: src/app/pages/{entities}/{entity-name}-management/{entity-name}-management.ts
文件路径: src/app/pages/{entities}/{entity-name}-management/{entity-name}-management.html
文件路径: src/app/pages/{entities}/{entity-name}-management/{entity-name}-management.scss
```
- 创建页面组件类
- 实现数据加载、分页、搜索功能
- 创建表格展示数据
- 添加新增/编辑/删除/按钮

### Step 5: 创建编辑弹窗组件
```
文件路径: src/app/pages/{entities}/{entity-name}-edit/{entity-name}-edit.ts
文件路径: src/app/pages/{entities}/{entity-name}-edit/{entity-name}-edit.html
文件路径: src/app/pages/{entities}/{entity-name}-edit/{entity-name}-edit.scss
```
- 创建弹窗组件
- 实现表单编辑功能
- 支持新建和编辑两种模式
- 实现表单验证

### Step 6: 配置路由
```
文件路径: src/app/app.routes.ts
```
- 添加路由配置
- 设置懒加载
- 配置路由守卫（如需要菜单权限）

---

## 2. 新增管理页面

**技能名称**: `create_management_page`
**技能描述**: 创建实体的管理列表页面

**前置条件**: 已有对应的实体 Model 和 Service

**执行步骤**:

### Step 1: 创建目录结构
```
src/app/pages/{entities}/{entity-name}-management/
```

### Step 2: 创建 TypeScript 组件
```
文件: {entity-name}-management.ts
```

**必要内容**:
```typescript
import { Component, OnInit } from '@angular/core';
import { NzTableQueryParams } from 'ng-zorro-antd/table';
import { {EntityName}Service } from '../../core/services/{entity-name}.service';
import { Query{EntityName} } from '../../core/models/requests/query-{entity-name}.model';
import { {EntityName} } from '../../core/models/requests/{entity-name}.model';

@Component({
  selector: 'app-{entity-name}-management',
  templateUrl: './{entity-name}-management.html',
  styleUrls: ['./{entity-name}-management.scss']
})
export class {EntityName}ManagementComponent implements OnInit {
  loading = false;
  total = 1;
  pageIndex = 1;
  pageSize = 10;
  listOfData: {EntityName}[] = [];

  query: Query{EntityName} = new Query{EntityName}();

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.query.pageIndex = this.pageIndex;
    this.query.pageSize = this.pageSize;

    this.{entityName}Service.searchEntities(this.query).subscribe({
      next: (result) => {
        this.loading = false;
        this.total = result.totalCount;
        this.listOfData = result.items;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onQueryParamsChange(params: NzTableQueryParams): void {
    this.pageIndex = params.pageIndex;
    this.pageSize = params.pageSize;
    this.loadData();
  }

  onAdd(): void { /* 打开新增弹窗 */ }
  onEdit(id: number): void { /* 打开编辑弹窗 */ }
  onDelete(id: number): void { /* 执行删除 */ }
}
```

### Step 3: 创建 HTML 模板
```
文件: {entity-name}-management.html
```

**必要内容**:
```html
<nz-card>
  <div class="table-operations">
    <button nz-button nzType="primary" (click)="onAdd()">
      <span>新增</span>
    </button>
    <div class="search-area">
      <!-- 搜索表单 -->
    </div>
  </div>

  <nz-table
    [nzData]="listOfData"
    [nzLoading]="loading"
    [nzTotal]="total"
    [nzPageIndex]="pageIndex"
    [nzPageSize]="pageSize"
    (nzQueryParams)="onQueryParamsChange($event)">
    <thead>
      <tr>
        <th>序号</th>
        <th>名称</th>
        <th>编码</th>
        <th>操作</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let data of listOfData; let i = index">
        <td>{{ i + 1 + (pageIndex - 1) * pageSize }}</td>
        <td>{{ data.name }}</td>
        <td>{{ data.code }}</td>
        <td>
          <a (click)="onEdit(data.id)">编辑</a>
          <nz-divider nzType="vertical"></nz-divider>
          <a nz-button nzType="link" nzDanger (click)="onDelete(data.id)">删除</a>
        </td>
      </tr>
    </tbody>
  </nz-table>
</nz-card>
```

### Step 4: 创建样式文件
```
文件: {entity-name}-management.scss
```

```scss
.table-operations {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
}

.search-area {
  display: flex;
  gap: 8px;
}
```

---

## 3. 新增编辑弹窗

**技能名称**: `create_edit_modal`
**技能描述**: 创建实体的编辑/新增弹窗组件

**前置条件**: 已有实体 Model

**执行步骤**:

### Step 1: 创建目录结构
```
src/app/pages/{entities}/{entity-name}-edit/
```

### Step 2: 创建 TypeScript 组件
```
文件: {entity-name}-edit.ts
```

**必要内容**:
```typescript
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { {EntityName}Service } from '../../core/services/{entity-name}.service';
import { {EntityName} } from '../../core/models/requests/{entity-name}.model';

@Component({
  selector: 'app-{entity-name}-edit',
  templateUrl: './{entity-name}-edit.html',
  styleUrls: ['./{entity-name}-edit.scss']
})
export class {EntityName}EditComponent implements OnInit {
  entityId?: number;

  form!: FormGroup;
  loading = false;
  isEdit = false;

  constructor(
    private modalRef: NzModalRef,
    @Inject(NZ_MODAL_DATA) public data: { {entityName}?: {EntityName} },
    private fb: FormBuilder,
    private {entityName}Service: {EntityName}Service,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {
    this.entityId = this.data?.{entityName}?.id;
    this.isEdit = !!this.entityId;
    this.initForm();

    if (this.isEdit) {
      this.loadData();
    }
  }

  initForm(): void {
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      code: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      status: [true],
      sortOrder: [0]
    });
  }

  loadData(): void {
    this.{entityName}Service.getEntity(this.entityId!).subscribe({
      next: (data) => {
        this.form.patchValue(data);
      }
    });
  }

  onSave(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(control => {
        control.markAsDirty();
        control.updateValueAndValidity();
      });
      return;
    }

    this.loading = true;
    const data = this.form.value;

    const request = this.isEdit
      ? this.{entityName}Service.updateEntity({ ...data, id: this.entityId })
      : this.{entityName}Service.createEntity(data);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.message.success(this.isEdit ? '更新成功' : '创建成功');
        this.modalRef.close(true);
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onCancel(): void {
    this.modalRef.close(false);
  }
}
```

> 打开弹窗时通过 `nzData` 传参：`modal.create({ nzContent: {EntityName}EditComponent, nzData: { {entityName}: row } })`。
> 本项目统一使用 `@Inject(NZ_MODAL_DATA)` 接收参数（参考 `pages/users/user-edit/user-edit.ts`），不使用 `@Input`。

### Step 3: 创建 HTML 模板
```
文件: {entity-name}-edit.html
```

**必要内容**:
```html
<nz-modal
  [(nzVisible)]="true"
  [nzTitle]="isEdit ? '编辑' : '新增'"
  [nzOkLoading]="loading"
  (nzOnOk)="onSave()"
  (nzOnCancel)="onCancel()">

  <ng-container *nzModalContent>
    <form [formGroup]="form" nz-form>
      <nz-form-item>
        <nz-form-label [nzSpan]="6" nzRequired>名称</nz-form-label>
        <nz-form-control [nzSpan]="14" nzErrorTip="请输入名称">
          <input nz-input formControlName="name" placeholder="请输入名称" />
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label [nzSpan]="6" nzRequired>编码</nz-form-label>
        <nz-form-control [nzSpan]="14" nzErrorTip="请输入编码">
          <input nz-input formControlName="code" placeholder="请输入编码" />
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label [nzSpan]="6">状态</nz-form-label>
        <nz-form-control [nzSpan]="14">
          <nz-switch formControlName="status"></nz-switch>
        </nz-form-control>
      </nz-form-item>

      <nz-form-item>
        <nz-form-label [nzSpan]="6">排序</nz-form-label>
        <nz-form-control [nzSpan]="14">
          <nz-input-number formControlName="sortOrder" [nzMin]="0" [nzMax]="9999"></nz-input-number>
        </nz-form-control>
      </nz-form-item>
    </form>
  </ng-container>
</nz-modal>
```

### Step 4: 创建样式文件
```
文件: {entity-name}-edit.scss
```

---

## 4. 新增路由配置

**技能名称**: `add_route`
**技能描述**: 为新页面添加路由配置

**前置条件**: 已创建页面组件

**执行步骤**:

### Step 1: 打开路由文件
```
文件: src/app/app.routes.ts
```

### Step 2: 导入组件
```typescript
import { {EntityName}ManagementComponent } from './pages/{entities}/{entity-name}-management/{entity-name}-management';
```

### Step 3: 添加路由配置
```typescript
{
  path: '{entity-name-plural}',
  loadComponent: () =>
    import('./pages/{entities}/{entity-name}-management/{entity-name}-management').then(
      (m) => m.{EntityName}ManagementComponent,
    ),
  canActivate: [menuGuard],
},
```

### Step 4: 添加菜单数据（后端）
在后端菜单表中添加对应的菜单记录：
```json
{
  "name": "实体名称",
  "code": "router",
  "path": "/{entity-name-plural}",
  "parentId": null,
  "sortOrder": 10
}
```

`code` 表示菜单类型，不是业务编码：内部 Angular 页面用 `router`，外接子应用用 `microapp`（并填写 `microAppUrl`）。`parentId` 为 `null` 表示一级菜单。

菜单创建后还需要：
1. 调用 `POST /rbac/endpoints/init` 将新增接口登记到接口表；
2. 在角色/用户权限中授权对应菜单和接口，否则 `menuGuard` 和 `PermissionMiddleware` 会分别拦截。

---

## 5. 新增服务接口

**技能名称**: `create_service`
**技能描述**: 创建实体的 HTTP 服务

**前置条件**: 已创建实体 Model

**执行步骤**:

### Step 1: 创建服务文件
```
文件: src/app/core/services/{entity-name}.service.ts
```

### Step 2: 实现服务类
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { {EntityName} } from '../models/requests/{entity-name}.model';
import { Query{EntityName} } from '../models/requests/query-{entity-name}.model';
import { PageResultModel } from '../models/responses/page-result.model';

@Injectable({ providedIn: 'root' })
export class {EntityName}Service {
  constructor(private http: HttpClient) {}

  getEntity(id: number): Observable<{EntityName}> {
    return this.http.post<{EntityName}>('/api/rbac/{entity-name-plural}/get', { id });
  }

  searchEntities(query: Query{EntityName}): Observable<PageResultModel<{EntityName}>> {
    return this.http.post<PageResultModel<{EntityName}>>('/api/rbac/{entity-name-plural}/search', query);
  }

  createEntity(data: Partial<{EntityName}>): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/{entity-name-plural}/create', data);
  }

  updateEntity(data: Partial<{EntityName}>): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/{entity-name-plural}/update', data);
  }

  deleteEntity(id: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/{entity-name-plural}/delete', { id });
  }

  enable(id: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/{entity-name-plural}/enable', { id });
  }

  disable(id: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/{entity-name-plural}/disable', { id });
  }
}
```

---

## 6. 新增表单验证

**技能名称**: `add_form_validation`
**技能描述**: 为表单添加验证规则

**前置条件**: 已创建表单

**执行步骤**:

### Step 1: 使用 FormBuilder 创建表单组
```typescript
this.form = this.fb.group({
  name: [null, [Validators.required]],
  code: [null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
  email: [null, [Validators.required, Validators.email]],
  phone: [null, [Validators.pattern(/^1[3-9]\d{9}$/)]],
  sortOrder: [0, [Validators.min(0), Validators.max(9999)]]
});
```

### Step 2: 添加错误提示
```html
<nz-form-control nzErrorTip="请输入名称">
  <input nz-input formControlName="name" />
</nz-form-control>

<nz-form-control [nzErrorTip]="codeErrorTpl">
  <input nz-input formControlName="code" />
  <ng-template #codeErrorTpl let-control>
    <ng-container *ngIf="control.hasError('required')">编码不能为空</ng-container>
    <ng-container *ngIf="control.hasError('pattern')">编码格式不正确</ng-container>
  </ng-template>
</nz-form-control>
```

### Step 3: 提交时验证
```typescript
onSave(): void {
  if (this.form.invalid) {
    Object.values(this.form.controls).forEach(control => {
      control.markAsDirty();
      control.updateValueAndValidity();
    });
    return;
  }
  // 执行保存
}
```

---

## 7. 新增下拉选项数据

**技能名称**: `create_dropdown_options`
**技能描述**: 为下拉框创建选项数据

**前置条件**: 有需要下拉选择的关联数据

**执行步骤**:

### Step 1: 创建选项列表（简单场景）
```typescript
statusOptions = [
  { label: '启用', value: true },
  { label: '禁用', value: false }
];
```

### Step 2: 从服务获取选项（关联其他实体）
```typescript
import { RoleService } from '../../core/services/role.service';

roleOptions: { label: string; value: number }[] = [];

ngOnInit(): void {
  this.loadRoleOptions();
}

loadRoleOptions(): void {
  this.roleService.listRoles().subscribe({
    next: (roles) => {
      this.roleOptions = roles.map(role => ({
        label: role.name,
        value: role.id
      }));
    }
  });
}
```

### Step 3: 在模板中使用
```html
<nz-select formControlName="roleId" [nzOptions]="roleOptions" nzPlaceHolder="请选择角色"></nz-select>
```

---

## 8. 完整功能开发流程

**技能名称**: `develop_full_feature`
**技能描述**: 从头开发一个完整的实体管理功能

**前置条件**: 已明确需求和实体字段

**执行步骤汇总**:

### Phase 1: 数据层（Model & Service）
1. ✅ 创建实体 Model → `src/app/core/models/requests/{entity}.model.ts`
2. ✅ 创建查询 Model → `src/app/core/models/requests/query-{entity}.model.ts`
3. ✅ 创建服务 → `src/app/core/services/{entity}.service.ts`

### Phase 2: 页面层（Management Page）
4. ✅ 创建管理页面目录 → `src/app/pages/{entities}/{entity}-management/`
5. ✅ 创建组件类 → `{entity}-management.ts`
6. ✅ 创建模板 → `{entity}-management.html`
7. ✅ 创建样式 → `{entity}-management.scss`

### Phase 3: 编辑弹窗（Edit Modal）
8. ✅ 创建编辑弹窗目录 → `src/app/pages/{entities}/{entity}-edit/`
9. ✅ 创建弹窗组件类 → `{entity}-edit.ts`
10. ✅ 创建弹窗模板 → `{entity}-edit.html`
11. ✅ 创建弹窗样式 → `{entity}-edit.scss`

### Phase 4: 路由与菜单
12. ✅ 配置路由 → `src/app/app.routes.ts`
13. ✅ 添加后端菜单数据

### Phase 5: 测试验证
14. ✅ 测试新增功能
15. ✅ 测试编辑功能
16. ✅ 测试删除功能
17. ✅ 测试启用/禁用功能
18. ✅ 测试分页和搜索

---

## 命名规范速查

| 类型 | 命名规则 | 示例 |
|:---|:---|:---|
| 实体名称 | PascalCase | `UserRole`, `ApiEndpoint` |
| 实体变量 | camelCase | `userRole`, `apiEndpoint` |
| 复数形式 | +s 或规则变化 | `user` → `users`, `menu` → `menus` |
| 文件名称 | kebab-case | `user-role.service.ts` |
| 路由路径 | kebab-case | `/user-roles` |
| API 路径 | kebab-case | `/api/rbac/user-roles` |
| 组件选择器 | kebab-case | `app-user-role-management` |

---

## 目录结构速查

```
src/app/
├── core/
│   ├── models/
│   │   └── requests/
│   │       ├── {entity}.model.ts          # 实体模型
│   │       └── query-{entity}.model.ts    # 查询模型
│   └── services/
│       └── {entity}.service.ts            # HTTP 服务
├── pages/
│   └── {entities}/
│       ├── {entity}-management/           # 管理页面
│       │   ├── {entity}-management.ts
│       │   ├── {entity}-management.html
│       │   └── {entity}-management.scss
│       └── {entity}-edit/                 # 编辑弹窗
│           ├── {entity}-edit.ts
│           ├── {entity}-edit.html
│           └── {entity}-edit.scss
└── app.routes.ts                          # 路由配置
```
