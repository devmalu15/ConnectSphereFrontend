import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLog } from '../../shared/models/models';
import { AdminService } from '../../core/services/api.services';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2 class="page-title">Audit Logs</h2>
      <p class="page-sub">Track all admin and system actions</p>
    </div>

    <div class="toolbar">
      <div class="date-filters">
        <div class="date-field">
          <label class="field-label">FROM</label>
          <input type="date" [(ngModel)]="fromDate">
        </div>
        <div class="date-field">
          <label class="field-label">TO</label>
          <input type="date" [(ngModel)]="toDate">
        </div>
        <div class="filter-actions">
          <button class="btn primary pill" (click)="loadLogs(1)">FILTER</button>
          <button class="btn ghost pill" (click)="clearFilters()">CLEAR</button>
        </div>
      </div>
      <div class="action-filter-wrap">
        <input class="action-filter-input" [(ngModel)]="actionFilter" placeholder="FILTER BY ACTION…" (input)="filterLogs()">
      </div>
    </div>

    <div *ngIf="loading()" class="page-loader"><div class="spinner"></div></div>

    <div *ngIf="!loading()" class="logs-table card">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Actor</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Entity ID</th>
            <th>IP</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let log of filteredLogs()" (click)="selectedLog.set(log)" class="log-row" [class.selected]="selectedLog()?.auditLogId === log.auditLogId">
            <td class="text-xs text-muted">{{ log.createdAt | date:'MMM d, HH:mm:ss' }}</td>
            <td>
              <span class="actor-name">{{ log.actorUserName }}</span>
              <span class="actor-id text-xs text-muted">#{{ log.actorId }}</span>
            </td>
            <td><span class="action-badge" [ngClass]="getActionClass(log.action)">{{ log.action }}</span></td>
            <td class="text-sm">{{ log.entityType }}</td>
            <td class="text-sm text-muted">{{ log.entityId }}</td>
            <td class="text-xs text-muted">{{ log.ipAddress || '–' }}</td>
            <td>
              <button *ngIf="log.beforeValue || log.afterValue" class="detail-btn" (click)="selectedLog.set(log); $event.stopPropagation()">
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <div *ngIf="filteredLogs().length === 0" class="empty" style="padding:32px"><p>No logs found</p></div>

      <div class="pagination">
        <button class="btn ghost" [disabled]="page === 1" (click)="loadLogs(page - 1)">Previous</button>
        <span class="page-info">Page {{ page }}</span>
        <button class="btn ghost" [disabled]="!hasMore()" (click)="loadLogs(page + 1)">Next</button>
      </div>
    </div>

    
    <div *ngIf="selectedLog() && (selectedLog()?.beforeValue || selectedLog()?.afterValue)" class="modal-overlay" (click)="selectedLog.set(null)">
      <div class="modal card" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>Log Detail — {{ selectedLog()?.action }}</h3>
          <button (click)="selectedLog.set(null)" style="color:var(--text2)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div *ngIf="selectedLog()?.beforeValue" class="diff-section">
            <p class="diff-label">Before</p>
            <pre class="diff-content before">{{ selectedLog()?.beforeValue }}</pre>
          </div>
          <div *ngIf="selectedLog()?.afterValue" class="diff-section">
            <p class="diff-label">After</p>
            <pre class="diff-content after">{{ selectedLog()?.afterValue }}</pre>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 40px; }
    .page-title { font-size: 32px; font-weight: 900; letter-spacing: -0.03em; color: #FFFFFF; }
    .page-sub { font-size: 12px; font-weight: 800; color: var(--text3); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }
    
    .toolbar { display: flex; align-items: flex-end; justify-content: space-between; gap: 24px; margin-bottom: 32px; flex-wrap: wrap; }
    .date-filters { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
    
    .date-field { 
      display: flex; flex-direction: column; gap: 8px; 
      input { 
        padding: 12px 16px; border-radius: 12px; background: rgba(255, 255, 255, 0.03); 
        border: 1px solid var(--border-sub); color: #FFFFFF; font-size: 13px; font-weight: 700;
        &:focus { border-color: rgba(255, 255, 255, 0.2); }
      }
    }
    
    .field-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text3); }
    
    .filter-actions { display: flex; gap: 8px; }
    .action-filter-wrap { width: 240px; position: relative; }
    .action-filter-input {
      width: 100%; padding: 12px 16px; border-radius: 100px;
      background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-sub);
      color: #FFFFFF; font-size: 13px; font-weight: 700; outline: none;
      &::placeholder { color: var(--text3); letter-spacing: 0.05em; text-transform: uppercase; }
    }

    .logs-table { 
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
    .log-row { cursor: pointer; transition: var(--transition); &:hover td { background: rgba(255, 255, 255, 0.02); } &.selected td { background: rgba(255, 255, 255, 0.05); } }
    
    .actor-name { font-size: 14px; font-weight: 800; color: #FFFFFF; }
    .actor-id { display: block; font-size: 10px; color: var(--text3); font-weight: 700; margin-top: 2px; }
    
    .action-badge { 
      display: inline-block; padding: 4px 12px; border-radius: 100px; 
      font-size: 10px; font-weight: 800; letter-spacing: 0.05em; background: rgba(255, 255, 255, 0.05); color: var(--text2);
      &.create { background: rgba(46,204,113,0.1); color: #2ecc71; }
      &.delete { background: rgba(255,59,48,0.1); color: #ff3b30; }
      &.update { background: rgba(52,152,219,0.1); color: #3498db; }
      &.suspend { background: rgba(243,156,18,0.1); color: #f39c12; }
    }

    .detail-btn { 
      font-size: 11px; font-weight: 800; color: #FFFFFF; background: rgba(255, 255, 255, 0.1);
      padding: 6px 14px; border-radius: 100px; transition: var(--transition);
      &:hover { background: #FFFFFF; color: #000; }
    }

    .pagination { display: flex; align-items: center; justify-content: center; gap: 24px; padding: 32px; }
    
    .modal-overlay { 
      position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(20px);
      display: flex; align-items: center; justify-content: center; z-index: 200; padding: 24px; 
    }
    .modal { 
      width: 100%; max-width: 640px; border-radius: 32px; overflow: hidden;
      background: rgba(20, 20, 20, 0.95); border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 40px 80px rgba(0,0,0,0.6);
    }
    .modal-header { 
      display: flex; justify-content: space-between; align-items: center; padding: 24px 32px; 
      border-bottom: 1px solid rgba(255, 255, 255, 0.05); 
      h3 { font-size: 18px; font-weight: 900; letter-spacing: -0.01em; color: #FFFFFF; }
    }
    .modal-body { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
    .diff-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text3); margin-bottom: 12px; }
    .diff-content { 
      font-size: 12px; padding: 20px; border-radius: 16px; white-space: pre-wrap; 
      word-break: break-all; font-family: 'JetBrains Mono', monospace; line-height: 1.6;
      &.before { background: rgba(255,59,48,0.05); color: #ff3b30; border: 1px solid rgba(255,59,48,0.1); } 
      &.after { background: rgba(46,204,113,0.05); color: #2ecc71; border: 1px solid rgba(46,204,113,0.1); } 
    }
  `]
})
export class AdminAuditComponent implements OnInit {
  logs = signal<AuditLog[]>([]);
  filteredLogs = signal<AuditLog[]>([]);
  loading = signal(true);
  hasMore = signal(false);
  page = 1;
  fromDate = '';
  toDate = '';
  actionFilter = '';
  selectedLog = signal<AuditLog | null>(null);

  constructor(private adminService: AdminService) {}

  ngOnInit() { this.loadLogs(1); }

  loadLogs(p: number) {
    this.page = p;
    this.loading.set(true);
    this.adminService.getAuditLogs(this.fromDate || undefined, this.toDate || undefined, p).subscribe({
      next: r => {
        this.logs.set(r.data.items);
        this.hasMore.set(r.data.page * r.data.pageSize < r.data.totalCount);
        this.filterLogs();
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterLogs() {
    const f = this.actionFilter.toLowerCase();
    this.filteredLogs.set(f ? this.logs().filter(l => l.action.toLowerCase().includes(f) || l.entityType.toLowerCase().includes(f)) : this.logs());
  }

  clearFilters() { this.fromDate = ''; this.toDate = ''; this.actionFilter = ''; this.loadLogs(1); }

  getActionClass(action: string): string {
    const a = action.toLowerCase();
    if (a.includes('create') || a.includes('add')) return 'action-badge create';
    if (a.includes('delete') || a.includes('remove')) return 'action-badge delete';
    if (a.includes('update') || a.includes('edit')) return 'action-badge update';
    if (a.includes('suspend') || a.includes('ban')) return 'action-badge suspend';
    return 'action-badge';
  }
}
