import { Injectable } from "@angular/core";
import { _HttpClient } from "@delon/theme";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { IYuleGwRoom } from "src/app/domains/yule-resource/iyule-gw-room";

@Injectable({
    providedIn: 'root'
})
export class YuleGwRoomService {
    constructor(private http: _HttpClient) {};

    save(room: IYuleGwRoom): Observable<IYuleGwRoom> {
        return this.http.put<IYuleGwRoom>(environment.serverYuleGwRoomServiceURL, room);
    }

    findOne(id:number): Observable<IYuleGwRoom> {
        return this.http.get<IYuleGwRoom>(environment.serverYuleGwRoomServiceURL+"/"+id);
    }

    getByResourceId(resourceId:number):Observable<IYuleGwRoom[]> {
        return this.http.get<IYuleGwRoom[]>(environment.serverYuleGwRoomServiceURL + "/byResourceId/" + resourceId);
    }

    delete(ids: number[]): Observable<void> {
        return this.http.delete<void>(`${environment.serverYuleGwRoomServiceURL}/${ids}`);
    }
}