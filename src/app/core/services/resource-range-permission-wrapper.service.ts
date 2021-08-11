import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { IResourceRangePermissionWrapper, Permission } from 'src/app/domains/iresource-range-permission-wrapper';

@Injectable({
  providedIn: 'root',
})
export class ResourceRangePermissionWrapperService {
  constructor(private http: _HttpClient) {}

  save(wrappers: IResourceRangePermissionWrapper): Observable<void> {
    return this.http.post(environment.serverPermissionServiceURL, wrappers);
  }

  delete(resourceRangeIds: string): Observable<void> {
    return this.http.delete(environment.serverPermissionServiceURL + '/' + resourceRangeIds);
  }
}
