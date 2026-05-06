import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <div class="landing-wrapper animate-fade">
      <header class="landing-nav">
        <div class="nav-brand title-gradient">ConnectSphere</div>
      </header>

      <main class="landing-content">
        <div class="hero-section">
          <h1 class="landing-title title-gradient">Connect Sphere</h1>
          <p class="landing-subtitle">Discover what's happening around you.</p>
          <div class="cta-group">
            <a routerLink="/auth/register" class="btn primary pill lg">GET STARTED</a>
            <a routerLink="/auth/login" class="btn glass pill lg">SIGN IN</a>
          </div>
        </div>
      </main>

      <footer class="landing-footer">
        <p>© 2026 ConnectSphere. All rights reserved.</p>
      </footer>
    </div>
  `,
  styles: [`
    .landing-wrapper {
      min-height: 100vh;
      background: var(--bg);
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;
    }

    .landing-nav {
      padding: 32px 64px;
      display: flex; align-items: center; justify-content: space-between;
      z-index: 100;
      @media (max-width: 640px) { padding: 24px; }
    }
    .nav-brand { font-size: 28px; font-weight: 800; letter-spacing: -0.04em; }
    .nav-actions { display: flex; gap: 16px; }

    .landing-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      text-align: center;
    }

    .hero-section {
      max-width: 800px;
      animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    .landing-title { 
      font-size: 120px; 
      font-weight: 800; 
      margin-bottom: 24px; 
      letter-spacing: -0.06em;
      line-height: 0.9;
      @media (max-width: 768px) { font-size: 80px; }
      @media (max-width: 480px) { font-size: 52px; margin-bottom: 16px; }
    }

    .landing-subtitle { 
      font-size: 24px; 
      color: var(--text2); 
      font-weight: 500; 
      margin-bottom: 48px;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
      @media (max-width: 480px) { font-size: 16px; margin-bottom: 32px; padding: 0 16px; }
    }

    .cta-group {
      display: flex;
      gap: 20px;
      justify-content: center;
      @media (max-width: 480px) { flex-direction: column; align-items: stretch; }
    }

    .btn.lg {
      height: 64px;
      padding: 0 48px;
      font-size: 18px;
      font-weight: 700;
      @media (max-width: 480px) { height: 56px; padding: 0 32px; font-size: 16px; }
    }

    .landing-footer {
      padding: 32px;
      text-align: center;
      color: var(--text3);
      font-size: 14px;
      font-weight: 500;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(40px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class LandingComponent {}
