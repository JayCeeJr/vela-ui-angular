import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {BehaviorSubject, debounceTime, Observable, switchMap} from "rxjs";
import {User} from "../types/definitions";

const API_ROOT = 'http://localhost:8080'

export interface Token {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public Login(code: string, state: string) {
    this.authenticate(code, state).subscribe({
      next: (res) => {
        this.setToken(res);
      },
      error: () => {
        console.log("unable to login");
      }
  });
  }

  // @ts-ignore
  private authStatus: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  private refreshingToken: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private gettingUser: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public GetUser: Observable<User> = this.authStatus.asObservable();
  public setToken(token: Token) {
    sessionStorage.setItem('token', token.token);
  }

  public IsLoggedIn(): boolean {
    if (!this.authStatus?.value?.name) {
      this.getUser();
      return false;
    } else {
      return true;
    }
  }
  private getUser() {
    if (this.GetToken() && !this.gettingUser.value) {
      this.gettingUser.next(true);
      this.getUserInfo().pipe(debounceTime(1000)).subscribe({
        next: (res) => {
          this.authStatus.next(res);
          this.gettingUser.next(false);
        },
        error: (err) => {
          console.log(err);
        }
      })
    }
  }
  public GetToken(): string|null {
    return sessionStorage.getItem('token');
  }
  constructor(private http: HttpClient) {
  }
  private authenticate(code: string, state: string): Observable<Token> {
    const params = new HttpParams().set('code', code).set('state', state)
    return this.http.get<Token>(`${API_ROOT}/authenticate`, { params, withCredentials: true });
  }
  public refreshToken() {
    if (!this.refreshingToken.value) {
      this.refreshingToken.next(true)
      return this._refreshToken().subscribe({
        next: res => {this.setToken(res); this.refreshingToken.next(false)},
        error: () => this.LogOut()
      })
    }
    return undefined
  }

  public LogOut() {
    console.log("logging Out");
    sessionStorage.removeItem('token');
    // @ts-ignore
    this.authStatus = new BehaviorSubject<User>(null);
  }
  public _refreshToken(): Observable<Token> {
    return this.http.get<Token>(`${API_ROOT}/token-refresh`, { withCredentials: true });
  }

  private getUserInfo(): Observable<User> {
    return this.http.get<User>(`${API_ROOT}/api/v1/user`)
  }

}
