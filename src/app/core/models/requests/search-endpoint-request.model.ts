export interface SearchApiEndpointsRequest {
  pageIndex?: number;
  pageSize?: number;
  url?: string;
  apiGroup?: string;
  description?: string;
  isEnabled?: boolean | null;
}
