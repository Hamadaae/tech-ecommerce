import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hero } from '../../components/hero/hero';
import { ProductCard } from '../../components/product-card/product-card';

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
}
