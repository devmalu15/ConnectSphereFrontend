import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Post, Comment } from '../../shared/models/models';
import { PostService, CommentService, LikeService, UserService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';
import { PostCardComponent } from '../../shared/components/post-card.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PostCardComponent],
  template: `
    <div *ngIf="loading()" class="page-loader"><div class="spinner"></div></div>

    <div *ngIf="!loading() && post()">
      <div class="post-header glass animate-fade">
        <div class="back-btn btn glass pill" onclick="history.back()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        </div>
        <h2 class="header-title title-gradient">POST</h2>
      </div>

      <app-post-card [post]="post()!" style="display:block;margin-top:12px" />

      
      <div class="comments-section glass animate-fade">
        <h3 class="section-title">COMMENTS ({{ post()?.commentCount }})</h3>

        <div class="add-comment glass">
          <div class="avatar mini-av">
            <img *ngIf="auth.currentUser()?.avatarUrl" [src]="auth.currentUser()?.avatarUrl">
            <span *ngIf="!auth.currentUser()?.avatarUrl">{{ auth.currentUser()?.userName?.[0]?.toUpperCase() }}</span>
          </div>
          <input class="input" [(ngModel)]="newComment" placeholder="ADD A COMMENT..." (keyup.enter)="addComment()">
          <button class="btn primary pill" [disabled]="!newComment.trim()" (click)="addComment()">SEND</button>
        </div>

        <div *ngIf="commentsLoading()" class="page-loader"><div class="spinner"></div></div>

        <div class="comment-list">
          <div *ngFor="let c of comments()" class="comment-item glass animate-fade">
            <div class="comment-left">
              <a [routerLink]="['/profile', c.userId]" class="avatar-link">
                <div class="avatar comment-av">
                  <img *ngIf="c.user?.avatarUrl" [src]="c.user?.avatarUrl">
                  <span *ngIf="!c.user?.avatarUrl">{{ c.user?.userName?.[0]?.toUpperCase() || '?' }}</span>
                </div>
              </a>
            </div>
            <div class="comment-right">
              <div class="comment-header">
                <a [routerLink]="['/profile', c.userId]" class="commenter-name">{{ c.user?.userName }}</a>
                <span class="comment-time">{{ c.createdAt | date:'shortTime' }}</span>
                <span *ngIf="c.isEdited" class="edited-badge">EDITED</span>
              </div>
              <ng-container *ngIf="editingComment() !== c.commentId">
                <p class="comment-text">{{ c.content }}</p>
              </ng-container>
              <ng-container *ngIf="editingComment() === c.commentId">
                <textarea class="input" [(ngModel)]="editContent" rows="2"></textarea>
                <div class="edit-actions">
                  <button class="btn glass pill btn-sm" (click)="editingComment.set(null)">CANCEL</button>
                  <button class="btn primary pill btn-sm" (click)="saveEdit(c)">SAVE</button>
                </div>
              </ng-container>
              <div class="comment-actions">
                <button class="c-act btn glass pill mini" [class.active]="c.isLiked" (click)="likeComment(c)">
                  <svg viewBox="0 0 24 24" [attr.fill]="c.isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span>{{ c.likeCount }}</span>
                </button>
                <button class="c-act btn glass pill mini" (click)="replyTo.set(replyTo() === c.commentId ? null : c.commentId)">REPLY</button>
                <button *ngIf="c.userId === auth.userId" class="c-act btn glass pill mini" (click)="startEdit(c)">EDIT</button>
                <button *ngIf="c.userId === auth.userId" class="c-act btn glass pill mini danger" (click)="deleteComment(c)">DELETE</button>
              </div>

              
              <div *ngIf="replyTo() === c.commentId" class="reply-input glass animate-fade">
                <input class="input" [(ngModel)]="replyContent" placeholder="REPLY TO {{ c.user?.userName?.toUpperCase() }}..." (keyup.enter)="addReply(c.commentId)">
                <button class="btn primary pill btn-sm" [disabled]="!replyContent.trim()" (click)="addReply(c.commentId)">SEND</button>
              </div>

              <div *ngIf="c.replyCount > 0" class="replies-section">
                <button class="btn glass pill btn-sm show-replies-btn" (click)="loadReplies(c)">
                  {{ repliesMap[c.commentId] ? 'HIDE' : 'VIEW' }} {{ c.replyCount }} {{ c.replyCount === 1 ? 'REPLY' : 'REPLIES' }}
                </button>
                <div *ngIf="repliesMap[c.commentId]" class="replies-list-inner animate-fade">
                  <div *ngFor="let r of repliesMap[c.commentId]" class="reply-item">
                    <div class="avatar reply-av">
                      <img *ngIf="r.user?.avatarUrl" [src]="r.user?.avatarUrl">
                      <span *ngIf="!r.user?.avatarUrl">{{ r.user?.userName?.[0]?.toUpperCase() || '?' }}</span>
                    </div>
                    <div class="reply-content-box">
                      <div class="reply-header">
                        <span class="reply-name">{{ r.user?.userName }}</span>
                        <span class="reply-time">{{ r.createdAt | date:'shortTime' }}</span>
                      </div>
                      <p class="reply-text">{{ r.content }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="!commentsLoading() && comments().length === 0" class="empty glass-card">
          <p>NO COMMENTS YET. BE THE FIRST TO START THE CONVERSATION.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .post-header {
      position: sticky; top: 96px; z-index: 100;
      display: flex; align-items: center; gap: 24px;
      padding: 16px 24px; border-radius: 100px;
      margin: 0 16px 24px;
      box-shadow: 0 15px 30px rgba(0,0,0,0.3);
    }
    .back-btn { width: 44px; height: 44px; padding: 0; }
    .header-title { font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }

    .comments-section { padding: 32px; border: 1px solid var(--border-sub); border-radius: var(--radius-lg); margin: 32px 16px; background: rgba(255, 255, 255, 0.03); }
    .section-title { font-size: 12px; font-weight: 800; letter-spacing: 0.1em; color: var(--text3); margin-bottom: 24px; }
    
    .add-comment {
      display: flex; gap: 12px; align-items: center; margin-bottom: 32px; padding: 8px; border-radius: 100px;
      border: 1px solid var(--border-sub); background: rgba(255, 255, 255, 0.05);
      .mini-av { width: 36px; height: 36px; border: 1px solid rgba(255, 255, 255, 0.1); }
      .input { flex: 1; padding: 12px 16px; border: none; background: none; color: #FFFFFF; font-size: 14px; font-weight: 500; &:focus { outline: none; } }
      .btn { padding: 0 24px; height: 40px; font-size: 11px; letter-spacing: 0.05em; }
    }

    .comment-list { display: flex; flex-direction: column; gap: 24px; }
    .comment-item { 
      display: flex; gap: 20px; padding: 24px; border-radius: var(--radius-md); 
      background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-sub);
    }
    .comment-av { width: 44px; height: 44px; border: 2px solid rgba(255, 255, 255, 0.1); }
    .comment-right { flex: 1; min-width: 0; }
    .comment-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .commenter-name { font-size: 15px; font-weight: 800; color: #FFFFFF; }
    .comment-time { font-size: 11px; color: var(--text3); font-weight: 700; text-transform: uppercase; }
    .edited-badge { font-size: 9px; font-weight: 800; background: rgba(255, 255, 255, 0.1); padding: 4px 8px; border-radius: 4px; color: var(--text3); }
    
    .comment-text { font-size: 15px; line-height: 1.6; color: var(--text2); font-weight: 500; }
    .comment-actions { display: flex; gap: 12px; margin-top: 16px; }
    .c-act { 
      font-size: 10px; font-weight: 800; color: var(--text3);
      &.active { color: #FF375F; }
      &.danger { &:hover { color: #FF3B30; } }
    }

    .reply-input {
      display: flex; gap: 12px; margin-top: 24px; padding: 8px; border-radius: 100px;
      border: 1px solid var(--border-sub); background: rgba(255, 255, 255, 0.05);
      .input { flex: 1; padding: 10px 16px; border: none; background: none; color: #FFFFFF; font-size: 13px; &:focus { outline: none; } }
      .btn { padding: 0 20px; height: 36px; font-size: 10px; }
    }

    .replies-section { margin-top: 20px; }
    .show-replies-btn { font-size: 11px; padding: 8px 16px; letter-spacing: 0.05em; }
    .replies-list-inner { margin-top: 20px; display: flex; flex-direction: column; gap: 16px; padding-left: 24px; border-left: 2px solid var(--border-sub); }
    .reply-item { display: flex; gap: 14px; align-items: flex-start; }
    .reply-av { width: 28px; height: 28px; border: 1px solid rgba(255, 255, 255, 0.1); }
    .reply-name { font-size: 13px; font-weight: 800; color: #FFFFFF; }
    .reply-time { font-size: 10px; color: var(--text3); font-weight: 700; }
    .reply-text { font-size: 14px; color: var(--text2); line-height: 1.5; }

    .empty { padding: 80px 32px; text-align: center; border-radius: var(--radius-lg); background: rgba(255, 255, 255, 0.02); p { font-size: 13px; font-weight: 800; color: var(--text3); letter-spacing: 0.1em; } }
  `]
})
export class PostDetailComponent implements OnInit {
  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);
  loading = signal(true);
  commentsLoading = signal(true);
  newComment = '';
  replyTo = signal<number | null>(null);
  replyContent = '';
  editingComment = signal<number | null>(null);
  editContent = '';
  repliesMap: Record<number, Comment[]> = {};

  constructor(
    private postService: PostService,
    private commentService: CommentService,
    private likeService: LikeService,
    private userService: UserService,
    public auth: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.postService.getById(id).subscribe(r => {
      const p = r.data;
      this.userService.getById(p.userId).subscribe(ur => {
        this.post.set({ ...p, user: ur.data });
      });
      this.loading.set(false);
    });
    this.loadComments(id);
  }

  loadComments(postId: number) {
    this.commentsLoading.set(true);
    this.commentService.getByPost(postId).subscribe({
      next: r => this.mapCommentsToUsers(r.data, comments => {
        this.comments.set(comments);
        this.commentsLoading.set(false);
      }),
      error: () => {
        this.comments.set([]);
        this.commentsLoading.set(false);
      }
    });
  }

  private mapCommentsToUsers(comments: Comment[], callback: (mapped: Comment[]) => void) {
    const userIds = [...new Set(comments.map(c => c.userId))];
    const userMap: Record<number, any> = {};
    let done = 0;

    if (userIds.length === 0) {
      callback(comments);
      return;
    }

    userIds.forEach(uid => {
      this.userService.getById(uid).subscribe({
        next: ur => { userMap[uid] = ur.data; },
        complete: () => {
          done++;
          if (done === userIds.length) {
            callback(comments.map(c => ({ ...c, user: userMap[c.userId] })));
          }
        },
        error: () => {
          done++;
          if (done === userIds.length) {
            callback(comments.map(c => ({ ...c, user: userMap[c.userId] })));
          }
        }
      });
    });
  }

  addComment() {
    if (!this.newComment.trim() || !this.post()) return;
    this.commentService.add(this.post()!.postId, this.newComment).subscribe(r => {
      const c = { ...r.data, user: this.auth.currentUser() as any };
      this.comments.set([c, ...this.comments()]);
      this.newComment = '';
      this.post.set({ ...this.post()!, commentCount: (this.post()!.commentCount ?? 0) + 1 });
    });
  }

  addReply(parentId: number) {
    if (!this.replyContent.trim() || !this.post()) return;
    this.commentService.add(this.post()!.postId, this.replyContent, parentId).subscribe(r => {
      const reply = { ...r.data, user: this.auth.currentUser() as any };
      if (!this.repliesMap[parentId]) this.repliesMap[parentId] = [];
      this.repliesMap[parentId] = [...this.repliesMap[parentId], reply];
      this.comments.set(this.comments().map(c => c.commentId === parentId ? { ...c, replyCount: c.replyCount + 1 } : c));
      this.replyContent = '';
      this.replyTo.set(null);
    });
  }

  loadReplies(comment: Comment) {
    if (this.repliesMap[comment.commentId]) { delete this.repliesMap[comment.commentId]; return; }
    this.commentService.getReplies(comment.commentId).subscribe({
      next: r => this.mapCommentsToUsers(r.data, replies => {
        this.repliesMap[comment.commentId] = replies;
      }),
      error: () => {
        this.repliesMap[comment.commentId] = [];
      }
    });
  }

  likeComment(c: Comment) {
    this.likeService.toggle(c.commentId, 'COMMENT').subscribe(r => {
      this.comments.set(this.comments().map(x => x.commentId === c.commentId ? { ...x, isLiked: r.data, likeCount: x.likeCount + (r.data ? 1 : -1) } : x));
    });
  }

  startEdit(c: Comment) { this.editingComment.set(c.commentId); this.editContent = c.content; }

  saveEdit(c: Comment) {
    this.commentService.edit(c.commentId, this.editContent).subscribe(r => {
      this.comments.set(this.comments().map(x => x.commentId === c.commentId ? { ...x, content: r.data.content, isEdited: true } : x));
      this.editingComment.set(null);
    });
  }

  deleteComment(c: Comment) {
    this.commentService.delete(c.commentId).subscribe(() => {
      this.comments.set(this.comments().filter(x => x.commentId !== c.commentId));
    });
  }
}
