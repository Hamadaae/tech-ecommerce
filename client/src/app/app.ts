import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { Footer } from './shared/components/footer/footer';
import { CommonModule } from '@angular/common';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NotificationService, Notification } from './core/services/notification.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar, Footer, MatSnackBarModule],
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
    <app-footer></app-footer>
    <div *ngIf="toast" class="fixed bottom-6 right-6 z-50">
      <div [ngClass]="{
        'bg-green-600': toast.type === 'success',
        'bg-red-600': toast.type === 'error',
        'bg-blue-600': toast.type === 'info'
      }" class="text-white px-4 py-2 rounded shadow-lg">
        {{ toast.message }}
      </div>
    </div>
  `
})
export class App implements OnInit {
  toast?: Notification | null = null;
  private sub = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.sub.add(this.notificationService.notifications$.subscribe(n => {
      this.toast = n;
      setTimeout(() => this.toast = null, 3000);
    }));
  }
}