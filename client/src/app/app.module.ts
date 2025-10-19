// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { CoreModule } from './core/core.module';

// root app component (replace with your actual component)
import { App } from './app';

// place-holder components (replace with your real ones)
import { HomeComponent } from './features/home/home.component';
import { ProductListComponent } from './features/product-list/product-list.component';
import { ProductDetailComponent } from './features/product-detail/product-detail.component';
import { CheckoutComponent } from './features/checkout/checkout.component';
import { OrderConfirmationComponent } from './features/order-confirmation/order-confirmation.component';
import { AuthLoginComponent } from './features/auth/login.component';
import { AuthRegisterComponent } from './features/auth/register.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'order/:id', component: OrderConfirmationComponent },
  { path: 'auth/login', component: AuthLoginComponent },
  { path: 'auth/register', component: AuthRegisterComponent },
  // TODO: add guarded routes for protected pages
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ProductListComponent,
    ProductDetailComponent,
    CheckoutComponent,
    OrderConfirmationComponent,
    AuthLoginComponent,
    AuthRegisterComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    CoreModule,          // register singleton interceptors/services
    RouterModule.forRoot(routes)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
