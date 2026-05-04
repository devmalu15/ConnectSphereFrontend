import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/api.services';

@Component({
  selector: 'app-admin-broadcast',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">Broadcast Notification</h2>
      <p class="page-sub">Send notifications to all users or specific users</p>
    </div>

    <div class="broadcast-layout">
      <div class="broadcast-form card">
        <div class="form-group">
          <label class="field-label">Notification Type</label>
          <select class="p-input" [(ngModel)]="type">
            <option value="SYSTEM">System Announcement</option>
            <option value="UPDATE">Platform Update</option>
            <option value="PROMOTION">Promotion</option>
            <option value="ALERT">Alert</option>
          </select>
        </div>

        <div class="form-group">
          <label class="field-label">Title</label>
          <input class="p-input" [(ngModel)]="title" placeholder="NOTIFICATION TITLE">
        </div>

        <div class="form-group">
          <label class="field-label">Message</label>
          <textarea class="p-input" [(ngModel)]="message" placeholder="WRITE YOUR MESSAGE HERE…" rows="5"></textarea>
          <p class="char-count">{{ message.length }} / 500</p>
        </div>

        <div class="form-group">
          <label class="field-label">Target Audience</label>
          <div class="audience-options">
            <label class="radio-label">
              <input type="radio" [(ngModel)]="audience" value="all"> ALL USERS
            </label>
            <label class="radio-label">
              <input type="radio" [(ngModel)]="audience" value="specific"> SPECIFIC USERS
            </label>
          </div>
        </div>

        <div *ngIf="audience === 'specific'" class="form-group">
          <label class="field-label">User IDs (comma separated)</label>
          <input class="p-input" [(ngModel)]="specificIds" placeholder="E.G. 1,2,3,4">
        </div>

        <div *ngIf="success()" class="success-msg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:18px;height:18px"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          NOTIFICATION DISPATCHED SUCCESSFULLY
        </div>
        <div *ngIf="error()" class="error-msg">{{ error() }}</div>

        <div class="form-actions">
          <button class="btn ghost pill" (click)="reset()">CLEAR</button>
          <button class="send-btn" [disabled]="!title.trim() || !message.trim() || sending()" (click)="send()">
            <div *ngIf="sending()" class="spinner" style="width:16px;height:16px;border-color:#000;border-top-color:transparent"></div>
            <svg *ngIf="!sending()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:18px;height:18px"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            <span>SEND BROADCAST</span>
          </button>
        </div>
      </div>

      <div class="preview-card card">
        <h3 class="preview-title">Preview</h3>
        <div class="notif-preview">
          <div class="notif-header-preview">
            <div class="notif-dot-preview" [ngClass]="type.toLowerCase()"></div>
            <span class="notif-type-label">{{ type }}</span>
          </div>
          <p class="preview-notif-title">{{ title || 'Notification title' }}</p>
          <p class="preview-notif-msg">{{ message || 'Your message will appear here...' }}</p>
          <p class="preview-time">Just now</p>
        </div>
        <div class="broadcast-info">
          <div class="info-row">
            <span class="info-label">Target</span>
            <span class="info-val">{{ audience === 'all' ? 'All users' : 'Specific users' }}</span>
          </div>
          <div class="info-row" *ngIf="audience === 'specific' && specificIds">
            <span class="info-label">Recipients</span>
            <span class="info-val">{{ specificIds.split(',').length }} users</span>
          </div>
          <div class="info-row">
            <span class="info-label">Type</span>
            <span class="info-val">{{ type }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 40px; }
    .page-title { font-size: 32px; font-weight: 900; letter-spacing: -0.03em; color: #FFFFFF; }
    .page-sub { font-size: 12px; font-weight: 800; color: var(--text3); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }
    .broadcast-layout { display: grid; grid-template-columns: 1fr 400px; gap: 32px; @media (max-width: 1024px) { grid-template-columns: 1fr; } }
    .broadcast-form { 
      padding: 40px; border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(15, 15, 15, 0.5); backdrop-filter: blur(40px);
    }
    .form-group { margin-bottom: 24px; }
    .field-label { display: block; font-size: 10px; font-weight: 800; color: var(--text3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 12px; }
    .char-count { font-size: 10px; font-weight: 700; color: var(--text3); text-align: right; margin-top: 8px; }
    .audience-options { display: flex; gap: 32px; }
    .radio-label { 
      display: flex; align-items: center; gap: 12px; font-size: 13px; font-weight: 700; color: var(--text2); cursor: pointer;
      input { width: 18px; height: 18px; accent-color: #FFFFFF; }
    }
    .success-msg { 
      background: rgba(46,204,113,0.1); color: #2ecc71; padding: 16px; border-radius: 16px; 
      font-size: 13px; font-weight: 700; margin-bottom: 24px; display: flex; align-items: center; gap: 12px;
      border: 1px solid rgba(46,204,113,0.2);
    }
    .error-msg { 
      background: rgba(255,59,48,0.1); color: #ff3b30; padding: 16px; border-radius: 16px; 
      font-size: 13px; font-weight: 700; margin-bottom: 24px; border: 1px solid rgba(255,59,48,0.2);
    }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 40px; }
    .preview-card { 
      padding: 32px; border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255, 255, 255, 0.02); height: fit-content;
    }
    .preview-title { font-size: 12px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; }
    .notif-preview { 
      background: rgba(20, 20, 20, 0.8); border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px); border-radius: 24px; padding: 24px; margin-bottom: 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }
    .notif-header-preview { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .notif-dot-preview { 
      width: 8px; height: 8px; border-radius: 50%; background: #FFFFFF;
      &.alert { background: #ff3b30; } &.promotion { background: #f39c12; } &.update { background: #3498db; }
    }
    .notif-type-label { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text3); }
    .preview-notif-title { font-size: 15px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.01em; }
    .preview-notif-msg { font-size: 13px; color: var(--text2); margin-top: 6px; line-height: 1.6; font-weight: 600; }
    .preview-time { font-size: 10px; color: var(--text3); font-weight: 800; text-transform: uppercase; margin-top: 16px; letter-spacing: 0.05em; }
    .broadcast-info { border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 24px; display: flex; flex-direction: column; gap: 12px; }
    .info-row { display: flex; justify-content: space-between; align-items: center; }
    .info-label { font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; }
    .info-val { font-size: 12px; font-weight: 800; color: #FFFFFF; }
  `]
})
export class AdminBroadcastComponent {
  title = '';
  message = '';
  type = 'SYSTEM';
  audience = 'all';
  specificIds = '';
  sending = signal(false);
  success = signal(false);
  error = signal('');

  constructor(private adminService: AdminService) {}

  send() {
    this.sending.set(true);
    this.success.set(false);
    this.error.set('');
    const userIds = this.audience === 'specific'
      ? this.specificIds.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n))
      : [];
    this.adminService.broadcast(this.title, this.message, userIds, this.type).subscribe({
      next: () => { this.sending.set(false); this.success.set(true); setTimeout(() => this.success.set(false), 3000); },
      error: e => { this.sending.set(false); this.error.set(e.error?.message || 'Failed to send broadcast'); }
    });
  }

  reset() { this.title = ''; this.message = ''; this.specificIds = ''; this.success.set(false); this.error.set(''); }
}
