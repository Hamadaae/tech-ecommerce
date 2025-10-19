import { Injectable } from "@angular/core";
import { Order, OrderItem } from "../models/order.model";

@Injectable({ providedIn : "root" })

export class CartService {
    private storageKey = 'app_cart_v1'
    private items : OrderItem[] = []
    private listeners : Array<() => void > = []

    constructor(){
        this.load()
    }

    private save() {
        try{
            localStorage.setItem(this.storageKey, JSON.stringify(this.items))
        } catch(error){
            console.warn('Cart save error', error)
        }
        this.emit()
    }

    private load(){
        try{
            const raw = localStorage.getItem(this.storageKey)
            this.items = raw ? JSON.parse(raw) : []
        } catch(error){
            this.items = []
        }
    }

    onChange(cb : () => void): () => void{
        this.listeners.push(cb)

        return () => {
            this.listeners = this.listeners.filter(l => l !== cb)
        }
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

  addItem(item: OrderItem) {
    const existingIndex = this.items.findIndex(i => i.product === item.product);
    if (existingIndex >= 0) {
      this.items[existingIndex].quantity += item.quantity;
      this.items[existingIndex].subTotal = Math.round((this.items[existingIndex].price * this.items[existingIndex].quantity) * 100) / 100;
    } else {
      const subTotal = Math.round((item.price * item.quantity) * 100) / 100;
      this.items.push({ ...item, subTotal });
    }
    this.save();
  }

  updateItemQuantity(productId: string, quantity: number) {
    const existingIndex= this.items.findIndex(i => i.product === productId);
    if (existingIndex >= 0) {
      this.items[existingIndex].quantity = Math.max(1, quantity);
      this.items[existingIndex].subTotal = Math.round((this.items[existingIndex].price * this.items[existingIndex].quantity) * 100) / 100;
      this.save();
    }
  }

  removeItem(productId : string) {
    this.items = this.items.filter(item => item.product !== productId);
    this.save();
  }

  clear(){
    this.items = []
    this.save()
  }
}