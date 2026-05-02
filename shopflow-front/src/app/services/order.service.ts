import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, OrderRequest } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private apiUrl = 'http://localhost:8080/api/orders';

  constructor(private http: HttpClient) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token');

    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  // ✅ GET MY ORDERS (CORRIGÉ)
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl, this.getAuthHeaders());
  }

  // ✅ GET ORDER BY ID
  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }

  // ✅ CREATE ORDER
  createOrder(orderRequest: OrderRequest): Observable<Order> {
    return this.http.post<Order>(
      this.apiUrl,
      orderRequest,
      this.getAuthHeaders()
    );
  }

  // ✅ CANCEL ORDER
  cancelOrder(id: number): Observable<Order> {
    return this.http.put<Order>(
      `${this.apiUrl}/${id}/cancel`,
      {},
      this.getAuthHeaders()
    );
  }
}