import { bootstrapApplication } from "@angular/platform-browser";
import { importProvidersFrom, provideZoneChangeDetection } from "@angular/core";
import { provideHttpClient } from "@angular/common/http";
import { provideRouter } from "@angular/router";
import { provideAnimations } from '@angular/platform-browser/animations';

import { provideStore } from "@ngrx/store";
import { provideEffects } from "@ngrx/effects";
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { App } from "./app/app";
import { routes } from "./app/app.routes";

import { CoreModule } from "./app/core/core.module";

import { authReducer } from "./app/store/auth/auth.reducer";
import { AuthEffect } from "./app/store/auth/auth.effects";
import { AuthService } from "./app/core/services/auth.service";

import { productReducer } from "./app/store/products/product.reducer";
import { ProductEffects } from "./app/store/products/product.effects";

import { orderReducer } from "./app/store/orders/order.reducer";
import { OrderEffects } from "./app/store/orders/order.effects";

bootstrapApplication(App, {
  providers : [
    provideHttpClient(),
    provideRouter(routes),
    provideAnimations(),
    provideStore({
      auth : authReducer,
      products : productReducer,
      orders : orderReducer
    }),
    provideEffects([AuthEffect, ProductEffects, OrderEffects]),
    provideStoreDevtools({maxAge : 25, logOnly : false}),
    AuthService,
    importProvidersFrom(CoreModule)
  ]
})
