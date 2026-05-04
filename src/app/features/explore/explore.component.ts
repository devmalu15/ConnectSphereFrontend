import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Post, User } from '../../shared/models/models';
import { PostService, UserService, FollowService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { PostCardComponent } from '../../shared/components/post-card.component';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PostCardComponent],
  template: `
    
    <div class="explore-top glass animate-fade">
      <div class="search-bar-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" [(ngModel)]="query" placeholder="SEARCH CONNECT" (input)="onSearch()" (keyup.enter)="onSearch()" id="explore-search">
        <button *ngIf="query" class="clear-btn btn glass pill" (click)="clearSearch()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>

    
    <div class="tabs-container animate-fade">
      <div class="tabs-inner glass">
        <button class="btn pill" [class.primary]="tab() === 'posts'" (click)="tab.set('posts'); doSearch()">POSTS</button>
        <button class="btn pill" [class.primary]="tab() === 'users'" (click)="tab.set('users'); doSearch()">PEOPLE</button>
      </div>
    </div>

    
    <div *ngIf="loading()" class="page-loader"><div class="spinner"></div></div>

    
    <div *ngIf="!loading() && tab() === 'posts'" class="posts-list animate-fade">
      <div *ngIf="posts().length === 0" class="empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:56px;height:56px"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        <h3>{{ query ? 'No results for "' + query + '"' : 'Trending posts' }}</h3>
        <p>{{ query ? 'Try different keywords' : 'See what\'s popular right now' }}</p>
      </div>
      <app-post-card *ngFor="let post of posts()" [post]="post" />
    </div>

    
    <div *ngIf="!loading() && tab() === 'users'" class="users-grid animate-fade">
      <div *ngIf="users().length === 0" class="empty glass-card"><h3>No people found</h3></div>
      <div *ngFor="let u of users()" class="user-card glass-card">
        <a [routerLink]="['/profile', u.userId]" class="user-link">
          <div class="avatar user-av">
            <img *ngIf="u.avatarUrl" [src]="u.avatarUrl" style="width:100%;height:100%;border-radius:50%;object-fit:cover">
            <span *ngIf="!u.avatarUrl">{{ u.userName[0].toUpperCase() }}</span>
          </div>
          <div class="user-details">
            <p class="u-name">{{ u.fullName }}</p>
            <p class="u-handle">&#64;{{ u.userName }}</p>
            <p *ngIf="u.bio" class="u-bio">{{ u.bio }}</p>
          </div>
        </a>
        <button *ngIf="u.userId !== auth.userId" class="btn pill" [class.glass]="following[u.userId]" [class.primary]="!following[u.userId]" (click)="toggleFollow(u)">
          {{ following[u.userId] ? 'FOLLOWING' : 'FOLLOW' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    
    .explore-top {
      position: sticky; top: 96px; z-index: 100;
      padding: 16px 24px;
      border-radius: 100px;
      margin: 0 16px 24px;
      box-shadow: 0 15px 30px rgba(0,0,0,0.3);
    }

    .search-bar-wrap {
      position: relative;
      display: flex; align-items: center;
    }

    .search-icon {
      position: absolute; left: 18px;
      width: 20px; height: 20px; color: var(--text3);
      pointer-events: none;
    }

    .search-input {
      width: 100%;
      padding: 14px 48px 14px 54px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-sub);
      color: var(--text); font-size: 16px; font-weight: 600; outline: none;
      transition: var(--transition);
      &:focus { border-color: rgba(255, 255, 255, 0.3); background: rgba(255, 255, 255, 0.08); }
      &::placeholder { color: var(--text3); letter-spacing: 0.05em; font-size: 13px; font-weight: 800; }
    }

    .clear-btn {
      position: absolute; right: 8px;
      width: 32px; height: 32px; padding: 0;
      svg { width: 14px; height: 14px; }
    }

    .tabs-container { display: flex; justify-content: center; margin-bottom: 32px; }
    .tabs-inner {
      display: flex; gap: 4px; padding: 6px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 100px;
      border: 1px solid var(--border-sub);
      .btn { 
        border: none; background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none; 
        font-size: 12px; font-weight: 800; padding: 10px 28px; color: var(--text3);
        &.primary { background: #FFFFFF; color: #000; box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1); }
      }
    }

    .users-grid { display: flex; flex-direction: column; gap: 16px; padding: 0 16px; }
    .user-card {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 24px; gap: 20px;
      transition: var(--transition);
      &:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.06); }
    }

    .user-link { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 0; }
    .user-av { width: 56px; height: 56px; border: 2px solid rgba(255, 255, 255, 0.1); flex-shrink: 0; }
    .user-details { flex: 1; min-width: 0; }
    .u-name { font-size: 16px; font-weight: 800; color: var(--text); letter-spacing: -0.01em; }
    .u-handle { font-size: 14px; color: var(--text3); font-weight: 600; }
    .u-bio { font-size: 14px; color: var(--text2); margin-top: 6px; line-height: 1.5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .posts-list { display: flex; flex-direction: column; gap: 32px; padding: 0 16px; }

    .empty { padding: 80px 40px; border-radius: var(--radius-lg); text-align: center; display: flex; flex-direction: column; align-items: center; gap: 16px; h3 { font-size: 20px; font-weight: 800; } p { color: var(--text3); font-size: 15px; } }
  `]
})
export class ExploreComponent implements OnInit {
  query = '';
  tab = signal<'posts' | 'users'>('posts');
  posts = signal<Post[]>([]);
  users = signal<User[]>([]);
  loading = signal(false);
  following: Record<number, boolean> = {};
  private searchTimeout: any;

  constructor(private postService: PostService, private userService: UserService, private followService: FollowService, public auth: AuthService, private route: ActivatedRoute) {}

  ngOnInit() { this.route.queryParams.subscribe(p => { if (p['tag']) { this.query = p['tag']; this.doSearch(); } else this.loadTrending(); }); }

  loadTrending() { this.loading.set(true); this.postService.getTrending().subscribe(r => { this.enrichPostsWithUsers(r.data); }); }

  onSearch() { clearTimeout(this.searchTimeout); this.searchTimeout = setTimeout(() => this.doSearch(), 400); }

  doSearch() {
    if (!this.query.trim()) { this.loadTrending(); return; }
    this.loading.set(true);
    if (this.tab() === 'users') {
      this.userService.search(this.query).subscribe(r => { this.users.set(r.data); this.loading.set(false); });
      return;
    }
    const tag = this.query.startsWith('#') ? this.query.slice(1) : null;
    const obs = tag ? this.postService.getByHashtag(tag) : this.postService.search(this.query);
    obs.subscribe(r => { this.enrichPostsWithUsers(r.data); });
  }

  clearSearch() { this.query = ''; this.loadTrending(); }

  enrichPostsWithUsers(posts: Post[]) {
    if (posts.length === 0) { this.posts.set([]); this.loading.set(false); return; }
    const ids = [...new Set(posts.map(p => p.userId))];
    const map: Record<number, any> = {};
    let done = 0;
    ids.forEach(uid => {
      this.userService.getById(uid).subscribe({
        next: r => { map[uid] = r.data; },
        complete: () => { done++; if (done === ids.length) { this.posts.set(posts.map(p => ({ ...p, user: map[p.userId] }))); this.loading.set(false); } },
        error: () => { done++; if (done === ids.length) { this.posts.set(posts.map(p => ({ ...p, user: map[p.userId] }))); this.loading.set(false); } }
      });
    });
  }

  toggleFollow(u: User) {
    if (this.following[u.userId]) { this.followService.unfollow(u.userId).subscribe(() => delete this.following[u.userId]); }
    else { this.followService.follow(u.userId).subscribe(() => this.following[u.userId] = true); }
  }
}
