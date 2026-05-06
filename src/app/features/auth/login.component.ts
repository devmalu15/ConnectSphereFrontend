import { Component, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-content animate-fade">
      <div class="auth-header">
        <h1 class="auth-title title-gradient">SIGN IN</h1>
        <p class="auth-subtitle uppercase">CONNECTSPHERE PLATFORM</p>
      </div>

      <div *ngIf="error()" class="error-box">{{ error() }}</div>

      <div class="auth-form">
        <div class="field-group">
          <label>EMAIL / USERNAME</label>
          <input class="input" type="text" [(ngModel)]="email" placeholder="ENTER YOUR EMAIL" (keyup.enter)="login()">
        </div>

        <div class="field-group">
          <label>PASSWORD</label>
          <input class="input" type="password" [(ngModel)]="password" placeholder="ENTER YOUR PASSWORD" (keyup.enter)="login()">
        </div>

        <button class="btn primary auth-btn" [disabled]="loading()" (click)="login()">
          <span *ngIf="!loading()">SIGN IN</span>
          <div *ngIf="loading()" class="spinner" style="width:16px;height:16px"></div>
        </button>
      </div>

      <div class="divider"><span>OR CONTINUE WITH</span></div>

      <div class="social-grid">
        <button class="btn primary google-btn" (click)="signInWithGoogle()">
          <svg viewBox="0 0 48 48" style="display:block">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          <span>CONTINUE WITH GOOGLE</span>
        </button>
      </div>

      <p class="auth-footer">
        Don't have an account? <a routerLink="/auth/register">SIGN UP</a>
      </p>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .auth-content { display: flex; flex-direction: column; gap: 32px; @media (max-width: 480px) { gap: 24px; } }
    
    .auth-header { text-align: center; }
    .auth-title { font-size: 32px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.05em; @media (max-width: 480px) { font-size: 24px; } }
    .auth-subtitle { color: var(--text3); font-size: 11px; font-weight: 800; letter-spacing: 0.1em; }

    .auth-form { display: flex; flex-direction: column; gap: 24px; @media (max-width: 480px) { gap: 16px; } }
    .field-group { display: flex; flex-direction: column; gap: 10px; }
    .field-group label { font-size: 11px; font-weight: 800; color: var(--text3); letter-spacing: 0.05em; }

    .input { 
      background: rgba(255, 255, 255, 0.05); 
      border: 1px solid var(--border-sub); 
      border-radius: 100px; padding: 16px 24px; font-size: 14px; font-weight: 600;
      @media (max-width: 480px) { padding: 14px 20px; font-size: 13px; }
      &::placeholder { color: rgba(255, 255, 255, 0.2); letter-spacing: 0.02em; }
      &:focus { border-color: rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.08); }
    }

    .auth-btn { height: 56px; font-size: 16px; font-weight: 800; letter-spacing: 0.02em; border-radius: 100px; margin-top: 8px; @media (max-width: 480px) { height: 50px; font-size: 14px; } }

    .divider {
      display: flex; align-items: center; gap: 16px;
      span { font-size: 10px; font-weight: 800; color: var(--text3); white-space: nowrap; letter-spacing: 0.05em; }
      &::before, &::after { content: ""; flex: 1; height: 1px; background: var(--border-sub); }
    }

    .social-grid { display: flex; flex-direction: column; gap: 16px; @media (max-width: 480px) { gap: 12px; } }
    .google-btn {
      height: 56px; width: 100%; border-radius: 100px; display: flex; align-items: center; justify-content: center; gap: 12px;
      font-size: 14px; font-weight: 600; letter-spacing: 0.25px;
      @media (max-width: 480px) { height: 50px; font-size: 13px; }
      svg { width: 18px; height: 18px; }
    }

    .auth-footer {
      text-align: center; font-size: 13px; font-weight: 600; color: var(--text3);
      a { color: var(--text); font-weight: 800; margin-left: 8px; &:hover { text-decoration: underline; } }
    }

    .error-box { background: rgba(255, 59, 48, 0.1); color: #FF3B30; border: 1px solid rgba(255, 59, 48, 0.2); padding: 16px; font-size: 13px; text-align: center; border-radius: var(--radius-sm); font-weight: 700; }
  `]
})
export class LoginComponent implements OnInit {
  email = ''; password = '';
  loading = signal(false);
  error = signal('');
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    // Initialize Google One Tap / Sign In
    (window as any).handleGoogleResponse = (res: any) => this.handleGoogleResponse(res);
    
    setTimeout(() => {
      if ((window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (window as any).handleGoogleResponse
        });
      }
    }, 1000);
  }

  login() {
    if (!this.email || !this.password) return;
    this.loading.set(true); this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/feed']),
      error: (e) => { this.loading.set(false); this.error.set(e.error?.message || 'Invalid credentials. Please try again.'); }
    });
  }

  signInWithGoogle() {
    if ((window as any).google) {
      (window as any).google.accounts.id.prompt();
    }
  }

  private handleGoogleResponse(res: any) {
    if (res.credential) {
      this.loading.set(true);
      this.auth.googleLogin(res.credential).subscribe({
        next: () => this.router.navigate(['/feed']),
        error: (e) => {
          this.loading.set(false);
          this.error.set('Google login failed. Please try again.');
        }
      });
    }
  }
}
