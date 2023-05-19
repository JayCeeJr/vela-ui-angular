import { Injectable } from '@angular/core';

const API_ROOT = 'http://localhost:8080';
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http: any;

  constructor() { }

}
