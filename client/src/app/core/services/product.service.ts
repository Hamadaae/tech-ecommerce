// product.service.ts
import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../models/product.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginationMeta } from '../../store/products/product.models';

export interface PaginatedProductsResponse {
  data: Product[];
  meta: PaginationMeta;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = '/api/products';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: token ? `Bearer ${token}` : '' } };
  }

  getProducts(
    page = 1,
    limit = 10,
    category?: string,
    search?: string,
    sort?: string,
    minPrice?: number,
    maxPrice?: number,
    stock?: 'in_stock' | 'out_of_stock'
  ): Observable<PaginatedProductsResponse> {
    let params = new HttpParams().set('page', String(page)).set('limit', String(limit));

    if (category) params = params.set('category', category);
    if (search && search.trim() !== '') params = params.set('search', search);
    if (sort && sort.trim() !== '') params = params.set('sort', sort);
    if (minPrice !== undefined && minPrice !== null)
      params = params.set('minPrice', String(minPrice));
    if (maxPrice !== undefined && maxPrice !== null)
      params = params.set('maxPrice', String(maxPrice));
    if (stock) params = params.set('stock', stock);

    return this.http.get<PaginatedProductsResponse>(this.apiUrl, { params });
  }

  getProductById(id: string) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getCategories() {
    return this.http.get<{ category: string; count: number }[]>(`${this.apiUrl}/categories`);
  }

  createProduct(product: any) {
    return this.http.post<any>(this.apiUrl, product, this.getAuthHeaders());
  }

  updateProduct(id: string, product: any) {
    return this.http.put<any>(`${this.apiUrl}/${id}`, product, this.getAuthHeaders());
  }

  deleteProduct(id: string) {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }
}
