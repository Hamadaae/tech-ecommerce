import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { loadProducts } from '../../store/products/product.actions';
import { selectAllProducts } from '../../store/products/product.selectors';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.html'
})
export class Home implements OnInit, OnDestroy {
  products$: Observable<any[]>;

  // slider state
  slides: { title: string; subtitle?: string; cta?: string; image: string; href?: string }[] = [];
  currentSlide = 0;
  autoplayIntervalMs = 5000;
  private autoplayHandle: any = null;

  constructor(private store: Store) {
    this.products$ = this.store.select(selectAllProducts);
  }

  ngOnInit(): void {
    this.store.dispatch(loadProducts());

    this.products$.subscribe(products => {
      const thumbs = (products || [])
        .filter(p => p?.thumbnail)
        .slice(0, 3)
        .map(p => ({
          title: p.title || 'Product',
          subtitle: p.category || '',
          cta: 'Shop Now',
          image: p.thumbnail,
          href: `/products/${p.externalId ?? p._id ?? ''}`
        }));

      this.slides = thumbs.length > 0 ? thumbs : [
        {
          title: 'Big Tech Deals',
          subtitle: 'Up to 40% off selected items',
          cta: 'Shop Deals',
          image: '/assets/hero-1.jpg',
          href: '/products'
        },
        {
          title: 'New Arrivals',
          subtitle: 'Latest gadgets from top brands',
          cta: 'Explore New',
          image: '/assets/hero-2.jpg',
          href: '/products'
        },
        {
          title: 'Trending Now',
          subtitle: 'What customers are loving this week',
          cta: 'See Trending',
          image: '/assets/hero-3.jpg',
          href: '/products'
        }
      ];

      this.stopAutoplay();
      this.startAutoplay();
    });
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  prev() {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }

  next() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  goTo(index: number) {
    if (index >= 0 && index < this.slides.length) this.currentSlide = index;
  }

  startAutoplay() {
    if (this.autoplayHandle != null) return;
    this.autoplayHandle = setInterval(() => {
      this.next();
    }, this.autoplayIntervalMs);
  }

  stopAutoplay() {
    if (this.autoplayHandle != null) {
      clearInterval(this.autoplayHandle);
      this.autoplayHandle = null;
    }
  }

  featured(products: any[] | null, count = 6) {
    return products ? products.slice(0, count) : [];
  }
}
