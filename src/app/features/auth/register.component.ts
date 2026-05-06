import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-content animate-fade">
      <div class="auth-header">
        <h1 class="auth-title title-gradient">SIGN UP</h1>
        <p class="auth-subtitle uppercase">JOIN THE COMMUNITY</p>
      </div>

      <div *ngIf="error()" class="error-box">{{ error() }}</div>

      <div class="auth-form">
        <div class="field-group">
          <label>FULL NAME</label>
          <input class="input" [(ngModel)]="fullName" placeholder="ENTER YOUR NAME">
        </div>
        <div class="field-group">
          <label>USERNAME</label>
          <input class="input" [(ngModel)]="userName" placeholder="CHOOSE A USERNAME">
        </div>
        <div class="field-group">
          <label>EMAIL</label>
          <input class="input" type="email" [(ngModel)]="email" placeholder="ENTER YOUR EMAIL">
        </div>
        <div class="field-group">
          <label>PASSWORD</label>
          <input class="input" type="password" [(ngModel)]="password" placeholder="CREATE A PASSWORD" (keyup.enter)="register()">
        </div>

        <button class="btn primary auth-btn" [disabled]="loading()" (click)="register()">
          <span *ngIf="!loading()">CREATE ACCOUNT</span>
          <div *ngIf="loading()" class="spinner" style="width:16px;height:16px"></div>
        </button>
      </div>

      <p class="auth-footer">
        Already have an account? <a routerLink="/auth/login">SIGN IN</a>
      </p>
    </div>
  `,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .auth-content { display: flex; flex-direction: column; gap: 24px; @media (max-width: 480px) { gap: 20px; } }
    
    .auth-header { text-align: center; }
    .auth-title { font-size: 32px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.05em; @media (max-width: 480px) { font-size: 24px; } }
    .auth-subtitle { color: var(--text3); font-size: 11px; font-weight: 800; letter-spacing: 0.1em; }

    .auth-form { display: flex; flex-direction: column; gap: 20px; @media (max-width: 480px) { gap: 16px; } }
    .field-group { display: flex; flex-direction: column; gap: 8px; }
    .field-group label { font-size: 11px; font-weight: 800; color: var(--text3); letter-spacing: 0.05em; }

    .input { 
      background: rgba(255, 255, 255, 0.05); 
      border: 1px solid var(--border-sub); 
      border-radius: 100px; padding: 14px 24px; font-size: 14px; font-weight: 600;
      @media (max-width: 480px) { padding: 12px 20px; font-size: 13px; }
      &::placeholder { color: rgba(255, 255, 255, 0.2); letter-spacing: 0.02em; }
      &:focus { border-color: rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.08); }
    }

    .auth-btn { height: 56px; font-size: 16px; font-weight: 800; letter-spacing: 0.02em; border-radius: 100px; margin-top: 12px; @media (max-width: 480px) { height: 50px; font-size: 14px; margin-top: 8px; } }

    .auth-footer {
      text-align: center; font-size: 13px; font-weight: 600; color: var(--text3);
      @media (max-width: 480px) { font-size: 12px; }
      a { color: var(--text); font-weight: 800; margin-left: 8px; &:hover { text-decoration: underline; } }
    }

    .error-box { background: rgba(255, 59, 48, 0.1); color: #FF3B30; border: 1px solid rgba(255, 59, 48, 0.2); padding: 16px; font-size: 13px; text-align: center; border-radius: var(--radius-sm); font-weight: 700; }
  `]
})
export class RegisterComponent {
  fullName = ''; userName = ''; email = ''; password = '';
  loading = signal(false);
  error = signal('');
  constructor(private auth: AuthService, private router: Router) {}
  register() {
    this.loading.set(true); this.error.set('');
    this.auth.register(this.userName, this.fullName, this.email, this.password).subscribe({
      next: () => this.router.navigate(['/feed']),
      error: (e) => { this.loading.set(false); this.error.set(e.error?.message || 'Registration failed.'); }
    });
  }
}
