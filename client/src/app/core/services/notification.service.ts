import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface Notification {
  type: 'success' | 'error' | 'info';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private subject = new Subject<Notification>();

  constructor(private snackBar: MatSnackBar) {}

  get notifications$(): Observable<Notification> {
    return this.subject.asObservable();
  }

  private emit(n: Notification) {
    this.subject.next(n);
    // show snackbar for immediate visual feedback
    try {
      this.snackBar.open(n.message, 'Close', {
        duration: 3000,
        panelClass: n.type === 'success' ? ['mat-snack-success'] : n.type === 'error' ? ['mat-snack-error'] : ['mat-snack-info']
      });
    } catch (e) {
      // fallback: console and alert
      console.log('Snack failed', e);
      try { alert(n.message); } catch (e) { /* ignore */ }
    }
  }

  success(message: string) {
    this.emit({ type: 'success', message });
  }

  error(message: string) {
    this.emit({ type: 'error', message });
  }

  info(message: string) {
    this.emit({ type: 'info', message });
  }
}
