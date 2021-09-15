import { Injectable } from "@angular/core";
import { _HttpClient } from "@delon/theme";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { IFieldAudit } from "src/app/domains/ifield-audit";

@Injectable({
    providedIn: 'root'
})
export class FieldAuditService {
    constructor(private http: _HttpClient) {}

    findOne(id: number): Observable<IFieldAudit> {
        return this.http.get<IFieldAudit>(`${environment.serverFieldAuditServiceURL}/${id}`);
    }

    save(fieldAudit: IFieldAudit): Observable<IFieldAudit> {
        return this.http.put<IFieldAudit>(environment.serverFieldAuditServiceURL, fieldAudit);
    }

    delete(ids: number[]): Observable<void> {
        return this.http.delete(environment.serverFieldAuditServiceURL+"/"+ids);
    }

}