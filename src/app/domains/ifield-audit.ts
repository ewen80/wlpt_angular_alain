import {IAttachment} from './iattachment'
import { ISignature } from './isignature';

// 现场审核信息
export interface IFieldAudit {
    id?: number;
    content: string;    // 审核内容
    auditDate: string; // 审核日期
    auditUserId: string; // 审核人id
    attachments?: IAttachment[]; // 附件列表
    signature?: ISignature;  //场地负责人签名
    auditDepartment: string;    //审核单位
}