import { IAttachment } from "./iattachment";

export interface IAttachmentBag{
    id?: number,
    name: string,
    memo?: string,
    createdAt: string,
    attachments: IAttachment[]
}