import { Permission } from "../iresource-range-permission-wrapper";
import { IFieldAudit } from "./ifield-audit";
import { IResourceCheckIn } from "./iresource-checkin";

export interface IResourceBase {
    permissions?: Array<{ mask: Permission }>;
    resourceCheckIn?: IResourceCheckIn;
    fieldAudits?: IFieldAudit[];
    readed?: boolean;    // 是否已读
}