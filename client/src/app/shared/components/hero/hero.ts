import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-blue-600 text-white py-20 px-4 text-center">
      <h1 class="text-4xl font-bold mb-4">Welcome to Our Store</h1>
      <p class="text-lg mb-6">Find the best laptops, smartphones, tablets, and accessories</p>
      <a routerLink="/products"
         class="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
        Shop Now
      </a>
    </div>
  `
})
export class Hero {}
