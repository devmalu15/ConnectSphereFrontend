import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="admin-login-page">
      <div class="portal-glow"></div>
      
      <div class="login-card glass animate-fade">
        <div class="security-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span>ENCRYPTED PORTAL</span>
        </div>

        <div class="admin-brand">
          <div class="admin-icon-wrap">
            <div class="admin-icon pulse">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          </div>
          <h1>ADMIN PORTAL</h1>
          <p>AUTHENTICATE TO ACCESS CONNECTSPHERE CORE</p>
        </div>

        <div *ngIf="error()" class="error-msg animate-shake">{{ error() }}</div>

        <div class="form-container">
          <div class="input-wrap">
            <svg class="i-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input class="p-input" type="email" [(ngModel)]="email" placeholder="ADMIN EMAIL" (keyup.enter)="login()">
          </div>
          
          <div class="input-wrap">
            <svg class="i-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input class="p-input" type="password" [(ngModel)]="password" placeholder="PASSWORD" (keyup.enter)="login()">
          </div>

          <button class="login-btn" [disabled]="loading()" (click)="login()">
            <span *ngIf="!loading()">SIGN IN TO CORE</span>
            <div *ngIf="loading()" class="spinner"></div>
          </button>
        </div>

        <div class="portal-footer">
          <button (click)="theme.toggle()" class="theme-btn glass">
            <svg *ngIf="!theme.isDark()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            <svg *ngIf="theme.isDark()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <span>{{ theme.isDark() ? 'DARK MODE' : 'LIGHT MODE' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-page { 
      min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; 
      background: #000; position: relative; overflow: hidden;
    }
    
    .portal-glow {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 600px; height: 600px; background: radial-gradient(circle, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
      pointer-events: none;
    }

    .login-card { 
      padding: 48px; width: 100%; max-width: 440px; 
      background: rgba(20, 20, 20, 0.8); backdrop-filter: blur(40px);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 32px;
      box-shadow: 0 40px 80px rgba(0,0,0,0.8);
      position: relative; z-index: 1;
    }

    .security-badge {
      display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px;
      background: rgba(255, 255, 255, 0.05); border-radius: 100px;
      color: var(--text3); font-size: 10px; font-weight: 800; letter-spacing: 0.1em;
      margin-bottom: 32px; border: 1px solid rgba(255, 255, 255, 0.05);
      svg { width: 12px; height: 12px; }
    }

    .admin-brand { text-align: center; margin-bottom: 40px; }
    .admin-icon-wrap { margin-bottom: 24px; display: flex; justify-content: center; }
    .admin-icon { 
      width: 64px; height: 64px; border-radius: 20px; 
      background: #FFFFFF; display: flex; align-items: center; justify-content: center; 
      box-shadow: 0 0 30px rgba(255, 255, 255, 0.2);
      svg { width: 28px; height: 28px; color: #000; }
    }

    h1 { font-size: 24px; font-weight: 900; letter-spacing: -0.02em; color: #FFFFFF; margin-bottom: 8px; }
    p { font-size: 11px; color: var(--text3); font-weight: 800; letter-spacing: 0.1em; }

    .form-container { display: flex; flex-direction: column; gap: 16px; }
    .input-wrap {
      position: relative; display: flex; align-items: center;
      .i-icon { position: absolute; left: 20px; width: 18px; height: 18px; color: var(--text3); }
    }
    .p-input {
      width: 100%; padding: 18px 24px 18px 54px; border-radius: 16px;
      background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-sub);
      color: #FFFFFF; font-size: 14px; font-weight: 600; outline: none;
      transition: var(--transition);
      &::placeholder { color: var(--text3); font-size: 12px; letter-spacing: 0.05em; font-weight: 700; }
      &:focus { background: rgba(255, 255, 255, 0.06); border-color: rgba(255, 255, 255, 0.3); }
    }

    .login-btn {
      margin-top: 12px; width: 100%; height: 56px; border-radius: 100px;
      background: #FFFFFF; color: #000; border: none;
      font-size: 14px; font-weight: 900; letter-spacing: 0.05em;
      transition: var(--transition); cursor: pointer;
      &:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 10px 20px rgba(255,255,255,0.1); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .error-msg { 
      background: rgba(255, 59, 48, 0.1); color: #FF453A; 
      padding: 12px 16px; border-radius: 12px; font-size: 13px; font-weight: 600; 
      margin-bottom: 24px; text-align: center; border: 1px solid rgba(255, 59, 48, 0.2);
    }

    .portal-footer { margin-top: 40px; display: flex; justify-content: center; }
    .theme-btn {
      display: flex; align-items: center; gap: 10px; padding: 10px 20px;
      border-radius: 100px; border: 1px solid var(--border-sub);
      color: var(--text2); font-size: 11px; font-weight: 800; letter-spacing: 0.05em;
      &:hover { background: rgba(255, 255, 255, 0.05); color: #FFFFFF; }
      svg { width: 14px; height: 14px; }
    }

    .pulse { animation: iconPulse 3s infinite ease-in-out; }
    @keyframes iconPulse {
      0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
      70% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
      100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
    }
  `]
})
export class AdminLoginComponent {
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  constructor(private auth: AuthService, private router: Router, public theme: ThemeService) {}

  login() {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.adminLogin(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/secretadmin']);
      },
      error: (e) => {
        this.loading.set(false);
        this.error.set(e.message === 'Not an admin' ? 'Access denied. Admin only.' : e.error?.message || 'Invalid credentials');
      }
    });
  }
}
