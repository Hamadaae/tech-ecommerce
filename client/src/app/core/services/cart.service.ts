import { Injectable, OnDestroy } from "@angular/core";
import { OrderItem } from "../models/order.model";

// Define a key for localStorage storage
const CART_STORAGE_KEY = 'angular-ecommerce-cart';

@Injectable({ providedIn: "root" })
export class CartService implements OnDestroy {
  // Properties required for local state management
  private items: OrderItem[] = [];
  private listeners: Array<() => void> = [];
  private isReady = false;

  constructor() {
    // Load data from localStorage immediately upon service instantiation
    this.load();
    this.isReady = true;
    console.log("CartService initialized using localStorage.");
  }

  /**
   * Loads the cart items from localStorage.
   */
  private load(): void {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        // Parse the JSON string back into an array of OrderItem
        this.items = JSON.parse(storedCart) as OrderItem[];
      } else {
        this.items = [];
      }
    } catch (e) {
      console.error("CartService: Failed to load cart from localStorage.", e);
      this.items = [];
    }
  }

  /**
   * Persists the current state of the cart items to localStorage.
   * This operation is now synchronous and replaces the async Firestore `save`.
   */
  private save(newItems: OrderItem[]): void {
    this.items = newItems;
    try {
      // Stringify the array and store it
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    } catch (e) {
      console.error('Cart save error (localStorage)', e);
    }
    this.emit();
  }

  // --- Public API methods ---

  /**
   * Registers a callback function to be executed when the cart changes.
   * @returns A function to unsubscribe the listener.
   */
  onChange(cb: () => void): () => void {
    this.listeners.push(cb);
    // Initial call for new listeners to get current state
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
    // Return a clone to prevent external mutation
    return this.items.map(item => ({ ...item }));
  }

  getTotal(): number {
    // Calculate total, falling back to price * quantity if subTotal is missing
    return this.items.reduce((acc, item) => acc + (item.subTotal ?? (item.price * item.quantity)), 0);
  }

  // Keeping these methods async (Promise<void>) prevents cascading changes
  // in components that call them, even though the internal logic is now synchronous.
  async addItem(item: OrderItem): Promise<void> {
    const currentItems = this.getItems();
    const existingIndex = currentItems.findIndex(i => i.product === item.product);

    let updatedItems: OrderItem[];

    if (existingIndex >= 0) {
      // Update quantity and subTotal of existing item
      const existingItem = currentItems[existingIndex];
      existingItem.quantity += item.quantity;
      existingItem.subTotal = Math.round((existingItem.price * existingItem.quantity) * 100) / 100;
      updatedItems = currentItems;
    } else {
      // Add new item with calculated subTotal
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
        return; // No change
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
    // Save an empty array to clear the cart in localStorage
    this.save([]);
  }

  ngOnDestroy(): void {
    // Nothing to unsubscribe from since we are no longer using Firebase.
  }
}
