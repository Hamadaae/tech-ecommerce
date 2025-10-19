import { Component, OnInit, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Product } from '../../core/models/product.model';
import * as ProductActions from '../../store/products/product.actions';
import { selectProductList, selectProductLoading, selectProductState } from '../../store/products/product.selectors';

@Component({
  selector: 'app-home-test',
  standalone: true,
  template: `<div>Check console for Redux test logs.</div>`
})
export class HomeTest implements OnInit {
  private store = inject(Store);
  products$!: Observable<Product[]>;
  loading$!: Observable<boolean>;

  ngOnInit(): void {
    this.store.dispatch(ProductActions.loadProducts({ page: 1, limit: 20 }));

    this.products$ = this.store.select(selectProductList);
    this.loading$ = this.store.select(selectProductLoading);

    this.products$.subscribe(list => console.log('[TestHome] Products:', list));
    this.loading$.subscribe(load => console.log('[TestHome] Loading:', load));

    this.store.select(selectProductState).subscribe(state =>
      console.log('[TestHome] Full product state:', state)
    );
  }
}
