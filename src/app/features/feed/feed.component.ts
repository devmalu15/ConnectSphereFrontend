import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post, FeedItem } from '../../shared/models/models';
import { FeedService, PostService, UserService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { PostCardComponent } from '../../shared/components/post-card.component';
import { CreatePostModalComponent } from '../../shared/components/create-post-modal.component';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, PostCardComponent, CreatePostModalComponent],
  template: `
    <div class="feed-layout animate-fade">
      
      <div class="feed-center">
        
        <!-- Header moved to TopNav -->

        <div class="tabs-container">
          <div class="tabs-inner glass">
            <button class="btn pill" [class.primary]="tab() === 'feed'" (click)="setTab('feed')">FOR YOU</button>
            <button class="btn pill" [class.primary]="tab() === 'suggested'" (click)="setTab('suggested')">FOLLOWING</button>
            <button class="btn pill" [class.primary]="tab() === 'trending'" (click)="setTab('trending')">TRENDING</button>
          </div>
        </div>

        <div class="feed-scroll-content">
          <div class="compose-trigger-wrap" (click)="showCreate.set(true)">
            <div class="compose-card glass animate-fade">
              <div class="avatar compose-av">
                <img *ngIf="auth.currentUser()?.avatarUrl" [src]="auth.currentUser()?.avatarUrl">
                <span *ngIf="!auth.currentUser()?.avatarUrl">{{ auth.currentUser()?.userName?.[0]?.toUpperCase() }}</span>
              </div>
              <span class="placeholder">WHAT'S HAPPENING?</span>
              <div class="compose-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15l-5-5L5 21"/><path d="M4 16v4h4"/></svg>
              </div>
            </div>
          </div>

          <div *ngIf="loading()" class="page-loader"><div class="spinner"></div></div>

          <div *ngIf="!loading() && posts().length === 0" class="empty glass-card">
            <div class="empty-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            </div>
            <h3>Your feed is quiet</h3>
            <p>Follow interesting people to see what's happening!</p>
          </div>

          <div class="posts-list">
            <app-post-card *ngFor="let post of posts()" [post]="post" class="feed-post-card" />
          </div>

          <div *ngIf="!loading() && hasMore()" class="load-more-row">
            <button class="btn primary show-more-btn" [disabled]="loadingMore()" (click)="loadMore()">
              <div *ngIf="loadingMore()" class="spinner" style="width:16px;height:16px"></div>
              <span *ngIf="!loadingMore()">Show more posts</span>
            </button>
          </div>
        </div>
      </div>

      <aside class="feed-sidebar">
        <div class="sidebar-widget glass-card">
          <h3 class="widget-title title-gradient">Top 5 trending Hashtags</h3>
          <div *ngFor="let tag of trendingTags().slice(0, 5); let i = index" class="trend-item">
            <div class="trend-meta">
              <span class="trend-label">#{{ i + 1 }} TRENDING</span>
            </div>
            <a [routerLink]="['/explore']" [queryParams]="{tag}" class="trend-tag">#{{ tag }}</a>
          </div>
          <a routerLink="/explore" class="btn glass pill show-more-link">See all trending</a>
        </div>
      </aside>
    </div>

    <app-create-post-modal *ngIf="showCreate()" (closed)="onPostCreated()" />
  `,
  styles: [`
    .feed-layout { 
      display: grid; 
      grid-template-columns: 1fr var(--col-left); 
      gap: 32px; 
      min-height: 100vh;
      @media (max-width: 1200px) { grid-template-columns: 1fr; } 
    }
    .feed-center { 
      min-width: 0;
      display: flex; flex-direction: column;
      gap: 32px;
    }
    
    /* feed-nav removed */

    .tabs-container { display: flex; justify-content: center; margin-bottom: 16px; }
    .tabs-inner {
      display: flex; gap: 4px; padding: 6px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 100px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      .btn { 
        border: none; background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none; 
        font-size: 12px; font-weight: 800; padding: 10px 24px; color: var(--text3);
        &.primary { background: #FFFFFF; color: #000; box-shadow: 0 8px 16px rgba(255, 255, 255, 0.15); }
        &:hover:not(.primary) { color: var(--text); background: rgba(255, 255, 255, 0.05); }
      }
    }

    .feed-scroll-content { flex: 1; display: flex; flex-direction: column; gap: 32px; }

    .compose-card {
      display: flex; align-items: center; gap: 20px; padding: 20px 28px;
      cursor: pointer;
      border-radius: var(--radius-lg);
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      transition: var(--transition);
      &:hover { 
        background: rgba(255, 255, 255, 0.1); 
        transform: translateY(-4px); 
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
      }
    }
    .compose-av { width: 44px; height: 44px; border: 2px solid rgba(255, 255, 255, 0.1); }
    .placeholder { font-size: 16px; font-weight: 600; color: var(--text3); flex: 1; letter-spacing: -0.01em; }
    .compose-icon { color: var(--text3); svg { width: 20px; } }

    .posts-list { display: flex; flex-direction: column; gap: 32px; }

    .feed-sidebar { 
      position: sticky; top: 112px; height: fit-content;
      display: flex; flex-direction: column;
      @media (max-width: 1200px) { display: none; } 
    }
    .sidebar-widget { 
      display: flex; flex-direction: column; gap: 10px;
      margin: -17px 0;
      padding: 20px 24px;
      border-radius: var(--radius-lg);
    }
    .widget-title { font-size: 18px; font-weight: 800; margin-bottom: 4px; letter-spacing: -0.02em; }
    .trend-item { display: flex; flex-direction: column; gap: 2px; padding-bottom: 12px; border-bottom: 1px solid var(--border-sub); &:last-child { border: none; padding: 0; } }
    .trend-meta { font-size: 10px; color: var(--text3); font-weight: 700; letter-spacing: 0.05em; }
    .trend-tag { font-size: 15px; font-weight: 800; color: var(--text); &:hover { color: #FFFFFF; text-decoration: underline; } }
    .trend-count { font-size: 11px; color: var(--text3); font-weight: 600; }
    .show-more-link { margin-top: 4px; height: 40px; font-size: 12px; font-weight: 800; }

    .empty { padding: 80px 40px; border-radius: var(--radius-lg); }
    .empty-icon-box { width: 72px; height: 72px; border-radius: 24px; background: rgba(255, 255, 255, 0.05); color: var(--text3); svg { width: 36px; } }
    .empty h3 { font-size: 22px; font-weight: 800; margin-top: 8px; }
    .empty p { font-size: 15px; color: var(--text3); }

    .load-more-row { padding: 32px 0 64px; }
    .show-more-btn { height: 56px; padding: 0 48px; font-size: 15px; font-weight: 800; }
  `]
})
export class FeedComponent implements OnInit {
  tab = signal<'feed' | 'suggested' | 'trending'>('feed');
  posts = signal<Post[]>([]);
  loading = signal(true);
  loadingMore = signal(false);
  hasMore = signal(false);
  page = 1;
  showCreate = signal(false);
  trendingTags = signal<string[]>([]);
  private tagPostCounts: Record<string, number> = {};

  constructor(
    private feedService: FeedService,
    private postService: PostService,
    private userService: UserService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.loadFeed();
    this.loadTrendingTags();
  }

  loadTrendingTags() {
    this.feedService.getTrendingHashtags(10).subscribe({
      next: r => this.trendingTags.set(r.data ?? []),
      error: () => {
        this.postService.getTrending().subscribe({
          next: r => {
            const tags = r.data.flatMap(p => this.extractHashtags(p));
            const uniqueTags = [...new Set(tags)].slice(0, 8);
            this.trendingTags.set(uniqueTags);
          },
          error: () => this.trendingTags.set([])
        });
      }
    });
  }

  extractHashtags(post: Post): string[] {
    return post.hashtags?.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean) ?? [];
  }

  getTagPostCount(tag: string): number {
    return this.tagPostCounts[tag] ?? 0;
  }

  setTab(t: 'feed' | 'suggested' | 'trending') {
    this.tab.set(t);
    this.page = 1;
    this.posts.set([]);
    this.loadFeed();
  }

  get uid(): number { return this.auth.userId; }

  loadFeed() {
    this.loading.set(true);

    if (this.tab() === 'feed') {
      this.feedService.getFeed(this.uid, this.page).subscribe({
        next: r => {
          const feedItems = r.data.items;
          if (!feedItems.length) {
            this.postService.getPublic(this.page).subscribe(r2 => {
              this.enrichAndSet(r2.data.items);
              this.hasMore.set(r2.data.page * r2.data.pageSize < r2.data.totalCount);
              this.loading.set(false);
            });
            return;
          }
          this.enrichFromFeedItems(feedItems);
          this.hasMore.set(r.data.page * r.data.pageSize < r.data.totalCount);
          this.loading.set(false);
        },
        error: () => {
          this.postService.getPublic(this.page).subscribe(r2 => {
            this.enrichAndSet(r2.data.items);
            this.hasMore.set(r2.data.page * r2.data.pageSize < r2.data.totalCount);
            this.loading.set(false);
          });
        }
      });

    } else if (this.tab() === 'trending') {
      this.postService.getTrending().subscribe({
        next: r => {
          const trendingPosts = r.data;
          if (!trendingPosts || trendingPosts.length === 0) {

            this.postService.getPublic(this.page).subscribe(r2 => {
              this.fetchUsers(r2.data.items);
              this.hasMore.set(r2.data.page * r2.data.pageSize < r2.data.totalCount);
              this.loading.set(false);
            });
            return;
          }
          this.hasMore.set(false);
          this.loading.set(false);
          this.fetchUsers(trendingPosts);
        },
        error: () => {
          this.postService.getPublic(this.page).subscribe(r2 => {
            this.fetchUsers(r2.data.items);
            this.hasMore.set(r2.data.page * r2.data.pageSize < r2.data.totalCount);
            this.loading.set(false);
          });
        }
      });

    } else {

      this.feedService.getSuggested(this.uid, this.page).subscribe({
        next: r => {
          const feedItems = r.data;
          if (!feedItems.length) {
            this.postService.getPublic(this.page).subscribe(r2 => {
              this.enrichAndSet(r2.data.items);
              this.hasMore.set(false);
              this.loading.set(false);
            });
            return;
          }
          this.enrichFromFeedItems(feedItems);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
    }
  }

  private enrichFromFeedItems(feedItems: FeedItem[]) {
    if (!feedItems.length) { this.posts.set([]); return; }
    const fetches = feedItems.map(fi =>
      new Promise<Post | null>(resolve =>
        this.postService.getById(fi.postId).subscribe({ next: r => resolve(r.data), error: () => resolve(null) })
      )
    );
    Promise.all(fetches).then(posts => {
      const valid = posts.filter((p): p is Post => p !== null && !!p.content);
      this.fetchUsers(valid);
    });
  }

  enrichAndSet(items: Post[]) {
    if (items.length === 0) { this.posts.set([]); return; }
    if (!items[0].content) {
      const fetches = items.map(fi =>
        new Promise<Post>(resolve =>
          this.postService.getById((fi as any).postId).subscribe({ next: r => resolve(r.data), error: () => resolve(fi) })
        )
      );
      Promise.all(fetches).then(ps => { this.fetchUsers(ps.filter(p => p?.content)); });
    } else {
      this.fetchUsers(items);
    }
  }

  fetchUsers(posts: Post[]) {
    const userIds = [...new Set(posts.map(p => p.userId))];
    const userMap: Record<number, any> = {};
    let done = 0;
    if (userIds.length === 0) { this.posts.set(posts); return; }
    userIds.forEach(uid => {
      this.userService.getById(uid).subscribe({
        next: r => { userMap[uid] = r.data; },
        complete: () => { done++; if (done === userIds.length) this.posts.set(posts.map(p => ({ ...p, user: userMap[p.userId] }))); },
        error: () => { done++; if (done === userIds.length) this.posts.set(posts.map(p => ({ ...p, user: userMap[p.userId] }))); }
      });
    });
  }

  loadMore() {
    this.page++;
    this.loadingMore.set(true);
    if (this.tab() === 'feed') {
      this.feedService.getFeed(this.uid, this.page).subscribe({
        next: r => {
          this.enrichFromFeedItemsAppend(r.data.items, this.posts());
          this.hasMore.set(r.data.page * r.data.pageSize < r.data.totalCount);
          this.loadingMore.set(false);
        },
        error: () => {
          this.postService.getPublic(this.page).subscribe(r => {
            this.fetchUsersAppend(r.data.items, this.posts());
            this.hasMore.set(r.data.page * r.data.pageSize < r.data.totalCount);
            this.loadingMore.set(false);
          });
        }
      });
    } else {
      this.postService.getPublic(this.page).subscribe(r => {
        this.fetchUsersAppend(r.data.items, this.posts());
        this.hasMore.set(r.data.page * r.data.pageSize < r.data.totalCount);
        this.loadingMore.set(false);
      });
    }
  }

  private enrichFromFeedItemsAppend(feedItems: FeedItem[], existing: Post[]) {
    if (!feedItems.length) { return; }
    const fetches = feedItems.map(fi =>
      new Promise<Post | null>(resolve =>
        this.postService.getById(fi.postId).subscribe({ next: r => resolve(r.data), error: () => resolve(null) })
      )
    );
    Promise.all(fetches).then(posts => {
      const valid = posts.filter((p): p is Post => p !== null && !!p.content);
      this.fetchUsersAppend(valid, existing);
    });
  }

  fetchUsersAppend(newPosts: Post[], existing: Post[]) {
    const userIds = [...new Set(newPosts.map(p => p.userId))];
    const userMap: Record<number, any> = {};
    let done = 0;
    if (userIds.length === 0) { this.posts.set([...existing, ...newPosts]); return; }
    userIds.forEach(uid => {
      this.userService.getById(uid).subscribe({
        next: r => { userMap[uid] = r.data; },
        complete: () => { done++; if (done === userIds.length) this.posts.set([...existing, ...newPosts.map(p => ({ ...p, user: userMap[p.userId] }))]); },
        error: () => { done++; if (done === userIds.length) this.posts.set([...existing, ...newPosts.map(p => ({ ...p, user: userMap[p.userId] }))]); }
      });
    });
  }

  onPostCreated() {
    this.showCreate.set(false);
    this.page = 1;
    this.loadFeed();
  }
}