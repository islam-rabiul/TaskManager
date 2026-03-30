import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { WorkTask } from '../../models/task.model';
import { TaskModalComponent } from '../../shared/task-modal/task-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TaskModalComponent],
  template: `
    <div class="fade-in">
      <div class="section-header">
        <h1 class="section-title">Overview</h1>
        <p class="section-sub">Here's what's happening with your tasks today.</p>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #6366f1, #818cf8)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ stats().total }}</div>
            <div class="stat-label">Total Tasks</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #fbbf24)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ stats().pending }}</div>
            <div class="stat-label">Pending</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6, #60a5fa)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ stats().inProgress }}</div>
            <div class="stat-label">In Progress</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #34d399)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div>
            <div class="stat-value">{{ stats().completed }}</div>
            <div class="stat-label">Completed</div>
          </div>
        </div>
      </div>

      <!-- Recent Tasks -->
      <h2 class="sub-heading">Recent Tasks</h2>
      @if (loading()) {
        <div style="display:flex;align-items:center;gap:10px;padding:20px 0;color:var(--text-secondary)">
          <span class="spinner"></span> Loading tasks…
        </div>
      } @else if (recentTasks().length === 0) {
        <p style="color:var(--text-muted);font-size:14px;">No tasks yet.</p>
      } @else {
        <div class="task-row-list">
          @for (t of recentTasks(); track t.taskId) {
            <div class="task-row" (click)="openModal(t)">
              <span class="task-dot priority-{{ t.priority }}"></span>
              <span class="task-row-title">{{ t.title }}</span>
              <span class="badge badge-{{ statusKey(t.status) }}">{{ t.status }}</span>
              <span class="task-row-due">{{ formatDate(t.dueDate) }}</span>
            </div>
          }
        </div>
      }
    </div>

    @if (selectedTask()) {
      <app-task-modal
        [task]="selectedTask()!"
        (closed)="closeModal()"
        (updated)="reload()"
        (deleted)="closeModal(); reload()" />
    }
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px; margin-bottom: 32px;
    }
    .stat-card {
      background: var(--bg-card); border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg); padding: 22px;
      display: flex; align-items: center; gap: 18px;
      transition: border-color var(--transition), transform var(--transition);
    }
    .stat-card:hover { border-color: var(--glass-border-hover); transform: translateY(-2px); }
    .stat-icon {
      width: 50px; height: 50px; border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      color: #fff; flex-shrink: 0; box-shadow: 0 4px 16px rgba(0,0,0,.3);
    }
    .stat-value { font-size: 28px; font-weight: 800; line-height: 1; }
    .stat-label { font-size: 12px; color: var(--text-secondary); margin-top: 4px; font-weight: 500; }

    .sub-heading { font-size: 18px; font-weight: 700; margin-bottom: 14px; }
    .task-row-list { display: flex; flex-direction: column; gap: 10px; }
    .task-row {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 18px;
      background: var(--bg-card); border: 1px solid var(--glass-border);
      border-radius: var(--radius-md); cursor: pointer;
      transition: background var(--transition), border-color var(--transition);
    }
    .task-row:hover { background: var(--bg-card-hover); border-color: var(--glass-border-hover); }
    .task-dot {
      width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
      background: var(--accent);
    }
    .task-dot.priority-High   { background: var(--danger); }
    .task-dot.priority-Medium { background: var(--warning); }
    .task-dot.priority-Low    { background: var(--success); }
    .task-row-title { flex: 1; font-size: 14px; font-weight: 500; }
    .task-row-due   { font-size: 12px; color: var(--text-muted); }
  `],
})
export class DashboardComponent implements OnInit {
  private taskSvc = inject(TaskService);
  private auth    = inject(AuthService);
  private toast   = inject(ToastService);

  loading     = signal(true);
  selectedTask = signal<WorkTask | null>(null);

  private source = computed(() =>
    this.auth.isManager ? this.taskSvc.allTasks() : this.taskSvc.myTasks()
  );

  stats = computed(() => {
    const tasks = this.source();
    return {
      total:      tasks.length,
      pending:    tasks.filter((t) => t.status === 'Pending').length,
      inProgress: tasks.filter((t) => t.status === 'In Progress').length,
      completed:  tasks.filter((t) => t.status === 'Completed').length,
    };
  });

  recentTasks = computed(() => this.source().slice(0, 5));

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    const obs = this.auth.isManager
      ? this.taskSvc.fetchAllTasks()
      : this.taskSvc.fetchMyTasks();

    obs.subscribe({
      next: ()  => this.loading.set(false),
      error: (e) => { this.loading.set(false); this.toast.error('Failed to load tasks'); },
    });
  }

  openModal(t: WorkTask)  { this.selectedTask.set(t); }
  closeModal()            { this.selectedTask.set(null); }

  statusKey(s: string): string {
    return s === 'Pending' ? 'pending' : s === 'In Progress' ? 'progress' : 'completed';
  }
  formatDate(d: string): string {
    if (!d) return '—';
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? '—' : dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
