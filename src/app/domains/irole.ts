import { IUser } from './iuser';

export interface IRole {
  id: string;
  name: string;
  description: string;
  userIds?: string[];
}
