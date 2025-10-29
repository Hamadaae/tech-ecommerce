import { Injectable, OnDestroy } from "@angular/core";
import { AuthService } from "./auth.service";
import { NotificationService } from "./notification.service";
import { User } from "../models/user.model";
import { Store } from "@ngrx/store";
import { selectUser, isLoggedIn } from "../../store/auth/auth.selectors";
import { Subscription } from "rxjs";

const WISHLIST_STORAGE_KEY_PREFIX = 'angular-ecommerce-wishlist';

export interface WishlistItem {
  product: string;   // product ID
  name: string;
  price: number;
  image?: string;
}

@Injectable({ providedIn: "root" })
export class WishlistService implements OnDestroy {
  private items: WishlistItem[] = [];
  private listeners: Array<() => void> = [];
  private isReady = false;
  private currentUser: User | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private store: Store
  ) {
    this.subscriptions.add(
      this.store.select(selectUser).subscribe(user => {
        this.currentUser = user;
        this.load();
      })
    );
    this.subscriptions.add(
      this.store.select(isLoggedIn).subscribe(isLoggedIn => {
        if (!isLoggedIn) {
          this.currentUser = null;
          this.load();
        }
      })
    );
    this.isReady = true;
    console.log("WishlistService initialized using localStorage.");
  }

  private getWishlistStorageKey(): string {
    const userId = this.currentUser ? this.currentUser._id : 'guest';
    return `${WISHLIST_STORAGE_KEY_PREFIX}-${userId}`;
  }

  private load(): void {
    try {
      const storedWishlist = localStorage.getItem(this.getWishlistStorageKey());
      if (storedWishlist) {
        this.items = JSON.parse(storedWishlist) as WishlistItem[];
      } else {
        this.items = [];
      }
    } catch (e) {
      console.error("WishlistService: Failed to load from localStorage.", e);
      this.items = [];
    }
    this.emit();
  }

  private save(newItems: WishlistItem[]): void {
    this.items = newItems;
    try {
      localStorage.setItem(this.getWishlistStorageKey(), JSON.stringify(newItems));
    } catch (e) {
      console.error('Wishlist save error (localStorage)', e);
    }
    this.emit();
  }

  onChange(cb: () => void): () => void {
    this.listeners.push(cb);
    if (this.isReady) cb();

    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private emit() {
    this.listeners.forEach(cb => {
      try { cb(); } catch (e) { console.error('wishlist listener error', e); }
    });
  }

  getItems(): WishlistItem[] {
    return this.items.map(item => ({ ...item }));
  }

  isInWishlist(productId: string): boolean {
    return this.items.some(item => item.product === productId);
  }

  async addItem(item: WishlistItem): Promise<void> {
    if (this.isInWishlist(item.product)) {
      this.notificationService.info('Already in wishlist.');
      return;
    }

    const updatedItems = [...this.items, item];
    this.save(updatedItems);
    this.notificationService.success('Added to wishlist!');
  }

  async removeItem(productId: string): Promise<void> {
    const updatedItems = this.items.filter(item => item.product !== productId);
    if (updatedItems.length !== this.items.length) {
      this.save(updatedItems);
      this.notificationService.info('Removed from wishlist.');
    }
  }

  async clear(): Promise<void> {
    this.save([]);
  }

  getCount(): number {
    return this.items.length;
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
