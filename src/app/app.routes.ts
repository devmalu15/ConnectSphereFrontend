import { Routes } from '@angular/router';
import { authGuard, adminGuard, guestGuard } from './core/guards/guards';

export const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { path: 'login', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: '/auth/register', pathMatch: 'full' },
  { path: 'admin', redirectTo: '/secretadmin/login', pathMatch: 'full' },
  {
    path: 'landing',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent),
    children: [
      { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
      { path: '', redirectTo: 'login', pathMatch: 'full' }
    ]
  },
  {
    path: 'feed',
    canActivate: [authGuard],
    loadComponent: () => import('./features/feed/feed.component').then(m => m.FeedComponent)
  },
  {
    path: 'explore',
    canActivate: [authGuard],
    loadComponent: () => import('./features/explore/explore.component').then(m => m.ExploreComponent)
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
  },
  {
    path: 'profile/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'profile-by-username/:username',
    loadComponent: () => import('./features/profile/profile-redirect.component').then(m => m.ProfileRedirectComponent)
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'post/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/post/post-detail.component').then(m => m.PostDetailComponent)
  },
  
  {
    path: 'secretadmin',
    children: [
      { path: 'login', loadComponent: () => import('./features/admin/admin-login.component').then(m => m.AdminLoginComponent) },
      {
        path: '',
        canActivate: [adminGuard],
        loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
        children: [
          { path: 'users', loadComponent: () => import('./features/admin/admin-users.component').then(m => m.AdminUsersComponent) },
          { path: 'analytics', loadComponent: () => import('./features/admin/admin-analytics.component').then(m => m.AdminAnalyticsComponent) },
          { path: 'posts', loadComponent: () => import('./features/admin/admin-posts.component').then(m => m.AdminPostsComponent) },
          { path: 'audit', loadComponent: () => import('./features/admin/admin-audit.component').then(m => m.AdminAuditComponent) },
          { path: 'broadcast', loadComponent: () => import('./features/admin/admin-broadcast.component').then(m => m.AdminBroadcastComponent) },
          { path: '', redirectTo: 'analytics', pathMatch: 'full' }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '/feed' }
];
