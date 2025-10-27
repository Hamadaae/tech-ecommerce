import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { loadProducts } from '../../store/products/product.actions';
import { selectAllProducts } from '../../store/products/product.selectors';
import { CartService } from '../../core/services/cart.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  products$: Observable<any[]>;

  newProducts = [
    {
      id: 1,
      name: 'MSI GF63 Thin Gaming Laptop',
      price: 499.00,
      rating: 4.5,
      image: 'https://placehold.co/400x300/222/fff?text=MSI+Laptop',
      category: 'Laptops'
    },
    {
      id: 2,
      name: 'MSI Gaming Desktop Pro',
      price: 899.00,
      rating: 4.7,
      image: 'https://placehold.co/400x300/222/fff?text=MSI+Desktop',
      category: 'Desktops'
    },
    {
      id: 3,
      name: 'MSI Gaming Monitor 27"',
      price: 299.00,
      rating: 4.6,
      image: 'https://placehold.co/400x300/222/fff?text=MSI+Monitor',
      category: 'Monitors'
    },
    {
      id: 4,
      name: 'MSI Creator Laptop',
      price: 1299.00,
      rating: 4.8,
      image: 'https://placehold.co/400x300/222/fff?text=MSI+Creator',
      category: 'Laptops'
    },
    {
      id: 5,
      name: 'MSI Workstation PC',
      price: 1499.00,
      rating: 4.9,
      image: 'https://placehold.co/400x300/222/fff?text=MSI+Workstation',
      category: 'Desktops'
    },
    {
      id: 6,
      name: 'MSI Curved Monitor 32"',
      price: 399.00,
      rating: 4.7,
      image: 'https://placehold.co/400x300/222/fff?text=MSI+Curved',
      category: 'Monitors'
    }
  ];



  categories = [
    {
      title: 'Smartphones',
      image: '/assets/categories/smartphones.jpg',
      link: '/category/smartphones'
    },
    {
      title: 'Tablets',
      image: '/assets/categories/tablets.jpg',
      link: '/category/tablets'
    },
    {
      title: 'Laptops',
      image: '/assets/categories/laptops.jpg',
      link: '/category/laptops'
    },
    {
      title: 'Mobile Accessories',
      image: '/assets/categories/accessories.jpg',
      link: '/category/accessories'
    }
  ];

  testimonials = [
    {
      text: 'My first order arrived today in perfect condition. From the time I sent a question about the item to making the purchase, to the shipping and now the delivery, your company, has stayed in touch. Such great service. I look forward to shopping on your site in the future and would highly recommend it.',
      author: 'Tony Brown'
    }
  ];

  brands = [
    '/assets/brands/roccat.png',
    '/assets/brands/msi.png',
    '/assets/brands/razer.png',
    '/assets/brands/thermaltake.png',
    '/assets/brands/adata.png',
    '/assets/brands/hp.png',
    '/assets/brands/gigabyte.png'
  ];

  constructor(private store: Store, private cartService: CartService, private notificationService: NotificationService) {
    this.products$ = this.store.select(selectAllProducts);

    // Add more products
    this.newProducts = [
      ...this.newProducts,
      {
        id: 2,
        name: 'MSI Gaming Desktop',
        price: 899.00,
        rating: 4.7,
        image: 'assets/products/desktop-1.png',
        category: 'Desktops'
      },
      {
        id: 3,
        name: 'MSI Gaming Monitor',
        price: 299.00,
        rating: 4.6,
        image: 'assets/products/monitor-1.png',
        category: 'Monitors'
      },
      {
        id: 4,
        name: 'MSI Creator Laptop',
        price: 1299.00,
        rating: 4.8,
        image: 'assets/products/laptop-2.png',
        category: 'Laptops'
      },
      {
        id: 5,
        name: 'MSI Workstation',
        price: 1499.00,
        rating: 4.9,
        image: 'assets/products/desktop-2.png',
        category: 'Desktops'
      }
    ];


  }

  ngOnInit(): void {
    this.store.dispatch(loadProducts());
  }

  async addToCart(product: any) {
    try {
      const item = {
        product: product._id ?? product.id ?? String(product.externalId ?? product.id),
        title: product.name ?? product.title,
        price: product.price ?? 0,
        quantity: 1
      } as any;

      await this.cartService.addItem(item);
      this.notificationService.success(`${item.title} added to cart`);
    } catch (e) {
      console.error('Add to cart failed', e);
      this.notificationService.error('Failed to add to cart');
    }
  }
}
