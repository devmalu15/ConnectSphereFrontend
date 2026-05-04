import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { User } from '../../shared/models/models';
import { AdminService, PostService } from '../../core/services/api.services';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-header">
      <h2 class="page-title">Users</h2>
      <p class="page-sub">Manage platform users</p>
    </div>

    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input class="search-input" [(ngModel)]="search" placeholder="SEARCH USERS…" (input)="filterUsers()">
      </div>
      <div class="filter-btns glass">
        <button class="filter-btn" [class.active-filter]="filter() === 'all'" (click)="setFilter('all')">ALL</button>
        <button class="filter-btn" [class.active-filter]="filter() === 'active'" (click)="setFilter('active')">ACTIVE</button>
        <button class="filter-btn" [class.active-filter]="filter() === 'suspended'" (click)="setFilter('suspended')">SUSPENDED</button>
      </div>
    </div>

    <div *ngIf="loading()" class="page-loader"><div class="spinner"></div></div>

    <div *ngIf="!loading()" class="users-table card">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Posts</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let u of filteredUsers()">
            <td>
              <a [routerLink]="['/profile', u.userId]" class="user-cell">
                <div class="avatar" style="width:32px;height:32px;font-size:12px">
                  <img *ngIf="u.avatarUrl" [src]="u.avatarUrl" style="width:100%;height:100%;border-radius:50%;object-fit:cover">
                  <span *ngIf="!u.avatarUrl">{{ u.userName[0].toUpperCase() }}</span>
                </div>
                <div>
                  <p class="user-name">{{ u.fullName }}</p>
                  <p class="user-handle">&#64;{{ u.userName }}</p>
                </div>
              </a>
            </td>
            <td class="text-sm">{{ u.email }}</td>
            <td>
              <button class="role-btn glass pill" [class.admin]="u.role === 'Admin'" (click)="toggleRole(u)" [title]="u.role === 'Admin' ? 'Demote to User' : 'Promote to Admin'">
                {{ u.role }}
              </button>
            </td>
            <td><span class="status-badge" [class.active]="u.isActive" [class.suspended]="!u.isActive">{{ u.isActive ? 'Active' : 'Suspended' }}</span></td>
            <td class="text-sm">{{ u.postCount }}</td>
            <td class="text-sm text-muted">{{ u.createdAt | date:'MMM d, yyyy' }}</td>
            <td>
              <div class="action-btns">
                <button class="action-icon info" (click)="viewDetails(u)" title="View Details">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
                <button class="action-icon" [class.danger]="u.isActive" [class.success]="!u.isActive" (click)="toggleSuspend(u)" [title]="u.isActive ? 'Suspend' : 'Activate'">
                  <svg *ngIf="u.isActive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                  <svg *ngIf="!u.isActive" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </button>
                <button class="action-icon delete" (click)="confirmDelete(u)" title="Delete User">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="filteredUsers().length === 0" class="empty" style="padding:32px">
        <p>No users found</p>
      </div>

      <div class="pagination" *ngIf="totalPages > 1">
        <button class="btn ghost" [disabled]="page === 1" (click)="loadPage(page - 1)">Previous</button>
        <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
        <button class="btn ghost" [disabled]="page >= totalPages" (click)="loadPage(page + 1)">Next</button>
      </div>
    </div>

    <!-- User Details Modal -->
    <div class="modal-overlay" *ngIf="selectedUser()" (click)="selectedUser.set(null)">
      <div class="detail-card glass animate-slide-up" (click)="$event.stopPropagation()">
        <div class="detail-header">
          <div class="detail-user">
            <div class="avatar lg">
              <img *ngIf="selectedUser()?.avatarUrl" [src]="selectedUser()?.avatarUrl">
              <span *ngIf="!selectedUser()?.avatarUrl">{{ selectedUser()?.userName?.[0]?.toUpperCase() }}</span>
            </div>
            <div>
              <h3>{{ selectedUser()?.fullName }}</h3>
              <p>&#64;{{ selectedUser()?.userName }}</p>
            </div>
          </div>
          <button class="close-btn" (click)="selectedUser.set(null)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <div class="detail-body">
          <div class="info-grid">
            <div class="info-item">
              <label>Email</label>
              <p>{{ selectedUser()?.email }}</p>
            </div>
            <div class="info-item">
              <label>Bio</label>
              <p>{{ selectedUser()?.bio || 'No bio provided' }}</p>
            </div>
            <div class="info-item">
              <label>Join Date</label>
              <p>{{ selectedUser()?.createdAt | date:'longDate' }}</p>
            </div>
            <div class="info-item">
              <label>Role</label>
              <p>{{ selectedUser()?.role }}</p>
            </div>
          </div>

          <div class="activity-section">
            <label>Recent Activity</label>
            <div class="activity-stats">
              <div class="a-stat">
                <span class="a-val">{{ selectedUser()?.postCount || 0 }}</span>
                <span class="a-lbl">Posts</span>
              </div>
              <div class="a-stat">
                <span class="a-val">0</span>
                <span class="a-lbl">Comments</span>
              </div>
              <div class="a-stat">
                <span class="a-val">{{ (selectedUser()?.followerCount || 0) }}</span>
                <span class="a-lbl">Followers</span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-footer">
          <button class="btn glass danger" (click)="confirmDelete(selectedUser()!)">Delete Account</button>
          <button class="btn primary" (click)="selectedUser.set(null)">Close</button>
        </div>
      </div>
    </div>

    
    <div *ngIf="toast()" class="toast">{{ toast() }}</div>
  `,
  styles: [`
    .page-header { margin-bottom: 40px; }
    .page-title { font-size: 32px; font-weight: 900; letter-spacing: -0.03em; color: #FFFFFF; }
    .page-sub { font-size: 12px; font-weight: 800; color: var(--text3); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }
    
    .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
    
    .search-wrap { 
      position: relative; flex: 1; max-width: 400px;
      .search-icon { position: absolute; left: 20px; top: 50%; transform: translateY(-50%); width: 18px; height: 18px; color: var(--text3); }
    }
    
    .search-input { 
      width: 100%; padding: 14px 24px 14px 54px; border-radius: 100px;
      background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-sub);
      color: #FFFFFF; font-size: 13px; font-weight: 700; outline: none;
      transition: var(--transition);
      &::placeholder { color: var(--text3); letter-spacing: 0.05em; text-transform: uppercase; }
      &:focus { border-color: rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.05); }
    }

    .filter-btns { display: flex; gap: 8px; background: rgba(255, 255, 255, 0.03); padding: 6px; border-radius: 100px; border: 1px solid var(--border-sub); }
    .filter-btn {
      padding: 8px 16px; border-radius: 100px; font-size: 11px; font-weight: 800;
      color: var(--text3); transition: var(--transition); letter-spacing: 0.05em;
      &.active-filter { background: #FFFFFF; color: #000; box-shadow: 0 4px 10px rgba(255,255,255,0.1); }
      &:hover:not(.active-filter) { color: #FFFFFF; }
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
    tr:last-child td { border: none; }
    tr:hover td { background: rgba(255, 255, 255, 0.02); }

    .user-cell { 
      display: flex; align-items: center; gap: 14px; 
      .avatar { width: 40px; height: 40px; border: 1px solid rgba(255, 255, 255, 0.1); }
      .user-name { font-size: 14px; font-weight: 800; color: #FFFFFF; }
      .user-handle { font-size: 11px; color: var(--text3); font-weight: 600; margin-top: 2px; }
    }

    .role-btn { 
      padding: 6px 14px; font-size: 10px; font-weight: 800; border: 1px solid var(--border-sub);
      transition: var(--transition);
      &.admin { background: #FFFFFF; color: #000; border-color: #FFFFFF; }
      &:hover:not(.admin) { background: rgba(255, 255, 255, 0.08); border-color: rgba(255, 255, 255, 0.2); }
    }

    .status-badge { 
      display: inline-block; padding: 4px 12px; border-radius: 100px; 
      font-size: 10px; font-weight: 800; letter-spacing: 0.05em; 
      &.active { background: rgba(46,204,113,0.1); color: #2ecc71; } 
      &.suspended { background: rgba(255,59,48,0.1); color: #ff3b30; } 
    }

    .action-icon { 
      width: 32px; height: 32px; border-radius: 8px; 
      display: flex; align-items: center; justify-content: center;
      transition: var(--transition); color: var(--text3);
      svg { width: 16px; height: 16px; }
      &:hover { background: rgba(255, 255, 255, 0.05); color: #FFFFFF; }
      &.info:hover { color: #3498db; background: rgba(52, 152, 219, 0.1); }
      &.danger { color: #ff3b30; &:hover { background: rgba(255,59,48,0.1); } }
      &.success { color: #2ecc71; &:hover { background: rgba(46,204,113,0.1); } }
      &.delete:hover { color: #ff3b30; background: rgba(255,59,48,0.1); }
    }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.8);
      backdrop-filter: blur(8px); z-index: 1000;
      display: flex; align-items: center; justify-content: center; padding: 24px;
    }

    .detail-card {
      width: 100%; max-width: 500px; background: rgba(20, 20, 20, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 32px;
      overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.8);
    }

    .detail-header {
      padding: 32px; display: flex; align-items: flex-start; justify-content: space-between;
      background: linear-gradient(to bottom, rgba(255,255,255,0.03), transparent);
    }

    .detail-user {
      display: flex; align-items: center; gap: 20px;
      .avatar.lg { width: 64px; height: 64px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); font-size: 24px; }
      h3 { font-size: 20px; font-weight: 800; color: #FFFFFF; margin: 0; }
      p { font-size: 13px; color: var(--text3); font-weight: 600; margin-top: 4px; }
    }

    .close-btn { 
      width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      color: var(--text3); &:hover { background: rgba(255, 255, 255, 0.1); color: #FFFFFF; }
      svg { width: 18px; height: 18px; }
    }

    .detail-body { padding: 32px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
    .info-item {
      label { display: block; font-size: 10px; font-weight: 800; color: var(--text3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
      p { font-size: 14px; font-weight: 600; color: #FFFFFF; }
    }

    .activity-section {
      padding-top: 24px; border-top: 1px solid rgba(255, 255, 255, 0.05);
      label { display: block; font-size: 10px; font-weight: 800; color: var(--text3); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
    }

    .activity-stats { display: flex; gap: 32px; }
    .a-stat {
      display: flex; flex-direction: column; gap: 4px;
      .a-val { font-size: 20px; font-weight: 900; color: #FFFFFF; }
      .a-lbl { font-size: 11px; font-weight: 700; color: var(--text3); text-transform: uppercase; }
    }

    .detail-footer {
      padding: 24px 32px; display: flex; justify-content: space-between; align-items: center;
      background: rgba(0,0,0,0.3); border-top: 1px solid rgba(255, 255, 255, 0.05);
    }

    .toast { 
      position: fixed; bottom: 32px; right: 32px; 
      background: #FFFFFF; color: #000; padding: 14px 28px; 
      border-radius: 100px; font-size: 13px; font-weight: 800;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4); z-index: 2000;
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  loading = signal(true);
  search = '';
  filter = signal<'all' | 'active' | 'suspended'>('all');
  page = 1;
  totalPages = 1;
  toast = signal('');
  selectedUser = signal<User | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.loadPage(1); }

  loadPage(p: number) {
    this.page = p;
    this.loading.set(true);
    this.adminService.getUsers(p).subscribe(r => {
      this.users.set(r.data);
      this.filterUsers();
      this.loading.set(false);
    });
  }

  filterUsers() {
    let list = this.users();
    if (this.search) list = list.filter(u => u.userName.toLowerCase().includes(this.search.toLowerCase()) || u.email.toLowerCase().includes(this.search.toLowerCase()));
    if (this.filter() === 'active') list = list.filter(u => u.isActive);
    if (this.filter() === 'suspended') list = list.filter(u => !u.isActive);
    this.filteredUsers.set(list);
  }

  setFilter(f: 'all' | 'active' | 'suspended') { this.filter.set(f); this.filterUsers(); }

  toggleSuspend(u: User) {
    this.adminService.suspend(u.userId).subscribe(() => {
      const updated = { ...u, isActive: !u.isActive };
      this.users.set(this.users().map(x => x.userId === u.userId ? updated : x));
      if (this.selectedUser()?.userId === u.userId) this.selectedUser.set(updated);
      this.filterUsers();
      this.showToast(u.isActive ? 'User suspended' : 'User activated');
    });
  }

  toggleRole(u: User) {
    const newRole = u.role === 'Admin' ? 'User' : 'Admin';
    this.users.set(this.users().map(x => x.userId === u.userId ? { ...x, role: newRole } : x));
    this.filterUsers();
    this.showToast(`User demoted to ${newRole}`);
  }

  confirmDelete(u: User) {
    if (confirm(`Are you sure you want to delete ${u.userName}? This cannot be undone.`)) {
      this.users.set(this.users().filter(x => x.userId !== u.userId));
      this.selectedUser.set(null);
      this.filterUsers();
      this.showToast('User deleted permanently');
    }
  }

  viewDetails(u: User) {
    this.selectedUser.set(u);
  }

  showToast(msg: string) {
    this.toast.set(msg);
    setTimeout(() => this.toast.set(''), 2500);
  }
}
