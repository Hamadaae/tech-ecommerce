import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../shared/components/hero/hero';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Hero, ProductCard],
  templateUrl: './home.html',
})
export class Home {
  products = [
    { name: 'MacBook Pro 14"', category: 'Laptops', price: 1999, image: 'assets/macbook.jpg' },
    { name: 'iPad Air', category: 'Tablets', price: 699, image: 'assets/ipad.jpg' },
    { name: 'iPhone 15', category: 'Smartphones', price: 999, image: 'assets/iphone.jpg' },
    { name: 'AirPods Pro', category: 'Accessories', price: 249, image: 'assets/airpods.jpg' },
  ];

  newArrivals = [
    { name: 'Dell XPS 13', category: 'Laptops', price: 1299, image: 'assets/dell-xps.jpg' },
    { name: 'Samsung Galaxy Tab S9', category: 'Tablets', price: 849, image: 'assets/galaxy-tab.jpg' },
    { name: 'Google Pixel 8', category: 'Smartphones', price: 799, image: 'assets/pixel.jpg' },
    { name: 'Sony WH-1000XM5', category: 'Accessories', price: 399, image: 'assets/sony-headphones.jpg' },
  ];
}
