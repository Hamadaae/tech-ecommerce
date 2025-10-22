import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './footer.html',
})
export class Footer {
  email = '';

  subscribe() {
    if (this.email.trim()) {
      console.log('Subscribed with:', this.email);
      this.email = '';
    }
  }
}
