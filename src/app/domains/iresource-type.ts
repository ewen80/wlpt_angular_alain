import { IResourceRange } from './iresource-range';

export interface IResourceType {
  className: string;
  name: string;
  repositoryBeanName: string;
  description?: string;
  resourceRanges?: IResourceRange[];
}
