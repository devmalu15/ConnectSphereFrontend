export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages?: number;
}

export interface User {
  userId: number;
  userName: string;
  fullName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  isPrivate: boolean;
  isActive: boolean;
  followerCount: number;
  followingCount: number;
  postCount: number;
  role: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface Post {
  postId: number;
  userId: number;
  content: string;
  mediaUrl?: string;
  mediaType?: number; 
  visibility: number; 
  likeCount: number;
  commentCount: number;
  shareCount: number;
  hashtags?: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
  
  user?: User;
  isLiked?: boolean;
  originalPostId?: number;
  originalPost?: Post;
}

export interface Comment {
  commentId: number;
  postId: number;
  userId: number;
  parentCommentId?: number;
  content: string;
  likeCount: number;
  replyCount: number;
  isDeleted: boolean;
  isEdited: boolean;
  createdAt: string;
  editedAt?: string;
  user?: User;
  isLiked?: boolean;
}

export interface Notification {
  notificationId: number;
  recipientId?: number;
  actorId?: number;
  type?: string | number;
  message?: string;
  targetId?: number;
  targetType?: string | number;
  actorName?: string;
  isRead: boolean;
  createdAt: string;

  
  
  actor?: User;

  
  targetPost?: Post;
}

export interface FeedItem {
  feedItemId: number;
  userId: number;
  postId: number;
  actorId: number;
  score: number;
  createdAt: string;
}

export interface AuditLog {
  auditLogId: number;
  actorId: number;
  actorUserName: string;
  action: string;
  entityType: string;
  entityId: string;
  beforeValue?: string;
  afterValue?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken?: string;
  token?: string;
  refreshToken: string;
  userId?: number;
  id?: number;
  userName?: string;
  role?: string;
  user?: User;
}