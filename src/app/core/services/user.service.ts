import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { IUser } from 'src/app/domains/iuser';
import { Md5 } from 'ts-md5';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: _HttpClient) {}

  findUsersByRoleId(roleId: string): Observable<IUser[]> {
    return this.http.get<IUser[]>(environment.serverUserServiceURL + '/role/nopage/' + roleId);
  }

  findAll(): Observable<IUser[]> {
    return this.http.get<IUser[]>(environment.serverUserServiceURL + '/nopage');
  }

  findOne(userId: string): Observable<IUser> {
    return this.http.get<IUser>(environment.serverUserServiceURL + '/' + userId);
  }

  delete(userIds: string[]): Observable<void> {
    return this.http.delete(environment.serverUserServiceURL + '/' + userIds);
  }

  // 检查id是否已经存在
  checkIdExist(userId: string): Observable<boolean> {
    return this.http.get<boolean>(environment.serverUserServiceURL + '/check/' + userId);
  }

  save(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(environment.serverUserServiceURL, user);
  }

  setPasssword(userId: string, password: string): Observable<void> {
    const passwordMD5 = Md5.hashStr(password).toString().toUpperCase();
    return this.http.put<void>(environment.serverUserServiceURL + '/' + userId, passwordMD5);
  }

  checkPassword(userId: string, passwordMD5: string): Observable<boolean> {
    return this.http.get<boolean>(environment.serverUserServiceURL + '/checkPassword', {
      userId,
      passwordMD5,
    });
  }
}
