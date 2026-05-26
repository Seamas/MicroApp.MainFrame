# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

- **Install**: `pnpm install` (requires pnpm >=9.0.0, Node >=18.19.1)
- **Dev server**: `ng serve` → `http://localhost:4200/`
- **Build (prod)**: `ng build` → outputs to `dist/`
- **Build (watch/dev)**: `ng build --watch --configuration development`
- **Unit tests**: `ng test` (uses Vitest)
- **Code scaffolding**: `ng generate component|service|guard <name>`

## Architecture

This is an **Angular 21 micro-frontend shell** (基座) that hosts sub-applications via `@micro-zoe/micro-app`. It provides authentication, RBAC management (users/roles/menus/API endpoints), and dynamic sub-app routing.

### Micro-frontend mechanism

- `@micro-zoe/micro-app` is started globally in `src/main.ts`. Sub-apps are rendered via `<micro-app>` custom web components.
- **`LayoutComponent`** (`src/app/layouts/layout/layout.ts:62-107`) is the core of dynamic routing. On init, it fetches the user's visible menus, builds a menu tree, and **dynamically registers routes** for any menu item whose `code === 'microapp'`. Each such route points to `MicroAppContainerComponent`, which creates a `<micro-app>` element pointing to the sub-app's URL.
- The `Menu` model has `code`, `path`, and `microAppUrl` fields (`src/app/core/models/requests/menu.model.ts`). `code` distinguishes menu types: `'router'` for internal Angular routes vs `'microapp'` for external sub-apps.

### HTTP layer

- **`apiInterceptor`** (`src/app/core/interceptors/api.interceptor.ts`): Unwraps the `ApiResult<T>` envelope (`{ success, message, data }`). On success, it extracts `data` so services receive the payload directly. On failure, it shows an error toast via `NzMessageService`. HTTP 401 clears the user session.
- **`tokenInterceptor`** (`src/app/core/interceptors/token.interceptor.ts`): Attaches `Authorization: Bearer <token>` from sessionStorage.
- **`RawHttpClient`** (`src/app/core/services/raw.http.ts`): Uses `HttpBackend` directly to bypass all interceptors — used only by `AppConfigService` to load `config/app.config.json`.

### Route guards (`src/app/core/guards/route.guards.ts`)

| Guard | Purpose |
|---|---|
| `authGuard` | Redirects already-logged-in users away from login/register |
| `mainGuard` | Redirects unauthenticated users to `/login` |
| `menuGuard` | Checks that the target route's first path segment exists in the user's visible menus (fetched from `PermissionService`). Whitelists `changePwd` and `profile`. |

### State management

Session-based, stored in `sessionStorage` via `src/app/core/stores/userstore.ts`: token, username, nickname, and cached visible menus. No NgRx or other state library — uses singleton services with `providedIn: 'root'`.

### Backend API

- All API calls go to `/api/rbac/**`. The dev server proxies `/api/rbac` → `http://localhost:5202` (configured in `proxy.conf.json`), with `/api/` prefix stripped.
- Production uses Nginx (`default.conf`) serving the Angular build at `/mainapp/` and sub-app builds at `/subapp/`.

### Component conventions

- All components are **standalone** (Angular 21 default). `@schematics/angular:component` is configured with `skipTests: true`.
- UI library: **ng-zorro-antd** (NG-ZORRO). Icons from `@ant-design/icons-angular`, registered in `src/app/icons-provider.ts`.
- Path aliases in `tsconfig.json`: `@app/*` → `src/app/*`, `@core/*` → `src/app/core/*`.
- Styles use SCSS. Build `baseHref` is `/mainapp/`.

### Docker deployment

The `Dockerfile` uses `nginx:alpine`, copies `dist/mainapp` → `/usr/share/nginx/html/mainapp` and `dist/subapp` → `/usr/share/nginx/html/subapp`, with the Nginx config serving both locations.
