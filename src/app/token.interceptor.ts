import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import {BehaviorSubject, catchError, filter, Observable, switchMap, take, tap, throwError} from 'rxjs';
import {AuthService, Token} from "./services/auth.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private auth: AuthService) {}
  private isRefreshing: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  // @ts-ignore
  private refreshTokenSubject: BehaviorSubject<Token> = new BehaviorSubject<Token>(null);
  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing.value) {
      this.isRefreshing.next(true);
      // @ts-ignore
      this.refreshTokenSubject.next(null);

      return this.auth._refreshToken().pipe(
        switchMap((token: any) => {
          this.isRefreshing.next(false);
          this.auth.setToken(token);
          this.refreshTokenSubject.next(token);
          return next.handle(this.addToken(request, token.token));
        })
      );
    } else {
      return next.handle(request);
    }
  }
  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        // tslint:disable-next-line:object-literal-key-quotes
        Authorization: `Bearer ${token}`,
      },
    });
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.GetToken();
    if (token) {
      request = this.addToken(request, token)
    }
    return next.handle(request).pipe(
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
            return this.handle401Error(request, next)
          } else {
          console.log('Caught outside handle401')
          this.auth.LogOut();
          return throwError(err);
        }
      })
    );
  }
}
