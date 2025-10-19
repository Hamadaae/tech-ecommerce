import { createFeatureSelector, createSelector } from '@ngrx/store';
import { OrderState } from './order.reducer';

// 1️⃣ Select the entire orders feature slice
export const selectOrderState = createFeatureSelector<OrderState>('orders');

// 2️⃣ Basic selectors
export const selectAllOrders = createSelector(
  selectOrderState,
  (state) => state.orders
);

export const selectMyOrders = createSelector(
  selectOrderState,
  (state) => state.myOrders
);

export const selectCurrentOrder = createSelector(
  selectOrderState,
  (state) => state.currentOrder
);

export const selectOrdersLoading = createSelector(
  selectOrderState,
  (state) => state.loading
);

export const selectOrdersError = createSelector(
  selectOrderState,
  (state) => state.error
);

// 3️⃣ Derived selectors (optional but useful)
export const selectIsOrderLoaded = createSelector(
  selectOrderState,
  (state) => !state.loading && !!state.currentOrder
);

export const selectHasOrders = createSelector(
  selectOrderState,
  (state) => state.orders.length > 0
);

export const selectHasMyOrders = createSelector(
  selectOrderState,
  (state) => state.myOrders.length > 0
);

// 4️⃣ Select an order by ID (for details pages)
export const selectOrderById = (orderId: string) =>
  createSelector(selectAllOrders, (orders) =>
    orders.find((order) => order._id === orderId)
  );
