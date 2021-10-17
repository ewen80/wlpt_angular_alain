import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { Permission } from 'src/app/domains/iresource-range-permission-wrapper';
import { IYuleResourceBase } from 'src/app/domains/yule-resource/iyule-resource-base';

@Injectable({
  providedIn: 'root'
})
export class YuleResourceService {
  constructor(private http: _HttpClient) {}

  findOne(id: number): Observable<IYuleResourceBase> {
    return this.http.get<IYuleResourceBase>(`${environment.serverYuleResourceBaseServiceURL}/${id}`);
  }

//   findAll(): Observable<IYuleResourceBase[]> {
//     return this.http.get<IYuleResourceBase[]>(`${environment.serverYuleResourceBaseServiceURL}/nopage`);
//   }

  add(myResource: IYuleResourceBase): Observable<IYuleResourceBase> {
    return this.http.post<IYuleResourceBase>(environment.serverYuleResourceBaseServiceURL, myResource);
  }

  update(myResource: IYuleResourceBase): Observable<void> {
    return this.http.put<void>(environment.serverYuleResourceBaseServiceURL, myResource);
  }

  delete(ids: number[]): Observable<void> {
    return this.http.delete<void>(`${environment.serverYuleResourceBaseServiceURL}/${ids}`);
  }

  getPermissions(roleId: string): Observable<Array<{ mask: Permission }>> {
    return this.http.get(environment.serverPermissionServiceURL, {
      resourceTypeClassName: environment.yuleResourceBaseTypeClassName,
      roleId
    });
  }

  print(yuleId: number, auditId: number): Observable<any> {
    return this.http.get(`${environment.serverYuleResourceBaseServiceURL}/print/${yuleId}/${auditId}`, undefined, {headers: new HttpHeaders().append('Accept','application/vnd.openxmlformats-officedocument.wordprocessingml.document'),  observe: 'response', responseType:'blob'});
  }

}
