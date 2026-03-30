import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { WorkTask, TaskStatus } from '../../models/task.model';
import { TaskCardComponent } from '../../shared/task-card/task-card.component';
import { TaskModalComponent } from '../../shared/task-modal/task-modal.component';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [FormsModule, TaskCardComponent, TaskModalComponent],
  template: `
    <div class="fade-in">
      <div class="section-header">
        <h1 class="section-title">{{ isTeamView() ? 'Team Tasks' : 'My Tasks' }}</h1>
        <p class="section-sub">{{ isTeamView() ? 'Overview of all organization tasks.' : 'Tasks currently assigned to you.' }}</p>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          @for (f of filters; track f.value) {
            <button class="filter-btn" [class.active]="activeFilter() === f.value" (click)="activeFilter.set(f.value)">
              {{ f.label }}
            </button>
          }
        </div>
        
        <div style="display:flex; gap: 12px; align-items:center;">
          @if (auth.isManager) {
            <button class="filter-btn team-toggle" [class.active]="isTeamView()" (click)="toggleView()">
              {{ isTeamView() ? '👤 Show Only Mine' : '👥 Show Team View' }}
            </button>
          }

          <div class="search-wrap">
            <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="search-input" type="text" placeholder="Search..." [(ngModel)]="searchQuery" />
          </div>
        </div>
      </div>

      @if (loading()) {
        <div style="display:flex;align-items:center;gap:10px;padding:32px 0;color:var(--text-secondary)">
          <span class="spinner"></span> Loading tasks…
        </div>
      } @else if (filtered().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No tasks found</h3>
          <p>Try adjusting your filters or search query.</p>
        </div>
      } @else {
        <div class="task-grid">
          @for (t of filtered(); track t.taskId) {
            <app-task-card [task]="t" [showAssignee]="isTeamView()" (cardClick)="openModal($event)" />
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
    .team-toggle.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent-light); }
  `]
})
export class TasksComponent implements OnInit {
  private taskSvc = inject(TaskService);
  auth            = inject(AuthService);
  private toast   = inject(ToastService);

  loading      = signal(true);
  isTeamView   = signal(false);
  activeFilter = signal<string>('all');
  searchQuery  = '';
  selectedTask = signal<WorkTask | null>(null);

  readonly filters = [
    { value: 'all',         label: 'All' },
    { value: 'Pending',     label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed',   label: 'Completed' },
  ];

  filtered = computed(() => {
    let tasks = this.isTeamView() ? this.taskSvc.allTasks() : this.taskSvc.myTasks();
    
    if (this.activeFilter() !== 'all') {
      tasks = tasks.filter((t) => t.status === (this.activeFilter() as TaskStatus));
    }
    
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      tasks = tasks.filter((t) =>
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }
    return tasks;
  });

  ngOnInit(): void {
    this.reload();
  }

  toggleView() {
    this.isTeamView.set(!this.isTeamView());
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    const obs = this.isTeamView() ? this.taskSvc.fetchAllTasks() : this.taskSvc.fetchMyTasks();
    obs.subscribe({
      next:  ()  => this.loading.set(false),
      error: ()  => { this.loading.set(false); this.toast.error('Failed to load tasks'); },
    });
  }

  openModal(t: WorkTask) { this.selectedTask.set(t); }
  closeModal()           { this.selectedTask.set(null); }
}
