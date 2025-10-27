import { Product } from '../../core/models/product.model';

// Defines the expected structure for pagination data
export interface PaginationMeta {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
}

export interface ProductState {
  products: Product[]; // MUST be an array
  selectedProduct: Product | null;
  meta: PaginationMeta | null; 
  loading: boolean;
  error: string | null;
}

export const initialState: ProductState = {
  products: [], // Initial state is explicitly an empty array
  selectedProduct: null,
  meta: {
    // Provide a default meta object structure to avoid null checks in the reducer/component logic
    total: 0,
    totalPages: 1,
    page: 1,
    limit: 8, 
  },
  loading: false,
  error: null,
};
