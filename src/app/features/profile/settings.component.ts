import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page animate-fade">
      <div class="settings-header glass animate-fade">
        <h1 class="page-title title-gradient">SETTINGS</h1>
      </div>

      <div class="settings-content">
        
        <div class="settings-section glass animate-fade">
          <h2 class="section-label">PROFILE INFORMATION</h2>

          <div class="edit-profile-box">
            <div class="avatar-edit-row">
              <div class="settings-avatar animate-fade">
                <img *ngIf="avatarPreview() || auth.currentUser()?.avatarUrl" [src]="avatarPreview() || auth.currentUser()?.avatarUrl">
                <span *ngIf="!avatarPreview() && !auth.currentUser()?.avatarUrl">{{ auth.currentUser()?.userName?.[0]?.toUpperCase() }}</span>
              </div>
              <div class="avatar-meta">
                <button class="btn glass pill btn-sm" (click)="av.click()">CHANGE PHOTO</button>
                <input type="file" #av (change)="onAvatarSelected($event)" accept="image/*" style="display:none">
                <p class="hint uppercase">SQUARE JPG/PNG RECOMMENDED</p>
              </div>
            </div>

            <div class="field-group">
              <label>FULL NAME</label>
              <input class="input" [(ngModel)]="fullName" placeholder="ENTER FULL NAME">
            </div>

            <div class="field-group">
              <label>BIO</label>
              <textarea class="input" [(ngModel)]="bio" rows="3" placeholder="TELL THE WORLD..."></textarea>
            </div>

            <div *ngIf="profileSuccess()" class="banner success">PROFILE UPDATED</div>
            <div *ngIf="profileError()" class="banner error">{{ profileError().toUpperCase() }}</div>

            <div class="save-row">
              <button class="btn primary pill" [disabled]="savingProfile() || !hasChanges()" (click)="saveProfile()">
                <span *ngIf="!savingProfile()">SAVE PROFILE</span>
                <div *ngIf="savingProfile()" class="spinner" style="width:14px;height:14px"></div>
              </button>
            </div>
          </div>
        </div>

        
        <div class="settings-section glass animate-fade">
          <h2 class="section-label">SECURITY</h2>
          
          <div class="settings-row" (click)="editingPw = !editingPw">
            <div class="meta">
              <p class="row-title">CHANGE PASSWORD</p>
              <p class="row-val">PROTECT YOUR ACCOUNT</p>
            </div>
            <svg class="chevron" [class.open]="editingPw" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          <div *ngIf="editingPw" class="edit-field animate-fade">
            <div class="field-group">
              <label>CURRENT PASSWORD</label>
              <input class="input" type="password" [(ngModel)]="currentPw" placeholder="CURRENT">
            </div>
            <div class="field-group">
              <label>NEW PASSWORD</label>
              <input class="input" type="password" [(ngModel)]="newPw" placeholder="NEW (8+ CHARS)">
            </div>
            
            <div *ngIf="pwSuccess()" class="banner success">PASSWORD UPDATED</div>
            <div *ngIf="pwError()" class="banner error">{{ pwError().toUpperCase() }}</div>
            
            <div class="save-row">
              <button class="btn primary pill" [disabled]="savingPw()" (click)="changePw()">
                <span *ngIf="!savingPw()">UPDATE PASSWORD</span>
                <div *ngIf="savingPw()" class="spinner" style="width:14px;height:14px"></div>
              </button>
            </div>
          </div>
        </div>

        
        <div class="settings-section glass animate-fade">
          <h2 class="section-label">PRIVACY</h2>
          <div class="settings-row" (click)="togglePrivacy()">
            <div class="meta">
              <p class="row-title">PRIVATE ACCOUNT</p>
              <p class="row-val">ONLY APPROVED FOLLOWERS CAN SEE YOUR POSTS</p>
            </div>
            <div class="toggle-track" [class.on]="auth.currentUser()?.isPrivate">
              <div class="toggle-thumb"></div>
            </div>
          </div>
        </div>

        <div class="settings-section glass animate-fade">
          <h2 class="section-label">APPEARANCE</h2>
          <div class="settings-row" (click)="theme.toggle()">
            <div class="meta">
              <p class="row-title">LIGHT MODE</p>
              <p class="row-val">TOGGLE BETWEEN LIGHT AND DARK THEMES</p>
            </div>
            <div class="toggle-track" [class.on]="!theme.isDark()">
              <div class="toggle-thumb"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-page { display: flex; flex-direction: column; min-height: 100vh; max-width: 800px; margin: 0 auto; background: var(--bg); }
    
    .settings-header { 
      position: sticky; top: 80px; z-index: 100;
      padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; 
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 100px; margin: 0 16px 24px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      @media (max-width: 640px) { top: 72px; padding: 12px 16px; margin: 0 8px 16px; }
    }
    .page-title { font-size: 20px; font-weight: 800; letter-spacing: 0.1em; margin: 0; }

    .settings-content { padding: 0 16px 80px; display: flex; flex-direction: column; gap: 24px; }
    .settings-section { padding: 32px; border: 1px solid var(--border-sub); border-radius: var(--radius-lg); background: rgba(255, 255, 255, 0.03); }
    .section-label { font-size: 12px; font-weight: 800; color: var(--text3); letter-spacing: 0.1em; margin-bottom: 32px; text-transform: uppercase; }

    .edit-profile-box { display: flex; flex-direction: column; gap: 32px; }
    .avatar-edit-row { display: flex; align-items: center; gap: 32px; @media (max-width: 640px) { gap: 20px; } }
    .settings-avatar { 
      width: 100px; height: 100px; border-radius: 50%; flex-shrink: 0;
      border: 4px solid var(--bg); background: #1a1a1a; 
      display: flex; align-items: center; justify-content: center; 
      font-weight: 800; font-size: 32px; overflow: hidden; color: #FFFFFF; 
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      @media (max-width: 640px) { width: 80px; height: 80px; font-size: 24px; }
      img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; } 
    }
    .avatar-meta { display: flex; flex-direction: column; gap: 12px; @media (max-width: 640px) { gap: 8px; } }
    .btn-sm { font-size: 11px; padding: 10px 20px; @media (max-width: 640px) { padding: 8px 16px; font-size: 10px; } }
    .hint { font-size: 10px; color: var(--text3); font-weight: 700; letter-spacing: 0.05em; }

    .field-group { display: flex; flex-direction: column; gap: 12px; }
    .field-group label { font-size: 11px; font-weight: 800; color: var(--text3); letter-spacing: 0.05em; }
    
    .input { 
      background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-sub); 
      border-radius: 12px; padding: 14px 20px; font-size: 15px; font-weight: 500;
      &::placeholder { color: rgba(255, 255, 255, 0.2); }
      &:focus { border-color: rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.08); }
    }

    .settings-row { 
      display: flex; align-items: center; justify-content: space-between; gap: 24px; 
      cursor: pointer;
    }
    
    .meta { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 0; }
    .row-title { font-size: 16px; font-weight: 800; color: var(--text); letter-spacing: -0.01em; @media (max-width: 640px) { font-size: 14px; } }
    .row-val { font-size: 12px; color: var(--text3); font-weight: 700; letter-spacing: 0.02em; @media (max-width: 640px) { font-size: 10px; } }

    .edit-field { padding: 32px; border-radius: var(--radius-md); background: rgba(0,0,0,0.2); border: 1px solid var(--border-sub); margin-top: 24px; display: flex; flex-direction: column; gap: 24px; @media (max-width: 640px) { padding: 20px; gap: 16px; } }
    
    .save-row { display: flex; gap: 16px; margin-top: 8px; }

    .banner { padding: 16px; font-size: 12px; font-weight: 800; text-align: center; border-radius: 12px; margin-top: 24px; letter-spacing: 0.05em; }
    .banner.success { background: rgba(255, 255, 255, 0.05); color: #FFFFFF; border: 1px solid var(--border-sub); }
    .banner.error { background: rgba(255, 59, 48, 0.1); color: #FF3B30; border: 1px solid rgba(255, 59, 48, 0.2); }

    .toggle-track {
      width: 52px; height: 32px; border-radius: 100px; background: rgba(255, 255, 255, 0.1);
      position: relative; transition: var(--transition);
      &.on { background: #34C759; .toggle-thumb { transform: translateX(20px); } }
    }
    .toggle-thumb {
      position: absolute; top: 4px; left: 4px; width: 24px; height: 24px;
      border-radius: 50%; background: #FFFFFF; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      transition: var(--transition);
    }

    .chevron { width: 20px; height: 20px; color: var(--text3); transition: var(--transition); &.open { transform: rotate(180deg); color: #FFFFFF; } }
  `]
})
export class SettingsComponent implements OnInit {
  fullName = ''; bio = ''; currentPw = ''; newPw = '';
  editingPw = false;
  avatarPreview = signal<string | null>(null);
  avatarFile: File | null = null;
  savingProfile = signal(false); savingPw = signal(false);
  profileSuccess = signal(false); profileError = signal('');
  pwSuccess = signal(false); pwError = signal('');

  constructor(public auth: AuthService, public theme: ThemeService, private userService: UserService) { }

  ngOnInit() { this.syncData(); }

  syncData() { const u = this.auth.currentUser(); this.fullName = u?.fullName ?? ''; this.bio = u?.bio ?? ''; }

  hasChanges() {
    const u = this.auth.currentUser();
    return this.fullName !== (u?.fullName ?? '') || this.bio !== (u?.bio ?? '') || !!this.avatarFile;
  }

  onAvatarSelected(e: Event) {
    const f = (e.target as HTMLInputElement).files?.[0];
    if (!f) return;
    this.avatarFile = f;
    const reader = new FileReader();
    reader.onload = ev => this.avatarPreview.set(ev.target?.result as string);
    reader.readAsDataURL(f);
  }

  saveProfile() {
    const u = this.auth.currentUser(); if (!u) return;
    this.savingProfile.set(true); this.profileSuccess.set(false); this.profileError.set('');
    const fd = new FormData();
    if (this.fullName) fd.append('fullName', this.fullName);
    if (this.bio) fd.append('bio', this.bio);
    if (this.avatarFile) fd.append('avatarFile', this.avatarFile);
    this.userService.updateProfile(u.userId, fd).subscribe({
      next: r => {
        this.savingProfile.set(false); this.profileSuccess.set(true);
        const updated = { ...u, fullName: r.data.fullName, bio: r.data.bio, avatarUrl: r.data.avatarUrl };
        this.auth.currentUser.set(updated); localStorage.setItem('cs_user', JSON.stringify(updated));
        this.avatarFile = null; this.avatarPreview.set(null);
      },
      error: e => { this.savingProfile.set(false); this.profileError.set(e.error?.message || 'Failed to update.'); }
    });
  }

  changePw() {
    const u = this.auth.currentUser(); if (!u || !this.currentPw || !this.newPw) return;
    this.savingPw.set(true); this.pwSuccess.set(false); this.pwError.set('');
    this.userService.changePassword(u.userId, { currentPassword: this.currentPw, newPassword: this.newPw }).subscribe({
      next: () => { this.savingPw.set(false); this.pwSuccess.set(true); this.currentPw = ''; this.newPw = ''; setTimeout(() => this.editingPw = false, 2000); },
      error: e => { this.savingPw.set(false); this.pwError.set(e.error?.message || 'Failed to change password.'); }
    });
  }

  togglePrivacy() {
    const u = this.auth.currentUser(); if (!u) return;
    this.userService.togglePrivacy(u.userId).subscribe(() => {
      const updated = { ...u, isPrivate: !u.isPrivate };
      this.auth.currentUser.set(updated); localStorage.setItem('cs_user', JSON.stringify(updated));
    });
  }
}
