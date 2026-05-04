import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, switchMap, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthTokens, ApiResponse, User } from '../../shared/models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;
  currentUser = signal<User | null>(null);
  token = signal<string | null>(localStorage.getItem('cs_token'));

  constructor(private http: HttpClient, private router: Router) {
    const stored = localStorage.getItem('cs_user');
    if (stored) this.currentUser.set(JSON.parse(stored));

    if (this.token() && !stored) {
      const userId = this.getUserIdFromToken(this.token());
      if (userId) this.fetchUserProfile(userId);
    }
  }

  login(email: string, password: string) {
    console.log('AuthService: login attempt', email);
    return this.http.post<ApiResponse<AuthTokens>>(`${this.api}/api/users/login`, { email, password }).pipe(
      tap(res => console.log('AuthService: login response', res)),
      switchMap(res => this.storeAuthAndFetchProfile(res.data))
    );
  }

  googleLogin(idToken: string) {
    return this.http.post<ApiResponse<AuthTokens>>(`${this.api}/api/users/oauth/google`, { idToken }).pipe(
      switchMap(res => this.storeAuthAndFetchProfile(res.data))
    );
  }

  register(userName: string, fullName: string, email: string, password: string) {
    return this.http.post<ApiResponse<AuthTokens>>(`${this.api}/api/users/register`, { userName, fullName, email, password }).pipe(
      switchMap(res => this.storeAuthAndFetchProfile(res.data))
    );
  }

  adminLogin(email: string, password: string) {
    console.log('AuthService: admin login attempt', email);
    return this.http.post<ApiResponse<AuthTokens>>(`${this.api}/api/users/login`, { email, password }).pipe(
      tap(res => {
        console.log('AuthService: admin login response', res);
        const role = this.getRoleFromAuth(res.data);
        console.log('AuthService: detected role from token', role);
        if (role !== 'Admin') throw new Error('Not an admin');
        
        
        this.currentUser.set({ role } as any);
      }),
      switchMap(res => this.storeAuthAndFetchProfile(res.data))
    );
  }

  private storeAuthAndFetchProfile(data: AuthTokens) {
    console.log('AuthService: storing auth and fetching profile', data);
    const accessToken = this.getAccessToken(data);
    if (!accessToken) {
      console.error('AuthService: missing access token');
      return throwError(() => new Error('Missing access token'));
    }

    localStorage.setItem('cs_token', accessToken);
    localStorage.setItem('cs_refresh', data.refreshToken);
    this.token.set(accessToken);

    const userId = this.getUserIdFromAuth(data);
    if (!userId) {
      console.error('AuthService: missing user ID');
      return throwError(() => new Error('Missing user ID'));
    }

    
    const roleFromToken = this.getRoleFromAuth(data);

    console.log('AuthService: fetching profile for userId', userId);
    return this.http.get<ApiResponse<User>>(`${this.api}/api/users/${userId}`).pipe(
      tap(r => {
        console.log('AuthService: profile fetched', r.data);
        const user = r.data;
        if (!user.role && roleFromToken) user.role = roleFromToken;
        
        this.currentUser.set(user);
        localStorage.setItem('cs_user', JSON.stringify(user));
      }),
      map(() => data)
    );
  }



  private getRoleFromAuth(data: AuthTokens): string | null {
    if (typeof data.role === 'string' && data.role) return data.role;
    if (data.user?.role) return data.user.role;

    const payload = this.decodeJwtPayload(this.getAccessToken(data));
    if (!payload) return null;
    if (typeof payload.role === 'string') return payload.role;
    if (Array.isArray(payload.role) && payload.role.length > 0) return payload.role[0];
    if (typeof payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] === 'string') {
      return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    }
    return null;
  }

  private getAccessToken(data: AuthTokens): string | null {
    return data.accessToken || data.token || null;
  }

  private decodeJwtPayload(token: string | null) {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    try {
      const payload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decodeURIComponent(escape(payload)));
    } catch {
      return null;
    }
  }

  private getUserIdFromAuth(data: AuthTokens): number | null {
    if (typeof data.userId === 'number') return data.userId;
    if (typeof data.id === 'number') return data.id;
    if (data.user?.userId) return data.user.userId;

    const payload = this.decodeJwtPayload(this.getAccessToken(data));
    if (!payload) return null;
    if (typeof payload.userId === 'number') return payload.userId;
    if (typeof payload.sub === 'number') return payload.sub;
    if (typeof payload.sub === 'string' && /^\d+$/.test(payload.sub)) return parseInt(payload.sub, 10);
    if (typeof payload.nameid === 'string' && /^\d+$/.test(payload.nameid)) return parseInt(payload.nameid, 10);
    return null;
  }

  private getUserIdFromToken(token: string | null): number | null {
    const payload = this.decodeJwtPayload(token);
    if (!payload) return null;
    if (typeof payload.userId === 'number') return payload.userId;
    if (typeof payload.sub === 'number') return payload.sub;
    if (typeof payload.sub === 'string' && /^\d+$/.test(payload.sub)) return parseInt(payload.sub, 10);
    return null;
  }

  private fetchUserProfile(userId: number) {
    this.http.get<ApiResponse<User>>(`${this.api}/api/users/${userId}`).subscribe({
      next: r => {
        this.currentUser.set(r.data);
        localStorage.setItem('cs_user', JSON.stringify(r.data));
      }
    });
  }

  refreshToken() {
    const rt = localStorage.getItem('cs_refresh');
    return this.http.post<ApiResponse<AuthTokens>>(`${this.api}/api/users/refresh`, { refreshToken: rt }).pipe(
      switchMap(res => this.storeAuthAndFetchProfile(res.data))
    );
  }

  logout() {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_refresh');
    localStorage.removeItem('cs_user');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/landing']);
  }

  get isLoggedIn() { 
    const t = this.token();
    return !!t && t.length > 10; // Basic check to ensure it's a real token
  }
  get isAdmin() { return this.currentUser()?.role === 'Admin'; }
  get userId() { return this.currentUser()?.userId ?? 0; }
}

