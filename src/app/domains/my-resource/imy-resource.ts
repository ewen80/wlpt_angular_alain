import { IAttachment } from '../iattachment';
import { Permission } from '../iresource-range-permission-wrapper';
import { ISignature } from '../isignature';
import { IResourceCheckIn } from '../resource/iresource-checkin';
import { IMyResourceRoom } from './imy-resource-room';

export interface IMyResource {
  id?: number;
  changdiName: string;
  changdiAddress: string;
  qxId: string;
  sign?: ISignature;
  // finished?: boolean;
  roomIds?: IMyResourceRoom[];
  permissions?: { mask: Permission }[];
  resourceCheckIn?: IResourceCheckIn;
  attachments?: IAttachment[];
}
