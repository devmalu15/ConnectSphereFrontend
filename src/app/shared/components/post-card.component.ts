import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Post, Comment } from '../models/models';
import { LikeService, CommentService, PostService, UserService } from '../../core/services/api.services';
import { AuthService } from '../../core/services/auth.service';

interface ContentSegment {
  text: string;
  isMention: boolean;
  isHashtag: boolean;
  link?: string;
}

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <article class="post-card glass-card animate-fade">
      <div class="content-overlay">
        
        <div class="user-row">
          <a [routerLink]="['/profile', post.userId]" class="avatar-link">
            <div class="avatar main-av">
              <img *ngIf="post.user?.avatarUrl" [src]="post.user?.avatarUrl">
              <span *ngIf="!post.user?.avatarUrl">{{ post.user?.userName?.[0]?.toUpperCase() }}</span>
            </div>
          </a>
          <div class="user-meta">
            <a [routerLink]="['/profile', post.userId]" class="fullname">{{ post.user?.userName }}</a>
            <span class="timestamp">{{ post.createdAt | date:'MMM d' }}</span>
          </div>
          <div class="spacer"></div>
          <button class="more-btn" *ngIf="isOwn && !isPreview" (click)="menuOpen.set(!menuOpen())">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
          </button>
          <div *ngIf="menuOpen() && !isPreview" class="menu-dropdown animate-fade">
            <button (click)="deletePost()" class="btn glass pill danger-btn">DELETE POST</button>
          </div>
        </div>

        
        <div class="post-body">
          <p class="post-text" [class.large-text]="!post.mediaUrl && post.content.length < 80">
            <ng-container *ngFor="let seg of getSegments(post.content)">
              <a *ngIf="seg.isMention" [routerLink]="['/profile-by-username', seg.text.substring(1)]" class="mention-link">{{ seg.text }}</a>
              <a *ngIf="seg.isHashtag" [routerLink]="['/explore']" [queryParams]="{tag: seg.text.substring(1)}" class="hashtag-link">{{ seg.text }}</a>
              <span *ngIf="!seg.isMention && !seg.isHashtag">{{ seg.text }}</span>
            </ng-container>
          </p>
          <div *ngIf="post.hashtags" class="tags">
            <span *ngFor="let tag of getHashtags()" class="tag">#{{ tag }}</span>
          </div>
        </div>

        
        <div *ngIf="post.mediaUrl" class="media-container">
          <img *ngIf="post.mediaType !== 1" [src]="post.mediaUrl" class="media-img">
          <video *ngIf="post.mediaType === 1" [src]="post.mediaUrl" controls class="media-video"></video>
        </div>

        
        <div class="action-bar glass pill" *ngIf="!isPreview">
          <button class="act-btn" (click)="toggleLike()" [class.active]="liked()">
            <svg viewBox="0 0 24 24" [attr.fill]="liked() ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span class="count">{{ likeCount() }}</span>
          </button>
          <button class="act-btn" (click)="toggleComments()" [class.active]="showComments()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="count">{{ post.commentCount }}</span>
          </button>
          <button class="act-btn" (click)="repost()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <span class="count">{{ post.shareCount }}</span>
          </button>
        </div>
      </div>

      
      <div *ngIf="showComments()" class="comments-drawer">
        <div *ngIf="commentsLoading()" class="page-loader"><div class="spinner"></div></div>
        
        <div *ngFor="let c of comments()" class="comment-item">
          <div class="c-row">
            <a [routerLink]="['/profile', c.userId]" class="c-av-link">
              <div class="avatar c-av">
                <img *ngIf="c.user?.avatarUrl" [src]="c.user?.avatarUrl">
                <span *ngIf="!c.user?.avatarUrl">{{ c.user?.userName?.[0]?.toUpperCase() }}</span>
              </div>
            </a>
            <div class="c-body">
              <div class="c-header">
                <a [routerLink]="['/profile', c.userId]" class="c-user">{{ c.user?.userName }}</a>
                <span class="c-time">{{ c.createdAt | date:'shortTime' }}</span>
              </div>
              <p class="c-txt">
                <ng-container *ngFor="let seg of getSegments(c.content)">
                  <a *ngIf="seg.isMention" [routerLink]="['/profile-by-username', seg.text.substring(1)]" class="mention-link">{{ seg.text }}</a>
                  <a *ngIf="seg.isHashtag" [routerLink]="['/explore']" [queryParams]="{tag: seg.text.substring(1)}" class="hashtag-link">{{ seg.text }}</a>
                  <span *ngIf="!seg.isMention && !seg.isHashtag">{{ seg.text }}</span>
                </ng-container>
              </p>
              
              <div class="c-actions">
                <button class="c-act btn glass pill mini" (click)="toggleCommentLike(c)" [class.active]="c.isLiked">
                  <svg viewBox="0 0 24 24" [attr.fill]="c.isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span>{{ c.likeCount || 0 }}</span>
                </button>
                <button class="c-act btn glass pill mini" (click)="replyTo.set(c.commentId)">REPLY</button>
                <button *ngIf="c.replyCount" class="c-act btn glass pill mini" (click)="toggleReplies(c)">
                  {{ showRepliesMap[c.commentId] ? 'HIDE REPLIES' : 'VIEW ' + c.replyCount + ' REPLIES' }}
                </button>
              </div>

              
              <div *ngIf="replyTo() === c.commentId" class="c-input-row mini animate-fade">
                <input [(ngModel)]="replyContent" placeholder="REPLY TO {{ c.user?.userName?.toUpperCase() }}..." (keyup.enter)="addReply(c)">
                <button (click)="addReply(c)">SEND</button>
              </div>

              
              <div *ngIf="showRepliesMap[c.commentId]" class="replies-list">
                <div *ngFor="let r of repliesMap[c.commentId]" class="c-row reply-row">
                  <a [routerLink]="['/profile', r.userId]" class="c-av-link">
                    <div class="avatar c-av mini">
                      <img *ngIf="r.user?.avatarUrl" [src]="r.user?.avatarUrl">
                      <span *ngIf="!r.user?.avatarUrl">{{ r.user?.userName?.[0]?.toUpperCase() }}</span>
                    </div>
                  </a>
                  <div class="c-body">
                    <div class="c-header">
                      <a [routerLink]="['/profile', r.userId]" class="c-user">{{ r.user?.userName }}</a>
                    </div>
                    <p class="c-txt">
                      <ng-container *ngFor="let seg of getSegments(r.content)">
                        <a *ngIf="seg.isMention" [routerLink]="['/profile-by-username', seg.text.substring(1)]" class="mention-link">{{ seg.text }}</a>
                        <a *ngIf="seg.isHashtag" [routerLink]="['/explore']" [queryParams]="{tag: seg.text.substring(1)}" class="hashtag-link">{{ seg.text }}</a>
                        <span *ngIf="!seg.isMention && !seg.isHashtag">{{ seg.text }}</span>
                      </ng-container>
                    </p>
                    <div class="c-actions">
                      <button class="c-act" (click)="toggleCommentLike(r)" [class.active]="r.isLiked">
                        <svg viewBox="0 0 24 24" [attr.fill]="r.isLiked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <span>{{ r.likeCount || 0 }}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div class="c-input-row glass animate-fade">
          <input [(ngModel)]="newComment" placeholder="ADD A COMMENT..." (keyup.enter)="addComment()">
          <button class="btn primary pill" [disabled]="!newComment.trim()" (click)="addComment()">SEND</button>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .post-card { 
      padding: 0;
      border: none;
      background: none;
      max-width: 600px;
      margin: 0 auto;
      transition: var(--transition);
      &:hover { 
        transform: translateY(-6px);
        .content-overlay {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
      }
    }
    .content-overlay { 
      padding: 24px; display: flex; flex-direction: column; gap: 20px; 
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      backdrop-filter: var(--glass-blur);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
      transition: var(--transition);
      @media (max-width: 640px) { padding: 16px; gap: 16px; border-radius: 20px; }
    }
    .user-row { display: flex; align-items: center; gap: 14px; @media (max-width: 640px) { gap: 10px; } }
    .main-av { width: 48px; height: 48px; border: 2px solid rgba(255, 255, 255, 0.1); @media (max-width: 640px) { width: 40px; height: 40px; } }
    .user-meta { display: flex; flex-direction: column; gap: 2px; }
    .fullname { font-weight: 800; font-size: 16px; color: var(--text); letter-spacing: -0.01em; &:hover { color: var(--text2); } @media (max-width: 640px) { font-size: 14px; } }
    .timestamp { font-size: 12px; color: var(--text3); font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; @media (max-width: 640px) { font-size: 10px; } }
    .spacer { flex: 1; }
    .more-btn { color: var(--text3); padding: 8px; border-radius: 50%; &:hover { background: var(--surface2); color: var(--text); } svg { width: 20px; } }
    
    .menu-dropdown { 
      position: absolute; right: 16px; top: 64px; padding: 8px; 
      background: rgba(20, 20, 20, 0.9); backdrop-filter: blur(30px);
      border: 1px solid var(--border-sub); border-radius: 16px; z-index: 10; 
      box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    }
    .danger-btn { color: #FF3B30; font-size: 11px; font-weight: 800; padding: 12px 24px; &:hover { background: rgba(255, 59, 48, 0.1); } }
    
    .post-text { font-size: 17px; line-height: 1.5; color: var(--text); white-space: pre-wrap; letter-spacing: -0.01em; @media (max-width: 640px) { font-size: 15px; } }
    .large-text { font-size: 32px; font-weight: 800; line-height: 1.2; color: #FFFFFF; letter-spacing: -0.04em; @media (max-width: 640px) { font-size: 24px; } }
    
    .tags { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
    .tag { font-size: 14px; font-weight: 700; color: var(--text3); &:hover { color: var(--text); } @media (max-width: 640px) { font-size: 12px; } }
    
    .media-container { border-radius: var(--radius-md); overflow: hidden; margin-top: 4px; border: 1px solid var(--border); box-shadow: var(--shadow); @media (max-width: 640px) { border-radius: 12px; } }
    .media-img, .media-video { width: 100%; max-height: 600px; object-fit: cover; display: block; @media (max-width: 640px) { max-height: 400px; } }
    
    .action-bar { 
      display: flex; gap: 4px; padding: 6px; border-radius: 100px; width: fit-content; margin-top: 8px; 
      background: rgba(255, 255, 255, 0.08); border: 1px solid var(--border); 
      @media (max-width: 640px) { width: 100%; justify-content: space-around; }
    }
    .act-btn { 
      display: flex; align-items: center; justify-content: center; gap: 10px; padding: 10px 24px; 
      font-size: 14px; font-weight: 700; color: var(--text3); border-radius: 100px;
      transition: var(--transition);
      @media (max-width: 640px) { padding: 8px 12px; font-size: 12px; gap: 6px; }
      &:hover { background: rgba(255, 255, 255, 0.1); color: var(--text); } 
      &.active { color: #FF375F; svg { fill: #FF375F; stroke: #FF375F; } } 
      svg { width: 18px; height: 18px; stroke-width: 2.5; @media (max-width: 640px) { width: 16px; height: 16px; } } 
    }

    .mention-link { color: #0A84FF; font-weight: 700; &:hover { text-decoration: underline; } }
    .hashtag-link { color: #5E5CE6; font-weight: 700; &:hover { text-decoration: underline; } }

    .comments-drawer { 
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
      margin: 0 16px 16px; padding: 24px; 
      display: flex; flex-direction: column; gap: 20px; 
      border-radius: var(--radius-lg);
      backdrop-filter: blur(20px);
      box-shadow: inset 0 0 20px rgba(0,0,0,0.2);
      @media (max-width: 640px) { margin: 0 8px 8px; padding: 16px; gap: 16px; border-radius: 16px; }
    }
    .comment-item { display: flex; flex-direction: column; gap: 12px; border-bottom: 1px solid var(--border-sub); padding-bottom: 20px; &:last-child { border: none; padding: 0; } }
    .c-row { display: flex; gap: 14px; @media (max-width: 640px) { gap: 10px; } }
    .c-av { width: 32px; height: 32px; border: 1px solid rgba(255, 255, 255, 0.1); @media (max-width: 640px) { width: 28px; height: 28px; } }
    .c-body { flex: 1; min-width: 0; }
    .c-header { display: flex; align-items: center; gap: 10px; margin-bottom: 4px; }
    .c-user { font-weight: 800; font-size: 14px; color: var(--text); @media (max-width: 640px) { font-size: 13px; } }
    .c-time { font-size: 11px; color: var(--text3); font-weight: 600; text-transform: uppercase; }
    .c-txt { font-size: 15px; color: var(--text2); line-height: 1.5; @media (max-width: 640px) { font-size: 14px; } }
    .c-actions { display: flex; gap: 12px; margin-top: 12px; @media (max-width: 640px) { gap: 8px; } }
    .c-act { 
      font-size: 10px; font-weight: 800; color: var(--text3); border-radius: 100px;
      &.active { color: #FF375F; }
      &.btn.glass { padding: 6px 14px; background: rgba(255, 255, 255, 0.05); @media (max-width: 640px) { padding: 4px 10px; } }
    }

    .c-input-row {
      display: flex; gap: 12px; margin-top: 16px; padding: 6px; border-radius: 100px;
      background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-sub);
      align-items: center;
      input { flex: 1; padding: 12px 20px; border: none; background: none; color: #FFFFFF; font-size: 14px; font-weight: 500; min-width: 0; &:focus { outline: none; } @media (max-width: 640px) { padding: 10px 16px; font-size: 13px; } }
      button { padding: 0 24px; font-size: 11px; font-weight: 800; letter-spacing: 0.05em; height: 40px; border-radius: 100px; flex-shrink: 0; @media (max-width: 640px) { padding: 0 16px; height: 34px; font-size: 10px; } }
      &.mini { margin-top: 12px; background: rgba(255, 255, 255, 0.03); }
    }
    .replies-list { display: flex; flex-direction: column; gap: 0; margin-top: 20px; border-left: 2px solid var(--border-sub); padding-left: 24px; @media (max-width: 640px) { padding-left: 16px; } }

  `]
})
export class PostCardComponent implements OnInit {
  @Input() post!: Post;
  @Input() isPreview = false;
  liked = signal(false);
  likeCount = signal(0);
  showComments = signal(false);
  comments = signal<Comment[]>([]);
  commentsLoading = signal(false);
  menuOpen = signal(false);
  newComment = '';
  replyTo = signal<number | null>(null);
  replyContent = '';
  
  repliesMap: Record<number, Comment[]> = {};
  showRepliesMap: Record<number, boolean> = {};
  originalPost?: Post;

  get isOwn() { return this.post.userId === this.auth.userId; }

  constructor(
    private likeService: LikeService, 
    private commentService: CommentService, 
    private postService: PostService, 
    private userService: UserService, 
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.liked.set(this.post.isLiked ?? false);
    this.likeCount.set(this.post.likeCount ?? 0);
    
    if (this.isPreview) return;
    
    if (this.post.isLiked === undefined || !this.post.isLiked) {
      this.likeService.hasLiked(this.post.postId, 'POST').subscribe(res => {
        if (res.data) this.liked.set(true);
      });
    }

    if (this.post.originalPostId) {
      this.postService.getById(this.post.originalPostId).subscribe(res => { this.originalPost = res.data; });
    }
  }

  getHashtags() { return this.post.hashtags?.split(',').map(t => t.trim().replace(/^#/, '')).filter(Boolean) ?? []; }

  getSegments(content: string): ContentSegment[] {
    if (!content) return [];
    const tokens = content.split(/(\s+)/);
    return tokens.map(token => {
      const isMention = /^@\w+/.test(token);
      const isHashtag = /^#\w+/.test(token);
      return { text: token, isMention, isHashtag };
    });
  }

  toggleComments() {
    this.showComments.set(!this.showComments());
    if (this.showComments() && this.comments().length === 0) this.loadComments();
  }

  toggleLike() {
    const prev = this.liked(); const prevCount = this.likeCount();
    this.liked.set(!prev); this.likeCount.set(prevCount + (prev ? -1 : 1));
    this.likeService.toggle(this.post.postId, 'POST').subscribe(res => {
      const l = typeof res.data === 'boolean' ? res.data : !prev;
      this.liked.set(l); this.likeCount.set(l ? prevCount + 1 : prevCount - 1);
    }, () => { this.liked.set(prev); this.likeCount.set(prevCount); });
  }

  loadComments() {
    this.commentsLoading.set(true);
    this.commentService.getByPost(this.post.postId).subscribe(res => { 
      this.fetchCommentUsers(res.data); 
      
      res.data.forEach(c => {
        this.likeService.hasLiked(c.commentId, 'COMMENT').subscribe(lRes => {
          if (lRes.data) c.isLiked = true;
        });
      });
    }, () => { this.comments.set([]); this.commentsLoading.set(false); });
  }

  addComment() {
    if (!this.newComment.trim()) return;
    this.commentService.add(this.post.postId, this.newComment).subscribe(res => {
      this.comments.set([{ ...res.data, user: this.auth.currentUser() as any }, ...this.comments()]);
      this.newComment = '';
      this.post.commentCount++;
    });
  }

  toggleCommentLike(c: Comment) {
    const prev = c.isLiked;
    c.isLiked = !prev;
    c.likeCount = (c.likeCount || 0) + (prev ? -1 : 1);
    this.likeService.toggle(c.commentId, 'COMMENT').subscribe(res => {
      c.isLiked = typeof res.data === 'boolean' ? res.data : !prev;
    }, () => {
      c.isLiked = prev;
      c.likeCount = (c.likeCount || 0) + (prev ? 1 : -1);
    });
  }

  toggleReplies(c: Comment) {
    const cid = c.commentId;
    this.showRepliesMap[cid] = !this.showRepliesMap[cid];
    if (this.showRepliesMap[cid] && (!this.repliesMap[cid] || this.repliesMap[cid].length === 0)) {
      this.commentService.getReplies(cid).subscribe(res => {
        this.fetchReplyUsers(res.data, cid);
        
        res.data.forEach(r => {
          this.likeService.hasLiked(r.commentId, 'COMMENT').subscribe(lRes => {
            if (lRes.data) r.isLiked = true;
          });
        });
      });
    }
  }

  addReply(parent: Comment) {
    if (!this.replyContent.trim()) return;
    this.commentService.add(this.post.postId, this.replyContent, parent.commentId).subscribe(res => {
      const newReply = { ...res.data, user: this.auth.currentUser() as any };
      this.repliesMap[parent.commentId] = [newReply, ...(this.repliesMap[parent.commentId] || [])];
      parent.replyCount++;
      this.showRepliesMap[parent.commentId] = true;
      this.replyContent = '';
      this.replyTo.set(null);
    });
  }

  private fetchCommentUsers(comments: Comment[]) {
    const ids = [...new Set(comments.map(c => c.userId))];
    const map: Record<number, any> = {};
    let done = 0;
    if (ids.length === 0) { this.comments.set(comments); this.commentsLoading.set(false); return; }
    ids.forEach(uid => {
      this.userService.getById(uid).subscribe({
        next: r => { map[uid] = r.data; },
        complete: () => { done++; if (done === ids.length) { this.comments.set(comments.map(c => ({ ...c, user: map[c.userId] }))); this.commentsLoading.set(false); } },
        error: () => { done++; if (done === ids.length) { this.comments.set(comments.map(c => ({ ...c, user: map[c.userId] }))); this.commentsLoading.set(false); } }
      });
    });
  }

  private fetchReplyUsers(replies: Comment[], parentId: number) {
    const ids = [...new Set(replies.map(c => c.userId))];
    const map: Record<number, any> = {};
    let done = 0;
    if (ids.length === 0) { this.repliesMap[parentId] = replies; return; }
    ids.forEach(uid => {
      this.userService.getById(uid).subscribe({
        next: r => { map[uid] = r.data; },
        complete: () => { done++; if (done === ids.length) { this.repliesMap[parentId] = replies.map(c => ({ ...c, user: map[c.userId] })); } },
        error: () => { done++; if (done === ids.length) { this.repliesMap[parentId] = replies.map(c => ({ ...c, user: map[c.userId] })); } }
      });
    });
  }

  deletePost() { this.postService.delete(this.post.postId).subscribe(() => { this.menuOpen.set(false); }); }

  repost() {
    this.postService.repost(this.post.postId).subscribe(res => {
      this.post.shareCount++;
    });
  }
}
