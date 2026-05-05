import { Component, EventEmitter, Output, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService, UserService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { PostCardComponent } from './post-card.component';
import { Post, User } from '../../shared/models/models';

@Component({
  selector: 'app-create-post-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCropperComponent, PostCardComponent],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal animate-fade" (click)="visibilityOpen.set(false)">
        
        <div class="modal-header">
          <button class="close-btn" (click)="closed.emit()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
          
          <div class="header-tabs">
            <button class="tab-btn" [class.active]="view() === 'compose'" (click)="view.set('compose')">COMPOSE</button>
            <button class="tab-btn" *ngIf="previewUrl() && isImage()" [class.active]="view() === 'crop'" (click)="view.set('crop')">EDIT</button>
            <button class="tab-btn" [class.active]="view() === 'preview'" (click)="view.set('preview')">PREVIEW</button>
          </div>
          
          <div class="spacer"></div>
        </div>

        
        <div class="compose-area" [style.display]="view() === 'compose' ? 'flex' : 'none'">
          <div class="avatar composer-av">
            <img *ngIf="auth.currentUser()?.avatarUrl" [src]="auth.currentUser()?.avatarUrl">
            <span *ngIf="!auth.currentUser()?.avatarUrl">{{ auth.currentUser()?.userName?.[0]?.toUpperCase() }}</span>
          </div>
          <div class="compose-right">
            <div class="input-wrapper">
              <textarea #textarea class="post-input" [(ngModel)]="content" placeholder="SHARE WHAT'S ON YOUR MIND..." rows="4" (input)="onInput($event)" (keydown)="onKeyDown($event)"></textarea>
              
              <div *ngIf="showSuggestions()" class="mention-dropdown animate-fade" [style.top.px]="suggestionTop" [style.left.px]="suggestionLeft">
                <div *ngFor="let user of suggestions(); let i = index" class="suggestion-item" [class.active]="i === selectedSuggestionIndex" (click)="selectUser(user)">
                  <div class="avatar mini-av">
                    <img *ngIf="user.avatarUrl" [src]="user.avatarUrl">
                    <span *ngIf="!user.avatarUrl">{{ user.userName[0].toUpperCase() }}</span>
                  </div>
                  <div class="user-info">
                    <span class="s-name">{{ user.userName }}</span>
                    <span class="s-full">{{ user.fullName }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="hashtags-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18"/></svg>
              <input class="hashtag-input" [(ngModel)]="hashtags" placeholder="ADD HASHTAGS (COMMA SEPARATED)...">
            </div>

            <div *ngIf="previewUrl()" class="media-preview animate-scale">
              <div class="preview-frame">
                <img *ngIf="isImage()" [src]="previewUrl()">
                <video *ngIf="!isImage()" [src]="previewUrl()" muted></video>
                <button class="remove-media" (click)="clearMedia()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="preview-area animate-fade" *ngIf="view() === 'preview'">
          <div class="preview-notice">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <span>LIVE FEED PREVIEW</span>
          </div>
          <app-post-card [post]="getMockPost()" [isPreview]="true" />
        </div>

        <div class="crop-area animate-fade" *ngIf="view() === 'crop'">
          <div class="crop-header">
            <h3>CROP YOUR IMAGE</h3>
            <div class="spacer"></div>
            <button class="btn primary pill" (click)="applyCrop()">DONE</button>
          </div>
          <div class="cropper-container">
            <image-cropper
              [imageChangedEvent]="imageChangedEvent"
              [maintainAspectRatio]="false"
              format="png"
              (imageCropped)="imageCropped($event)"
            ></image-cropper>
          </div>
        </div>

        
        <div class="modal-footer">
          <div class="footer-actions">
            <input type="file" #fileInput (change)="onFileSelected($event)" accept="image/*,video/*" style="display:none">
            <button class="tool-btn" (click)="fileInput.click()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span>MEDIA</span>
            </button>
            <div class="visibility-selector">
              <button class="visibility-pill glass" (click)="toggleVisibility($event)">
                <svg *ngIf="visibility === '0'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                <svg *ngIf="visibility === '2'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <svg *ngIf="visibility === '1'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>{{ getVisibilityLabel() }}</span>
                <svg class="chevron" [class.open]="visibilityOpen()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              
              <div *ngIf="visibilityOpen()" class="visibility-menu glass animate-fade">
                <button class="menu-item" (click)="setVisibility('0')" [class.active]="visibility === '0'">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                  <div class="m-text">
                    <span class="m-title">EVERYONE</span>
                    <span class="m-desc">Anyone can see this post</span>
                  </div>
                </button>
                <button class="menu-item" (click)="setVisibility('1')" [class.active]="visibility === '1'">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <div class="m-text">
                    <span class="m-title">FOLLOWERS</span>
                    <span class="m-desc">Only your followers can see</span>
                  </div>
                </button>
                <button class="menu-item" (click)="setVisibility('2')" [class.active]="visibility === '2'">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <div class="m-text">
                    <span class="m-title">PRIVATE</span>
                    <span class="m-desc">Only you can see this post</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div class="footer-right">
            <div class="char-count" [class.limit]="charCount > 280">{{ charCount }}/280</div>
            <button class="post-submit-btn" [disabled]="!content.trim() || loading()" (click)="submit()">
              {{ loading() ? 'SENDING...' : 'POST' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0; z-index: 1000;
      display: flex; align-items: flex-start; justify-content: center;
      padding: 20px; background: rgba(0,0,0,0.9);
      overflow-y: auto;
    }

    .modal {
      width: 100%; max-width: 600px; margin: 80px 0 40px;
      background: rgba(15, 15, 15, 0.8);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex; flex-direction: column; 
      border-radius: var(--radius-lg);
      box-shadow: 0 30px 60px rgba(0,0,0,0.6);
      flex-shrink: 0;
    }

    .modal-header { display: flex; align-items: center; padding: 16px 32px; border-bottom: 1px solid var(--border-sub); gap: 24px; }
    .header-tabs { display: flex; gap: 8px; }
    .tab-btn {
      font-size: 11px; font-weight: 800; letter-spacing: 0.1em; color: var(--text3);
      padding: 8px 16px; border-radius: 100px; transition: var(--transition);
      &:hover { color: var(--text); background: rgba(255, 255, 255, 0.05); }
      &.active { color: #FFFFFF; background: rgba(255, 255, 255, 0.1); }
    }
    .close-btn { color: var(--text3); padding: 8px; border-radius: 50%; &:hover { background: rgba(255, 255, 255, 0.1); color: var(--text); } svg { width: 20px; } }
    .spacer { flex: 1; }
    
    .compose-area { padding: 32px; display: flex; gap: 24px; min-height: 220px; }
    
    .preview-area { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
    .preview-notice { display: flex; align-items: center; gap: 12px; color: var(--text3); font-size: 11px; font-weight: 800; letter-spacing: 0.1em; svg { width: 14px; } }

    .crop-area { padding: 32px; display: flex; flex-direction: column; gap: 20px; }
    .crop-header { display: flex; align-items: center; h3 { font-size: 14px; font-weight: 800; letter-spacing: 0.05em; } }
    .cropper-container { border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border); background: #000; }
    .composer-av { width: 44px; height: 44px; border: 2px solid rgba(255, 255, 255, 0.1); flex-shrink: 0; }
    .compose-right { flex: 1; display: flex; flex-direction: column; gap: 20px; min-width: 0; }
    
    .input-wrapper { position: relative; width: 100%; }
    .post-input {
      width: 100%; background: none; border: none; color: var(--text); font-size: 18px;
      font-weight: 500; resize: none; min-height: 100px; line-height: 1.5;
      font-family: inherit; &::placeholder { color: rgba(255, 255, 255, 0.3); }
      &:focus { outline: none; }
    }

    .mention-dropdown {
      position: absolute; width: 280px; background: rgba(30, 30, 30, 0.95); backdrop-filter: blur(20px);
      border: 1px solid var(--border); z-index: 100; border-radius: var(--radius-sm);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .suggestion-item {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer;
      border-bottom: 1px solid var(--border-sub); &:last-child { border: none; }
      &.active, &:hover { background: rgba(255, 255, 255, 0.1); }
    }
    .mini-av { width: 28px; height: 28px; border: 1px solid rgba(255, 255, 255, 0.1); font-size: 10px; }
    .user-info { display: flex; flex-direction: column; }
    .s-name { font-size: 12px; font-weight: 800; text-transform: uppercase; color: var(--text); }
    .s-full { font-size: 10px; color: var(--text3); }

    .hashtags-row {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px; 
      background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-sub);
      border-radius: 100px;
      svg { width: 16px; color: var(--text3); }
      input { background: none; border: none; color: var(--text); font-size: 13px; font-weight: 600; width: 100%; }
    }

    .media-preview { border-radius: var(--radius-md); overflow: hidden; position: relative; border: 1px solid var(--border-sub); box-shadow: var(--shadow); }
    .preview-frame img, .preview-frame video { width: 100%; max-height: 350px; object-fit: cover; }
    .remove-media {
      position: absolute; top: 12px; right: 12px; width: 32px; height: 32px;
      background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(10px); color: white;
      display: flex; align-items: center; justify-content: center;
      border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.2);
      &:hover { background: #FF3B30; border-color: #FF3B30; }
    }

    .modal-footer { display: flex; align-items: center; justify-content: space-between; padding: 24px 32px; border-top: 1px solid var(--border-sub); }
    .footer-actions { display: flex; align-items: center; gap: 24px; }
    .tool-btn { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: var(--text2); &:hover { color: var(--text); } svg { width: 20px; } }
    
    .visibility-selector { position: relative; }
    .visibility-pill {
      display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 100px; 
      background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-sub);
      color: var(--text2); font-size: 11px; font-weight: 800; letter-spacing: 0.05em;
      transition: var(--transition);
      svg { width: 14px; height: 14px; }
      .chevron { width: 10px; height: 10px; transition: transform 0.3s ease; &.open { transform: rotate(180deg); } }
      &:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.2); }
    }

    .visibility-menu {
      position: absolute; bottom: calc(100% + 12px); left: 0; width: 260px;
      background: rgba(20, 20, 20, 0.9); backdrop-filter: blur(30px);
      border: 1px solid var(--border); border-radius: var(--radius-md);
      padding: 8px; z-index: 1100; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .menu-item {
      width: 100%; display: flex; align-items: center; gap: 16px; padding: 12px 16px;
      border-radius: var(--radius-sm); transition: var(--transition);
      &:hover { background: rgba(255, 255, 255, 0.05); }
      &.active { background: rgba(255, 255, 255, 0.1); .m-title { color: #FFFFFF; } svg { color: #FFFFFF; } }
      svg { width: 18px; height: 18px; color: var(--text3); }
      .m-text { display: flex; flex-direction: column; align-items: flex-start; gap: 2px; }
      .m-title { font-size: 12px; font-weight: 800; color: var(--text2); }
      .m-desc { font-size: 10px; color: var(--text3); font-weight: 500; }
    }

    .footer-right { display: flex; align-items: center; gap: 24px; }
    .char-count { font-size: 12px; font-weight: 700; color: var(--text3); &.limit { color: #FF3B30; } }
    .post-submit-btn {
      background: #FFFFFF; color: #000; border: none; padding: 12px 32px;
      font-size: 14px; font-weight: 800; letter-spacing: 0.02em; border-radius: 100px;
      box-shadow: 0 10px 20px rgba(255,255,255,0.1);
      &:disabled { opacity: 0.5; cursor: not-allowed; }
      &:hover:not(:disabled) { transform: scale(1.05); }
    }

    @media (max-width: 600px) {
      .modal-overlay { padding: 0; align-items: flex-start; }
      .modal { 
        margin: 0; border-radius: 0; min-height: 100vh; border: none;
        max-width: 100%;
      }
      .modal-header { padding: 12px 16px; gap: 12px; }
      .header-tabs { flex: 1; overflow-x: auto; scrollbar-width: none; &::-webkit-scrollbar { display: none; } }
      .tab-btn { padding: 6px 12px; white-space: nowrap; }
      
      .compose-area { padding: 16px; gap: 16px; min-height: auto; flex: 1; }
      .composer-av { width: 36px; height: 36px; }
      .post-input { font-size: 16px; min-height: 120px; }
      
      .modal-footer { 
        padding: 16px; flex-direction: column; gap: 16px; align-items: stretch;
        border-top: 1px solid var(--border-sub);
        background: rgba(15, 15, 15, 0.95);
        position: sticky; bottom: 0;
      }
      .footer-actions { justify-content: space-between; gap: 12px; }
      .footer-right { justify-content: space-between; gap: 16px; }
      .post-submit-btn { flex: 1; padding: 12px; text-align: center; }
      
      .preview-area, .crop-area { padding: 16px; }
      .preview-frame img, .preview-frame video { max-height: 250px; }
      
      .visibility-menu { width: calc(100vw - 32px); left: 0; bottom: calc(100% + 10px); }
    }
  `]
})
export class CreatePostModalComponent {
  @Output() closed = new EventEmitter<void>();
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  content = ''; hashtags = ''; visibility = '0';
  loading = signal(false);
  previewUrl = signal<string | null>(null);
  selectedFile: File | null = null;
  mediaType = 0;
  charCount = 0;

  
  showSuggestions = signal(false);
  suggestions = signal<User[]>([]);
  selectedSuggestionIndex = 0;
  suggestionTop = 0;
  suggestionLeft = 0;
  visibilityOpen = signal(false);
  mentionQuery = '';

  view = signal<'compose' | 'preview' | 'crop'>('compose');
  imageChangedEvent: any = '';
  croppedBlob: Blob | null = null;

  constructor(private postService: PostService, private userService: UserService, public auth: AuthService) {}

  getMockPost(): Post {
    return {
      postId: 0,
      content: this.content,
      hashtags: this.hashtags,
      mediaUrl: this.previewUrl() || undefined,
      mediaType: this.mediaType,
      createdAt: new Date().toISOString(),
      userId: this.auth.userId || 0,
      user: this.auth.currentUser() as User,
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      visibility: Number(this.visibility),
      isDeleted: false
    };
  }

  onFileSelected(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    if (file.type.startsWith('image/')) {
      this.selectedFile = file;
      this.mediaType = 0;
      this.imageChangedEvent = e;
      const reader = new FileReader();
      reader.onload = ev => this.previewUrl.set(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      this.selectedFile = file;
      this.mediaType = 1;
      const reader = new FileReader();
      reader.onload = ev => this.previewUrl.set(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedBlob = event.blob || null;
    if (event.objectUrl) this.previewUrl.set(event.objectUrl);
  }

  applyCrop() {
    if (this.croppedBlob) {
      this.selectedFile = new File([this.croppedBlob], 'cropped.png', { type: 'image/png' });
      this.mediaType = 0;
    }
    this.view.set('compose');
  }

  getVisibilityLabel() {
    if (this.visibility === '0') return 'EVERYONE';
    if (this.visibility === '1') return 'FOLLOWERS';
    return 'PRIVATE';
  }

  toggleVisibility(e: Event) { e.stopPropagation(); this.visibilityOpen.set(!this.visibilityOpen()); }

  setVisibility(val: string) { this.visibility = val; this.visibilityOpen.set(false); }

  isImage() { return this.mediaType === 0; }

  onInput(e: Event) {
    const val = (e.target as HTMLTextAreaElement).value;
    this.charCount = val.length;
    this.checkMentions(val);
  }

  checkMentions(val: string) {
    const cursor = this.textarea.nativeElement.selectionStart;
    const textBefore = val.substring(0, cursor);
    const lastAt = textBefore.lastIndexOf('@');

    if (lastAt !== -1 && (lastAt === 0 || /\s/.test(textBefore[lastAt - 1]))) {
      const query = textBefore.substring(lastAt + 1);
      if (!/\s/.test(query)) {
        this.mentionQuery = query;
        this.userService.search(query).subscribe(res => {
          this.suggestions.set(res.data.filter(u => u.userId !== this.auth.userId).slice(0, 5));
          this.showSuggestions.set(this.suggestions().length > 0);
          this.selectedSuggestionIndex = 0;
        });
        return;
      }
    }
    this.showSuggestions.set(false);
  }

  onKeyDown(e: KeyboardEvent) {
    if (this.showSuggestions()) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % this.suggestions().length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.selectedSuggestionIndex = (this.selectedSuggestionIndex - 1 + this.suggestions().length) % this.suggestions().length;
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.selectUser(this.suggestions()[this.selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        this.showSuggestions.set(false);
      }
    }
  }

  selectUser(user: User) {
    const cursor = this.textarea.nativeElement.selectionStart;
    const textBefore = this.content.substring(0, cursor);
    const lastAt = textBefore.lastIndexOf('@');
    const textAfter = this.content.substring(cursor);
    
    this.content = this.content.substring(0, lastAt) + '@' + user.userName + ' ' + textAfter;
    this.showSuggestions.set(false);
    setTimeout(() => this.textarea.nativeElement.focus(), 0);
  }



  clearMedia() { this.previewUrl.set(null); this.selectedFile = null; }

  submit() {
    if (!this.content.trim()) return;
    this.loading.set(true);
    const fd = new FormData();
    fd.append('content', this.content);
    fd.append('visibility', this.visibility);
    if (this.hashtags) fd.append('hashtags', this.hashtags);
    if (this.selectedFile) { fd.append('mediaFile', this.selectedFile); fd.append('mediaType', String(this.mediaType)); }
    this.postService.create(fd).subscribe({ next: () => { this.loading.set(false); this.closed.emit(); }, error: () => this.loading.set(false) });
  }

  onOverlayClick(e: MouseEvent) { if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.closed.emit(); }
}
