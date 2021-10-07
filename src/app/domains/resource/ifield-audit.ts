import {IAttachment} from '../iattachment'
import { IAttachmentBag } from '../iattachment-bag';
import { ISignature } from '../isignature';
import { IGPS } from './igps';

// 现场审核信息
export interface IFieldAudit {
    id?: number;
    content: string;    // 审核内容
    auditDate: string; // 审核日期
    auditUserId: string; // 审核人id
    attachmentBags?: IAttachmentBag[]; // 附件包列表
    signature?: ISignature;  //场地负责人签名
    auditDepartment: string;    //审核单位
    gps?:IGPS;  //GPS信息
}