import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-topnav',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="topnav glass animate-fade">
      <div class="nav-container">
        <div class="nav-left">
          <a routerLink="/" class="logo title-gradient">ConnectSphere</a>
        </div>
        
        <div class="nav-right" *ngIf="auth.isLoggedIn">
          <a *ngIf="auth.currentUser()" [routerLink]="['/profile', auth.currentUser()?.userId]" class="profile-chip glass pill clickable">
            <div class="avatar mini-av">
              <img *ngIf="auth.currentUser()?.avatarUrl" [src]="auth.currentUser()?.avatarUrl">
              <span *ngIf="!auth.currentUser()?.avatarUrl">{{ auth.currentUser()?.userName?.[0]?.toUpperCase() }}</span>
            </div>
            <span class="user-name">{{ auth.currentUser()?.fullName?.toUpperCase() }}</span>
          </a>
          
          <button class="btn glass pill logout-btn" (click)="auth.logout()">
            <span class="logout-text">LOGOUT</span>
            <svg class="logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topnav {
      position: fixed; top: 0; left: 0; right: 0;
      height: 80px; z-index: 1000;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      display: flex; align-items: center;
    }

    .nav-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      font-size: 24px; font-weight: 800; letter-spacing: -0.04em;
      text-decoration: none;
    }

    .nav-right { display: flex; align-items: center; gap: 20px; }

    .profile-chip {
      display: flex; align-items: center; gap: 12px;
      padding: 6px 16px 6px 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-sub);
      text-decoration: none;
      transition: all 0.3s ease;
      
      &.clickable {
        cursor: pointer;
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }
      }
    }

    .mini-av { 
      width: 32px; height: 32px; border: 1px solid rgba(255, 255, 255, 0.1); 
      font-size: 12px; font-weight: 800;
    }

    .user-name {
      font-size: 12px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em;
    }

    .logout-btn {
      font-size: 11px; font-weight: 800; letter-spacing: 0.1em;
      padding: 10px 24px; color: var(--text3);
      display: flex; align-items: center; gap: 8px;
      &:hover { color: #FF3B30; background: rgba(255, 59, 48, 0.1); border-color: rgba(255, 59, 48, 0.2); }
    }
    .logout-icon { display: none; width: 18px; height: 18px; }

    @media (max-width: 640px) {
      .nav-container { padding: 0 16px; }
      .topnav { height: 64px; }
      .logo { font-size: 18px; }
      .user-name { display: none; }
      .profile-chip { padding: 4px; gap: 0; }
      .nav-right { gap: 12px; }
      .logout-btn { padding: 8px; border-radius: 50%; width: 40px; height: 40px; justify-content: center; }
      .logout-text { display: none; }
      .logout-icon { display: block; }
    }
  `]
})
export class TopNavComponent {
  constructor(public auth: AuthService) {}
}
