import { Component, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Notification, User, Post } from '../../shared/models/models';
import { NotifService, FollowService, UserService, PostService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { PostCardComponent } from '../../shared/components/post-card.component';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, PostCardComponent],
  template: `
    <div class="notif-page animate-fade">
      <div class="notif-header glass animate-fade">
        <h1 class="title title-gradient">NOTIFICATIONS</h1>
        <button *ngIf="filterTab() === 'all' && unread() > 0" class="btn glass pill mark-all-btn" (click)="markAllRead()">MARK ALL READ</button>
      </div>

      <div class="tabs-container animate-fade">
        <div class="tabs-inner glass">
          <button class="btn pill" [class.primary]="filterTab() === 'all'" (click)="setTab('all')">ALL</button>
          <button class="btn pill" [class.primary]="filterTab() === 'mentions'" (click)="setTab('mentions')">MENTIONS</button>
        </div>
      </div>

      <div class="notif-scroll-area">
        <div *ngIf="loading()" class="page-loader"><div class="spinner"></div></div>
        
        
        <ng-container *ngIf="filterTab() === 'all'">
          <div *ngIf="!loading() && notifications().length === 0" class="empty">
            <div class="empty-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>
            </div>
            <h3>EMPTY</h3>
            <p>No notifications at the moment.</p>
          </div>

          <div class="notif-list">
            <div *ngFor="let n of notifications()" 
                 class="notif-card glass animate-fade" 
                 [class.unread]="!n.isRead"
                 (click)="markRead(n)">
              
              <div class="icon-wrap">
                <svg *ngIf="getKind(n) === 'like'" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                <svg *ngIf="getKind(n) === 'comment'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                <svg *ngIf="getKind(n) === 'follow'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg>
                <svg *ngIf="getKind(n) === 'repost'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg>
                <svg *ngIf="getKind(n) === 'mention'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>
              </div>

              <div class="notif-body">
                <div class="notif-header-inner">
                  <span class="actor-name">{{ getActorName(n).toUpperCase() }}</span>
                  <span class="notif-time">{{ n.createdAt | date:'shortTime' }}</span>
                </div>
                <p class="notif-msg">
                  <span class="action-text">{{ getActionText(n).toUpperCase() }}</span>
                </p>
                <div *ngIf="n.targetPost?.content" class="target-preview glass">
                  "{{ getSnippet(n.targetPost!) }}"
                </div>
                <div *ngIf="typeStr(n.type)==='FOLLOW_REQUEST'" class="follow-req-actions" (click)="$event.stopPropagation()">
                  <button class="btn primary pill btn-sm" (click)="acceptFollow(n)">ACCEPT</button>
                  <button class="btn glass pill btn-sm" (click)="rejectFollow(n)">REJECT</button>
                </div>
              </div>
            </div>
          </div>
        </ng-container>

        
        <ng-container *ngIf="filterTab() === 'mentions'">
          <div *ngIf="!loading() && mentionedPosts().length === 0" class="empty">
            <div class="empty-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>
            </div>
            <h3>NO MENTIONS</h3>
            <p>You haven't been mentioned in any posts yet.</p>
          </div>

          <div class="posts-list">
            <app-post-card *ngFor="let post of mentionedPosts()" [post]="post" class="notif-post" />
          </div>
        </ng-container>

        <div *ngIf="hasMore()" class="load-more-row">
          <button class="show-more-btn" (click)="loadMore()">SHOW MORE</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notif-page { display: flex; flex-direction: column; min-height: 100vh; max-width: 800px; margin: 0 auto; background: var(--bg); }
    
    .notif-header { 
      position: sticky; top: 80px; z-index: 100;
      padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; 
      border-radius: 100px; margin: 0 16px 24px;
      box-shadow: 0 15px 30px rgba(0,0,0,0.3);
      @media (max-width: 640px) { padding: 12px 16px; margin: 0 8px 16px; top: 72px; }
    }
    .title { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; margin: 0; @media (max-width: 640px) { font-size: 16px; } }
    .mark-all-btn { font-size: 11px; font-weight: 800; letter-spacing: 0.1em; padding: 10px 20px; @media (max-width: 640px) { padding: 8px 12px; font-size: 10px; } }

    .tabs-container { display: flex; justify-content: center; margin-bottom: 24px; @media (max-width: 640px) { margin-bottom: 16px; } }
    .tabs-inner {
      display: flex; gap: 4px; padding: 6px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 100px;
      border: 1px solid var(--border-sub);
      .btn { 
        border: none; background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none; 
        font-size: 12px; font-weight: 800; padding: 10px 28px; color: var(--text3);
        @media (max-width: 640px) { padding: 8px 20px; font-size: 11px; }
        &.primary { background: #FFFFFF; color: #000; box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1); }
      }
    }

    .notif-scroll-area { padding: 0 16px; flex: 1; @media (max-width: 640px) { padding: 0 12px; } }
    .notif-list { display: flex; flex-direction: column; gap: 12px; }
    .posts-list { display: flex; flex-direction: column; gap: 32px; padding: 0 0 32px; }
    
    .notif-card {
      padding: 24px; border: 1px solid var(--border-sub); border-radius: var(--radius-lg); transition: var(--transition);
      display: flex; gap: 20px; align-items: flex-start; cursor: pointer;
      background: rgba(255, 255, 255, 0.03);
      &.unread { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.2); box-shadow: 0 10px 30px rgba(255,255,255,0.05); }
      &:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.06); }
    }

    .icon-wrap {
      width: 40px; height: 40px; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0; color: #FFFFFF; 
      background: rgba(255, 255, 255, 0.05); border-radius: 12px;
      svg { width: 18px; height: 18px; stroke-width: 2.5; }
    }
    
    .notif-body { flex: 1; min-width: 0; }
    .notif-header-inner { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
    .actor-name { font-weight: 800; color: var(--text); font-size: 15px; letter-spacing: -0.01em; }
    .notif-time { font-size: 11px; color: var(--text3); font-weight: 700; text-transform: uppercase; }
    
    .notif-msg { font-size: 14px; color: var(--text2); line-height: 1.4; font-weight: 500; }
    .action-text { font-weight: 800; color: #FFFFFF; }
    
    .target-preview {
      margin-top: 12px; padding: 14px 18px; border-radius: var(--radius-sm);
      background: rgba(0, 0, 0, 0.3); font-size: 13px; color: var(--text3);
      border-left: 3px solid #FFFFFF; font-style: normal; font-weight: 500;
    }

    .empty { padding: 100px 40px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; }
    .empty-icon-box { width: 72px; height: 72px; border-radius: 24px; background: rgba(255, 255, 255, 0.05); color: var(--text3); display: flex; align-items: center; justify-content: center; svg { width: 32px; } }
    .empty h3 { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; color: var(--text); }
    .empty p { color: var(--text3); font-size: 15px; font-weight: 600; }

    .follow-req-actions { display: flex; gap: 12px; margin-top: 16px; }
    .btn-sm { padding: 10px 24px; font-size: 11px; font-weight: 800; }
    
    .load-more-row { text-align: center; padding: 48px 0 80px; }
    .show-more-btn { 
      background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-sub); 
      color: var(--text); padding: 16px 40px; font-weight: 800; font-size: 13px; 
      border-radius: 100px; transition: var(--transition);
      &:hover { background: #FFFFFF; color: #000; } 
    }
    
    .page-loader { display: flex; justify-content: center; padding: 40px; }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications = signal<Notification[]>([]);
  mentionedPosts = signal<Post[]>([]);
  loading = signal(true);
  unread = signal(0);
  filterTab = signal<'all' | 'mentions'>('all');
  page = 1;
  hasMore = signal(false);
  
  private actorCache = new Map<number, User>();
  private postCache  = new Map<number, Post>();

  constructor(
    private notifService: NotifService, 
    private followService: FollowService, 
    private userService: UserService, 
    private postService: PostService, 
    public auth: AuthService
  ) {}

  ngOnInit() {
    if (this.auth.userId) { this.initNotifications(); return; }
    const s = effect(() => { if (!this.auth.userId) return; this.initNotifications(); s.destroy?.(); });
  }

  private initNotifications() { 
    this.load(); 
    this.notifService.getUnreadCount(this.auth.userId).subscribe(r => this.unread.set(r.data)); 
  }

  setTab(t: 'all' | 'mentions') {
    this.filterTab.set(t);
    this.page = 1;
    this.notifications.set([]);
    this.mentionedPosts.set([]);
    this.load();
  }

  load() {
    this.loading.set(true);
    if (this.filterTab() === 'all') {
      this.notifService.getAll(this.auth.userId, this.page).subscribe(r => {
        this.notifications.set(r.data.items);
        this.hasMore.set(r.data.page * r.data.pageSize < r.data.totalCount);
        this.loading.set(false);
        this.enrich(r.data.items);
      });
    } else {
      this.postService.getMentionedPosts(this.page).subscribe(r => {
        this.mentionedPosts.set(r.data.items);
        this.hasMore.set(r.data.page * r.data.pageSize < r.data.totalCount);
        this.loading.set(false);
        this.fetchPostUsers(r.data.items);
      });
    }
  }

  loadMore() {
    this.page++;
    if (this.filterTab() === 'all') {
      this.notifService.getAll(this.auth.userId, this.page).subscribe(r => {
        this.notifications.set([...this.notifications(), ...r.data.items]);
        this.hasMore.set(r.data.page * r.data.pageSize < r.data.totalCount);
        this.enrich(r.data.items);
      });
    } else {
      this.postService.getMentionedPosts(this.page).subscribe(r => {
        const next = r.data.items;
        this.mentionedPosts.set([...this.mentionedPosts(), ...next]);
        this.hasMore.set(r.data.page * r.data.pageSize < r.data.totalCount);
        this.fetchPostUsers(next);
      });
    }
  }

  private fetchPostUsers(posts: Post[]) {
    const ids = [...new Set(posts.map(p => p.userId))];
    ids.forEach(uid => {
      this.userService.getById(uid).subscribe(res => {
        this.mentionedPosts.set(this.mentionedPosts().map(p => p.userId === uid ? { ...p, user: res.data } : p));
      });
    });
  }

  private enrich(notifs: Notification[]) {
    const ids = [...new Set(notifs.map(n => n.actorId).filter((id): id is number => !!id && id !== 0))];
    const pids = [...new Set(notifs.filter(n => this.typeStr(n.targetType) === 'POST' && n.targetId).map(n => n.targetId!))];
    ids.forEach(id => { if (this.actorCache.has(id)) { this.attachActor(id, this.actorCache.get(id)!); return; } this.userService.getById(id).subscribe({ next: r => { this.actorCache.set(id, r.data); this.attachActor(id, r.data); } }); });
    pids.forEach(id => { if (this.postCache.has(id)) { this.attachPost(id, this.postCache.get(id)!); return; } this.postService.getById(id).subscribe({ next: r => { this.postCache.set(id, r.data); this.attachPost(id, r.data); } }); });
  }

  private attachActor(id: number, u: User) { this.notifications.set(this.notifications().map(n => n.actorId === id ? { ...n, actor: u } : n)); }
  private attachPost(id: number, p: Post) { this.notifications.set(this.notifications().map(n => n.targetId === id && this.typeStr(n.targetType) === 'POST' ? { ...n, targetPost: p } : n)); }

  markRead(n: Notification) { if (n.isRead) return; this.notifService.markRead(n.notificationId).subscribe(); this.notifications.set(this.notifications().map(x => x.notificationId === n.notificationId ? { ...x, isRead: true } : x)); this.unread.set(Math.max(0, this.unread() - 1)); }
  markAllRead() { this.notifService.markAllRead(this.auth.userId).subscribe(); this.notifications.set(this.notifications().map(x => ({ ...x, isRead: true }))); this.unread.set(0); }
  deleteNotif(n: Notification, e: Event) { e.stopPropagation(); this.notifService.delete(n.notificationId).subscribe(); this.notifications.set(this.notifications().filter(x => x.notificationId !== n.notificationId)); if (!n.isRead) this.unread.set(Math.max(0, this.unread() - 1)); }
  acceptFollow(n: Notification) { if (n.targetId) this.followService.accept(n.targetId).subscribe(); this.deleteNotif(n, new Event('click')); }
  rejectFollow(n: Notification) { if (n.targetId) this.followService.reject(n.targetId).subscribe(); this.deleteNotif(n, new Event('click')); }

  typeStr(t: string | number | undefined): string {
    if (t == null) return '';
    if (typeof t === 'string') { if (/^\d+$/.test(t.trim())) return this.typeStr(Number(t.trim())); return t.toUpperCase(); }
    const m: Record<number, string> = { 0:'LIKE_POST', 1:'LIKE_COMMENT', 2:'NEW_COMMENT', 3:'NEW_REPLY', 4:'NEW_FOLLOWER', 5:'FOLLOW_REQUEST', 6:'FOLLOW_ACCEPTED', 7:'MENTION', 8:'REPOST', 9:'PLATFORM' };
    return m[t as number] ?? String(t).toUpperCase();
  }

  getKind(n: Notification): string {
    const t = this.typeStr(n.type);
    if (t.includes('LIKE')) return 'like';
    if (t.includes('COMMENT') || t.includes('REPLY')) return 'comment';
    if (t.includes('FOLLOW')) return 'follow';
    if (t.includes('REPOST')) return 'repost';
    if (t.includes('MENTION')) return 'mention';
    return 'system';
  }

  getActorName(n: Notification): string { return n.actor?.fullName || n.actor?.userName || n.actorName || 'Someone'; }
  getActorInitial(n: Notification): string { return this.getActorName(n).charAt(0).toUpperCase() || '?'; }

  getActionText(n: Notification): string {
    const m: Record<string, string> = { 
      LIKE_POST: 'liked your post', 
      LIKE_COMMENT: 'liked your comment', 
      NEW_COMMENT: 'commented on your post', 
      NEW_REPLY: 'replied to your comment', 
      NEW_FOLLOWER: 'followed you', 
      FOLLOW_REQUEST: 'wants to follow you', 
      FOLLOW_ACCEPTED: 'accepted your follow request', 
      MENTION: 'mentioned you in a post',
      REPOST: 'reposted your post' 
    };
    return m[this.typeStr(n.type)] ?? (n.message ?? 'sent you a notification');
  }

  getSnippet(post: Post): string { const t = post.content?.trim() ?? ''; return t.length > 80 ? t.slice(0, 80) + '…' : t; }
}