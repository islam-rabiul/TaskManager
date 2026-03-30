import { Component, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast toast-{{ toast.type }}" (click)="toastService.remove(toast.id)">
          <span class="toast-icon">{{ icons[toast.type] }}</span>
          <span class="toast-msg">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed; bottom: 28px; right: 28px;
      display: flex; flex-direction: column; gap: 10px;
      z-index: 9999; pointer-events: none;
    }
    .toast {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 20px;
      background: rgba(17,17,24,0.97);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      font-size: 14px; color: var(--text-primary);
      box-shadow: 0 8px 32px rgba(0,0,0,.4);
      backdrop-filter: blur(16px);
      max-width: 360px;
      animation: slideUp .3s var(--spring) both;
      cursor: pointer; pointer-events: all;
    }
    .toast-success { border-color: rgba(16,185,129,.4); }
    .toast-error   { border-color: rgba(239,68,68,.4); }
    .toast-warning { border-color: rgba(245,158,11,.4); }
    .toast-info    { border-color: rgba(59,130,246,.4); }
    .toast-icon    { font-size: 18px; flex-shrink: 0; }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
  readonly icons: Record<string, string> = {
    success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️'
  };
}
