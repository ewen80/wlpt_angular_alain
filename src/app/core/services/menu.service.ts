import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { IMenu } from 'src/app/domains/imenu';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  constructor(private http: _HttpClient) {}

  findAll(userId: string): Observable<IMenu[]> {
    return this.http.get<IMenu[]>(`${environment.serverMenuServiceURL}/${userId}`);
  }

  save(menu: IMenu): Observable<IMenu> {
    return this.http.post<IMenu>(environment.serverMenuServiceURL, menu);
  }

  batchSave(menus: IMenu[]): Observable<void> {
    return this.http.put<void>(environment.serverMenuServiceURL, menus);
  }

  delete(id: number): Observable<void> {
    return this.http.delete(`${environment.serverMenuServiceURL}/${id.toString()}`);
  }
}
