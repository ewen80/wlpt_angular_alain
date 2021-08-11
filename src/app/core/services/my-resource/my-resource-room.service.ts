import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';
import { IAttachment } from 'src/app/domains/iattachment';
import { IMyResourceRoom } from 'src/app/domains/my-resource/imy-resource-room';

@Injectable({
  providedIn: 'root'
})
export class MyResourceRoomService {
  constructor(private http: _HttpClient) {}

  save(myResourceRoom: IMyResourceRoom): Observable<IMyResourceRoom> {
    return this.http.post<IMyResourceRoom>(environment.serverMyResourceRoomServiceURL, myResourceRoom);
  }

  findByMyResourceId(myResourceId: number): Observable<IMyResourceRoom[]> {
    return this.http.get<IMyResourceRoom[]>(`${environment.serverMyResourceRoomServiceURL}?myResourceId=${myResourceId}`);
  }

  findOne(roomId: number): Observable<IMyResourceRoom> {
    return this.http.get<IMyResourceRoom>(`${environment.serverMyResourceRoomServiceURL}/${roomId}`);
  }

  delete(roomIds: number[]): Observable<void> {
    return this.http.delete<void>(`${environment.serverMyResourceRoomServiceURL}/${roomIds}`);
  }
}
