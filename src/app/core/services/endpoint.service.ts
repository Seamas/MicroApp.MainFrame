import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageResultModel } from '../models/responses/page-result.model';
import { SearchApiEndpointsRequest } from '../models/requests/search-endpoint-request.model';
import { CreateApiEndpointRequest } from '../models/requests/create-endpoint-request.model';
import { UpdateApiEndpointRequest } from '../models/requests/update-endpoint-request.model';
import { ApiEndpoint } from '../models/api-endpoint.model';

@Injectable({ providedIn: 'root' })
export class ApiEndpointService {
  constructor(private http: HttpClient) {}

  getAllApiEndpoints(): Observable<ApiEndpoint[]> {
    return this.http.get<ApiEndpoint[]>(`/api/rbac/endpoints/get-all`);
  }

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

  updateApiEndpoint(endpoint: UpdateApiEndpointRequest): Observable<boolean> {
    return this.http.post<boolean>(`/api/rbac/endpoints/update`, endpoint);
  }

  enableApiEndpoint(id: number): Observable<boolean> {
    return this.http.post<boolean>(`/api/rbac/endpoints/enable`, { id });
  }

  disableApiEndpoint(id: number): Observable<boolean> {
    return this.http.post<boolean>(`/api/rbac/endpoints/disable`, { id });
  }

  initApiEndpoints(): Observable<boolean> {
    return this.http.post<boolean>(`/api/rbac/endpoints/init`, {});
  }
}
