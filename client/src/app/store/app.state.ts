import { AuthState } from './auth/auth.models';
import { ProductState } from './products/product.models';
import { OrderState } from './orders/order.reducer'; 

export interface AppState {
  auth: AuthState;
  products: ProductState;
  orders: OrderState; 
}
