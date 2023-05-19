import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {BehaviorSubject, debounceTime, Observable} from "rxjs";
import {User} from "../types/definitions";

const API_ROOT = 'http://localhost:8080'

interface Token {
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
  gettingUser: boolean = false;

  // @ts-ignore
  private authStatus: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  public GetUser: Observable<User> = this.authStatus.asObservable();
  private setToken(token: Token) {
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
    if (this.GetToken()) {
      this.getUserInfo().pipe(debounceTime(1000)).subscribe({
        next: (res) => {
          this.authStatus.next(res);
        },
        error: (err) => console.log(err)
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
    return this.http.get<Token>(`${API_ROOT}/authenticate`, { params });
  }
  private refreshToken() {
    this._refreshToken().subscribe({
      next: res => this.setToken(res),
      error: () => this.LogOut()
    })
  }

  public LogOut() {
    sessionStorage.removeItem('token');
    // @ts-ignore
    this.authStatus = new BehaviorSubject<User>(null);
  }
  private _refreshToken(): Observable<Token> {
    return this.http.get<Token>(`${API_ROOT}/refresh-token`);
  }

  private getUserInfo(): Observable<User> {
    return this.http.get<User>(`${API_ROOT}/api/v1/user`)
  }

}
