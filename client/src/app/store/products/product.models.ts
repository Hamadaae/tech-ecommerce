import { Product } from '../../core/models/product.model';

export interface PaginationMeta {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface ProductState {
  products: Product[];
  selectedProduct: Product | null;
  meta: PaginationMeta | null; 
  loading: boolean;
  error: string | null;
}

export const initialState: ProductState = {
  products: [], 
  selectedProduct: null,
  meta: {
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 8, 
  },
  loading: false,
  error: null,
};
