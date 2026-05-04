import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="auth-wrapper animate-fade">
      <div class="auth-container">
        <div class="auth-card glass-card">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: 100vh;
      background: radial-gradient(circle at 50% 50%, #1a1a1a 0%, #000000 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px;
      position: relative;
      overflow: hidden;
      &::before {
        content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
        background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.05) 0%, transparent 40%);
        pointer-events: none;
      }
    }

    .auth-container {
      width: 100%;
      max-width: 480px;
      z-index: 10;
    }

    .auth-card {
      padding: 48px;
      border-radius: var(--radius-lg);
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: var(--glass-blur);
      border: 1px solid var(--border);
      box-shadow: 0 40px 100px rgba(0,0,0,0.8);
    }
  `]
})
export class AuthComponent {}
