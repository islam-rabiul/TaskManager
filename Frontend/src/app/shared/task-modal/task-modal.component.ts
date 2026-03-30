import {
  Component,
  inject,
  input,
  output,
  computed,
  signal,
  OnInit,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkTask, TaskStatus, TaskPriority, User } from '../../models/task.model';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="modal-overlay" (click)="onOverlayClick($event)">
      <div class="modal-box glass-card" id="modal-box">
        <button class="modal-close btn-icon" (click)="closed.emit()">✕</button>

        <div class="modal-header">
          @if (!isEditing()) {
            <span class="badge badge-{{ priorityKey() }}">{{ task().priority }}</span>
            <h2 class="modal-title">{{ task().title }}</h2>
            <div class="modal-meta">
              <span class="badge badge-{{ statusKey() }}">{{ task().status }}</span>
              <span>📅 {{ formatDate(task().dueDate) }}{{ isOverdue() ? ' ⚠️ Overdue' : '' }}</span>
              @if (task().assignedToUserId) {
                <span>👤 {{ assignedToName() }}</span>
              }
            </div>
          } @else {
            <h2 class="modal-title">Edit Task</h2>
          }
        </div>

        <div class="modal-body">
          @if (!isEditing()) {
            <p class="modal-desc">{{ task().description || 'No description provided.' }}</p>

            <div class="modal-status-section">
              <label class="form-label">Update Status</label>
              <div class="status-pills">
                @for (s of statuses; track s.value) {
                  <button
                    class="status-pill"
                    [class.active]="task().status === s.value"
                    [disabled]="updating()"
                    (click)="changeStatus(s.value)">
                    {{ s.icon }} {{ s.label }}
                  </button>
                }
              </div>
            </div>

            <div class="modal-actions">
              @if (auth.isManager) {
                <button class="btn btn-secondary" (click)="toggleEdit()">
                  ✏️ Edit Details
                </button>
              }
              @if (auth.isAdmin) {
                <button class="btn btn-danger" [disabled]="deleting()" (click)="onDelete()">
                  @if (deleting()) { <span class="spinner"></span> }
                  🗑 Delete Task
                </button>
              }
            </div>
          } @else {
            <!-- EDIT FORM -->
            <form [formGroup]="editForm" (ngSubmit)="onSave()" class="edit-form">
              <div class="form-group">
                <label class="form-label">Title</label>
                <input class="form-input" formControlName="title" />
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Priority</label>
                  <select class="form-input form-select" formControlName="priority">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Due Date</label>
                  <input class="form-input" type="date" formControlName="dueDate" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Assign To</label>
                <select class="form-input form-select" formControlName="assignedToUserId">
                  @for (u of users(); track u.userId) {
                    <option [value]="u.userId">{{ u.fullName }}</option>
                  }
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-input form-textarea" formControlName="description"></textarea>
              </div>

              <div class="modal-actions">
                <button type="button" class="btn btn-secondary" (click)="toggleEdit()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="saving()">
                  @if (saving()) { <span class="spinner"></span> } Save Changes
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,.7); backdrop-filter: blur(8px);
      z-index: 500;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      animation: fadeIn .2s ease;
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .modal-box {
      width: 100%; max-width: 540px; padding: 36px; position: relative;
      animation: modalIn .3s var(--spring);
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(.9) translateY(20px); }
      to   { opacity: 1; transform: scale(1) translateY(0); }
    }
    .modal-close {
      position: absolute; top: 16px; right: 16px;
      width: 32px; height: 32px;
      background: rgba(255,255,255,.07); border: 1px solid var(--glass-border);
      border-radius: 50%; color: var(--text-secondary);
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      font-size: 14px; transition: background var(--transition), color var(--transition);
    }
    .modal-close:hover { background: rgba(255,255,255,.14); color: var(--text-primary); }
    .modal-header { margin-bottom: 24px; }
    .modal-title { font-size: 22px; font-weight: 700; line-height: 1.3; margin: 10px 0; }
    .modal-meta { display: flex; gap: 12px; flex-wrap: wrap; font-size: 13px; color: var(--text-secondary); align-items: center; }
    .modal-desc {
      font-size: 14px; color: var(--text-secondary); line-height: 1.7;
      padding: 16px; background: rgba(255,255,255,.03);
      border: 1px solid var(--glass-border); border-radius: var(--radius-md);
      margin-bottom: 24px; min-height: 60px;
    }
    .modal-status-section { margin-bottom: 24px; }
    .status-pills { display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap; }
    .status-pill {
      padding: 8px 18px; border-radius: 20px;
      border: 1px solid var(--glass-border);
      background: rgba(255,255,255,.04);
      color: var(--text-secondary);
      font-family: inherit; font-size: 13px; font-weight: 500;
      cursor: pointer; transition: all var(--transition);
    }
    .status-pill:hover:not(:disabled) { background: var(--accent-dim); border-color: var(--accent); color: var(--accent-light); }
    .status-pill.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent-light); font-weight: 600; }
    .modal-actions { display: flex; gap: 12px; }
    
    .edit-form { display: flex; flex-direction: column; gap: 16px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    @media (max-width: 600px) { .modal-box { padding: 24px; } .form-row { grid-template-columns: 1fr; } }
  `],
})
export class TaskModalComponent implements OnInit {
  task    = input.required<WorkTask>();
  closed  = output<void>();
  updated = output<void>();
  deleted = output<void>();

  taskSvc = inject(TaskService);
  auth    = inject(AuthService);
  toast   = inject(ToastService);
  fb      = inject(FormBuilder);

  isEditing = signal(false);
  updating  = signal(false);
  deleting  = signal(false);
  saving    = signal(false);
  users     = signal<User[]>([]);

  editForm = this.fb.nonNullable.group({
    title:            ['', Validators.required],
    description:      [''],
    priority:         ['Low' as TaskPriority, Validators.required],
    dueDate:          ['', Validators.required],
    assignedToUserId: [0, [Validators.required, Validators.min(1)]],
  });

  readonly statuses: { value: TaskStatus; label: string; icon: string }[] = [
    { value: 'Pending',     label: 'Pending',     icon: '🕐' },
    { value: 'In Progress', label: 'In Progress',  icon: '🔄' },
    { value: 'Completed',   label: 'Completed',   icon: '✅' },
  ];

  priorityKey = computed(() => this.task().priority || 'Low');
  statusKey   = computed(() => {
    const s = this.task().status;
    return s === 'Pending' ? 'pending' : s === 'In Progress' ? 'progress' : 'completed';
  });
  isOverdue   = computed(() =>
    !!this.task().dueDate &&
    new Date(this.task().dueDate) < new Date() &&
    this.task().status !== 'Completed'
  );

  assignedToName = computed(() => {
    const t = this.task() as any;
    return t.assignedToName || `User #${t.assignedToUserId}`;
  });

  ngOnInit(): void {
    if (this.auth.isManager) {
      this.taskSvc.getUsers().subscribe(users => this.users.set(users));
    }
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      this.isEditing.set(false);
    } else {
      const t = this.task();
      this.editForm.patchValue({
        title: t.title,
        description: t.description,
        priority: t.priority,
        dueDate: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : '',
        assignedToUserId: t.assignedToUserId
      });
      this.isEditing.set(true);
    }
  }

  onSave(): void {
    if (this.editForm.invalid) return;
    this.saving.set(true);
    const updatedTask: WorkTask = {
      ...this.task(),
      ...this.editForm.getRawValue()
    };

    this.taskSvc.updateTask(updatedTask).subscribe({
      next: () => {
        this.toast.success('Task updated successfully');
        this.updated.emit();
        this.isEditing.set(false);
        this.saving.set(false);
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to update task');
        this.saving.set(false);
      }
    });
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
      this.closed.emit();
    }
  }

  changeStatus(newStatus: TaskStatus): void {
    if (this.updating() || newStatus === this.task().status) return;
    this.updating.set(true);
    this.taskSvc.updateStatus(this.task().taskId, newStatus).subscribe({
      next: () => {
        this.toast.success(`Status → "${newStatus}"`);
        this.updated.emit();
        this.updating.set(false);
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to update status');
        this.updating.set(false);
      },
    });
  }

  onDelete(): void {
    if (!confirm(`Delete "${this.task().title}"? This cannot be undone.`)) return;
    this.deleting.set(true);
    this.taskSvc.deleteTask(this.task().taskId).subscribe({
      next: () => {
        this.toast.info('Task deleted.');
        this.deleted.emit();
        this.deleting.set(false);
      },
      error: (err) => {
        this.toast.error(err?.error?.message || 'Failed to delete task');
        this.deleting.set(false);
      },
    });
  }

  formatDate(d: string): string {
    if (!d) return '—';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '—';
    return dt.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
