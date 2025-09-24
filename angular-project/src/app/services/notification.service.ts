import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$: Observable<Notification[]> = this.notificationsSubject.asObservable();

  private notifications: Notification[] = [];
  private timeouts: Map<string, any> = new Map();

  constructor() {}

  addNotification(notification: Omit<Notification, 'id'>): string {
    const id = this.generateId();
    const newNotification: Notification = {
      id,
      duration: 5000,
      persistent: false,
      ...notification
    };

    this.notifications.unshift(newNotification);
    this.notificationsSubject.next([...this.notifications]);

    if (!newNotification.persistent && newNotification.duration && newNotification.duration > 0) {
      const timeout = setTimeout(() => {
        this.removeNotification(id);
      }, newNotification.duration);
      this.timeouts.set(id, timeout);
    }

    return id;
  }

  removeNotification(id: string): void {
    const index = this.notifications.findIndex(notification => notification.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notificationsSubject.next([...this.notifications]);

      if (this.timeouts.has(id)) {
        clearTimeout(this.timeouts.get(id));
        this.timeouts.delete(id);
      }
    }
  }

  clearAllNotifications(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.timeouts.clear();
    this.notifications = [];
    this.notificationsSubject.next([]);
  }

  showSuccess(message: string, title?: string, duration?: number): string {
    return this.addNotification({
      type: 'success',
      title,
      message,
      duration
    });
  }

  showError(message: string, title?: string, persistent: boolean = false): string {
    return this.addNotification({
      type: 'error',
      title,
      message,
      persistent,
      duration: persistent ? 0 : 8000
    });
  }

  showWarning(message: string, title?: string, duration?: number): string {
    return this.addNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  showInfo(message: string, title?: string, duration?: number): string {
    return this.addNotification({
      type: 'info',
      title,
      message,
      duration
    });
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }
}