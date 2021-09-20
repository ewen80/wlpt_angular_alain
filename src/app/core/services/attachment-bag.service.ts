import { Injectable } from "@angular/core";
import { _HttpClient } from "@delon/theme";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { IAttachmentBag } from "src/app/domains/iattachment-bag";

@Injectable({
    providedIn: 'root'
})
export class AttachmentBagService {
    constructor(private http: _HttpClient) {}
    
    findById(id:number): Observable<IAttachmentBag> {
        return this.http.get<IAttachmentBag>(environment.serverAttachmentBagServiceURL+"/"+id);
    }

    findByAuditId(auditId: number): Observable<IAttachmentBag[]> {
        return this.http.get<IAttachmentBag[]>(environment.serverAttachmentBagServiceURL+"?auditId="+auditId);
    }

    saveByFieldAudit(attachmentBag: IAttachmentBag, auditId: number): Observable<void> {
        return this.http.put<void>(environment.serverAttachmentBagServiceURL, {attachmentBag, auditId});
    }
}