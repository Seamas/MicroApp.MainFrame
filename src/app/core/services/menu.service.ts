import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Menu } from '../models/requests/menu.model';
import { PageResultModel } from '../models/responses/page-result.model';
import { Observable } from 'rxjs';
import { QueryMenuModel } from '../models/requests/query-menu.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  constructor(private http: HttpClient) {}

  getMenu(id: number): Observable<Menu> {
    return this.http.post<Menu>('/api/rbac/menus/get', { id });
  }

  deleteMenu(id: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/menus/delete', { id });
  }

  searchMenus(param: QueryMenuModel): Observable<PageResultModel<Menu>> {
    return this.http.post<PageResultModel<Menu>>('/api/rbac/menus/search', param);
  }

  createMenu(menu: Menu): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/menus/create', menu);
  }

  updateMenu(menu: Menu): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/menus/update', menu);
  }

  firstLevelMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>('/api/rbac/menus/first-level');
  }

  enable(id: number, enabled: boolean): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/menus/enable', { id, enabled });
  }
}
