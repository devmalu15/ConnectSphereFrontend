import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { CreatePostModalComponent } from '../components/create-post-modal.component';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, CreatePostModalComponent],
  template: `
    <aside class="sidenav animate-fade">
      <div class="side-inner glass">
        
        <!-- Logo removed, now in TopNav -->

        <nav class="nav-links">
          <a routerLink="/feed" routerLinkActive="active" class="nav-item btn glass pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            <span>HOME</span>
          </a>
          <a routerLink="/explore" routerLinkActive="active" class="nav-item btn glass pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <span>EXPLORE</span>
          </a>
          <a routerLink="/notifications" routerLinkActive="active" class="nav-item btn glass pill">
            <div class="icon-wrap">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>
              <div class="badge" *ngIf="unreadCount() > 0"></div>
            </div>
            <span>NOTIFS</span>
          </a>
          <a routerLink="/settings" routerLinkActive="active" class="nav-item btn glass pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>SETTINGS</span>
          </a>
          <a *ngIf="auth.userId" [routerLink]="['/profile', auth.userId]" routerLinkActive="active" class="nav-item btn glass pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>PROFILE</span>
          </a>
        </nav>

        <button class="btn primary create-btn" (click)="showCreate.set(true)">
          <span>+ POST</span>
        </button>

        <div class="spacer"></div>

        <!-- Profile mini removed, now in TopNav -->
      </div>
    </aside>

    <app-create-post-modal *ngIf="showCreate()" (closed)="showCreate.set(false)" />
  `,
  styles: [`
    .sidenav {
      position: sticky; top: 80px; height: calc(100vh - 112px); display: flex;
      width: var(--col-left);
      z-index: 50;
      @media (max-width: 1200px) { width: 80px; }
      @media (max-width: 640px) { display: none; }
    }
    .side-inner {
      flex: 1; padding: 32px 20px;
      display: flex; flex-direction: column; gap: 32px;
      margin: 16px 0;
      border-radius: var(--radius-lg);
    }
    
    /* logo-row removed */

    .nav-links { display: flex; flex-direction: column; gap: 12px; width: 100%; }
    .nav-item {
      justify-content: flex-start; gap: 16px; border: none; width: 100%;
      height: 54px;
      padding: 0 24px;
      @media (max-width: 1200px) { padding: 12px; justify-content: center; height: 50px; }
      svg { width: 22px; height: 22px; stroke-width: 2.5; }
      span { font-size: 14px; font-weight: 700; letter-spacing: -0.01em; @media (max-width: 1200px) { display: none; } }
      
      &.active { 
        background: #FFFFFF !important;
        color: #000000 !important;
        box-shadow: 0 12px 24px rgba(255, 255, 255, 0.15);
        transform: scale(1.02);
      }
    }

    .icon-wrap { position: relative; display: flex; align-items: center; justify-content: center; }
    .badge { position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #FF3B30; border-radius: 50%; border: 2px solid #000; }

    .spacer { flex: 1; }
    .create-btn { 
      width: 100%; height: 56px; font-size: 15px; font-weight: 800;
      box-shadow: 0 15px 30px rgba(255, 255, 255, 0.1);
    }
    
    /* profile-mini removed */
  `]
})
export class SidenavComponent {
  showCreate = signal(false);
  unreadCount = signal(0);
  constructor(public auth: AuthService, public theme: ThemeService) { }
}
