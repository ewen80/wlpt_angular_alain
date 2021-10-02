import { IResourceRange } from './iresource-range';

export enum Permission {
  READ = 1,
  WRITE = 2,
  CREATE = 4,
  DELETE = 8,
  ADMINISTRATION = 16,
  FINISH = 32
}

export interface IResourceRangePermissionWrapper {
  resourceRangeDTO: IResourceRange;
  permissions: Array<{ mask: Permission }>;
}
