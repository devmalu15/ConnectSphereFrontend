import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="admin-layout">
      
      <aside class="admin-sidebar glass">
        <div class="admin-logo-section">
          <div class="admin-brand-icon animate-fade">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div class="admin-brand-text">
            <p class="brand-name">CONNECTSPHERE</p>
            <div class="admin-tag">ADMIN CORE</div>
          </div>
        </div>

        <nav class="admin-nav">
          <a routerLink="analytics" routerLinkActive="active" class="admin-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <span>ANALYTICS</span>
          </a>
          <a routerLink="users" routerLinkActive="active" class="admin-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>USER CONTROLS</span>
          </a>
          <a routerLink="posts" routerLinkActive="active" class="admin-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            <span>POST CONTROL</span>
          </a>
          <a routerLink="broadcast" routerLinkActive="active" class="admin-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <span>SYSTEM BROADCAST</span>
          </a>
          <a routerLink="audit" routerLinkActive="active" class="admin-nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span>AUDIT LOGS</span>
          </a>
        </nav>

        <div class="admin-sidebar-footer">
          <div class="footer-divider"></div>
          <button (click)="theme.toggle()" class="footer-action-btn">
            <svg *ngIf="!theme.isDark()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2"/></svg>
            <svg *ngIf="theme.isDark()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            <span>{{ theme.isDark() ? 'DARK' : 'LIGHT' }} MODE</span>
          </button>
          <button (click)="auth.logout()" class="footer-action-btn danger">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>TERMINATE SESSION</span>
          </button>
        </div>
      </aside>

      <main class="admin-content-area">
        <div class="content-wrapper">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { 
      display: flex; min-height: 100vh; background: #000; 
      color: #FFFFFF; font-family: var(--font-main);
    }
    
    .admin-sidebar {
      width: 280px; flex-shrink: 0;
      background: rgba(15, 15, 15, 0.8);
      backdrop-filter: blur(40px);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      display: flex; flex-direction: column;
      position: sticky; top: 0; height: 100vh;
      z-index: 10;
      @media (max-width: 1024px) { width: 80px; }
    }

    .admin-logo-section {
      padding: 32px 24px; display: flex; align-items: center; gap: 16px;
      @media (max-width: 1024px) { padding: 32px 0; justify-content: center; }
    }

    .admin-brand-icon {
      width: 44px; height: 44px; border-radius: 14px;
      background: #FFFFFF; color: #000;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 30px rgba(255, 255, 255, 0.15);
      flex-shrink: 0;
      svg { width: 22px; height: 22px; }
    }

    .admin-brand-text {
      @media (max-width: 1024px) { display: none; }
      .brand-name { font-size: 14px; font-weight: 900; letter-spacing: 0.1em; color: #FFFFFF; margin: 0; }
      .admin-tag { 
        display: inline-block; font-size: 9px; font-weight: 800; color: #FFFFFF;
        background: rgba(255, 255, 255, 0.1); padding: 2px 8px; border-radius: 4px;
        margin-top: 4px; letter-spacing: 0.05em;
      }
    }

    .admin-nav { flex: 1; padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; }
    
    .admin-nav-item {
      display: flex; align-items: center; gap: 16px;
      padding: 14px 20px; border-radius: 16px;
      font-size: 12px; font-weight: 800; color: var(--text3);
      transition: var(--transition); letter-spacing: 0.05em;
      svg { width: 18px; height: 18px; flex-shrink: 0; }
      span { @media (max-width: 1024px) { display: none; } }
      &:hover { background: rgba(255, 255, 255, 0.05); color: #FFFFFF; }
      &.active { 
        background: #FFFFFF; color: #000; 
        box-shadow: 0 10px 20px rgba(255,255,255,0.1);
      }
      @media (max-width: 1024px) { justify-content: center; padding: 14px 0; }
    }

    .admin-sidebar-footer { padding: 16px; display: flex; flex-direction: column; gap: 4px; }
    .footer-divider { height: 1px; background: rgba(255, 255, 255, 0.08); margin: 0 8px 12px; }
    
    .footer-action-btn {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      border-radius: 12px; font-size: 11px; font-weight: 800; color: var(--text3); 
      transition: var(--transition); letter-spacing: 0.05em;
      svg { width: 16px; height: 16px; }
      span { @media (max-width: 1024px) { display: none; } }
      &:hover { background: rgba(255, 255, 255, 0.05); color: #FFFFFF; }
      &.danger:hover { background: rgba(255, 59, 48, 0.1); color: #FF453A; }
      @media (max-width: 1024px) { justify-content: center; padding: 12px 0; }
    }

    .admin-content-area { flex: 1; overflow-y: auto; background: #000; position: relative; }
    .content-wrapper { padding: 48px; max-width: 1400px; margin: 0 auto; @media (max-width: 640px) { padding: 24px; } }
  `]
})
export class AdminComponent {
  constructor(public auth: AuthService, public theme: ThemeService) {}
}
