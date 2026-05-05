import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/api.services';
import { Post } from '../../shared/models/models';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Post Control</h2>
        <p class="page-sub">Audit and manage platform content</p>
      </div>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" [(ngModel)]="search" placeholder="SEARCH POSTS…" (input)="filterPosts()">
      </div>
    </div>

    <div *ngIf="loading()" class="page-loader"><div class="spinner"></div></div>

    <div *ngIf="!loading()" class="posts-grid">
      <div *ngFor="let p of filteredPosts()" class="post-card glass animate-fade">
        <div class="post-header">
          <div class="author-info">
            <div class="avatar mini">
              <img *ngIf="p.user?.avatarUrl" [src]="p.user?.avatarUrl">
              <span *ngIf="!p.user?.avatarUrl">{{ p.user?.userName?.[0]?.toUpperCase() }}</span>
            </div>
            <div>
              <p class="author-name">{{ p.user?.fullName }}</p>
              <p class="post-date">{{ p.createdAt | date:'MMM d, h:mm a' }}</p>
            </div>
          </div>
          <button class="delete-btn" (click)="confirmDelete(p)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>
        </div>

        <div class="post-content">
          <p>{{ p.content }}</p>
          <div *ngIf="p.mediaUrl" class="post-media">
            <img [src]="p.mediaUrl" alt="Post media">
          </div>
        </div>

        <div class="post-footer">
          <div class="p-stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span>{{ p.likeCount || 0 }}</span>
          </div>
          <div class="p-stat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            <span>{{ p.commentCount || 0 }}</span>
          </div>
          <div class="spacer"></div>
          <div class="visibility-tag" [class.private]="p.visibility !== 0">
            {{ p.visibility === 0 ? 'Public' : 'Private' }}
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="!loading() && filteredPosts().length === 0" class="empty-state">
      <p>No posts found matching your search.</p>
    </div>

    <div class="pagination" *ngIf="totalPages > 1">
      <button class="btn ghost" [disabled]="page === 1" (click)="loadPage(page - 1)">Previous</button>
      <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
      <button class="btn ghost" [disabled]="page >= totalPages" (click)="loadPage(page + 1)">Next</button>
    </div>

    <div *ngIf="toast()" class="toast">{{ toast() }}</div>
  `,
  styles: [`
    .page-header { margin-bottom: 40px; }
    .page-title { font-size: 32px; font-weight: 900; letter-spacing: -0.03em; color: #FFFFFF; }
    .page-sub { font-size: 12px; font-weight: 800; color: var(--text3); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }
    
    .toolbar { margin-bottom: 32px; }
    .search-wrap { 
      position: relative; max-width: 400px;
      .search-icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: var(--text3); }
    }
    .search-input { 
      width: 100%; padding: 14px 24px 14px 54px; border-radius: 100px;
      background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-sub);
      color: #FFFFFF; font-size: 13px; font-weight: 700; outline: none;
      &::placeholder { color: var(--text3); text-transform: uppercase; letter-spacing: 0.05em; }
    }

    .posts-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px; margin-bottom: 40px;
    }

    .post-card {
      padding: 24px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08);
      display: flex; flex-direction: column; gap: 20px;
      transition: var(--transition);
      &:hover { transform: translateY(-4px); border-color: rgba(255, 255, 255, 0.2); }
    }

    .post-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .author-info { 
      display: flex; align-items: center; gap: 12px; 
      .avatar.mini { width: 36px; height: 36px; border-radius: 12px; font-size: 14px; border: 1px solid rgba(255,255,255,0.1); }
      .author-name { font-size: 14px; font-weight: 800; color: #FFFFFF; }
      .post-date { font-size: 11px; color: var(--text3); font-weight: 600; margin-top: 2px; }
    }

    .delete-btn {
      width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      color: var(--text3); transition: var(--transition);
      &:hover { background: rgba(255, 59, 48, 0.1); color: #FF3B30; }
      svg { width: 16px; height: 16px; }
    }

    .post-content {
      font-size: 14px; line-height: 1.6; color: var(--text2);
      p { margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    }
    .post-media {
      margin-top: 16px; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.05);
      aspect-ratio: 16/9; img { width: 100%; height: 100%; object-fit: cover; }
    }

    .post-footer {
      margin-top: auto; padding-top: 16px; border-top: 1px solid rgba(255, 255, 255, 0.05);
      display: flex; align-items: center; gap: 16px;
    }
    .p-stat {
      display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 800; color: var(--text3);
      svg { width: 14px; height: 14px; }
    }
    .spacer { flex: 1; }
    .visibility-tag {
      font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em;
      padding: 4px 10px; border-radius: 6px; background: rgba(255,255,255,0.05); color: var(--text3);
      &.private { background: rgba(243, 156, 18, 0.1); color: #F39C12; }
    }

    .pagination { 
      display: flex; align-items: center; justify-content: center; gap: 24px; padding: 32px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .page-info { font-size: 12px; font-weight: 800; color: var(--text3); letter-spacing: 0.05em; }

    .toast { 
      position: fixed; bottom: 32px; right: 32px; 
      background: #FFFFFF; color: #000; padding: 14px 28px; 
      border-radius: 100px; font-size: 13px; font-weight: 800;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4); z-index: 2000;
    }
  `]
})
export class AdminPostsComponent implements OnInit {
  posts = signal<Post[]>([]);
  filteredPosts = signal<Post[]>([]);
  loading = signal(true);
  search = '';
  page = 1;
  totalPages = 1;
  toast = signal('');

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.loadPage(1); }

  loadPage(p: number) {
    this.page = p;
    this.loading.set(true);
    this.adminService.getAllPosts(p).subscribe({
      next: (r: any) => {
        this.posts.set(r.data.items || r.data);
        this.totalPages = r.data.totalPages || 1;
        this.filterPosts();
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.showToast('Failed to load posts');
      }
    });
  }

  filterPosts() {
    let list = this.posts();
    if (this.search) {
      list = list.filter(p => 
        p.content.toLowerCase().includes(this.search.toLowerCase()) || 
        p.user?.userName?.toLowerCase().includes(this.search.toLowerCase()) ||
        p.hashtags?.toLowerCase().includes(this.search.toLowerCase())
      );
    }
    this.filteredPosts.set(list);
  }

  confirmDelete(p: Post) {
    if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      this.adminService.deletePost(p.postId).subscribe(() => {
        this.posts.set(this.posts().filter(x => x.postId !== p.postId));
        this.filterPosts();
        this.showToast('Post deleted successfully');
      });
    }
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 2500);
  }
}
