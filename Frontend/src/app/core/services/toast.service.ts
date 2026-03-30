import { inject, Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private nextId = 0;

  show(type: ToastType, message: string, duration = 3500): void {
    const id = ++this.nextId;
    this.toasts.update((list) => [...list, { id, type, message }]);
    setTimeout(() => this.remove(id), duration);
  }

  success(msg: string) { this.show('success', msg); }
  error(msg: string)   { this.show('error', msg); }
  info(msg: string)    { this.show('info', msg); }
  warning(msg: string) { this.show('warning', msg); }

  remove(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
