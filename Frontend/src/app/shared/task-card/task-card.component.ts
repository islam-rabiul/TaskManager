import {
  Component,
  inject,
  input,
  output,
  computed,
} from '@angular/core';
import { WorkTask } from '../../models/task.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-task-card',
  standalone: true,
  template: `
    <div class="task-card priority-{{ priorityKey() }}" (click)="cardClick.emit(task())">
      <div class="tc-header">
        <h3 class="tc-title">{{ task().title || 'Untitled' }}</h3>
        <span class="badge badge-{{ priorityKey() }}">{{ task().priority }}</span>
      </div>

      @if (task().description) {
        <p class="tc-desc">{{ task().description }}</p>
      }

      <div class="tc-meta">
        <span class="badge badge-{{ statusKey() }}">{{ task().status }}</span>
        <span class="tc-due" [class.overdue]="isOverdue()">
          📅 {{ formatDate(task().dueDate) }}{{ isOverdue() ? ' ⚠️' : '' }}
        </span>
      </div>

      @if (showAssignee()) {
        <div class="tc-assignee">👤 User #{{ task().assignedToUserId }}</div>
      }
    </div>
  `,
  styles: [`
    .task-card {
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-left: 3px solid var(--accent);
      border-radius: var(--radius-lg);
      padding: 20px;
      cursor: pointer;
      transition: border-color var(--transition), transform var(--transition), box-shadow var(--transition);
    }
    .task-card:hover {
      border-color: var(--glass-border-hover);
      transform: translateY(-3px);
      box-shadow: 0 8px 32px rgba(0,0,0,.3);
    }
    .priority-High   { border-left-color: var(--danger); }
    .priority-Medium { border-left-color: var(--warning); }
    .priority-Low    { border-left-color: var(--success); }
    .tc-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; }
    .tc-title { flex: 1; font-size: 15px; font-weight: 600; color: var(--text-primary); line-height: 1.3; }
    .tc-desc {
      font-size: 13px; color: var(--text-secondary); line-height: 1.5;
      margin-bottom: 14px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .tc-meta { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
    .tc-due  { font-size: 12px; color: var(--text-muted); }
    .tc-due.overdue { color: #fca5a5; }
    .tc-assignee { font-size: 12px; color: var(--text-muted); margin-top: 10px; }
  `],
})
export class TaskCardComponent {
  task         = input.required<WorkTask>();
  showAssignee = input(false);
  cardClick    = output<WorkTask>();

  priorityKey = computed(() =>
    (this.task().priority as string) || 'Low'
  );

  statusKey = computed(() => {
    const s = this.task().status;
    if (s === 'Pending')     return 'pending';
    if (s === 'In Progress') return 'progress';
    if (s === 'Completed')   return 'completed';
    return 'pending';
  });

  isOverdue = computed(() => {
    if (!this.task().dueDate) return false;
    return (
      new Date(this.task().dueDate) < new Date() &&
      this.task().status !== 'Completed'
    );
  });

  formatDate(d: string): string {
    if (!d) return '—';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '—';
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
