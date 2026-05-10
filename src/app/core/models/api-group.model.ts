import { ApiEndpoint } from './api-endpoint.model';

export interface ApiGroup {
  name: string;
  children: ApiEndpoint[];
}
