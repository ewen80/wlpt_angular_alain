import { Injectable } from "@angular/core";
import { _HttpClient } from "@delon/theme";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { IFieldAudit } from "src/app/domains/ifield-audit";

@Injectable({
    providedIn: 'root'
  })
  export class WeixingFieldAuditService {
    constructor(private http: _HttpClient) {}
  
    save(fieldAudit: IFieldAudit, weixingResourceId: number): Observable<IFieldAudit> {
      return this.http.put<IFieldAudit>(environment.serverWeixingFieldAuditServiceURL, {fieldAudit, weixingResourceId});
    }
  
    findByWeixingId(weixingResourceId: number): Observable<IFieldAudit[]> {
      return this.http.get<IFieldAudit[]>(`${environment.serverWeixingFieldAuditServiceURL}?weixingResourceId=${weixingResourceId}`);
    }
  
    findOne(id: number): Observable<IFieldAudit> {
      return this.http.get<IFieldAudit>(`${environment.serverWeixingFieldAuditServiceURL}/${id}`);
    }
  
    delete(ids: number[], weixingResourceId: number): Observable<void> {
      return this.http.delete<void>(`${environment.serverWeixingFieldAuditServiceURL}/${ids}?weixingResourceId=${weixingResourceId}`);
    }
  }