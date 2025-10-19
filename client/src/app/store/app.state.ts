import { AuthState } from './auth/auth.models';
import { ProductState } from './products/product.models';

export interface AppState {
  auth: AuthState;
  products: ProductState;
}
