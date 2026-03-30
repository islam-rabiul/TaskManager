import { Routes } from '@angular/router';
import { authGuard, guestGuard, managerGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./pages/auth/auth.component').then((m) => m.AuthComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      { path: '', redirectTo: 'tasks', pathMatch: 'full' },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./pages/tasks/tasks.component').then(
            (m) => m.TasksComponent
          ),
      },
      {
        path: 'create-task',
        canActivate: [managerGuard],
        loadComponent: () =>
          import('./pages/create-task/create-task.component').then(
            (m) => m.CreateTaskComponent
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'auth' },
];
