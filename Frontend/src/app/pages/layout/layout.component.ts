import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <!-- Sidebar Overlay (mobile) -->
    <div
      class="sidebar-overlay"
      [class.visible]="sidebarOpen()"
      (click)="sidebarOpen.set(false)">
    </div>

    <!-- Sidebar -->
    <aside class="sidebar" [class.open]="sidebarOpen()">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
            </svg>
          </div>
          <span class="logo-text">TaskFlow</span>
        </div>
        <button class="btn-icon sidebar-close" (click)="sidebarOpen.set(false)">✕</button>
      </div>

      <div class="user-card">
        <div class="avatar">{{ initials() }}</div>
        <div class="user-info">
          <div class="user-name">{{ auth.currentUser()?.fullName }}</div>
          <span class="role-badge" [class]="roleClass()">{{ auth.roleName }}</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a class="nav-item" routerLink="/dashboard/tasks" routerLinkActive="active" (click)="sidebarOpen.set(false)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          Tasks
        </a>
        @if (auth.isManager) {
          <a class="nav-item" routerLink="/dashboard/create-task" routerLinkActive="active" (click)="sidebarOpen.set(false)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            Create Task
          </a>
        }
      </nav>

      <button class="sidebar-logout" (click)="auth.logout()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign Out
      </button>
    </aside>

    <!-- Main area -->
    <div class="main-wrap">
      <header class="topbar">
        <button class="btn-icon menu-toggle" (click)="sidebarOpen.set(true)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div class="topbar-spacer"></div>
        <div class="topbar-user">
          <div class="avatar-sm">{{ initials() }}</div>
          <span class="topbar-name">{{ auth.currentUser()?.fullName }}</span>
        </div>
      </header>

      <main class="page-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    :host { display: flex; min-height: 100vh; }

    /* ── Sidebar ──────────────────────────────────── */
    .sidebar {
      width: 260px; min-height: 100vh;
      background: rgba(14,14,20,.98);
      border-right: 1px solid var(--glass-border);
      display: flex; flex-direction: column;
      position: fixed; left: 0; top: 0; z-index: 200;
      transition: transform .3s ease;
      padding-bottom: 24px;
    }
    .sidebar-header {
      display: flex; align-items: center;
      justify-content: space-between;
      padding: 24px 20px 20px;
    }
    .sidebar-close { display: none; }
    .logo { display: flex; align-items: center; gap: 10px; }
    .logo-icon {
      width: 42px; height: 42px;
      background: linear-gradient(135deg, var(--accent), #8b5cf6);
      border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center;
      color: #fff; box-shadow: 0 4px 16px var(--accent-glow); flex-shrink: 0;
    }
    .logo-text {
      font-size: 20px; font-weight: 700;
      background: linear-gradient(135deg, var(--accent-light), #c4b5fd);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    }

    /* user card */
    .user-card {
      margin: 0 16px 20px;
      padding: 14px 16px;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      display: flex; align-items: center; gap: 12px;
    }
    .avatar {
      width: 42px; height: 42px;
      background: linear-gradient(135deg, var(--accent), #8b5cf6);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .user-info { min-width: 0; }
    .user-name { font-size: 14px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .role-badge {
      display: inline-block; padding: 2px 8px;
      border-radius: 20px; font-size: 11px; font-weight: 600; margin-top: 4px;
      background: var(--accent-dim); color: var(--accent-light);
      border: 1px solid rgba(99,102,241,.3);
    }
    .role-badge.admin   { background: var(--danger-dim);  color: #fca5a5; border-color: rgba(239,68,68,.3); }
    .role-badge.manager { background: var(--warning-dim); color: #fcd34d; border-color: rgba(245,158,11,.3); }

    /* nav */
    .sidebar-nav { flex: 1; padding: 0 12px; display: flex; flex-direction: column; gap: 4px; }
    .nav-item {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: 14px; font-weight: 500;
      text-decoration: none;
      transition: background var(--transition), color var(--transition);
    }
    .nav-item:hover { background: rgba(255,255,255,.05); color: var(--text-primary); }
    .nav-item.active { background: var(--accent-dim); color: var(--accent-light); font-weight: 600; }

    .sidebar-logout {
      display: flex; align-items: center; gap: 10px;
      margin: 16px 16px 0;
      padding: 10px 14px;
      border: 1px solid rgba(239,68,68,.25);
      background: rgba(239,68,68,.07);
      color: var(--danger);
      font-family: inherit; font-size: 13px; font-weight: 500;
      cursor: pointer; border-radius: var(--radius-md);
      transition: background var(--transition);
    }
    .sidebar-logout:hover { background: rgba(239,68,68,.15); }

    /* ── Main ─────────────────────────────────────── */
    .main-wrap {
      flex: 1; margin-left: 260px;
      min-height: 100vh; display: flex; flex-direction: column;
    }
    .topbar {
      height: 64px;
      background: rgba(10,10,15,.92);
      border-bottom: 1px solid var(--glass-border);
      backdrop-filter: blur(16px);
      display: flex; align-items: center; gap: 16px;
      padding: 0 28px;
      position: sticky; top: 0; z-index: 50;
    }
    .menu-toggle { display: none; }
    .topbar-spacer { flex: 1; }
    .topbar-user { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--text-secondary); }
    .avatar-sm {
      width: 34px; height: 34px;
      background: linear-gradient(135deg, var(--accent), #8b5cf6);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: #fff;
    }
    .topbar-name { display: none; }
    .page-content { padding: 32px 28px; flex: 1; }

    /* ── Sidebar overlay (mobile) ─────────────────── */
    .sidebar-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,.6); backdrop-filter: blur(4px);
      z-index: 199;
    }
    .sidebar-overlay.visible { display: block; }

    /* ── Responsive ──────────────────────────────── */
    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); box-shadow: 24px 0 64px rgba(0,0,0,.5); }
      .sidebar-close { display: flex; }
      .main-wrap { margin-left: 0; }
      .menu-toggle { display: flex; }
      .topbar { padding: 0 16px; }
      .page-content { padding: 24px 16px; }
      .topbar-name { display: none; }
    }
    @media (min-width: 900px) {
      .topbar-name { display: inline; }
    }
  `],
})
export class LayoutComponent {
  auth = inject(AuthService);
  sidebarOpen = signal(false);

  initials = computed(() => {
    const name = this.auth.currentUser()?.fullName || '';
    return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  });

  roleClass = computed(() => {
    const id = this.auth.currentUser()?.roleId;
    return id === 1 ? 'admin' : id === 2 ? 'manager' : '';
  });
}
