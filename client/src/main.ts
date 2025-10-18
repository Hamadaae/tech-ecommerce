import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';

import { App } from './app/app';
import { productReducer, productFeatureKey } from './app/store/products/product.reducer';
import { ProductEffects } from './app/store/products/product.effects';

bootstrapApplication(App, {
  providers: [
    provideHttpClient(),
    provideStore({ [productFeatureKey]: productReducer }),
    provideEffects([ProductEffects])
  ]
});
