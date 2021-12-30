import { IResourceFinish } from './resource-finish';

export interface IResourceCheckIn {
  createdDateTime: string;
  createdUserId: string;
  finished: boolean;
  id: string;
  resourceFinish: IResourceFinish;
}
