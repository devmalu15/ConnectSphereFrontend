import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { SidenavComponent } from './shared/components/sidenav.component';
import { TopNavComponent } from './shared/components/topnav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, SidenavComponent, TopNavComponent],
  template: `
    <ng-container *ngIf="isAppRoute() && auth.isLoggedIn; else bare">
      <app-topnav />
      <div class="app-layout">
        <app-sidenav />
        <main class="main-content">
          <router-outlet />
        </main>
      </div>
      
      
      <nav class="mobile-nav">
        <a routerLink="/feed" routerLinkActive="active" class="m-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
        </a>
        <a routerLink="/explore" routerLinkActive="active" class="m-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </a>
        <a routerLink="/notifications" routerLinkActive="active" class="m-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </a>
        <a [routerLink]="['/profile', auth.userId]" routerLinkActive="active" class="m-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </a>
      </nav>
    </ng-container>
    <ng-template #bare><router-outlet /></ng-template>
  `,
  styles: [`
    .app-layout { padding-top: 80px; }
    .main-content { min-width: 0; }
    
    .mobile-nav {
      position: fixed; bottom: 0; left: 0; right: 0;
      height: 72px; display: none; align-items: center; justify-content: space-around;
      background: rgba(10, 10, 10, 0.8);
      backdrop-filter: var(--glass-blur);
      -webkit-backdrop-filter: var(--glass-blur);
      border-top: 1px solid var(--border-sub); z-index: 500;
      padding-bottom: 12px;
      @media (max-width: 640px) { display: flex; }
    }
    .m-item {
      color: var(--text3); padding: 12px; border-radius: 100px; transition: var(--transition);
      svg { width: 24px; height: 24px; }
      &.active { color: #FFFFFF; background: rgba(255, 255, 255, 0.1); transform: scale(1.1); }
    }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService, public theme: ThemeService, private router: Router) {}

  isAppRoute(): boolean {
    const url = this.router.url;
    return !url.includes('/auth') && !url.includes('/landing') && !url.includes('/secretadmin');
  }
}
