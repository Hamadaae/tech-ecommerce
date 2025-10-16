import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

interface Product {
  name: string;
  category: string;
  price: number;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule,
  ],
  templateUrl: './header.html'
})
export class Header implements OnInit, OnDestroy {
  searchControl = new FormControl('');
  filteredProducts!: Observable<Product[]>;
  cartItemCount = 0;
  isMobileSearchVisible = false;
  isLargeScreen = false;
  private breakpointSubscription: any;

  constructor(private breakpointObserver: BreakpointObserver) {}

  // Sample products data (you should get this from a service)
  private products: Product[] = [
    { name: 'MacBook Pro 14"', category: 'Laptops', price: 1999 },
    { name: 'Dell XPS 13', category: 'Laptops', price: 1299 },
    { name: 'iPad Air', category: 'Tablets', price: 699 },
    { name: 'Samsung Galaxy Tab S9', category: 'Tablets', price: 849 },
    { name: 'iPhone 15', category: 'Smartphones', price: 999 },
    { name: 'Google Pixel 8', category: 'Smartphones', price: 799 },
  ];

  ngOnInit() {
    // Set up search filtering
    this.filteredProducts = this.searchControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value || ''))
    );

    // Set up responsive breakpoint detection
    this.breakpointSubscription = this.breakpointObserver
      .observe([Breakpoints.XLarge, Breakpoints.Large])
      .subscribe(result => {
        this.isLargeScreen = result.matches;
      });
  }

  private _filter(value: string): Product[] {
    const filterValue = value.toLowerCase();
    return this.products.filter(product =>
      product.name.toLowerCase().includes(filterValue) ||
      product.category.toLowerCase().includes(filterValue)
    );
  }

  onSearch() {
    const searchTerm = this.searchControl.value;
    // Implement search logic here (e.g., navigate to search results page)
    console.log('Searching for:', searchTerm);
    this.isMobileSearchVisible = false;
  }

  toggleMobileSearch() {
    this.isMobileSearchVisible = !this.isMobileSearchVisible;
  }

  logout() {
    // Implement logout logic here
    console.log('Logging out...');
  }

  getCategoryIcon(category: string): string {
    switch (category.toLowerCase()) {
      case 'laptops': return 'laptop';
      case 'tablets': return 'tablet';
      case 'smartphones': return 'smartphone';
      default: return 'devices';
    }
  }

  ngOnDestroy() {
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }
}
