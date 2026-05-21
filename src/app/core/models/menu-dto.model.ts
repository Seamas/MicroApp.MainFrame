export interface MenuDto {
  type: string;
  name: string;
  icon?: string;
  url?: string;
  sortOrder: number;
  children?: MenuDto[];
}
