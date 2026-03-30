import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { CreateTaskRequest, WorkTask } from '../../models/task.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);

  /** Cached signals so components reuse the same in-memory list */
  myTasks = signal<WorkTask[]>([]);
  allTasks = signal<WorkTask[]>([]);

  // ─── GET endpoints ─────────────────────────────────────────────────────────

  fetchMyTasks(): Observable<WorkTask[]> {
    return this.http
      .get<WorkTask[]>(`${environment.apiBase}/api/Task/my-tasks`)
      .pipe(tap((tasks) => this.myTasks.set(tasks)));
  }

  fetchAllTasks(): Observable<WorkTask[]> {
    return this.http
      .get<WorkTask[]>(`${environment.apiBase}/api/Task/all-tasks`)
      .pipe(tap((tasks) => this.allTasks.set(tasks)));
  }

  // ─── Mutations ─────────────────────────────────────────────────────────────

  createTask(task: CreateTaskRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${environment.apiBase}/api/Task/create`,
      task
    );
  }

  updateTask(task: WorkTask): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${environment.apiBase}/api/Task/update`,
      task
    );
  }

  updateStatus(
    taskId: number,
    status: string
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${environment.apiBase}/api/Task/update-status/${taskId}`,
      JSON.stringify(status),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  deleteTask(taskId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiBase}/api/Task/delete/${taskId}`
    );
  }

  getUsers(): Observable<import('../../models/task.model').User[]> {
    return this.http.get<import('../../models/task.model').User[]>(
      `${environment.apiBase}/api/Task/users`
    );
  }
}
