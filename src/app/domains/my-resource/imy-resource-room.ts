import { IAttachment } from '../iattachment';

export interface IMyResourceRoom {
  id?: number;
  name: string;
  description: string;
  myResourceId: number;
  attachments: IAttachment[];
}
