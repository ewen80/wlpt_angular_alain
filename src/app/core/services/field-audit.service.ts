import { Injectable } from "@angular/core";
import { _HttpClient } from "@delon/theme";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { IFieldAudit } from "src/app/domains/resource/ifield-audit";

@Injectable({
    providedIn: 'root'
})
export class FieldAuditService {
    constructor(private http: _HttpClient) {}

    findId(id: number): Observable<IFieldAudit> {
        return this.http.get<IFieldAudit>(`${environment.serverFieldAuditServiceURL}/${id}`);
    }

    findByResourceId(resourceId: number, serverUrl: string): Observable<IFieldAudit[]> {
        return this.http.get<IFieldAudit[]>(`${serverUrl}?resourceId=${resourceId}`);
      }

    save(fieldAudit: IFieldAudit): Observable<IFieldAudit> {
        return this.http.put<IFieldAudit>(environment.serverFieldAuditServiceURL, fieldAudit);
    }

    saveByResourceId(fieldAudit: IFieldAudit, resourceId: number, serverUrl: string): Observable<IFieldAudit> {
        return this.http.put<IFieldAudit>(serverUrl, {fieldAudit, resourceId});
    }

    delete(ids: number[]): Observable<void> {
        return this.http.delete(environment.serverFieldAuditServiceURL+"/"+ids);
    }

    deleteByResourceId(ids: number[], resourceId: number, serverUrl: string): Observable<void> {
        return this.http.delete(serverUrl+"/"+ids+"?resourceId="+resourceId);   
    }

    deleteAttachmentBags(bagIds: number[], auditId: number): Observable<void> {
        return this.http.delete(environment.serverFieldAuditServiceURL + "/attachmentbags/" + auditId + "?bagIds=" + bagIds);
    }

}