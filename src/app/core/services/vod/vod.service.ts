import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { _HttpClient } from "@delon/theme";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { Permission } from "src/app/domains/iresource-range-permission-wrapper";
import { IVodResource } from "src/app/domains/vod/ivod-resource";

@Injectable({
    providedIn: 'root'
  })
  export class VodResourceService {
    constructor(private http: _HttpClient) {}

    getPermissions(roleId: string): Observable<Array<{ mask: Permission }>> {
        return this.http.get(environment.serverPermissionServiceURL, {
          resourceTypeClassName: environment.vodResourceTypeClassName,
          roleId
        });
    }

    delete(ids: number[]): Observable<void> {
        return this.http.delete<void>(`${environment.serverVodResourceServiceURL}/${ids}`);
    }

    findOne(id: number): Observable<IVodResource> {
        return this.http.get<IVodResource>(`${environment.serverVodResourceServiceURL}/${id}`);
    }

    read(resourceId: number, userId: string): Observable<void> {
        return this.http.put(`${environment.serverVodResourceServiceURL}/read/${resourceId}/${userId}`);
    }

    update(myResource: IVodResource): Observable<void> {
        return this.http.put<void>(environment.serverVodResourceServiceURL, myResource);
    }

    add(myResource: IVodResource): Observable<IVodResource> {
        return this.http.post<IVodResource>(environment.serverVodResourceServiceURL, myResource);
    }

    print(resourceId: number, auditId: number): Observable<any> {
        return this.http.get(`${environment.serverVodResourceServiceURL}/print/${resourceId}/${auditId}`, undefined, {headers: new HttpHeaders().append('Accept','application/vnd.openxmlformats-officedocument.wordprocessingml.document'),  observe: 'response', responseType:'blob'});
    }
  }