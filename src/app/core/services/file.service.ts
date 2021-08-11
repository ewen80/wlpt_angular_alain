import { Injectable } from '@angular/core';
import { _HttpClient } from '@delon/theme';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  constructor(private http: _HttpClient) {}

  removeFile(fileName: string): Observable<boolean> {
    return this.http.request<boolean>('delete', environment.serverFileServiceURL + '/delete', { body: fileName, observe: 'body' });
  }
}
