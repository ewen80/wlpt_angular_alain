import { Injectable } from "@angular/core";
import { _HttpClient } from "@delon/theme";
import { environment } from "@env/environment";
import { Observable } from "rxjs";
import { IYuleGwWc } from "src/app/domains/yule-resource/iyule-gw-wc";

@Injectable({
    providedIn: 'root'
})
export class YuleGwWcService {
    constructor(private http: _HttpClient) {};

    save(room: IYuleGwWc): Observable<IYuleGwWc> {
        return this.http.put<IYuleGwWc>(environment.serverYuleGwWcServiceURL, room);
    }

    findOne(id:number): Observable<IYuleGwWc> {
        return this.http.get<IYuleGwWc>(environment.serverYuleGwWcServiceURL+"/"+id);
    }

    getByResourceId(resourceId:number):Observable<IYuleGwWc[]> {
        return this.http.get<IYuleGwWc[]>(environment.serverYuleGwWcServiceURL + "/byResourceId/" + resourceId);
    }

    delete(ids: number[]): Observable<void> {
        return this.http.delete<void>(`${environment.serverYuleGwWcServiceURL}/${ids}`);
    }
}