import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'auth.token';
  private readonly EXPIRES_KEY = 'auth.expiresAtUtc';
  loggedIn = signal<boolean>(false);

  constructor(private http: HttpClient) {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const exp = localStorage.getItem(this.EXPIRES_KEY);
    if (token && exp && new Date(exp).getTime() > Date.now()) {
      this.loggedIn.set(true);
    } else {
      this.clearStorage();
    }
  }

  isAuthenticated(): boolean {
    const exp = localStorage.getItem(this.EXPIRES_KEY);
    if (exp && new Date(exp).getTime() <= Date.now()) {
      this.logout();
      return false;
    }
    return this.loggedIn();
  }

  signIn(user: string, password: string): Observable<void> {
    const url = `${environment.apiBaseUrl}/api/Auth/signin`;
    const body = { user, password };
    return this.http.post<AuthResponse>(url, body).pipe(
      tap(res => this.persistAuth(res)),
      map(() => void 0)
    );
  }

  signUp(user: string, password: string): Observable<void> {
    const url = `${environment.apiBaseUrl}/api/Auth/signup`;
    const body = { user, password };
    return this.http.post<AuthResponse>(url, body).pipe(
      tap(res => this.persistAuth(res)),
      map(() => void 0)
    );
  }

  logout(): void {
    this.loggedIn.set(false);
    this.clearStorage();
  }

  private persistAuth(res: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.token);
    localStorage.setItem(this.EXPIRES_KEY, res.expiresAtUtc);
    this.loggedIn.set(true);
  }

  private clearStorage() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_KEY);
  }
}

type AuthResponse = {
  token: string;
  expiresAtUtc: string; // ISO string
};
