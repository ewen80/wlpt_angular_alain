import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { IRole } from 'src/app/domains/irole';

@Injectable({
  providedIn: 'root',
})
export class RoleService {
  constructor(private http: _HttpClient) {}

  findAll(): Observable<IRole[]> {
    return this.http.get<IRole[]>(environment.serverRoleServiceURL + '/all');
  }

  findOne(roleId: string): Observable<IRole> {
    return this.http.get<IRole>(environment.serverRoleServiceURL + '/' + roleId);
  }

  // 检查roleId是否已经存在
  checkIdExist(roleId: string): Observable<boolean> {
    return this.http.get<boolean>(environment.serverRoleServiceURL + '/check/' + roleId);
  }

  save(role: IRole): Observable<IRole> {
    return this.http.post<IRole>(environment.serverRoleServiceURL, role);
  }

  // 设置角色的用户
  setUsers(roleId: string, userIds: string[]): Observable<void> {
    return this.http.put(`${environment.serverRoleServiceURL}/setusers/${roleId}`, userIds);
  }

  // 删除角色
  delete(roleIds: string[]): Observable<void> {
    return this.http.delete(environment.serverRoleServiceURL + '/' + roleIds);
  }
}
