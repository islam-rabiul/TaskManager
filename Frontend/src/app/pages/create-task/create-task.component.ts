import { Component, inject, signal, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TaskService } from '../../core/services/task.service';
import { ToastService } from '../../core/services/toast.service';
import { CreateTaskRequest, TaskPriority, TaskStatus, User } from '../../models/task.model';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="fade-in">
      <div class="section-header">
        <h1 class="section-title">Create Task</h1>
        <p class="section-sub">Assign a new task to a team member.</p>
      </div>

      <div class="form-card glass-card">
        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()">
          <div class="form-grid">

            <div class="form-group">
              <label class="form-label" for="ct-title">Task Title *</label>
              <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <input class="form-input" id="ct-title" type="text" placeholder="Enter task title" formControlName="title" />
              </div>
              @if (f['title'].invalid && f['title'].touched) {
                <span class="field-error">Title is required.</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="ct-priority">Priority *</label>
              <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/><path d="M13 13l6 6"/></svg>
                <select class="form-input form-select" id="ct-priority" formControlName="priority">
                  <option value="" disabled>Select priority</option>
                  <option value="Low">🟢 Low</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="High">🔴 High</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="ct-due">Due Date *</label>
              <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                <input class="form-input" id="ct-due" type="date" formControlName="dueDate" />
              </div>
              @if (f['dueDate'].invalid && f['dueDate'].touched) {
                <span class="field-error">Due date is required.</span>
              }
            </div>

            <div class="form-group">
              <label class="form-label" for="ct-user">Assign To *</label>
              <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <select class="form-input form-select" id="ct-user" formControlName="assignedToUserId">
                  <option [value]="null" disabled>{{ usersLoading() ? 'Loading users...' : 'Select team member' }}</option>
                  @for (u of users(); track u.userId) {
                    <option [value]="u.userId">{{ u.fullName }}</option>
                  }
                </select>
              </div>
              @if (f['assignedToUserId'].invalid && f['assignedToUserId'].touched) {
                <span class="field-error">Assignment is required.</span>
              }
            </div>

            <div class="form-group form-full">
              <label class="form-label" for="ct-desc">Description</label>
              <textarea class="form-input form-textarea no-icon" id="ct-desc" placeholder="Describe the task in detail…" formControlName="description"></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" for="ct-status">Initial Status</label>
              <div class="input-wrap">
                <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <select class="form-input form-select" id="ct-status" formControlName="status">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          @if (error()) {
            <div class="alert alert-error" style="margin-bottom:20px">{{ error() }}</div>
          }
          @if (successMsg()) {
            <div class="alert alert-success" style="margin-bottom:20px">{{ successMsg() }}</div>
          }

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="taskForm.reset({status:'Pending'})">Reset</button>
            <button type="submit" class="btn btn-primary" [disabled]="loading() || usersLoading()">
              @if (loading()) { <span class="spinner"></span> } Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-card { max-width: 720px; padding: 36px; }
    .form-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 20px; margin-bottom: 24px;
    }
    .form-full { grid-column: 1 / -1; }
    .form-actions { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
    .field-error { font-size: 12px; color: #fca5a5; margin-top: 4px; }
    @media (max-width: 600px) {
      .form-grid { grid-template-columns: 1fr; }
      .form-card { padding: 24px 16px; }
    }
  `],
})
export class CreateTaskComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private taskSvc = inject(TaskService);
  private toast   = inject(ToastService);

  loading      = signal(false);
  usersLoading = signal(true);
  error        = signal('');
  successMsg   = signal('');
  users        = signal<User[]>([]);

  taskForm = this.fb.nonNullable.group({
    title:            ['', Validators.required],
    description:      [''],
    priority:         ['' as TaskPriority, Validators.required],
    dueDate:          ['', Validators.required],
    status:           ['Pending' as TaskStatus],
    assignedToUserId: [null as unknown as number, [Validators.required, Validators.min(1)]],
  });

  get f() { return this.taskForm.controls; }

  ngOnInit(): void {
    this.taskSvc.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.usersLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load team members');
        this.usersLoading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid) { this.taskForm.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');
    this.successMsg.set('');

    const payload = this.taskForm.getRawValue() as unknown as CreateTaskRequest;
    this.taskSvc.createTask(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMsg.set('🎉 Task created successfully!');
        this.taskForm.reset({ status: 'Pending', assignedToUserId: null as any });
        this.toast.success('Task created!');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message || 'Failed to create task');
        this.toast.error('Failed to create task');
      },
    });
  }
}
