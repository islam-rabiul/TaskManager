import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { ToastService } from '../../core/services/toast.service';
import { WorkTask, TaskStatus } from '../../models/task.model';
import { TaskCardComponent } from '../../shared/task-card/task-card.component';
import { TaskModalComponent } from '../../shared/task-modal/task-modal.component';

@Component({
  selector: 'app-all-tasks',
  standalone: true,
  imports: [FormsModule, TaskCardComponent, TaskModalComponent],
  template: `
    <div class="fade-in">
      <div class="section-header">
        <h1 class="section-title">All Tasks</h1>
        <p class="section-sub">Manage all tasks across the organisation.</p>
      </div>

      <div class="filter-bar">
        <div class="filter-group">
          @for (f of filters; track f.value) {
            <button class="filter-btn" [class.active]="activeFilter() === f.value" (click)="activeFilter.set(f.value)">
              {{ f.label }}
            </button>
          }
        </div>
        <div class="search-wrap">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="search-input" type="text" placeholder="Search tasks…" [(ngModel)]="searchQuery" id="all-tasks-search" />
        </div>
      </div>

      @if (loading()) {
        <div style="display:flex;align-items:center;gap:10px;padding:32px 0;color:var(--text-secondary)">
          <span class="spinner"></span> Loading all tasks…
        </div>
      } @else if (filtered().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>No tasks found</h3>
          <p>No tasks match this filter.</p>
        </div>
      } @else {
        <div class="task-grid">
          @for (t of filtered(); track t.taskId) {
            <app-task-card [task]="t" [showAssignee]="true" (cardClick)="openModal($event)" />
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
})
export class AllTasksComponent implements OnInit {
  private taskSvc = inject(TaskService);
  private toast   = inject(ToastService);

  loading      = signal(true);
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
    let tasks = this.taskSvc.allTasks();
    if (this.activeFilter() !== 'all')
      tasks = tasks.filter((t) => t.status === (this.activeFilter() as TaskStatus));
    if (this.searchQuery.trim())
      tasks = tasks.filter((t) =>
        t.title?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    return tasks;
  });

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading.set(true);
    this.taskSvc.fetchAllTasks().subscribe({
      next:  ()  => this.loading.set(false),
      error: ()  => { this.loading.set(false); this.toast.error('Failed to load tasks'); },
    });
  }

  openModal(t: WorkTask) { this.selectedTask.set(t); }
  closeModal()           { this.selectedTask.set(null); }
}
