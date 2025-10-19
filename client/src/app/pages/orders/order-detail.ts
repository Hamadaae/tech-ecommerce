import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto p-6">
      <div class="bg-white rounded-lg shadow p-6">
        <h1 class="text-2xl font-bold mb-6">Order Details</h1>
        <p class="text-gray-600">Order details will be displayed here.</p>
      </div>
    </div>
  `,
})
export class OrderDetail {
  constructor(private route: ActivatedRoute) {}
}