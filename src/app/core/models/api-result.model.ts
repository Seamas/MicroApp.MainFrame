export interface ApiResult<T> {
  code: number;
  success: boolean;
  message?: string;
  data?: T;
}
