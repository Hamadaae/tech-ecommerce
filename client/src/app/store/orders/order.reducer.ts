import { createReducer, on } from '@ngrx/store';
import * as OrderActions from './order.actions';
import { Order } from '../../core/models/order.model';

export interface OrderState {
  orders: Order[];
  myOrders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

export const initialState: OrderState = {
  orders: [],
  myOrders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

export const orderReducer = createReducer(
  initialState,

  on(OrderActions.createOrder, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(OrderActions.createOrderSuccess, (state, { order }) => ({
    ...state,
    loading: false,
    currentOrder: order,
  })),
  on(OrderActions.createOrderFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(OrderActions.loadMyOrders, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(OrderActions.loadMyOrdersSuccess, (state, { orders }) => ({
    ...state,
    loading: false,
    myOrders: orders,
  })),
  on(OrderActions.loadMyOrdersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(OrderActions.loadOrderById, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(OrderActions.loadOrderByIdSuccess, (state, { order }) => ({
    ...state,
    loading: false,
    currentOrder: order,
  })),
  on(OrderActions.loadOrderByIdFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(OrderActions.updateOrderToPaid, (state) => ({
    ...state,
    loading: true,
  })),
  on(OrderActions.updateOrderToPaidSuccess, (state, { order }) => ({
    ...state,
    loading: false,
    currentOrder: order,
  })),
  on(OrderActions.updateOrderToPaidFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(OrderActions.loadAllOrders, (state) => ({
    ...state,
    loading: true,
  })),
  on(OrderActions.loadAllOrdersSuccess, (state, { orders }) => ({
    ...state,
    loading: false,
    orders,
  })),
  on(OrderActions.loadAllOrdersFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(OrderActions.updateOrderStatus, (state) => ({
    ...state,
    loading: true,
  })),
  on(OrderActions.updateOrderStatusSuccess, (state, { order }) => ({
    ...state,
    loading: false,
    orders: state.orders.map((o) => (o._id === order._id ? order : o)),
  })),
  on(OrderActions.updateOrderStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(OrderActions.deleteOrder, (state) => ({
    ...state,
    loading: true,
  })),
  on(OrderActions.deleteOrderSuccess, (state, { orderId }) => ({
    ...state,
    loading: false,
    orders: state.orders.filter((o) => o._id !== orderId),
  })),
  on(OrderActions.deleteOrderFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
