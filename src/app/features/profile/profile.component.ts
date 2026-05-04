import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { User, Post } from '../../shared/models/models';
import { UserService, PostService, FollowService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { PostCardComponent } from '../../shared/components/post-card.component';

type PendingFollowRequest = { followId: number; followerId: number; follower?: User; };

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, PostCardComponent],
  template: `
    <div *ngIf="loading()" class="page-loader"><div class="spinner"></div></div>

    <div *ngIf="!loading() && user()">
      
      <div class="profile-sticky-header glass animate-fade">
        <div class="back-btn btn glass pill" onclick="history.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </div>
        <div class="header-meta">
          <h2 class="sticky-name title-gradient">{{ user()?.fullName }}</h2>
          <p class="sticky-count">{{ user()?.postCount }} POSTS</p>
        </div>
      </div>

      
      <div class="profile-cover">
        <div class="cover-inner"></div>
      </div>

      
      <div class="profile-info-section">
        <div class="avatar-action-row">
          <div class="profile-avatar animate-fade">
            <img *ngIf="user()?.avatarUrl" [src]="user()?.avatarUrl" style="width:100%;height:100%;border-radius:50%;object-fit:cover">
            <span *ngIf="!user()?.avatarUrl">{{ getInitial(user()) }}</span>
          </div>
          <div class="profile-actions animate-fade">
            <ng-container *ngIf="!isOwnProfile">
              <button class="btn pill" [class.glass]="isFollowing()" [class.primary]="!isFollowing()" (click)="toggleFollow()">
                {{ followStatus() }}
              </button>
            </ng-container>
            <ng-container *ngIf="isOwnProfile">
              <button class="btn glass pill" [routerLink]="['/settings']">EDIT PROFILE</button>
            </ng-container>
          </div>
        </div>

        <div class="profile-names">
          <h2 class="profile-full-name">{{ user()?.fullName }}</h2>
          <p class="profile-handle">&#64;{{ user()?.userName }}</p>
        </div>

        <p *ngIf="user()?.bio" class="profile-bio">{{ user()?.bio }}</p>

        <div *ngIf="user()?.isPrivate" class="private-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Private account
        </div>

        <div class="profile-stats">
          <button class="stat-btn" (click)="canViewFollowList() && toggleFollowList('following')">
            <span class="stat-num">{{ user()?.followingCount }}</span>
            <span class="stat-lbl">Following</span>
          </button>
          <button class="stat-btn" (click)="canViewFollowList() && toggleFollowList('followers')">
            <span class="stat-num">{{ user()?.followerCount }}</span>
            <span class="stat-lbl">Followers</span>
          </button>
        </div>
      </div>

      
      <div *ngIf="isOwnProfile && pendingRequests().length > 0" class="pending-section glass animate-fade">
        <h4 class="section-heading">FOLLOW REQUESTS</h4>
        <div *ngFor="let r of pendingRequests()" class="pending-row">
          <div class="pending-user">
            <div class="avatar mini-av">
              <img *ngIf="r.follower?.avatarUrl" [src]="r.follower?.avatarUrl">
              <span *ngIf="!r.follower?.avatarUrl">{{ r.follower?.userName?.[0]?.toUpperCase() }}</span>
            </div>
            <div class="p-meta">
              <span class="p-name">{{ r.follower?.fullName || r.follower?.userName }}</span>
              <span class="p-handle">&#64;{{ r.follower?.userName }}</span>
            </div>
          </div>
          <div class="p-actions">
            <button class="btn primary pill btn-sm" (click)="acceptRequest(r.followId)">ACCEPT</button>
            <button class="btn glass pill btn-sm" (click)="rejectRequest(r.followId)">REJECT</button>
          </div>
        </div>
      </div>

      
      <div *ngIf="selectedFollowList()" class="follow-panel glass animate-fade">
        <div class="follow-panel-header">
          <h4 class="title-gradient">{{ selectedFollowList() === 'followers' ? 'FOLLOWERS' : 'FOLLOWING' }}</h4>
          <button class="btn glass pill btn-sm" (click)="closeFollowList()">CLOSE</button>
        </div>
        <div *ngIf="followListLoading()" class="page-loader"><div class="spinner"></div></div>
        <div class="follow-list-content">
          <div *ngFor="let u of followUsers()" class="follow-row animate-fade">
            <a [routerLink]="['/profile', u.userId]" class="follow-user">
              <div class="avatar follow-av">
                <img *ngIf="u.avatarUrl" [src]="u.avatarUrl" style="width:100%;height:100%;border-radius:50%;object-fit:cover">
                <span *ngIf="!u.avatarUrl">{{ u.userName[0].toUpperCase() }}</span>
              </div>
              <div class="f-info">
                <p class="f-name">{{ u.fullName }}</p>
                <p class="f-handle">&#64;{{ u.userName }}</p>
              </div>
            </a>
            <button *ngIf="isOwnProfile && selectedFollowList() === 'followers'" class="btn glass pill btn-sm" (click)="removeFollower(u.userId)">REMOVE</button>
          </div>
        </div>
      </div>

      
      <div class="posts-tabs-container">
        <div class="posts-tabs-inner glass">
          <div class="posts-tab active">POSTS</div>
        </div>
      </div>

      <div *ngIf="postsLoading()" class="page-loader"><div class="spinner"></div></div>
      <div *ngIf="!postsLoading() && posts().length === 0" class="empty glass animate-fade">
        <div class="empty-icon-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15h18"/><path d="M9 3v18"/></svg>
        </div>
        <h3>NO POSTS YET</h3>
        <p *ngIf="isOwnProfile">Share your first story with the world.</p>
      </div>
      <app-post-card *ngFor="let p of posts()" [post]="p" />
      <div *ngIf="hasMore()" class="load-more-row">
        <button class="btn glass pill show-more-btn" (click)="loadMorePosts()">LOAD MORE POSTS</button>
      </div>
    </div>
  `,
  styles: [`
    
    .profile-sticky-header {
      position: sticky; top: 96px; z-index: 100;
      display: flex; align-items: center; gap: 24px;
      padding: 16px 24px; border-radius: 100px;
      margin: 0 16px;
      box-shadow: 0 15px 30px rgba(0,0,0,0.3);
    }
    .back-btn { width: 44px; height: 44px; padding: 0; }
    .header-meta { display: flex; flex-direction: column; gap: 2px; }
    .sticky-name { font-size: 18px; font-weight: 800; letter-spacing: -0.02em; }
    .sticky-count { font-size: 10px; color: var(--text3); font-weight: 800; letter-spacing: 0.1em; }

    .profile-cover { height: 240px; background: linear-gradient(135deg, #1a1a1a 0%, #000 100%); margin-top: -80px; }
    .cover-inner { width: 100%; height: 100%; opacity: 0.5; }

    .profile-info-section { padding: 24px 32px 0; }

    .avatar-action-row { display: flex; align-items: flex-end; justify-content: space-between; margin-top: -80px; margin-bottom: 24px; }

    .profile-avatar {
      width: 140px; height: 140px; border-radius: 50%;
      border: 6px solid var(--bg);
      background: #1a1a1a;
      display: flex; align-items: center; justify-content: center;
      font-size: 48px; font-weight: 800; color: #FFFFFF;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    .profile-actions { padding-bottom: 8px; display: flex; gap: 12px; }

    .profile-names { margin-bottom: 16px; }
    .profile-full-name { font-size: 32px; font-weight: 800; letter-spacing: -0.05em; line-height: 1.1; }
    .profile-handle { font-size: 18px; color: var(--text3); font-weight: 600; letter-spacing: -0.02em; }
    .profile-bio { font-size: 16px; line-height: 1.6; margin-bottom: 24px; color: var(--text); max-width: 600px; }
    
    .private-badge { 
      display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px;
      background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-sub);
      border-radius: 100px; font-size: 11px; color: var(--text3); margin-bottom: 24px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em;
      svg { width: 14px; height: 14px; } 
    }

    .profile-stats { display: flex; gap: 40px; padding: 24px 0; border-top: 1px solid var(--border-sub); border-bottom: 1px solid var(--border-sub); }
    .stat-btn { display: flex; align-items: baseline; gap: 8px; }
    .stat-num { font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.02em; }
    .stat-lbl { font-size: 14px; color: var(--text3); font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }

    .pending-section { 
      padding: 24px; border-radius: var(--radius-lg); background: rgba(255, 255, 255, 0.03); 
      border: 1px solid var(--border-sub); margin: 24px 0; 
    }
    .section-heading { font-size: 12px; font-weight: 800; margin-bottom: 16px; text-transform: uppercase; color: var(--text3); letter-spacing: 0.1em; }
    .pending-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--border-sub); font-size: 14px; font-weight: 700; &:last-child { border: none; } }

    .follow-panel { 
      padding: 32px; border-radius: var(--radius-lg); background: rgba(10, 10, 10, 0.8); 
      backdrop-filter: blur(40px); border: 1px solid var(--border-sub); margin: 24px 0;
      box-shadow: 0 20px 50px rgba(0,0,0,0.4);
      backdrop-filter: blur(40px); border: 1px solid var(--border-sub); margin: 32px 0;
      box-shadow: 0 40px 100px rgba(0,0,0,0.6);
    }
    .follow-panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; h4 { font-size: 24px; font-weight: 800; letter-spacing: -0.04em; } }
    .follow-list-content { display: flex; flex-direction: column; gap: 12px; }
    .follow-row { display: flex; align-items: center; justify-content: space-between; padding: 16px; border: 1px solid var(--border-sub); border-radius: 16px; background: rgba(255, 255, 255, 0.03); transition: var(--transition); &:hover { background: rgba(255, 255, 255, 0.06); transform: translateY(-2px); } }
    .follow-user { display: flex; align-items: center; gap: 16px; text-decoration: none; color: inherit; }
    .follow-av { width: 48px; height: 48px; border: 2px solid rgba(255, 255, 255, 0.1); }
    .f-info { display: flex; flex-direction: column; }
    .f-name { font-size: 16px; font-weight: 800; color: #FFFFFF; }
    .f-handle { font-size: 14px; color: var(--text3); font-weight: 600; }

    .posts-tabs-container { display: flex; justify-content: center; margin: 48px 0 32px; }
    .posts-tabs-inner { display: flex; padding: 6px; border-radius: 100px; border: 1px solid var(--border-sub); background: rgba(255, 255, 255, 0.05); }
    .posts-tab { padding: 10px 32px; font-size: 13px; font-weight: 800; color: #000; background: #FFFFFF; border-radius: 100px; box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1); letter-spacing: 0.05em; }

    .empty { padding: 100px 32px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; border-radius: var(--radius-lg); background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-sub); }
    .empty-icon-box { width: 72px; height: 72px; border-radius: 24px; background: rgba(255, 255, 255, 0.05); color: var(--text3); display: flex; align-items: center; justify-content: center; svg { width: 32px; } }
    .empty h3 { font-size: 24px; font-weight: 800; letter-spacing: -0.02em; margin: 0; } 
    .empty p { color: var(--text3); font-size: 16px; font-weight: 500; }

    .load-more-row { text-align: center; padding: 48px 0 80px; }
    .show-more-btn { padding: 16px 48px; font-size: 14px; font-weight: 800; }
  `]
})
export class ProfileComponent implements OnInit {
  user = signal<User | null>(null);
  posts = signal<Post[]>([]);
  loading = signal(true);
  postsLoading = signal(true);
  isFollowing = signal(false);
  followStatus = signal('Follow');
  followRequestPending = signal(false);
  pendingRequests = signal<PendingFollowRequest[]>([]);
  selectedFollowList = signal<'followers' | 'following' | null>(null);
  followUsers = signal<User[]>([]);
  followListLoading = signal(false);
  hasMore = signal(false);
  page = 1;
  userId!: number;

  get isOwnProfile() { return this.userId === this.auth.userId; }

  constructor(private userService: UserService, private postService: PostService, private followService: FollowService, public auth: AuthService, private route: ActivatedRoute) {}

  ngOnInit() { this.route.params.subscribe(p => { this.userId = +p['id']; this.load(); }); }

  load() {
    this.selectedFollowList.set(null); this.followUsers.set([]); this.page = 1;
    this.loading.set(true);
    this.userService.getById(this.userId).subscribe(r => { this.user.set(r.data); this.loading.set(false); });
    this.loadPosts();
    if (this.isOwnProfile) { this.loadPendingRequests(); }
    else { this.followService.isFollowing(this.userId).subscribe(r => { this.isFollowing.set(r.data); this.followStatus.set(r.data ? 'Following' : 'Follow'); }); }
  }

  loadPosts() {
    this.postsLoading.set(true);
    this.postService.getByUser(this.userId, this.page).subscribe(r => {
      this.posts.set(r.data.items.map(p => ({ ...p, user: this.user() ?? undefined })));
      this.hasMore.set(r.data.page * r.data.pageSize < r.data.totalCount);
      this.postsLoading.set(false);
    });
  }

  loadMorePosts() {
    this.page++;
    this.postService.getByUser(this.userId, this.page).subscribe(r => {
      this.posts.set([...this.posts(), ...r.data.items.map(p => ({ ...p, user: this.user() ?? undefined }))]);
      this.hasMore.set(r.data.page * r.data.pageSize < r.data.totalCount);
    });
  }

  toggleFollow() {
    if (this.isFollowing() || this.followRequestPending()) { this.followService.unfollow(this.userId).subscribe(() => { this.isFollowing.set(false); this.followRequestPending.set(false); this.followStatus.set('Follow'); this.refreshProfile(); }); return; }
    this.followService.follow(this.userId).subscribe(r => {
      const status = this.parseStatus(r.data);
      this.isFollowing.set(status === 'Accepted'); this.followRequestPending.set(status === 'Pending');
      this.followStatus.set(status === 'Pending' ? 'Requested' : status === 'Accepted' ? 'Following' : 'Follow');
      this.refreshProfile();
    });
  }

  acceptRequest(followId: number) { this.followService.accept(followId).subscribe(() => this.load()); }
  rejectRequest(followId: number) { this.followService.reject(followId).subscribe(() => this.load()); }

  toggleFollowList(list: 'followers' | 'following') {
    if (this.selectedFollowList() === list) { this.closeFollowList(); return; }
    this.selectedFollowList.set(list); this.followUsers.set([]); this.followListLoading.set(true);
    const obs = list === 'followers' ? this.followService.getFollowers(this.userId) : this.followService.getFollowing(this.userId);
    obs.subscribe({ next: r => this.loadFollowUsers(r.data), error: () => { this.followUsers.set([]); this.followListLoading.set(false); } });
  }

  closeFollowList() { this.selectedFollowList.set(null); this.followUsers.set([]); this.followListLoading.set(false); }

  removeFollower(followerId: number) {
    this.followService.removeFollower(this.userId, followerId).subscribe({ next: () => { this.followUsers.set(this.followUsers().filter(u => u.userId !== followerId)); this.refreshProfile(); }, error: () => this.refreshProfile() });
  }

  private loadFollowUsers(ids: number[]) {
    if (ids.length === 0) { this.followUsers.set([]); this.followListLoading.set(false); return; }
    const fetches = ids.map(id => new Promise<User | null>(resolve => this.userService.getById(id).subscribe({ next: r => resolve(r.data), error: () => resolve(null) })));
    Promise.all(fetches).then(users => { this.followUsers.set(users.filter((u): u is User => !!u)); this.followListLoading.set(false); });
  }

  private loadPendingRequests() {
    this.followService.getPending(this.userId).subscribe({ next: r => { const reqs = (r.data ?? []) as PendingFollowRequest[]; this.pendingRequests.set(reqs); reqs.forEach(req => { if (req.followerId) this.userService.getById(req.followerId).subscribe({ next: r2 => { this.pendingRequests.set(this.pendingRequests().map(x => x.followerId === req.followerId ? { ...x, follower: r2.data } : x)); } }); }); }, error: () => this.pendingRequests.set([]) });
  }

  private parseStatus(data: any): 'Accepted' | 'Pending' | 'Follow' {
    if (!data) return 'Follow';
    const text = String(typeof data === 'string' ? data : data.status ?? data.followStatus ?? data).trim();
    if (/accepted|following|followed/i.test(text)) return 'Accepted';
    if (/pending|requested/i.test(text)) return 'Pending';
    return 'Follow';
  }

  private refreshProfile() { this.userService.getById(this.userId).subscribe(r => this.user.set(r.data)); }

  getInitial(user: User | null): string { return (user?.userName?.[0] ?? '').toUpperCase(); }
  canViewFollowList() { if (!this.user()) return false; if (this.isOwnProfile) return true; if (!this.user()?.isPrivate) return true; return this.isFollowing(); }
}
