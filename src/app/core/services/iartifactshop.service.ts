import { HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { _HttpClient } from "@delon/theme";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { Permission } from "src/app/domains/iresource-range-permission-wrapper";
import { IArtifactShopResource } from "src/app/domains/resources/iartifactshop-resource";

@Injectable({
    providedIn: 'root'
  })
  export class ArtifactShopResourceService {
    constructor(private http: _HttpClient) {}

    getPermissions(roleId: string): Observable<Array<{ mask: Permission }>> {
        return this.http.get(environment.serverPermissionServiceURL, {
          resourceTypeClassName: environment.artifactShopResourceTypeClassName,
          roleId
        });
    }

    delete(ids: number[]): Observable<void> {
        return this.http.delete<void>(`${environment.serverArtifactShopResourceServiceURL}/${ids}`);
    }

    findOne(id: number): Observable<IArtifactShopResource> {
        return this.http.get<IArtifactShopResource>(`${environment.serverArtifactShopResourceServiceURL}/${id}`);
    }

    read(resourceId: number, userId: string): Observable<void> {
        return this.http.put(`${environment.serverArtifactShopResourceServiceURL}/read/${resourceId}/${userId}`);
    }

    update(myResource: IArtifactShopResource): Observable<void> {
        return this.http.put<void>(environment.serverArtifactShopResourceServiceURL, myResource);
    }

    add(myResource: IArtifactShopResource): Observable<IArtifactShopResource> {
        return this.http.post<IArtifactShopResource>(environment.serverArtifactShopResourceServiceURL, myResource);
    }

    print(resourceId: number, auditId: number): Observable<any> {
        return this.http.get(`${environment.serverArtifactShopResourceServiceURL}/print/${resourceId}/${auditId}`, undefined, {headers: new HttpHeaders().append('Accept','application/vnd.openxmlformats-officedocument.wordprocessingml.document'),  observe: 'response', responseType:'blob'});
    }
  }