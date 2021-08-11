import { IResourceRange } from './iresource-range';

export enum Permission {
  READ = 1,
  WRITE = 2,
  ADMINISTRATION = 16,
  FINISH = 32
}

export interface IResourceRangePermissionWrapper {
  resourceRangeDTO: IResourceRange;
  permissions: Array<{ mask: Permission }>;
}
