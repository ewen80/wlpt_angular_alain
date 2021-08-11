import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { Observable, of } from 'rxjs';
import { IResourceType } from 'src/app/domains/iresource-type';

@Injectable({
  providedIn: 'root',
})
export class ResourceTypeService {
  constructor(private http: _HttpClient) {}

  delete(ids: string[]): Observable<void> {
    return this.http.delete(environment.serverResourceTypeServiceURL + '/' + ids + '/');
  }

  checkClassNameExist(className: string): Observable<boolean> {
    return this.http.get<boolean>(environment.serverResourceTypeServiceURL + '/check/' + className + '/'); // 由于classsName最后含有点，会被后端SpringMVC认为是文件后缀名忽略，所以最后加一个/
  }

  save(resourceType: IResourceType): Observable<IResourceType> {
    return this.http.post<IResourceType>(environment.serverResourceTypeServiceURL, resourceType);
  }

  findOne(className: string): Observable<IResourceType> {
    return this.http.get<IResourceType>(environment.serverResourceTypeServiceURL + '/' + className + '/');
  }
}
