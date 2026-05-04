import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse, PagedResult, Post, Comment, Notification, User, FeedItem, AuditLog } from '../../shared/models/models';
import { Observable } from 'rxjs';

const API = environment.apiUrl;
const ADMIN_API = environment.adminApiUrl;

type LikeTargetType = 'POST' | 'COMMENT' | 'USER';

@Injectable({ providedIn: 'root' })
export class PostService {
  constructor(private http: HttpClient) {}

  create(formData: FormData) {
    return this.http.post<ApiResponse<Post>>(`${API}/api/posts`, formData);
  }
  getById(id: number) {
    return this.http.get<ApiResponse<Post>>(`${API}/api/posts/${id}`);
  }
  getByUser(userId: number, page = 1, pageSize = 12) {
    return this.http.get<ApiResponse<PagedResult<Post>>>(`${API}/api/posts/user/${userId}?page=${page}&pageSize=${pageSize}`);
  }
  getPublic(page = 1, pageSize = 12) {
    return this.http.get<ApiResponse<PagedResult<Post>>>(`${API}/api/posts/public?page=${page}&pageSize=${pageSize}`);
  }
  getTrending() {
    return this.http.get<ApiResponse<Post[]>>(`${API}/api/posts/trending`);
  }
  search(q: string) {
    return this.http.get<ApiResponse<Post[]>>(`${API}/api/posts/search?q=${q}`);
  }
  getByHashtag(tag: string) {
    return this.http.get<ApiResponse<Post[]>>(`${API}/api/posts/hashtag/${tag}`);
  }
  update(id: number, body: { content?: string; visibility?: number; hashtags?: string }) {
    return this.http.put<ApiResponse<Post>>(`${API}/api/posts/${id}`, body);
  }
  delete(id: number) {
    return this.http.delete<ApiResponse<string>>(`${API}/api/posts/${id}`);
  }
  repost(id: number) {
    return this.http.post<ApiResponse<Post>>(`${API}/api/posts/${id}/repost`, {});
  }
  getMentionedPosts(page = 1, pageSize = 12) {
    return this.http.get<ApiResponse<PagedResult<Post>>>(`${API}/api/posts/mentions?page=${page}&pageSize=${pageSize}`);
  }
}




@Injectable({ providedIn: 'root' })
export class FeedService {
  constructor(private http: HttpClient) {}

  getFeed(userId: number, page = 1, pageSize = 10) {
    return this.http.get<ApiResponse<PagedResult<FeedItem>>>(
      `${API}/api/feed/${userId}?page=${page}&pageSize=${pageSize}`
    );
  }

  getSuggested(userId: number, page = 1) {
    return this.http.get<ApiResponse<FeedItem[]>>(
      `${API}/api/feed/suggested/${userId}?page=${page}&pageSize=10`
    );
  }

  getExplore(userId: number) {
    return this.http.get<ApiResponse<FeedItem[]>>(
      `${API}/api/feed/explore/${userId}`
    );
  }

  getTrendingHashtags(topN = 10) {
    return this.http.get<ApiResponse<string[]>>(
      `${API}/api/feed/trending-hashtags?topN=${topN}`
    );
  }

  invalidateCache(userId: number) {
    return this.http.delete<ApiResponse<string>>(`${API}/api/feed/${userId}/cache`);
  }
}


@Injectable({ providedIn: 'root' })
export class FollowService {
  constructor(private http: HttpClient) {}

  follow(followeeId: number) {
    return this.http.post<ApiResponse<any>>(`${API}/api/follows`, { followeeId });
  }
  unfollow(followeeId: number) {
    return this.http.delete<ApiResponse<string>>(`${API}/api/follows/${followeeId}`);
  }
  removeFollower(ownerId: number, followerId: number) {
    return this.http.delete<ApiResponse<string>>(`${API}/api/follows/${ownerId}/followers/${followerId}`);
  }
  accept(id: number) {
    return this.http.put<ApiResponse<string>>(`${API}/api/follows/${id}/accept`, {});
  }
  reject(id: number) {
    return this.http.put<ApiResponse<string>>(`${API}/api/follows/${id}/reject`, {});
  }
  getFollowers(userId: number) {
    return this.http.get<ApiResponse<number[]>>(`${API}/api/follows/${userId}/followers`);
  }
  getFollowing(userId: number) {
    return this.http.get<ApiResponse<number[]>>(`${API}/api/follows/${userId}/following`);
  }
  getPending(userId: number) {
    return this.http.get<ApiResponse<any[]>>(`${API}/api/follows/${userId}/pending`);
  }
  isFollowing(followeeId: number) {
    return this.http.get<ApiResponse<boolean>>(`${API}/api/follows/is-following/${followeeId}`);
  }
}

@Injectable({ providedIn: 'root' })
export class LikeService {
  constructor(private http: HttpClient) {}

  private normalizeTargetType(type: LikeTargetType) {
    switch (type) {
      case 'POST': return 0;
      case 'COMMENT': return 1;
      case 'USER': return 2;
    }
  }

  toggle(targetId: number, targetType: LikeTargetType) {
    return this.http.post<ApiResponse<boolean>>(
      `${API}/api/likes/toggle`,
      { targetId, targetType: this.normalizeTargetType(targetType) }
    );
  }

  hasLiked(targetId: number, targetType: LikeTargetType) {
    return this.http.get<ApiResponse<boolean>>(
      `${API}/api/likes/has/${targetId}/${this.normalizeTargetType(targetType)}`
    );
  }

  getCount(targetId: number, targetType: LikeTargetType) {
    return this.http.get<ApiResponse<number>>(
      `${API}/api/likes/count/${targetId}/${this.normalizeTargetType(targetType)}`
    );
  }
}

@Injectable({ providedIn: 'root' })
export class CommentService {
  constructor(private http: HttpClient) {}

  add(postId: number, content: string, parentCommentId?: number) {
    return this.http.post<ApiResponse<Comment>>(`${API}/api/comments`, { postId, content, parentCommentId });
  }
  getByPost(postId: number) {
    return this.http.get<ApiResponse<Comment[]>>(`${API}/api/comments/post/${postId}`);
  }
  getReplies(commentId: number) {
    return this.http.get<ApiResponse<Comment[]>>(`${API}/api/comments/${commentId}/replies`);
  }
  edit(id: number, content: string) {
    return this.http.put<ApiResponse<Comment>>(`${API}/api/comments/${id}`, { content });
  }
  delete(id: number) {
    return this.http.delete<ApiResponse<string>>(`${API}/api/comments/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class NotifService {
  constructor(private http: HttpClient) {}

  getAll(userId: number, page = 1) {
    return this.http.get<ApiResponse<PagedResult<Notification>>>(`${API}/api/notifications/${userId}?page=${page}&pageSize=20`);
  }
  getUnreadCount(userId: number) {
    return this.http.get<ApiResponse<number>>(`${API}/api/notifications/${userId}/unread-count`);
  }
  markRead(id: number) {
    return this.http.put<ApiResponse<string>>(`${API}/api/notifications/${id}/read`, {});
  }
  markAllRead(userId: number) {
    return this.http.put<ApiResponse<string>>(`${API}/api/notifications/${userId}/read-all`, {});
  }
  delete(id: number) {
    return this.http.delete<ApiResponse<string>>(`${API}/api/notifications/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private http: HttpClient) {}

  getById(id: number) {
    return this.http.get<ApiResponse<User>>(`${API}/api/users/${id}`);
  }
  search(q: string) {
    return this.http.get<ApiResponse<User[]>>(`${API}/api/users/search?q=${q}`);
  }
  getSuggested(userId: number) {
    return this.http.get<ApiResponse<User[]>>(`${API}/api/users/${userId}/suggested`);
  }
  getByUsername(username: string) {
    return this.http.get<ApiResponse<User>>(`${API}/api/users/username/${username}`);
  }
  updateProfile(userId: number, formData: FormData) {
    return this.http.put<ApiResponse<User>>(`${API}/api/users/${userId}/profile`, formData);
  }
  changePassword(userId: number, dto: any) {
    return this.http.put<ApiResponse<string>>(`${API}/api/users/${userId}/password`, dto);
  }
  togglePrivacy(userId: number) {
    return this.http.put<ApiResponse<string>>(`${API}/api/users/${userId}/privacy`, {});
  }
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getUsers(page = 1) {
    return this.http.get<ApiResponse<User[]>>(`${API}/api/admin/users?page=${page}&pageSize=20`);
  }
  suspend(userId: number) {
    return this.http.put<ApiResponse<string>>(`${API}/api/admin/users/${userId}/suspend`, {});
  }
  getAllPosts(page = 1) {
    return this.http.get<ApiResponse<PagedResult<Post>>>(`${API}/api/admin/posts?page=${page}&pageSize=20`);
  }
  deletePost(postId: number) {
    return this.http.delete<ApiResponse<string>>(`${API}/api/admin/posts/${postId}`);
  }
  deleteComment(commentId: number) {
    return this.http.delete<ApiResponse<string>>(`${API}/api/admin/comments/${commentId}`);
  }
  getAnalytics() {
    return this.http.get<ApiResponse<any>>(`${API}/api/admin/analytics`);
  }
  broadcast(title: string, message: string, userIds: number[], type: string) {
    return this.http.post<ApiResponse<string>>(`${API}/api/admin/notifications/broadcast`, { title, message, userIds, type });
  }
  getAuditLogs(from?: string, to?: string, page = 1) {
    let params = new HttpParams().set('page', page).set('pageSize', 20);
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<ApiResponse<PagedResult<AuditLog>>>(`${API}/api/admin/audit-logs`, { params });
  }
}