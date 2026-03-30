import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  ROLE_MAP,
  RoleName,
} from '../../models/user.model';
import { environment } from '../../../environments/environment';

const SESSION_KEY = 'tf_session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  /** Reactive signal holding the logged-in user (null = unauthenticated) */
  currentUser = signal<User | null>(this.loadUser());
  token = signal<string | null>(this.loadToken());

  // ─── Public Helpers ────────────────────────────────────────────────────────

  get roleName(): RoleName {
    const id = this.currentUser()?.roleId ?? 3;
    return ROLE_MAP[id] ?? 'Employee';
  }

  get isAdmin(): boolean {
    return this.currentUser()?.roleId === 1;
  }

  get isManager(): boolean {
    const id = this.currentUser()?.roleId;
    return id === 1 || id === 2;
  }

  get isAuthenticated(): boolean {
    return !!this.token();
  }

  // ─── API Calls ─────────────────────────────────────────────────────────────

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiBase}/api/Auth/login`, payload)
      .pipe(tap((res) => this.persist(res)));
  }

  register(payload: RegisterRequest): Observable<User> {
    return this.http.post<User>(
      `${environment.apiBase}/api/Auth/register`,
      payload
    );
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.currentUser.set(null);
    this.token.set(null);
    this.router.navigate(['/auth']);
  }

  // ─── Persistence ───────────────────────────────────────────────────────────

  private persist(res: AuthResponse): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(res));
    this.currentUser.set(res.user);
    this.token.set(res.token);
  }

  private loadUser(): User | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthResponse).user : null;
    } catch {
      return null;
    }
  }

  private loadToken(): string | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthResponse).token : null;
    } catch {
      return null;
    }
  }
}
