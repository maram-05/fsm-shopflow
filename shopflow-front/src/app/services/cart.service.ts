import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Cart, CartItemRequest } from '../models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/api/cart';
  
  cartItemCount = signal<number>(0);
  cart = signal<Cart | null>(null);

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(this.apiUrl).pipe(
      tap(cart => {
        this.cart.set(cart);
        this.cartItemCount.set(cart.nombreArticles || cart.items?.length || 0);
      })
    );
  }

  addToCart(item: CartItemRequest): Observable<Cart> {
    return this.http.post<Cart>(`${this.apiUrl}/items`, item).pipe(
      tap(cart => {
        this.cart.set(cart);
        this.cartItemCount.set(cart.nombreArticles || cart.items?.length || 0);
      })
    );
  }

  // Alias for addToCart to match component usage
  addItem(productId: number, quantite: number): Observable<Cart> {
    return this.addToCart({ productId, quantite });
  }

  updateQuantity(itemId: number, quantite: number): Observable<Cart> {
    return this.http.put<Cart>(`${this.apiUrl}/items/${itemId}`, null, {
      params: { quantite: quantite.toString() }
    }).pipe(
      tap(cart => {
        this.cart.set(cart);
        this.cartItemCount.set(cart.nombreArticles || cart.items?.length || 0);
      })
    );
  }

  // Alias for updateQuantity to match component usage
  updateItemQuantity(itemId: number, quantite: number): Observable<Cart> {
    return this.updateQuantity(itemId, quantite);
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${this.apiUrl}/items/${itemId}`).pipe(
      tap(cart => {
        this.cart.set(cart);
        this.cartItemCount.set(cart.nombreArticles || cart.items?.length || 0);
      })
    );
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(this.apiUrl).pipe(
      tap(() => {
        this.cart.set(null);
        this.cartItemCount.set(0);
      })
    );
  }
}
