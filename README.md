# MainApp（微前端基座）

Angular 21 微前端基座，提供登录认证、RBAC 管理（用户 / 角色 / 菜单 / 接口）以及子应用动态路由。

## 环境要求

- Node.js `>=18.19.1 <24.0.0`
- pnpm `>=9.0.0`（`packageManager`: `pnpm@9.15.0`）

## 安装与开发

```bash
pnpm install
ng serve --proxy-config proxy.conf.json
```

浏览器访问 `http://localhost:4200/`。

开发服务器通过 `proxy.conf.json` 将 `/api/rbac/**` 代理到 `http://localhost:5202`，并去掉 `/api` 前缀。该代理未写入 `angular.json`，因此启动时必须显式传入 `--proxy-config`。

后端默认端口为 `5202`（见 `backend/MyWebProject.Host/Properties/launchSettings.json`），可先启动依赖：

```bash
docker compose -f backend/docker-compose.yml up -d postgres redis
dotnet run --project backend/MyWebProject.Host
```

## 构建

```bash
pnpm build        # 等价于 ng build
```

产物默认输出到 `dist/main-app/`，`baseHref` 为 `/mainapp/`。

> `Dockerfile` 复制的是 `dist/mainapp`。如需直接使用该 Dockerfile，请在 `angular.json` 中设置
> `"outputPath": "dist/mainapp"`，或构建后把 `dist/main-app` 重命名为 `dist/mainapp`。

## 单元测试

```bash
ng test
```

使用 Vitest 运行。项目未配置端到端测试框架。

## 目录结构

```
src/app/
├── core/            # 模型、服务、拦截器、守卫、会话存储
├── layouts/         # 基座布局、菜单、子应用容器
├── pages/           # 登录/注册、用户、角色、菜单、接口管理页面
├── app.config.ts    # 路由、HTTP 拦截器、ng-zorro 配置
├── app.routes.ts    # 基座路由
└── icons-provider.ts
```

- 组件均为 standalone，`@schematics/angular:component` 默认 `skipTests: true`。
- UI 使用 ng-zorro-antd，图标在 `icons-provider.ts` 注册。
- 路径别名：`@app/*`、`@core/*`、`@shared/*`（见 `tsconfig.json`）。
- 会话数据（token / username / nickname / 可见菜单）存放在 `sessionStorage`。

## 微前端

- `src/main.ts` 启动 `@micro-zoe/micro-app`。
- `LayoutComponent` 拉取用户可见菜单并构建菜单树；`code === 'microapp'` 的菜单会被动态注册到 `MicroAppContainerComponent`，由后者渲染 `<micro-app>` 并下发子路由；`code === 'router'` 的菜单走 Angular 内部路由。

## 部署

`Dockerfile` 基于 `nginx:alpine`，`default.conf` 分别托管：

- `/mainapp/` → 基座构建产物
- `/subapp/` → 子应用构建产物
