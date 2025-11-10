import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = '/api/orders';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
    });
  }

  createOrder(
    orderData: Partial<Order>
  ): Observable<{ order: Order; checkoutSessionId?: string; checkoutUrl?: string }> {
    return this.http.post<{ order: Order; checkoutSessionId?: string; checkoutUrl?: string }>(
      this.apiUrl,
      orderData,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my`, {
      headers: this.getAuthHeaders(),
    });
  }

  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${orderId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  updateOrderToPaid(orderId: string, sessionId?: string | null): Observable<Order> {
    const body = typeof sessionId !== 'undefined' && sessionId !== null ? { sessionId } : {};
    return this.http.put<Order>(`${this.apiUrl}/${orderId}/pay`, body, {
      headers: this.getAuthHeaders(),
    });
  }

  getAllOrders(): Observable<{ data: Order[]; meta: any }> {
    return this.http.get<{ data: Order[]; meta: any }>(this.apiUrl, {
      headers: this.getAuthHeaders(),
    });
  }

  updateOrderStatus(orderId: string, isDelivered: boolean): Observable<Order> {
    return this.http.put<Order>(
      `${this.apiUrl}/${orderId}/status`,
      { isDelivered },
      { headers: this.getAuthHeaders() }
    );
  }

  deleteOrder(orderId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${orderId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  cancelUnpaidOrder(orderId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${orderId}/cancel`, {
      headers: this.getAuthHeaders(),
    });
  }
}
