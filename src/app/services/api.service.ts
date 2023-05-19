import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

const API_ROOT = 'http://localhost:8080';
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  public getRepos(): Observable<any> {
    return this.http.get(`${API_ROOT}/api/v1/user/source/repos`);
  }
}
