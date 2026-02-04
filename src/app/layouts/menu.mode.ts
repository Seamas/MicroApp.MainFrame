export interface Menu {
  type: string;
  name: string;
  icon: string;
  url?: string;
  children?: Menu[];
}
