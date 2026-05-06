import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/api.services';
import { Post } from '../../shared/models/models';
import { PostCardComponent } from '../../shared/components/post-card.component';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCardComponent],
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

    <div *ngIf="!loading()" class="users-table card">
      <table>
        <thead>
          <tr>
            <th>Author</th>
            <th>Content Snippet</th>
            <th>Engagement</th>
            <th>Status</th>
            <th>Posted On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of filteredPosts()">
            <td>
              <div class="user-cell">
                <div class="avatar" style="width:32px;height:32px;font-size:12px">
                  <img *ngIf="p.user?.avatarUrl" [src]="p.user?.avatarUrl" style="width:100%;height:100%;border-radius:50%;object-fit:cover">
                  <span *ngIf="!p.user?.avatarUrl">{{ p.user?.userName?.[0]?.toUpperCase() }}</span>
                </div>
                <div>
                  <p class="user-name">{{ p.user?.fullName }}</p>
                  <p class="user-handle">{{ p.user?.userName }}</p>
                </div>
              </div>
            </td>
            <td class="text-sm content-cell">
              <p class="truncate">{{ p.content }}</p>
              <span *ngIf="p.mediaUrl" class="media-indicator">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                MEDIA ATTACHED
              </span>
            </td>
            <td>
              <div class="stats-row">
                <div class="stat-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span>{{ p.likeCount || 0 }}</span>
                </div>
                <div class="stat-item">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                  <span>{{ p.commentCount || 0 }}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="status-badge" [class.private]="p.visibility !== 0">
                {{ p.visibility === 0 ? 'Public' : 'Private' }}
              </span>
            </td>
            <td class="text-sm text-muted">{{ p.createdAt | date:'MMM d, yyyy' }}</td>
            <td>
              <div class="action-btns">
                <button class="action-icon info" (click)="viewPost(p)" title="Preview Post">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="action-icon warning" (click)="toggleSuspendAuthor(p)" title="Suspend Author">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                </button>
                <button class="action-icon delete" (click)="confirmDelete(p)" title="Delete Post">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="filteredPosts().length === 0" class="empty" style="padding:32px">
        <p>No posts found matching your search.</p>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button class="btn ghost" [disabled]="page === 1" (click)="loadPage(page - 1)">Previous</button>
        <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
        <button class="btn ghost" [disabled]="page >= totalPages" (click)="loadPage(page + 1)">Next</button>
      </div>
    </div>

    <!-- Post Preview Modal -->
    <div class="modal-overlay" *ngIf="selectedPost()" (click)="selectedPost.set(null)">
      <div class="preview-container glass animate-slide-up" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">POST PREVIEW</h3>
          <button class="close-btn" (click)="selectedPost.set(null)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body scroll-y">
          <app-post-card [post]="selectedPost()!" [isPreview]="true" />
        </div>
        <div class="modal-footer">
          <button class="btn primary pill" (click)="selectedPost.set(null)">CLOSE PREVIEW</button>
        </div>
      </div>
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

    .users-table { 
      border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); overflow: hidden;
      background: rgba(15, 15, 15, 0.5); backdrop-filter: blur(20px);
    }
    
    table { width: 100%; border-collapse: collapse; }
    th { 
      text-align: left; padding: 20px 24px; font-size: 10px; font-weight: 800; 
      text-transform: uppercase; letter-spacing: 0.1em; color: var(--text3); 
      border-bottom: 1px solid rgba(255, 255, 255, 0.05); background: rgba(255, 255, 255, 0.02);
    }
    td { padding: 16px 24px; font-size: 13px; border-bottom: 1px solid rgba(255, 255, 255, 0.03); vertical-align: middle; }
    tr:hover td { background: rgba(255, 255, 255, 0.02); }

    .user-cell { 
      display: flex; align-items: center; gap: 14px; 
      .avatar { width: 36px; height: 36px; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; }
      .user-name { font-size: 14px; font-weight: 800; color: #FFFFFF; }
      .user-handle { font-size: 11px; color: var(--text3); font-weight: 600; margin-top: 2px; }
    }

    .content-cell { max-width: 300px; }
    .truncate { 
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0; 
      color: var(--text2); font-weight: 500;
    }
    .media-indicator { 
      display: flex; align-items: center; gap: 6px; font-size: 9px; font-weight: 800; 
      color: var(--text3); margin-top: 6px;
      svg { width: 12px; height: 12px; }
    }

    .stats-row { display: flex; gap: 16px; }
    .stat-item { 
      display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: var(--text3);
      svg { width: 14px; height: 14px; }
    }

    .status-badge { 
      display: inline-block; padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 800;
      background: rgba(46, 204, 113, 0.1); color: #2ecc71;
      &.private { background: rgba(243, 156, 18, 0.1); color: #f39c12; }
    }

    .action-btns { display: flex; gap: 8px; }
    .action-icon { 
      width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
      color: var(--text3); transition: var(--transition); border: 1px solid transparent;
      svg { width: 16px; height: 16px; }
      &:hover { background: rgba(255, 255, 255, 0.05); color: #FFFFFF; }
      &.info:hover { color: #3498db; background: rgba(52, 152, 219, 0.1); }
      &.warning:hover { color: #f1c40f; background: rgba(241, 196, 15, 0.1); }
      &.delete:hover { color: #ff3b30; background: rgba(255, 59, 48, 0.1); }
    }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.8);
      backdrop-filter: blur(12px); z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 40px;
    }
    .preview-container {
      width: 100%; max-width: 600px; background: rgba(15, 15, 15, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 32px;
      display: flex; flex-direction: column; max-height: 90vh;
    }
    .modal-header { padding: 24px 32px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .modal-title { font-size: 14px; font-weight: 900; letter-spacing: 0.1em; color: #FFFFFF; }
    .close-btn { color: var(--text3); &:hover { color: #FFFFFF; } svg { width: 20px; } }
    .modal-body { flex: 1; padding: 32px; overflow-y: auto; }
    .modal-footer { padding: 24px 32px; display: flex; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.05); }

    .pagination { 
      display: flex; align-items: center; justify-content: center; gap: 24px; padding: 32px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
    }
    .page-info { font-size: 12px; font-weight: 800; color: var(--text3); }

    .toast { 
      position: fixed; bottom: 32px; right: 32px; 
      background: #FFFFFF; color: #000; padding: 14px 28px; 
      border-radius: 100px; font-size: 13px; font-weight: 800;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4); z-index: 2000;
    }
    .scroll-y { scrollbar-width: none; &::-webkit-scrollbar { display: none; } }
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
  selectedPost = signal<Post | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.loadPage(1); }

  loadPage(p: number) {
    this.page = p;
    this.loading.set(true);
    this.adminService.getAllPosts(p).subscribe({
      next: (r: any) => {
        const items = r.data.items || r.data;
        this.posts.set(items);
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
      const q = this.search.toLowerCase();
      list = list.filter(p => 
        p.content.toLowerCase().includes(q) || 
        p.user?.userName?.toLowerCase().includes(q) ||
        p.user?.fullName?.toLowerCase().includes(q)
      );
    }
    this.filteredPosts.set(list);
  }

  viewPost(p: Post) {
    this.selectedPost.set(p);
  }

  toggleSuspendAuthor(p: Post) {
    if (!p.user) return;
    const action = p.user.isActive ? 'suspend' : 'activate';
    if (confirm(`Are you sure you want to ${action} ${p.user.userName}?`)) {
      this.adminService.suspend(p.userId).subscribe(() => {
        this.showToast(`User ${p.user!.userName} ${p.user!.isActive ? 'suspended' : 'activated'}`);
        // Refresh posts to update user status if needed, or just reload page
        this.loadPage(this.page);
      });
    }
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
