import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResultModel } from '../models/responses/page-result.model';

interface SearchApiEndpointsRequest {
  pageIndex?: number;
  pageSize?: number;
  url?: string;
  apiGroup?: string;
  description?: string;
  isEnabled?: boolean | null;
}

interface CreateApiEndpointRequest {
  url: string;
  apiGroup: string;
  description: string;
  isEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiEndpointService {
  constructor(private http: HttpClient) {}

  getApiEndpoint(id: number): Observable<ApiEndpoint> {
    return this.http.post<ApiEndpoint>(`/api/rbac/endpoints/get`, { id });
  }

  deleteApiEndpoint(id: number): Observable<boolean> {
    return this.http.post<boolean>(`/api/rbac/endpoints/delete`, { id });
  }

  searchApiEndpoints(query: SearchApiEndpointsRequest): Observable<PageResultModel<ApiEndpoint>> {
    return this.http.post<PageResultModel<ApiEndpoint>>(`/api/rbac/endpoints/search`, query);
  }

  createApiEndpoint(endpoint: CreateApiEndpointRequest): Observable<boolean> {
    return this.http.post<boolean>(`/api/rbac/endpoints/create`, endpoint);
  }

  updateApiEndpoint(endpoint: ApiEndpoint): Observable<boolean> {
    return this.http.post<boolean>(`/api/rbac/endpoints/update`, endpoint);
  }

  enableApiEndpoint(id: number, enabled: boolean): Observable<boolean> {
    return this.http.post<boolean>(`/api/rbac/endpoints/enable`, { id, enabled });
  }

  initApiEndpoints(): Observable<boolean> {
    return this.http.post<boolean>(`/api/rbac/endpoints/init`, {});
  }
}
