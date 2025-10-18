import { HttpClient, HttpParams } from '@angular/common/http';
import { Product } from '../models/product.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = '/api/products'

  constructor(private http: HttpClient) {}


  getProducts(): Observable<Product[]>{
    return this.http.get<Product[]>(this.apiUrl)
  }

  getProductById(id : string): Observable<Product>{
    return this.http.get<Product>(`${this.apiUrl}/${id}`)
  }

  getCategories(): Observable<string[]>{
    return this.http.get<string[]>(`${this.apiUrl}/categories`)
  }

  createProduct(product: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, product);
  } 

  updateProduct(id : string, product : any): Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/${id}`, product)
  }

  deleteProduct(id : string): Observable<any>{
    return this.http.delete<any>(`${this.apiUrl}/${id}`)
  }
}