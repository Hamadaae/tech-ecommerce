import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Checkout Page</h2>
      <p>Welcome to checkout!</p>
    </div>
  `,
})
export class Checkout {}

// import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, Injectable, Pipe, PipeTransform } from '@angular/core';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { CommonModule, CurrencyPipe } from '@angular/common';
// import { Subject, takeUntil } from 'rxjs'; // Using basic RxJS for cleanup

// // --- START: USER-PROVIDED MODEL INTERFACES (Keep these) ---

// export interface OrderItem {
//     product: string,
//     name: string,
//     quantity: number,
//     price: number,
//     discountPercentage?: number,
//     image?: string,
//     subTotal?: number,
//     _id?: string
// }

// export interface ShippingAddress {
//     address: string,
//     city: string,
//     postalCode: string,
//     country: string
// }

// export type PaymentMethod = 'stripe' | 'cash_on_delivery'

// export interface PaymentResult {
//     id?: string,
//     status?: string,
//     update_time?: string,
//     [key: string]: any;
// }

// export interface Order {
//     _id?: string;
//     user?: string | any;
//     orderItems: OrderItem[];
//     shippingAddress: ShippingAddress;
//     paymentMethod: PaymentMethod;
//     paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
//     stripePaymentIntentId?: string;
//     stripeChargeId?: string;
//     stripeReceiptUrl?: string;
//     itemsPrice?: number;
//     shippingPrice?: number;
//     taxPrice?: number;
//     totalPrice?: number;
//     isPaid?: boolean;
//     paidAt?: string;
//     isDelivered?: boolean;
//     deliveredAt?: string;
//     stockReserved?: boolean;
//     createdAt?: string;
//     updatedAt?: string;
//     paymentResult?: PaymentResult;
//     clientSecret?: string;
// }

// export interface Product {
//     _id?: string,
//     title?: string,
//     price?: number,
//     discountPercentage?: number,
//     // Add stock for controller logic simulation
//     stock?: number,
//     // Minimal properties needed for cart/order logic
// }

// // --- END: USER-PROVIDED MODEL INTERFACES ---

// // --- MOCK API DATA ---

// const MOCK_PRODUCTS: Product[] = [
//     { _id: '1', title: 'Gemini Backpack', price: 79.99, discountPercentage: 0, stock: 10 },
//     { _id: '2', title: 'Tensor Watch', price: 299.00, discountPercentage: 10, stock: 5 },
//     { _id: '3', title: 'Pixel Buds Pro', price: 199.99, discountPercentage: 5, stock: 20 },
// ];

// /**
//  * Mock Product Store - simulates fetching products needed for order validation.
//  */
// @Injectable({ providedIn: "root" })
// class MockProductStore {
//     private products = MOCK_PRODUCTS;
//     getProductById(id: string): Product | undefined {
//         return this.products.find(p => p._id === id);
//     }
//     getAllProducts(): Product[] {
//         return this.products;
//     }
// }

// // --- USER'S CART SERVICE (IMPLEMENTATION) ---

// const CART_STORAGE_KEY = 'angular-ecommerce-cart';

// @Injectable({ providedIn: "root" })
// export class CartService implements OnDestroy {
//     private items: OrderItem[] = [];
//     private listeners: Array<() => void> = [];
//     private isReady = false;
//     private productStore = inject(MockProductStore);

//     constructor() {
//         this.load();
//         this.isReady = true;
//     }

//     private load(): void {
//         // NOTE: In a real app, we would use Firestore here, but localStorage is used for this single-file mock.
//         try {
//             const storedCart = localStorage.getItem(CART_STORAGE_KEY);
//             if (storedCart) {
//                 this.items = JSON.parse(storedCart) as OrderItem[];
//             } else {
//                 this.items = [];
//             }
//         } catch (e) {
//             console.error("CartService: Failed to load cart from localStorage.", e);
//             this.items = [];
//         }
//     }

//     private save(newItems: OrderItem[]): void {
//         this.items = newItems;
//         try {
//             localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
//         } catch (e) {
//             console.error('Cart save error (localStorage)', e);
//         }
//         this.emit();
//     }

//     /**
//      * Registers a callback function to be executed when the cart changes.
//      * @returns A function to unsubscribe the listener.
//      */
//     onChange(cb: () => void): () => void {
//         this.listeners.push(cb);
//         // Initial call for new listeners to get current state
//         try { if (this.isReady) cb(); } catch (e) { console.error('cart listener initial call error', e); }

//         return () => {
//             this.listeners = this.listeners.filter(l => l !== cb);
//         };
//     }

//     private emit() {
//         this.listeners.forEach(cb => {
//             try { cb(); } catch (e) { console.error('cart listener error', e); }
//         });
//     }

//     getItems(): OrderItem[] {
//         // Return a clone to prevent external mutation
//         return this.items.map(item => ({ ...item }));
//     }

//     /** Calculates the total price of items after discounts. */
//     getSummary(): { items: OrderItem[], itemsPrice: number, itemsCount: number } {
//         const items = this.items.map(item => {
//             const productDoc = this.productStore.getProductById(item.product);
//             const price = productDoc?.price ?? item.price;
//             const discountPercentage = productDoc?.discountPercentage ?? item.discountPercentage ?? 0;

//             const discount = discountPercentage / 100;
//             // Recalculate subTotal based on stored quantity and current price/discount
//             const subTotal = Math.round(price * item.quantity * (1 - discount) * 100) / 100;

//             return {
//                 ...item,
//                 price, // Use product price for consistency
//                 discountPercentage,
//                 subTotal: subTotal,
//             };
//         });

//         const itemsPrice = items.reduce((acc, item) => acc + (item.subTotal ?? 0), 0);
//         const itemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

//         return { items, itemsPrice: Number(itemsPrice.toFixed(2)), itemsCount };
//     }

//     // --- Public Mutator Methods (Simulating the async user logic) ---

//     async addItem(productId: string, quantity: number = 1): Promise<void> {
//         const product = this.productStore.getProductById(productId);
//         if (!product || !product._id || !product.title || product.price === undefined) {
//             console.error('Cannot add item: Product details incomplete.');
//             return;
//         }

//         const currentItems = this.getItems();
//         const existingIndex = currentItems.findIndex(i => i.product === productId);

//         let updatedItems: OrderItem[];

//         const price = product.price;
//         const discountPercentage = product.discountPercentage ?? 0;
//         const discount = discountPercentage / 100;

//         if (existingIndex >= 0) {
//             const existingItem = currentItems[existingIndex];
//             existingItem.quantity += quantity;
//             existingItem.subTotal = Math.round(price * existingItem.quantity * (1 - discount) * 100) / 100;
//             updatedItems = currentItems;
//         } else {
//             const subTotal = Math.round(price * quantity * (1 - discount) * 100) / 100;
//             updatedItems = [...currentItems, {
//                 product: product._id,
//                 name: product.title,
//                 quantity: quantity,
//                 price: price,
//                 discountPercentage: discountPercentage,
//                 subTotal: subTotal,
//             }];
//         }
//         this.save(updatedItems);
//     }

//     async updateItemQuantity(productId: string, quantity: number): Promise<void> {
//         const product = this.productStore.getProductById(productId);
//         if (!product) return;

//         const currentItems = this.getItems();
//         const existingIndex = currentItems.findIndex(i => i.product === productId);

//         if (existingIndex >= 0) {
//             const updatedQuantity = Math.max(1, quantity);

//             if (updatedQuantity === currentItems[existingIndex].quantity) {
//                 return; // No change
//             }

//             const item = currentItems[existingIndex];
//             item.quantity = updatedQuantity;

//             const price = product.price ?? item.price;
//             const discount = (product.discountPercentage ?? item.discountPercentage ?? 0) / 100;

//             item.subTotal = Math.round(price * item.quantity * (1 - discount) * 100) / 100;

//             this.save(currentItems);
//         }
//     }

//     async removeItem(productId: string): Promise<void> {
//         const updatedItems = this.items.filter(item => item.product !== productId);
//         if (updatedItems.length !== this.items.length) {
//             this.save(updatedItems);
//         }
//     }

//     async clear(): Promise<void> {
//         this.save([]);
//     }

//     ngOnDestroy(): void {
//         // Clear listeners
//         this.listeners = [];
//     }
// }

// @Pipe({ name: 'currency', standalone: true })
// export class MockCurrencyPipe implements PipeTransform {
//   transform(value: number | undefined | null, currencyCode: string, display: string): string {
//     if (value == null) {
//       return '-';
//     }
//     // Simple formatting for demonstration
//     return display === 'symbol' ? `$${value.toFixed(2)}` : value.toFixed(2);
//   }
// }

// // --- USER'S ORDER SERVICE (MOCKED) ---

// /**
//  * Mocks the OrderService, simulating API interaction based on order.controller.ts logic.
//  */
// @Injectable({ providedIn: 'root' })
// export class OrderService {
//     private productStore = inject(MockProductStore);

//     private getOrderTotals(items: OrderItem[], shippingPrice: number = 0, taxPrice: number = 0): { itemsPrice: number, shippingPrice: number, taxPrice: number, totalPrice: number, orderItems: OrderItem[] } {
//         const processedItems: OrderItem[] = [];
//         let itemsPrice = 0;

//         for (const item of items) {
//             const productDoc = this.productStore.getProductById(item.product);
//             if (!productDoc || productDoc.price === undefined) continue;

//             const qty = item.quantity;
//             const price = productDoc.price;
//             const discountPercentage = productDoc.discountPercentage ?? 0;

//             const discount = discountPercentage / 100;
//             const subTotal = Math.round(price * qty * (1 - discount) * 100) / 100;

//             itemsPrice += subTotal;
//             processedItems.push({
//                 ...item,
//                 price,
//                 discountPercentage,
//                 subTotal,
//                 name: productDoc.title!,
//             });
//         }

//         // Re-calculate shipping/tax based on itemsPrice (simple mock rule)
//         const normalizedShipping = itemsPrice > 100 ? 0 : 15.00;
//         const normalizedTax = Math.round(itemsPrice * 0.10 * 100) / 100; // 10% tax

//         const totalPrice = Math.round((itemsPrice + normalizedShipping + normalizedTax) * 100) / 100;

//         return {
//             itemsPrice: Number(itemsPrice.toFixed(2)),
//             shippingPrice: Number(normalizedShipping.toFixed(2)),
//             taxPrice: Number(normalizedTax.toFixed(2)),
//             totalPrice: Number(totalPrice.toFixed(2)),
//             orderItems: processedItems,
//         };
//     }

//     /**
//      * Simulates the createOrder API call using the logic from order.controller.ts.
//      * @returns A Promise that resolves to the Order object and optionally clientSecret.
//      */
//     async createOrder(orderData: Partial<Order>): Promise<{ order: Order; clientSecret?: string }> {
//         await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API latency

//         const items = orderData.orderItems!;
//         const totals = this.getOrderTotals(items);
//         const paymentMethod = orderData.paymentMethod!;

//         const createdOrder: Order = {
//             _id: 'order-' + Math.random().toString(36).substring(2, 9),
//             user: 'mock-user-id',
//             orderItems: totals.orderItems,
//             shippingAddress: orderData.shippingAddress!,
//             paymentMethod: paymentMethod,
//             itemsPrice: totals.itemsPrice,
//             shippingPrice: totals.shippingPrice,
//             taxPrice: totals.taxPrice,
//             totalPrice: totals.totalPrice,
//             isPaid: false,
//             paymentStatus: 'pending',
//             stockReserved: paymentMethod === 'cash_on_delivery', // Mock stock reserved for COD
//             createdAt: new Date().toISOString(),
//         };

//         let clientSecret: string | undefined = undefined;
//         if (paymentMethod === 'stripe') {
//             // Mock Stripe Payment Intent creation (as per controller logic)
//             // Total price must be converted to cents for Stripe, but we keep it in dollars here for simplicity
//             clientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(2, 8)}`;
//             createdOrder.stripePaymentIntentId = clientSecret.split('_secret_')[0];
//             createdOrder.clientSecret = clientSecret; // Store client secret on the mock order
//         }

//         console.log(`Mock Order Created (${paymentMethod}):`, createdOrder);
//         return { order: createdOrder, clientSecret };
//     }

//     /**
//      * Simulates the updateOrderToPaid API call using the logic from order.controller.ts.
//      */
//     async updateOrderToPaid(orderId: string, paymentResult: PaymentResult): Promise<Order> {
//         await new Promise(resolve => setTimeout(resolve, 500));

//         // Mock successful payment update (real logic would fetch the order and update it)
//         const paidOrder: Order = {
//             _id: orderId,
//             isPaid: true,
//             paidAt: new Date().toISOString(),
//             paymentStatus: 'paid',
//             paymentResult: paymentResult,
//             stockReserved: true, // Stock is reserved upon payment success
//             totalPrice: 485.49, // Placeholder total price
//             paymentMethod: 'stripe',
//             shippingAddress: {} as ShippingAddress,
//             orderItems: [],
//         };

//         console.log(`Mock Order ${orderId} updated to Paid Status.`);
//         return paidOrder;
//     }
// }

// // --- MAIN COMPONENT ---

// // Global Stripe and Elements variables (initialized once the script loads)
// declare var Stripe: any;
// let stripe: any;
// let elements: any;
// let paymentElement: any;

// @Component({
//     selector: 'app-root',
//     standalone: true,
//     imports: [CommonModule, ReactiveFormsModule],
//     providers: [CartService, OrderService, MockProductStore], // Provide the services
//     template: `
//         <!-- Load Tailwind and Inter Font -->
//         <script src="https://cdn.tailwindcss.com"></script>
//         <script>
//             tailwind.config = {
//                 theme: {
//                     extend: {
//                         fontFamily: {
//                             sans: ['Inter', 'sans-serif'],
//                         },
//                     }
//                 }
//             }
//         </script>
//         <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
//         <!-- Load Stripe.js -->
//         <script src="https://js.stripe.com/v3/"></script>

//         <style>
//             /* Custom styles for the Payment Element to ensure responsiveness and good looks */
//             .StripeElement {
//                 box-sizing: border-box;
//                 height: 48px; /* Increased height for better touch target */
//                 padding: 12px 16px;
//                 border: 1px solid #e5e7eb; /* gray-200 */
//                 border-radius: 0.75rem; /* rounded-xl */
//                 background-color: white;
//                 box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
//                 transition: box-shadow 0.15s ease, border-color 0.15s ease;
//             }
//             .StripeElement--focus {
//                 border-color: #3b82f6; /* blue-500 */
//                 box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5); /* blue-500 with opacity */
//             }
//             .StripeElement--invalid {
//                 border-color: #ef4444; /* red-500 */
//             }
//         </style>

//         <div class="min-h-screen bg-gray-50 font-sans p-4 md:p-8">
//             <div class="max-w-6xl mx-auto shadow-2xl rounded-2xl bg-white overflow-hidden">

//                 <!-- Header -->
//                 <header class="bg-gray-800 p-5 text-white flex justify-between items-center">
//                     <h1 class="text-2xl font-bold tracking-tight">E-Commerce Checkout</h1>
//                     <div class="text-sm font-medium">
//                         Step: <span class="uppercase tracking-wider font-semibold text-teal-300">{{ view }}</span>
//                     </div>
//                 </header>

//                 <div class="p-6 md:p-10 lg:grid lg:grid-cols-3 lg:gap-10">

//                     <!-- LEFT COLUMN: Cart Summary & Totals -->
//                     <div class="lg:col-span-1 mb-8 lg:mb-0">
//                         <h2 class="text-xl font-semibold mb-4 text-gray-700">Order Summary</h2>
//                         <div class="bg-gray-100 p-5 rounded-xl shadow-inner">

//                             <!-- Cart Items List -->
//                             <div *ngIf="!cartSummary.isEmpty; else emptyCart">
//                                 <div *ngFor="let item of cartSummary.items" class="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
//                                     <div class="flex items-center space-x-3">
//                                         <span class="w-10 h-10 flex items-center justify-center bg-gray-200 rounded-lg text-sm font-medium text-gray-700">{{ item.name ? item.name.slice(0, 2) : '??' }}</span>
//                                         <div class="flex-grow">
//                                             <p class="font-medium text-gray-800">{{ item.name }}</p>
//                                             <p class="text-sm text-gray-500">
//                                                 {{ item.price | currency:'USD':'symbol' }} x {{ item.quantity }}
//                                                 <span *ngIf="item.discountPercentage" class="text-red-500 text-xs"> ({{ item.discountPercentage }}% off)</span>
//                                             </p>
//                                         </div>
//                                     </div>
//                                     <div class="text-right">
//                                         <p class="font-semibold text-gray-800">{{ item.subTotal | currency:'USD':'symbol' }}</p>
//                                         <!-- Quantity Controls only visible in 'cart' view -->
//                                         <div *ngIf="view === 'cart'" class="flex space-x-1 mt-1 justify-end">
//                                             <button (click)="updateQuantity(item.product, item.quantity - 1)" class="text-xs text-gray-600 hover:text-red-500 p-0.5 rounded-full hover:bg-white transition">
//                                                 &minus;
//                                             </button>
//                                             <span class="text-xs text-gray-600 w-4 text-center">{{ item.quantity }}</span>
//                                             <button (click)="updateQuantity(item.product, item.quantity + 1)" class="text-xs text-gray-600 hover:text-teal-500 p-0.5 rounded-full hover:bg-white transition">
//                                                 &plus;
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             <!-- Empty Cart State -->
//                             <ng-template #emptyCart>
//                                 <div class="text-center py-6">
//                                     <p class="text-gray-500">Your cart is empty.</p>
//                                     <button (click)="addItemToCart(productStore.getAllProducts()[0]._id!)" class="mt-3 text-sm font-medium text-teal-600 hover:text-teal-700">
//                                         Add Sample Product
//                                     </button>
//                                 </div>
//                             </ng-template>

//                             <!-- Totals Breakdown -->
//                             <div class="mt-4 pt-4 border-t border-gray-300 space-y-2 text-sm">
//                                 <div class="flex justify-between">
//                                     <span class="text-gray-600">Items Price ({{ cartSummary.itemsCount }} items)</span>
//                                     <span class="font-medium text-gray-800">{{ cartSummary.itemsPrice | currency:'USD':'symbol' }}</span>
//                                 </div>
//                                 <div class="flex justify-between">
//                                     <span class="text-gray-600">Shipping (Mock Rule: Free over $100)</span>
//                                     <span class="font-medium text-gray-800">{{ currentOrder?.shippingPrice ? (currentOrder.shippingPrice | currency:'USD':'symbol') : '---' }}</span>
//                                 </div>
//                                 <div class="flex justify-between">
//                                     <span class="text-gray-600">Tax (10%)</span>
//                                     <span class="font-medium text-gray-800">{{ currentOrder?.taxPrice ? (currentOrder.taxPrice | currency:'USD':'symbol') : '---' }}</span>
//                                 </div>
//                             </div>

//                             <!-- Grand Total -->
//                             <div class="mt-4 pt-4 border-t border-gray-300 flex justify-between items-center">
//                                 <span class="text-lg font-bold text-gray-800">Order Total</span>
//                                 <span class="text-2xl font-extrabold text-teal-600">{{ currentOrder?.totalPrice ? (currentOrder.totalPrice | currency:'USD':'symbol') : (cartSummary.itemsPrice | currency:'USD':'symbol') }}</span>
//                             </div>
//                         </div>
//                     </div>

//                     <!-- RIGHT COLUMN: Checkout Steps -->
//                     <div class="lg:col-span-2">

//                         <!-- Step 1: Cart View -->
//                         <div *ngIf="view === 'cart'">
//                             <h2 class="text-xl font-semibold mb-6 text-gray-700">1. Review Your Cart</h2>
//                             <div class="flex justify-end">
//                                 <button
//                                     (click)="goToShipping()"
//                                     [disabled]="cartSummary.isEmpty"
//                                     class="px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl shadow-lg hover:bg-teal-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
//                                     Proceed to Shipping ({{ cartSummary.itemsPrice | currency:'USD':'symbol' }})
//                                 </button>
//                             </div>
//                         </div>

//                         <!-- Step 2: Shipping Form -->
//                         <div *ngIf="view === 'shipping'">
//                             <h2 class="text-xl font-semibold mb-6 text-gray-700">2. Shipping & Payment Method</h2>

//                             <form [formGroup]="shippingForm" (ngSubmit)="createOrderAndGoToNextStep()" class="space-y-8">

//                                 <div class="p-6 border border-gray-200 rounded-xl space-y-4">
//                                     <h3 class="text-lg font-medium text-gray-800">Shipping Details</h3>
//                                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         <div>
//                                             <label for="address" class="block text-sm font-medium text-gray-700">Address</label>
//                                             <input id="address" formControlName="address" type="text" placeholder="123 Main St" class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 focus:border-teal-500 focus:ring-teal-500">
//                                             <p *ngIf="shippingForm.get('address')?.invalid && shippingForm.get('address')?.touched" class="text-red-500 text-xs mt-1">Address is required.</p>
//                                         </div>
//                                         <div>
//                                             <label for="city" class="block text-sm font-medium text-gray-700">City</label>
//                                             <input id="city" formControlName="city" type="text" placeholder="San Francisco" class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 focus:border-teal-500 focus:ring-teal-500">
//                                             <p *ngIf="shippingForm.get('city')?.invalid && shippingForm.get('city')?.touched" class="text-red-500 text-xs mt-1">City is required.</p>
//                                         </div>
//                                     </div>
//                                     <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         <div>
//                                             <label for="postalCode" class="block text-sm font-medium text-gray-700">Postal Code</label>
//                                             <input id="postalCode" formControlName="postalCode" type="text" placeholder="94107" class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 focus:border-teal-500 focus:ring-teal-500">
//                                             <p *ngIf="shippingForm.get('postalCode')?.invalid && shippingForm.get('postalCode')?.touched" class="text-red-500 text-xs mt-1">Postal Code is required.</p>
//                                         </div>
//                                         <div>
//                                             <label for="country" class="block text-sm font-medium text-gray-700">Country</label>
//                                             <input id="country" formControlName="country" type="text" placeholder="USA" class="mt-1 block w-full rounded-xl border-gray-300 shadow-sm p-3 focus:border-teal-500 focus:ring-teal-500">
//                                             <p *ngIf="shippingForm.get('country')?.invalid && shippingForm.get('country')?.touched" class="text-red-500 text-xs mt-1">Country is required.</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <!-- Payment Method Selection -->
//                                 <div class="p-6 border border-gray-200 rounded-xl space-y-4">
//                                     <h3 class="text-lg font-medium text-gray-800">Payment Method</h3>

//                                     <div class="space-y-3">
//                                         <label class="flex items-center p-4 bg-white border border-gray-300 rounded-xl cursor-pointer hover:border-teal-500 transition">
//                                             <input type="radio" formControlName="paymentMethod" value="stripe" class="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500">
//                                             <span class="ml-3 font-medium text-gray-700">Pay with Card (Stripe)</span>
//                                             <svg xmlns="http://www.w3.org/2000/svg" class="ml-auto h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fill-rule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 12a1 1 0 110-2 1 1 0 010 2z" clip-rule="evenodd" /></svg>
//                                         </label>

//                                         <label class="flex items-center p-4 bg-white border border-gray-300 rounded-xl cursor-pointer hover:border-teal-500 transition">
//                                             <input type="radio" formControlName="paymentMethod" value="cash_on_delivery" class="h-4 w-4 text-teal-600 border-gray-300 focus:ring-teal-500">
//                                             <span class="ml-3 font-medium text-gray-700">Cash on Delivery (COD)</span>
//                                             <svg xmlns="http://www.w3.org/2000/svg" class="ml-auto h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2l-2 2v-2h6.586l.27-.27m 0 0L17 12V9m2 2l-2-2m2 2V9" /></svg>
//                                         </label>
//                                     </div>

//                                     <p *ngIf="shippingForm.get('paymentMethod')?.invalid && shippingForm.get('paymentMethod')?.touched" class="text-red-500 text-xs mt-1">Payment method is required.</p>
//                                 </div>

//                                 <div class="flex justify-between pt-4">
//                                     <button (click)="view = 'cart'" type="button" class="text-sm text-gray-600 hover:text-teal-600 transition">
//                                         &larr; Back to Cart
//                                     </button>
//                                     <button type="submit" [disabled]="shippingForm.invalid || isProcessing"
//                                         class="px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl shadow-lg hover:bg-teal-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
//                                         <span *ngIf="!isProcessing">
//                                             {{ shippingForm.get('paymentMethod')?.value === 'stripe' ? 'Continue to Payment' : 'Place Order' }}
//                                         </span>
//                                         <span *ngIf="isProcessing" class="flex items-center">
//                                             <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
//                                             Creating Order...
//                                         </span>
//                                     </button>
//                                 </div>
//                             </form>
//                         </div>

//                         <!-- Step 3: Payment (Stripe Only) -->
//                         <div *ngIf="view === 'payment' && currentOrder">
//                             <h2 class="text-xl font-semibold mb-6 text-gray-700">3. Complete Your Purchase</h2>

//                             <div class="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-lg">
//                                 <p class="font-medium">Total Charge: {{ currentOrder.totalPrice | currency:'USD':'symbol' }}</p>
//                                 <p class="text-sm">Please use test cards like 4242... for the Stripe integration below.</p>
//                             </div>

//                             <!-- Stripe Payment Element Container -->
//                             <div id="payment-element-container" class="mb-6">
//                                 <!-- The Stripe Payment Element will be mounted here -->
//                             </div>

//                             <div class="flex justify-between pt-4">
//                                 <button (click)="view = 'shipping'" type="button" [disabled]="isProcessing" class="text-sm text-gray-600 hover:text-teal-600 transition">
//                                     &larr; Back to Shipping
//                                 </button>
//                                 <button (click)="confirmPayment()" [disabled]="isProcessing"
//                                     class="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-lg hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
//                                     <span *ngIf="!isProcessing">Pay Now</span>
//                                     <span *ngIf="isProcessing" class="flex items-center">
//                                         <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
//                                         Processing Payment...
//                                     </span>
//                                 </button>
//                             </div>
//                             <div *ngIf="paymentError" class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//                                 <p class="font-medium">Payment Error:</p>
//                                 <p class="text-sm">{{ paymentError }}</p>
//                             </div>
//                         </div>

//                         <!-- Step 4: Success -->
//                         <div *ngIf="view === 'success'">
//                             <div class="text-center py-16 rounded-xl" [ngClass]="{'bg-green-50': finalOrder?.isPaid, 'bg-blue-50': finalOrder?.paymentMethod === 'cash_on_delivery'}">
//                                 <svg *ngIf="finalOrder?.isPaid" class="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
//                                 <svg *ngIf="finalOrder?.paymentMethod === 'cash_on_delivery'" class="w-16 h-16 mx-auto text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c1.657 0 3 .895 3 2s-1.343 2-3 2v5m0-5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>

//                                 <h2 class="text-3xl font-bold mt-4" [ngClass]="{'text-green-700': finalOrder?.isPaid, 'text-blue-700': finalOrder?.paymentMethod === 'cash_on_delivery'}">
//                                     Order Placed Successfully!
//                                 </h2>

//                                 <p *ngIf="finalOrder?.isPaid" class="text-gray-600 mt-2">
//                                     Payment via Stripe Confirmed.
//                                 </p>
//                                 <p *ngIf="finalOrder?.paymentMethod === 'cash_on_delivery'" class="text-gray-600 mt-2">
//                                     Payment Method: Cash on Delivery. Order total: {{ finalOrder?.totalPrice | currency:'USD':'symbol' }}
//                                 </p>

//                                 <p class="text-sm text-gray-500 mt-1">Order ID: {{ finalOrder?._id }}</p>

//                                 <button (click)="startNewOrder()" class="mt-8 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition duration-300">
//                                     Start New Order
//                                 </button>
//                             </div>
//                         </div>

//                     </div>
//                 </div>
//             </div>
//         </div>
//     `,
//     changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class App implements OnInit, OnDestroy {
//     private fb = inject(FormBuilder);
//     private cartService = inject(CartService);
//     private orderService = inject(OrderService);
//     public productStore = inject(MockProductStore);

//     private destroy$ = new Subject<void>();
//     private cartUnsubscribe: (() => void) | undefined;

//     // Component State
//     view: 'cart' | 'shipping' | 'payment' | 'success' = 'cart';
//     isProcessing: boolean = false;
//     paymentError: string | null = null;
//     currentOrder: Order | null = null;
//     finalOrder: Order | null = null;

//     // Cart State from Service Listener
//     cartSummary: { items: OrderItem[], itemsPrice: number, itemsCount: number, isEmpty: boolean } = {
//         items: [],
//         itemsPrice: 0,
//         itemsCount: 0,
//         isEmpty: true
//     };

//     // Shipping and Payment Form
//     shippingForm = this.fb.group({
//         address: ['123 Mock Street', [Validators.required]],
//         city: ['San Francisco', [Validators.required]],
//         postalCode: ['94107', [Validators.required]],
//         country: ['USA', [Validators.required]],
//         paymentMethod: ['stripe' as PaymentMethod, [Validators.required]],
//     });

//     ngOnInit(): void {
//         // Set up the cart listener
//         this.cartUnsubscribe = this.cartService.onChange(() => {
//             this.updateCartSummary();
//         });

//         // Add a product to start the flow if the cart is empty
//         if (this.cartService.getItems().length === 0) {
//             this.cartService.addItem(this.productStore.getAllProducts()[1]._id!, 1);
//         } else {
//             this.updateCartSummary(); // Ensure initial state is set
//         }

//         // Initialize Stripe (must happen after script load)
//         setTimeout(() => {
//              // Mock Test Publishable Key for Stripe
//             const STRIPE_PUBLISHABLE_KEY = 'pk_test_51MockedKeyForFrontendTesting0000000000';
//             if (typeof Stripe !== 'undefined') {
//                 stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
//             } else {
//                 console.error("Stripe.js not loaded!");
//             }
//         }, 500);
//     }

//     ngOnDestroy(): void {
//         this.destroy$.next();
//         this.destroy$.complete();
//         if (this.cartUnsubscribe) {
//             this.cartUnsubscribe();
//         }
//     }

//     private updateCartSummary(): void {
//         const summary = this.cartService.getSummary();
//         this.cartSummary = {
//             ...summary,
//             isEmpty: summary.items.length === 0
//         };
//         // Reset currentOrder if cart becomes empty
//         if (this.cartSummary.isEmpty) {
//             this.currentOrder = null;
//             this.view = 'cart';
//         }
//     }

//     /** Helper to add initial sample product */
//     addItemToCart(productId: string): void {
//         this.cartService.addItem(productId, 1);
//     }

//     /** Handles quantity updates from the cart view */
//     updateQuantity(productId: string, quantity: number): void {
//         if (quantity < 1) {
//             this.cartService.removeItem(productId);
//         } else {
//             this.cartService.updateItemQuantity(productId, quantity);
//         }
//     }

//     /** Transitions from cart to shipping and initiates recalculation of totals. */
//     goToShipping(): void {
//         if (!this.cartSummary.isEmpty) {
//             // Use the mock order service to get the final totals (including shipping/tax)
//             this.isProcessing = true;
//             const mockOrderData: Partial<Order> = {
//                 orderItems: this.cartSummary.items,
//                 shippingAddress: this.shippingForm.value as ShippingAddress,
//                 paymentMethod: this.shippingForm.get('paymentMethod')?.value as PaymentMethod,
//             };

//             this.orderService.createOrder(mockOrderData).then(({ order }) => {
//                 this.currentOrder = order;
//                 this.view = 'shipping';
//             }).catch(error => {
//                 console.error('Error calculating totals:', error);
//                 this.paymentError = 'Failed to calculate final totals. Please try again.';
//             }).finally(() => {
//                 this.isProcessing = false;
//             });
//         }
//     }

//     /** Creates the mock order and proceeds to payment or success based on method. */
//     async createOrderAndGoToNextStep(): Promise<void> {
//         if (this.shippingForm.invalid || this.isProcessing || this.cartSummary.isEmpty) {
//             return;
//         }

//         this.isProcessing = true;
//         this.paymentError = null;

//         const { address, city, postalCode, country, paymentMethod } = this.shippingForm.value;

//         const orderData: Partial<Order> = {
//             orderItems: this.cartSummary.items,
//             shippingAddress: { address: address!, city: city!, postalCode: postalCode!, country: country! },
//             paymentMethod: paymentMethod as PaymentMethod,
//         };

//         try {
//             // Re-create the order to get the final server-side calculation and client secret
//             const { order, clientSecret } = await this.orderService.createOrder(orderData);
//             this.currentOrder = order;

//             if (order.paymentMethod === 'stripe' && clientSecret) {
//                 // Stripe: Go to payment and initialize elements
//                 this.initializeStripeElements(clientSecret);
//                 this.view = 'payment';
//             } else if (order.paymentMethod === 'cash_on_delivery') {
//                 // COD: Payment is complete on the spot (mock success)
//                 this.finalOrder = order;
//                 this.cartService.clear();
//                 this.view = 'success';
//             }
//         } catch (error) {
//             console.error('Order creation failed:', error);
//             this.paymentError = 'Failed to place order. Please check details and cart.';
//         } finally {
//             this.isProcessing = false;
//         }
//     }

//     /** Initializes Stripe Elements using the Client Secret. */
//     private initializeStripeElements(clientSecret: string): void {
//         if (!stripe || !clientSecret) {
//             this.paymentError = 'Stripe initialization failed. Please reload.';
//             return;
//         }

//         elements = stripe.elements({ clientSecret });

//         // Create and mount the Payment Element
//         const paymentElementContainer = document.getElementById('payment-element-container');
//         if (paymentElementContainer) {
//             // Unmount existing element if present
//             if (paymentElement) {
//                 paymentElement.destroy();
//             }
//             paymentElement = elements.create('payment', {
//                 layout: {
//                     type: 'tabs',
//                     defaultCollapsed: false,
//                     radios: false,
//                     spaced: true,
//                 }
//             });
//             paymentElement.mount(paymentElementContainer);
//             this.paymentError = null; // Clear previous errors
//         } else {
//             this.paymentError = 'Payment container element not found.';
//         }
//     }

//     /** Confirms the Stripe payment. */
//     async confirmPayment(): Promise<void> {
//         if (!stripe || !elements || !this.currentOrder?._id) {
//             this.paymentError = 'Payment system not ready.';
//             return;
//         }

//         this.isProcessing = true;
//         this.paymentError = null;

//         // Use the current domain as the mock return URL
//         const returnUrl = window.location.href.split('?')[0];

//         try {
//             // Confirm the payment using the element data
//             const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
//                 elements,
//                 redirect: 'if_required', // Do not redirect in this sandbox, handle result manually
//             });

//             if (stripeError) {
//                 // Show error to the user
//                 this.paymentError = stripeError.message;
//                 console.error('Stripe Confirmation Error:', stripeError);
//             } else if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture')) {
//                 // Mock: Update server side with payment result (which also clears cart/reserves stock)
//                 const paymentResult: PaymentResult = {
//                     id: paymentIntent.id,
//                     status: paymentIntent.status,
//                     update_time: new Date().toISOString(),
//                 };

//                 const paidOrder = await this.orderService.updateOrderToPaid(this.currentOrder._id, paymentResult);

//                 // Finalize success state
//                 this.finalOrder = paidOrder;
//                 this.cartService.clear();
//                 this.view = 'success';
//             } else {
//                 // Handle other statuses (e.g., processing, requires action)
//                 this.paymentError = `Payment is currently ${paymentIntent?.status ?? 'in progress'}. Please check back later.`;
//             }
//         } catch (error) {
//             console.error('Unexpected payment error:', error);
//             this.paymentError = 'An unexpected error occurred during payment confirmation.';
//         } finally {
//             this.isProcessing = false;
//         }
//     }

//     /** Resets the application state to start a new order. */
//     startNewOrder(): void {
//         this.view = 'cart';
//         this.finalOrder = null;
//         this.currentOrder = null;
//         this.paymentError = null;
//         this.shippingForm.reset({ paymentMethod: 'stripe' });
//     }
// }
