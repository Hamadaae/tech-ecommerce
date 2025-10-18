import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-6">
      <h1 class="text-2xl font-bold mb-6">My Wishlist</h1>
      <div class="bg-white rounded-lg shadow p-6">
        <p class="text-gray-600">Your wishlist items will appear here.</p>
      </div>
    </div>
  `,
})
export class Wishlist {}