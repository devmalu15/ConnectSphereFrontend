import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/api.services';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h2 class="page-title">Analytics</h2>
        <p class="page-sub">Platform overview and statistics</p>
      </div>
      <div class="time-filter glass pill">
        <button class="t-btn" [class.active]="timeRange() === '24h'" (click)="setTimeRange('24h')">24H</button>
        <button class="t-btn" [class.active]="timeRange() === '7d'" (click)="setTimeRange('7d')">7D</button>
        <button class="t-btn" [class.active]="timeRange() === '30d'" (click)="setTimeRange('30d')">30D</button>
      </div>
    </div>

    <div *ngIf="loading()" class="page-loader"><div class="spinner"></div></div>

    <div *ngIf="!loading() && analytics()" class="analytics-grid">
      
      <div class="stat-card card" *ngFor="let s of stats()">
        <div class="stat-main">
          <div class="stat-icon" [style.background]="s.color + '20'" [style.color]="s.color">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" [innerHTML]="s.icon"></svg>
          </div>
          <div *ngIf="s.trend !== undefined" class="stat-trend" [class.up]="s.trend > 0" [class.down]="s.trend < 0">
            {{ s.trend > 0 ? '+' : '' }}{{ s.trend }}%
          </div>
        </div>
        <div class="stat-info">
          <p class="stat-value">{{ s.value | number }}</p>
          <p class="stat-label">{{ s.label }}</p>
        </div>
      </div>
    </div>

    
    <div *ngIf="!loading()" class="charts-row">
      <div class="chart-card card">
        <div class="chart-header">
          <h3 class="chart-title">User Growth</h3>
          <div class="live-pulse">
            <div class="pulse-dot"></div>
            <span>LIVE FEED</span>
          </div>
        </div>
        <div class="chart-bars">
          <div *ngFor="let d of monthlyData()" class="bar-col" [attr.data-val]="d.val">
            <div class="bar-hitbox" [title]="d.label + ': ' + d.val">
              <div class="bar" [style.height.%]="d.pct">
                <div class="bar-glow"></div>
              </div>
            </div>
            <span class="bar-label">{{ d.label }}</span>
          </div>
        </div>
      </div>
      <div class="chart-card card donut-card">
        <h3 class="chart-title">Content Engagement</h3>
        <div class="donut-wrap">
          <svg viewBox="0 0 100 100" class="donut">
            <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="12"/>
            <circle cx="50" cy="50" r="38" fill="none" stroke="var(--accent)" stroke-width="12"
              stroke-linecap="round"
              [attr.stroke-dasharray]="postsPct() + ' ' + (238 - postsPct())"
              stroke-dashoffset="0" transform="rotate(-90 50 50)"/>
          </svg>
          <div class="donut-label">
            <span class="donut-val">{{ postsPct() }}%</span>
            <span class="donut-sub">Active</span>
          </div>
        </div>
        <div class="legend">
          <div class="legend-item">
            <div class="dot-label">
              <span class="dot" style="background:var(--accent)"></span>
              <span>Posts</span>
            </div>
            <span class="legend-val">{{ postsPct() }}%</span>
          </div>
          <div class="legend-item">
            <div class="dot-label">
              <span class="dot" style="background:rgba(255,255,255,0.1)"></span>
              <span>Comments</span>
            </div>
            <span class="legend-val">{{ 100 - postsPct() }}%</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between; }
    .page-title { font-size: 32px; font-weight: 900; letter-spacing: -0.03em; color: #FFFFFF; }
    .page-sub { font-size: 12px; font-weight: 800; color: var(--text3); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 4px; }
    
    .time-filter { display: flex; gap: 4px; padding: 4px; background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-sub); }
    .t-btn { 
      padding: 6px 16px; border-radius: 100px; font-size: 10px; font-weight: 800; color: var(--text3);
      transition: var(--transition);
      &.active { background: #FFFFFF; color: #000; }
      &:hover:not(.active) { color: #FFFFFF; }
    }

    .analytics-grid { 
      display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
      gap: 20px; margin-bottom: 32px; 
    }
    
    .stat-card { 
      padding: 24px; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08);
      transition: var(--transition); background: rgba(255,255,255,0.01);
      &:hover { transform: translateY(-4px); border-color: rgba(255, 255, 255, 0.2); background: rgba(255, 255, 255, 0.03); }
    }
    
    .stat-main { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .stat-icon { 
      width: 48px; height: 48px; border-radius: 14px; 
      display: flex; align-items: center; justify-content: center; 
      svg { width: 20px; height: 20px; } 
    }
    
    .stat-trend {
      font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 100px;
      &.up { background: rgba(46,204,113,0.1); color: #2ecc71; }
      &.down { background: rgba(255,59,48,0.1); color: #ff3b30; }
    }

    .stat-value { font-size: 32px; font-weight: 900; letter-spacing: -0.02em; color: #FFFFFF; }
    .stat-label { font-size: 11px; color: var(--text3); font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase; margin-top: 4px; }
    
    .charts-row { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; @media (max-width: 1024px) { grid-template-columns: 1fr; } }
    
    .chart-card { 
      padding: 32px; border-radius: 28px; 
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: rgba(255,255,255,0.01);
    }
    
    .chart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
    .chart-title { font-size: 12px; font-weight: 800; color: #FFFFFF; letter-spacing: 0.05em; text-transform: uppercase; margin: 0; }
    
    .live-pulse {
      display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800; color: #2ecc71;
      .pulse-dot { width: 6px; height: 6px; background: #2ecc71; border-radius: 50%; box-shadow: 0 0 10px #2ecc71; animation: pulse 2s infinite; }
    }

    @keyframes pulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }

    .chart-bars { display: flex; align-items: flex-end; gap: 12px; height: 200px; padding-top: 16px; }
    .bar-col { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 12px; height: 100%; justify-content: flex-end; }
    .bar-hitbox { width: 100%; cursor: pointer; display: flex; align-items: flex-end; height: 100%; }
    .bar { 
      width: 100%; background: linear-gradient(to top, rgba(255,255,255,0.1), #FFFFFF); border-radius: 6px 6px 0 0; min-height: 4px; 
      transition: height 1s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative; overflow: hidden;
      .bar-glow { position: absolute; top: 0; left: 0; right: 0; height: 20px; background: linear-gradient(to bottom, rgba(255,255,255,0.3), transparent); }
    }
    .bar-label { font-size: 10px; font-weight: 800; color: var(--text3); }
    
    .donut-card { display: flex; flex-direction: column; align-items: center; }
    .donut-wrap { position: relative; width: 180px; height: 180px; margin: 20px 0 40px; }
    .donut { width: 100%; height: 100%; }
    .donut-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .donut-val { font-size: 32px; font-weight: 900; color: #FFFFFF; }
    .donut-sub { font-size: 10px; font-weight: 800; color: var(--text3); letter-spacing: 0.05em; text-transform: uppercase; }
    
    .legend { width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 20px; background: rgba(255, 255, 255, 0.03); border-radius: 20px; }
    .legend-item { display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: var(--text2); }
    .dot-label { display: flex; align-items: center; gap: 10px; }
    .dot { width: 10px; height: 10px; border-radius: 3px; }
    .legend-val { font-weight: 800; color: #FFFFFF; }
  `]
})
export class AdminAnalyticsComponent implements OnInit {
  analytics = signal<any>(null);
  loading = signal(true);
  stats = signal<any[]>([]);
  monthlyData = signal<{ label: string; pct: number; val: number }[]>([]);
  postsPct = signal(65);
  timeRange = signal<'24h' | '7d' | '30d'>('7d');

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.adminService.getAnalytics().subscribe({
      next: r => {
        this.analytics.set(r.data);
        this.buildStats(r.data);
        this.buildCharts(r.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.buildStats({ totalUsers: 1450, totalPosts: 8900, totalComments: 4500, totalLikes: 24000, activeUsers: 850, newUsersToday: 42 });
        this.buildCharts({});
      }
    });
  }

  setTimeRange(r: '24h' | '7d' | '30d') {
    this.timeRange.set(r);
    this.refresh();
  }

  buildStats(d: any) {
    this.stats.set([
      { label: 'Total Users', value: d.totalUsers ?? 0, trend: d.userTrend, color: '#3498db', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>' },
      { label: 'Total Posts', value: d.totalPosts ?? 0, trend: d.postTrend, color: '#2ecc71', icon: '<rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>' },
      { label: 'Comments', value: d.totalComments ?? 0, trend: d.commentTrend, color: '#9b59b6', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
      { label: 'Total Likes', value: d.totalLikes ?? 0, trend: d.likeTrend, color: '#e74c3c', icon: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>' },
      { label: 'Active Users', value: d.activeUsers ?? 0, trend: d.activeTrend, color: '#f39c12', icon: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>' },
      { label: 'Engagement', value: d.engagementRate ?? 0, trend: d.engagementTrend, color: '#1abc9c', icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>' },
    ]);
    if (d.totalPosts && d.totalPosts + d.totalComments > 0) {
      this.postsPct.set(Math.round((d.totalPosts / (d.totalPosts + d.totalComments)) * 100));
    }
  }

  buildCharts(d: any) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const data = d.monthlyGrowth || [];
    const maxVal = Math.max(...data.map((x: any) => x.val || 0)) || 1000;
    this.monthlyData.set(
      months.map((label, i) => {
        const val = data[i]?.val || 0;
        return { label, pct: Math.round((val / maxVal) * 100), val };
      })
    );
  }
}
