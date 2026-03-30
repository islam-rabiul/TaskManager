export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface WorkTask {
  taskId: number;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string; // ISO date string
  status: TaskStatus;
  assignedToUserId: number;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  assignedToUserId: number;
}

export interface User {
  userId: number;
  fullName: string;
  email: string;
  roleId: number;
}
