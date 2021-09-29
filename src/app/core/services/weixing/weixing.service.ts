import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { Permission } from 'src/app/domains/iresource-range-permission-wrapper';
import { IWeixingResource } from 'src/app/domains/weixing-resource/iweixing-resource';

@Injectable({
  providedIn: 'root'
})
export class WeixingResourceService {
  constructor(private http: _HttpClient) {}

  findOne(id: number): Observable<IWeixingResource> {
    return this.http.get<IWeixingResource>(`${environment.serverWeixingResourceServiceURL}/${id}`);
  }

  findAll(): Observable<IWeixingResource[]> {
    return this.http.get<IWeixingResource[]>(`${environment.serverWeixingResourceServiceURL}/nopage`);
  }

  save(myResource: IWeixingResource): Observable<IWeixingResource> {
    return this.http.post<IWeixingResource>(environment.serverWeixingResourceServiceURL, myResource);
  }

  delete(ids: number[]): Observable<void> {
    return this.http.delete<void>(`${environment.serverWeixingResourceServiceURL}/${ids}`);
  }

  getPermissions(roleId: string): Observable<Array<{ mask: Permission }>> {
    return this.http.get(environment.serverPermissionServiceURL, {
      resourceTypeClassName: environment.weixingResourceTypeClassName,
      roleId
    });
  }

  print(weixingId: number, auditId: number): Observable<any> {
    return this.http.get(`${environment.serverWeixingResourceServiceURL}/fieldauditpdfs/${weixingId}/${auditId}`, undefined, {headers: new HttpHeaders().append('Accept','application/pdf'),  observe: 'response', responseType:'blob'});
  }
}
