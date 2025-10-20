import { Injectable, OnDestroy } from "@angular/core";
import { OrderItem } from "../models/order.model";

const CART_STORAGE_KEY = 'angular-ecommerce-cart';

@Injectable({ providedIn: "root" })
export class CartService implements OnDestroy {
  private items: OrderItem[] = [];
  private listeners: Array<() => void> = [];
  private isReady = false;

  constructor() {
    this.load();
    this.isReady = true;
    console.log("CartService initialized using localStorage.");
  }

  private load(): void {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        this.items = JSON.parse(storedCart) as OrderItem[];
      } else {
        this.items = [];
      }
    } catch (e) {
      console.error("CartService: Failed to load cart from localStorage.", e);
      this.items = [];
    }
  }

  private save(newItems: OrderItem[]): void {
    this.items = newItems;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Cart save error (localStorage)', e);
    }
    this.emit();
  }

  onChange(cb: () => void): () => void {
    this.listeners.push(cb);
    try { if (this.isReady) cb(); } catch (e) { console.error('cart listener initial call error', e); }

    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private emit() {
    this.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error('cart listener error', e); }
    });
  }

  getItems(): OrderItem[] {
    return this.items.map(item => ({ ...item }));
  }

  getTotal(): number {
    return this.items.reduce((acc, item) => acc + (item.subTotal ?? (item.price * item.quantity)), 0);
  }

  async addItem(item: OrderItem): Promise<void> {
    const currentItems = this.getItems();
    const existingIndex = currentItems.findIndex(i => i.product === item.product);

    let updatedItems: OrderItem[];

    if (existingIndex >= 0) {
      const existingItem = currentItems[existingIndex];
      existingItem.quantity += item.quantity;
      existingItem.subTotal = Math.round((existingItem.price * existingItem.quantity) * 100) / 100;
      updatedItems = currentItems;
    } else {
      const subTotal = Math.round((item.price * item.quantity) * 100) / 100;
      updatedItems = [...currentItems, { ...item, subTotal }];
    }

    this.save(updatedItems);
  }

  async updateItemQuantity(productId: string, quantity: number): Promise<void> {
    const currentItems = this.getItems();
    const existingIndex = currentItems.findIndex(i => i.product === productId);

    if (existingIndex >= 0) {
      const updatedQuantity = Math.max(1, quantity);

      if (updatedQuantity === currentItems[existingIndex].quantity) {
        return; 
      }

      currentItems[existingIndex].quantity = updatedQuantity;
      const item = currentItems[existingIndex];
      item.subTotal = Math.round((item.price * item.quantity) * 100) / 100;

      this.save(currentItems);
    }
  }

  async removeItem(productId: string): Promise<void> {
    const updatedItems = this.items.filter(item => item.product !== productId);
    if (updatedItems.length !== this.items.length) {
      this.save(updatedItems);
    }
  }

  async clear(): Promise<void> {
    this.save([]);
  }

  ngOnDestroy(): void {
  }
}
