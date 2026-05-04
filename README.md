# ConnectSphere Frontend

Angular 17 frontend for the ConnectSphere social media platform.

## Features

- **Feed** — Personal feed, suggested posts, trending posts with infinite scroll
- **Explore** — Search posts, users, browse by hashtag
- **Post creation** — Media upload with **live aspect ratio preview** (1:1, 4:5, 16:9, 9:16) and auto-detection
- **Profile** — View/edit profile, followers/following, pending follow requests
- **Notifications** — Real-time notifications, mark read, accept/reject follow requests
- **Post detail** — Full comment thread with replies, likes, edit/delete
- **Settings** — Edit profile, change avatar, toggle privacy, change password
- **Dark/Light mode** — Persistent theme toggle
- **Mobile responsive** — Bottom nav, mobile-optimized layouts
- **Admin Panel** — Hidden at `/secretadmin`
  - Analytics dashboard with charts
  - User management (suspend/activate, filter, search)
  - Broadcast notifications to all or specific users
  - Audit log viewer with before/after diff

## Setup

```bash
npm install
ng serve
```

## Environment

Edit `src/environments/environment.ts`:

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5096',      // Ocelot Gateway URL
  adminApiUrl: 'http://localhost:5158'  // Admin API direct (if needed)
};
```

## Routes

| Path | Description |
|---|---|
| `/auth/login` | User login |
| `/auth/register` | User registration |
| `/feed` | Home feed |
| `/explore` | Search & explore |
| `/notifications` | Notifications |
| `/profile/:id` | User profile |
| `/post/:id` | Post detail & comments |
| `/settings` | Account settings |
| `/secretadmin/login` | Admin login (hidden) |
| `/secretadmin` | Admin dashboard |
| `/secretadmin/users` | User management |
| `/secretadmin/analytics` | Analytics |
| `/secretadmin/broadcast` | Broadcast notifications |
| `/secretadmin/audit` | Audit logs |

## Architecture

```
src/app/
├── core/
│   ├── guards/         # auth, admin, guest guards
│   ├── interceptors/   # JWT attach + 401 refresh
│   └── services/       # auth, theme, all API services
├── features/
│   ├── auth/           # login, register
│   ├── feed/           # home feed
│   ├── explore/        # search & explore
│   ├── notifications/  # notification center
│   ├── post/           # post detail + comments
│   ├── profile/        # profile + settings
│   └── admin/          # admin panel (hidden route)
└── shared/
    ├── components/     # sidenav, post-card, create-post-modal
    └── models/         # TypeScript interfaces
```

## Tech Stack

- Angular 17 (standalone components)
- Angular Router (lazy loading)
- Angular Signals (state management)
- SCSS with CSS custom properties (theming)
- No third-party UI library — fully custom minimalist design
