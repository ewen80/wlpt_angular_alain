import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { Permission } from 'src/app/domains/iresource-range-permission-wrapper';
import { IMyResource } from 'src/app/domains/my-resource/imy-resource';

@Injectable({
  providedIn: 'root'
})
export class MyResourceService {
  constructor(private http: _HttpClient) {}

  findOne(id: number): Observable<IMyResource> {
    return this.http.get<IMyResource>(`${environment.serverMyResourceServiceURL}/${id}`);
  }

  save(myResource: IMyResource): Observable<IMyResource> {
    return this.http.post<IMyResource>(environment.serverMyResourceServiceURL, myResource);
  }

  delete(ids: number[]): Observable<void> {
    return this.http.delete<void>(`${environment.serverMyResourceServiceURL}/${ids}`);
  }

  finish(id: number): Observable<void> {
    return this.http.put<void>(`${environment.serverMyResourceServiceURL}/finish/${id}`);
  }

  getPermissions(roleId: string): Observable<Array<{ mask: Permission }>> {
    return this.http.get(environment.serverPermissionServiceURL, { resourceTypeClassName: environment.myResourceTypeClassName, roleId });
  }
}
