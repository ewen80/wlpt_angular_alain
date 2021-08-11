import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { IResourceRange } from 'src/app/domains/iresource-range';

@Injectable({
  providedIn: 'root'
})
export class ResourceRangeService {
  constructor(private http: _HttpClient) {}

  findOne(resourceClassName: string, roleId: string): Observable<IResourceRange> {
    return this.http.get<IResourceRange>(environment.serverResourceRangeServiceURL, {
      resourceClassName,
      roleId
    });
  }

  checkExist(resourceClassName: string, roleId: string): Observable<boolean> {
    return this.http.get<boolean>(`${environment.serverResourceRangeServiceURL}/checkexist`, {
      resourceClassName,
      roleId
    });
  }

  save(resourceRange: IResourceRange): Observable<IResourceRange> {
    return this.http.post<IResourceRange>(environment.serverResourceRangeServiceURL, resourceRange);
  }
}
