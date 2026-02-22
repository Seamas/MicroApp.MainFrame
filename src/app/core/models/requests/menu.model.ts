export interface Menu {
  id: number;
  name: string;
  code: string;
  icon?: string;
  path?: string;
  parentId?: number;
  sortOrder: number;
  isEnabled: boolean;
}
