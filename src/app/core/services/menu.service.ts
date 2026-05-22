import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Menu } from '../models/requests/menu.model';
import { PageResultModel } from '../models/responses/page-result.model';
import { Observable } from 'rxjs';
import { QueryMenuModel } from '../models/requests/query-menu.model';

interface MenuDto {
  id?: number;
  name: string;
  code: string;
  path?: string;
  microAppUrl?: string;
  parentId?: number;
  sortOrder: number;
}

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

  createMenu(menu: MenuDto): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/menus/create', menu);
  }

  updateMenu(menu: MenuDto): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/menus/update', menu);
  }

  firstLevelMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>('/api/rbac/menus/first-level');
  }

  enable(id: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/menus/enable', { id });
  }

  disable(id: number): Observable<boolean> {
    return this.http.post<boolean>('/api/rbac/menus/disable', { id });
  }

  getAllMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>('/api/rbac/menus/get-all');
  }
}
