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

  getProducts(page = 1, limit = 10, category?: string, search?: string, sort?: string): Observable<PaginatedProductsResponse> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    if (category) params = params.set('category', category);
    if (search && search.trim() !== '') params = params.set('search', search);
    if (sort && sort.trim() !== '') params = params.set('sort', sort);

    return this.http.get<PaginatedProductsResponse>(this.apiUrl, { params });
  }

  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<{category : string , count : number}[]> {
    return this.http.get<{category : string , count : number}[]>(`${this.apiUrl}/categories`);
  }

  createProduct(product: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, product);
  }

  updateProduct(id: string, product: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
