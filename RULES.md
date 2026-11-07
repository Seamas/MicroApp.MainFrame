# AI Agent Rules - 开发规则文档

## 目录

1. [代码组织规则](#1-代码组织规则)
2. [命名规范规则](#2-命名规范规则)
3. [组件开发规则](#3-组件开发规则)
4. [服务开发规则](#4-服务开发规则)
5. [表单处理规则](#5-表单处理规则)
6. [路由配置规则](#6-路由配置规则)
7. [错误处理规则](#7-错误处理规则)
8. [样式规范规则](#8-样式规范规则)

---

## 1. 代码组织规则

### 1.1 目录结构规则

| 规则编号 | 规则描述 | 违规处理 |
|:---|:---|:---|
| ORG-001 | 实体/请求 Model 放在 `src/app/core/models/requests/`，响应 Model 放在 `src/app/core/models/responses/`，通用 Model 放在 `src/app/core/models/` | 新建文件必须遵循 |
| ORG-002 | 所有 HTTP 服务放在 `src/app/core/services/` 目录下 | 新建文件必须遵循 |
| ORG-003 | 页面组件放在 `src/app/pages/{entity-plural}/` 目录下 | 新建页面必须遵循 |
| ORG-004 | 每个页面功能包含 3 个文件：.ts、.html、.scss | 不得合并或省略 |

### 1.2 文件导入规则

| 规则编号 | 规则描述 |
|:---|:---|
| ORG-005 | 相对路径导入层级不超过 3 层（尽量使用绝对路径） |
| ORG-006 | Model 类型导入使用 `import type` 语法 |
| ORG-007 | 组件间通信优先使用 @Input/@Output，避免直接访问子组件 |

---

## 2. 命名规范规则

### 2.1 文件命名

| 规则编号 | 规则类型 | 规则描述 | 正例 | 反例 |
|:---|:---|:---|:---|:---|
| NAME-001 | 文件名 | TypeScript 文件使用 kebab-case | `user.service.ts` | `UserService.ts` |
| NAME-002 | 文件名 | HTML 模板文件使用 kebab-case | `login.html` | `login.component.html` |
| NAME-003 | 文件名 | SCSS 样式文件使用 kebab-case | `login.scss` | `login.style.scss` |

### 2.2 类命名

| 规则编号 | 规则类型 | 规则描述 | 正例 | 反例 |
|:---|:---|:---|:---|:---|
| NAME-004 | 类名 | 使用 PascalCase | `UserService` | `userService` |
| NAME-005 | 类名 | 组件类名以 Component 结尾 | `UserManagementComponent` | `UserManagement` |
| NAME-006 | 类名 | 服务类名以 Service 结尾 | `AuthService` | `Auth` |

### 2.3 变量命名

| 规则编号 | 规则类型 | 规则描述 | 正例 | 反例 |
|:---|:---|:---|:---|:---|
| NAME-007 | 变量 | 使用 camelCase | `userName` | `user_name` |
| NAME-008 | 变量 | 布尔变量使用 is/has/can 前缀 | `isActive` | `active` |
| NAME-009 | 变量 | 列表变量使用复数或 List 后缀 | `users` | `userList` |
| NAME-010 | 常量 | 使用全大写+下划线 | `MAX_LENGTH` | `maxLength` |

### 2.4 路由命名

| 规则编号 | 规则描述 | 正例 | 反例 |
|:---|:---|:---|:---|
| NAME-011 | URL 路径使用小写，多单词用 kebab-case | `/api/rbac/user-roles` | `/api/rbac/userRoles` |
| NAME-012 | 路由路径使用 kebab-case | `/user-management` | `/userManagement` |

---

## 3. 组件开发规则

### 3.1 组件结构规则

| 规则编号 | 规则描述 | 强制级别 |
|:---|:---|:---|
| COMP-001 | 组件必须指定 selector | 必须 |
| COMP-002 | 组件必须指定 templateUrl 或 template | 必须 |
| COMP-003 | 组件必须指定 styleUrls 或 styles | 必须 |
| COMP-004 | 组件必须实现 OnInit 接口（如果有初始化逻辑） | 必须 |
| COMP-005 | 组件必须实现 OnDestroy 接口（如果有订阅需要清理） | 必须 |

### 3.2 组件代码规则

```typescript
// ✅ 正确示例
@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.html',
  styleUrls: ['./user-management.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // 初始化逻辑
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

| 规则编号 | 规则描述 |
|:---|:---|
| COMP-006 | 使用 `private destroy$ = new Subject<void>()` 管理订阅生命周期 |
| COMP-007 | 长期订阅必须用 `takeUntil(destroy$)` 在 `ngOnDestroy` 中取消；一次性请求优先使用 `firstValueFrom` |
| COMP-008 | 优先使用 async pipe 替代手动订阅 |

---

## 4. 服务开发规则

### 4.1 服务定义规则

| 规则编号 | 规则描述 |
|:---|:---|
| SERV-001 | 服务必须使用 `@Injectable({ providedIn: 'root' })` 装饰器 |
| SERV-002 | 服务必须注入 HttpClient |
| SERV-003 | 服务方法返回 Observable 类型 |
| SERV-004 | CRUD 方法命名遵循规范：get/search/create/update/delete |

### 4.2 API 路径规则

| 规则编号 | 规则描述 | 示例 |
|:---|:---|:---|
| SERV-005 | 本项目统一使用 POST + 动词路径（非严格 RESTful），路径小写，多单词用 kebab-case | POST `/api/rbac/users/create` |
| SERV-006 | 获取单个实体使用 POST + id | POST `/api/rbac/users/get` |
| SERV-007 | 分页查询使用 POST + search | POST `/api/rbac/users/search` |
| SERV-008 | 所有 API 路径前缀为 `/api/rbac/` | - |

### 4.3 服务代码规则

```typescript
// ✅ 正确示例
@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getUser(id: number): Observable<User> {
    return this.http.post<User>('/api/rbac/users/get', { id });
  }

  searchUsers(query: QueryUser): Observable<PageResultModel<User>> {
    return this.http.post<PageResultModel<User>>('/api/rbac/users/search', query);
  }
}
```

---

## 5. 表单处理规则

### 5.1 表单验证规则

| 规则编号 | 规则描述 | 强制级别 |
|:---|:---|:---|
| FORM-001 | 所有必填字段必须添加 Validators.required | 必须 |
| FORM-002 | 长度限制必须添加 Validators.minLength/maxLength | 必须 |
| FORM-003 | 格式验证必须添加 Validators.pattern | 推荐 |
| FORM-004 | 提交前必须调用 markAsDirty() 和 updateValueAndValidity() | 必须 |

### 5.2 表单代码规则

```typescript
// ✅ 正确示例
this.form = this.fb.group({
  name: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
  code: [null, [Validators.required, Validators.pattern(/^[a-zA-Z0-9_-]+$/)]],
  email: [null, [Validators.required, Validators.email]]
});
```

### 5.3 表单提交规则

```typescript
// ✅ 正确示例
onSave(): void {
  if (this.form.invalid) {
    Object.values(this.form.controls).forEach(control => {
      control.markAsDirty();
      control.updateValueAndValidity();
    });
    return;
  }
  // 执行保存逻辑
}
```

---

## 6. 路由配置规则

### 6.1 路由加载规则

| 规则编号 | 规则描述 | 强制级别 |
|:---|:---|:---|
| ROUTE-001 | 页面组件必须使用懒加载 | 必须 |
| ROUTE-002 | 使用 loadComponent 而非直接 import | 必须 |
| ROUTE-003 | 需要权限的页面必须添加 menuGuard | 必须 |

### 6.2 路由代码规则

```typescript
// ✅ 正确示例
{
  path: 'users',
  loadComponent: () =>
    import('./pages/users/user-management/user-management').then(
      (m) => m.UserManagementComponent,
    ),
  canActivate: [menuGuard],
},
```

### 6.3 路由守卫规则

| 规则编号 | 规则描述 |
|:---|:---|
| ROUTE-004 | 公开页面（登录/注册）使用 authGuard |
| ROUTE-005 | 受保护页面使用 mainGuard |
| ROUTE-006 | 需要菜单权限的页面使用 menuGuard |

---

## 7. 错误处理规则

### 7.1 HTTP 错误处理

| 规则编号 | 规则描述 |
|:---|:---|
| ERR-001 | 所有 HTTP 请求必须处理错误回调 |
| ERR-002 | 使用 subscribe 时必须提供 error 回调 |
| ERR-003 | 错误时必须设置 loading = false |

### 7.2 错误处理代码规则

```typescript
// ✅ 正确示例
this.userService.getUser(id).subscribe({
  next: (data) => {
    this.loading = false;
    this.form.patchValue(data);
  },
  error: () => {
    this.loading = false;
    this.message.error('加载数据失败');
  }
});
```

### 7.3 错误提示规则

| 规则编号 | 规则描述 |
|:---|:---|
| ERR-004 | 操作成功使用 message.success() |
| ERR-005 | 操作失败使用 message.error() |
| ERR-006 | 删除/禁用等危险操作前必须弹出确认框 |

---

## 8. 样式规范规则

### 8.1 样式文件规则

| 规则编号 | 规则描述 |
|:---|:---|
| STYLE-001 | 每个组件有独立的 .scss 文件 |
| STYLE-002 | 使用 BEM 命名规范 | classes: `block__element--modifier` |
| STYLE-003 | 避免使用 !important |
| STYLE-004 | 使用 scss 变量定义颜色、间距等 |

### 8.2 响应式规则

| 规则编号 | 规则描述 |
|:---|:---|
| STYLE-005 | 使用 ng-zorro 内置的响应式栅格系统 |
| STYLE-006 | 移动端优先考虑 | < nzSpan={24} |
| STYLE-007 | 使用 flexbox 布局优先于 float |

### 8.3 样式示例

```scss
// ✅ 正确示例
.table-operations {
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &__button {
    margin-right: 8px;
  }

  &--hidden {
    display: none;
  }
}
```

---

## 9. 其他开发规范

### 9.1 TypeScript 规则

| 规则编号 | 规则描述 |
|:---|:---|
| TS-001 | 优先使用 const，必要时使用 let，禁止使用 var |
| TS-002 | 使用箭头函数，避免不必要的 this |
| TS-003 | 接口和类型定义使用 interface |
| TS-004 | 使用 strict 模式 |

### 9.2 代码质量规则

| 规则编号 | 规则描述 |
|:---|:---|
| QUAL-001 | 删除未使用的导入 |
| QUAL-002 | 删除注释掉的代码 |
| QUAL-003 | 函数长度不超过 50 行 |
| QUAL-004 | 文件不超过 300 行 |

---

## 10. 常用验证规则速查

### 10.1 用户名/编码类
```
用户名格式: ^[a-zA-Z0-9_]+$
用户名长度: 3-20 字符（注册/用户编辑表单）
编码格式: ^[a-zA-Z0-9_-]+$
编码长度: 2-50 字符（按具体表单）
```

### 10.2 邮箱
```
格式: ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
```

### 10.3 手机号
```
格式: ^1[3-9]\d{9}$
```

### 10.4 密码
```
长度: 至少 6 字符（当前登录/注册/改密表单仅校验最小长度）
```

### 10.5 排序值
```
范围: 0-9999
```
