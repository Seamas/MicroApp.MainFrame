export interface PageResultModel<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;

  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
