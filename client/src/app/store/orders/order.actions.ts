import { createAction, props } from '@ngrx/store';
import { Order } from '../../core/models/order.model';

export const createOrder = createAction(
  '[Order] Create Order',
  props<{ orderData: Partial<Order> }>()
);

export const createOrderSuccess = createAction(
  '[Order] Create Order Success',
  props<{ order: Order; checkoutSessionId?: string; checkoutUrl?: string }>()
);

export const createOrderFailure = createAction(
  '[Order] Create Order Failure',
  props<{ error: string }>()
);

export const loadMyOrders = createAction('[Order] Load My Orders');

export const loadMyOrdersSuccess = createAction(
  '[Order] Load My Orders Success',
  props<{ orders: Order[] }>()
);

export const loadMyOrdersFailure = createAction(
  '[Order] Load My Orders Failure',
  props<{ error: string }>()
);

export const loadOrderById = createAction(
  '[Order] Load Order By ID',
  props<{ orderId: string }>()
);

export const loadOrderByIdSuccess = createAction(
  '[Order] Load Order By ID Success',
  props<{ order: Order }>()
);

export const loadOrderByIdFailure = createAction(
  '[Order] Load Order By ID Failure',
  props<{ error: string }>()
);

export const updateOrderToPaid = createAction(
  '[Order] Update Order To Paid',
  props<{ orderId: string; sessionId: string }>()
);

export const updateOrderToPaidSuccess = createAction(
  '[Order] Update Order To Paid Success',
  props<{ order: Order }>()
);

export const updateOrderToPaidFailure = createAction(
  '[Order] Update Order To Paid Failure',
  props<{ error: string }>()
);

export const loadAllOrders = createAction('[Order] Load All Orders');

export const loadAllOrdersSuccess = createAction(
  '[Order] Load All Orders Success',
  props<{ orders: Order[] }>()
);

export const loadAllOrdersFailure = createAction(
  '[Order] Load All Orders Failure',
  props<{ error: string }>()
);

export const updateOrderStatus = createAction(
  '[Order] Update Order Status',
  props<{ orderId: string; isDelivered: boolean }>()
);

export const updateOrderStatusSuccess = createAction(
  '[Order] Update Order Status Success',
  props<{ order: Order }>()
);

export const updateOrderStatusFailure = createAction(
  '[Order] Update Order Status Failure',
  props<{ error: string }>()
);

export const deleteOrder = createAction(
  '[Order] Delete Order',
  props<{ orderId: string }>()
);

export const deleteOrderSuccess = createAction(
  '[Order] Delete Order Success',
  props<{ orderId: string }>()
);

export const deleteOrderFailure = createAction(
  '[Order] Delete Order Failure',
  props<{ error: string }>()
);
