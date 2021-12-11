export interface IMenu {
  id: number;
  name: string;
  path: string;
  orderId: number;
  iconClass?: string;
  parentId: number;
  children?: IMenu[];
  unReadCount?: number;
}
