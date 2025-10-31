import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as OrderActions from './order.actions';
import { OrderService } from '../../core/services/order.service';
import { catchError, map, mergeMap, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class OrderEffects {
  private actions$ = inject(Actions);
  private orderService = inject(OrderService);
  private router = inject(Router);

  constructor() {} 

  createOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.createOrder),
      mergeMap(({ orderData }) =>
        this.orderService.createOrder(orderData).pipe(
          map((res) =>
            OrderActions.createOrderSuccess({
              order: res.order,
              checkoutSessionId: res.checkoutSessionId,
              checkoutUrl: res.checkoutUrl,
            })
          ),
          catchError((err: any) =>
            of(
              OrderActions.createOrderFailure({
                error: err.error?.message || err.message || 'Create order failed',
              })
            )
          )
        )
      )
    )
  );

  createOrderSuccessRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(OrderActions.createOrderSuccess),
        switchMap(({ order }) => {
          if (order && order._id) {
            this.router.navigate([`/orders/${order._id}`]);
          }
          return of(); 
        })
      ),
    { dispatch: false }
  );

  loadMyOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.loadMyOrders),
      mergeMap(() =>
        this.orderService.getMyOrders().pipe(
          map((orders) => OrderActions.loadMyOrdersSuccess({ orders })),
          catchError((err: any) =>
            of(
              OrderActions.loadMyOrdersFailure({
                error: err.error?.message || err.message || 'Failed to load orders',
              })
            )
          )
        )
      )
    )
  );

  loadOrderById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.loadOrderById),
      mergeMap(({ orderId }) =>
        this.orderService.getOrderById(orderId).pipe(
          map((order) => OrderActions.loadOrderByIdSuccess({ order })),
          catchError((err: any) =>
            of(
              OrderActions.loadOrderByIdFailure({
                error: err.error?.message || err.message || 'Failed to load order',
              })
            )
          )
        )
      )
    )
  );

  updateOrderToPaid$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.updateOrderToPaid),
<<<<<<< HEAD
      mergeMap(({ orderId, paymentResult }) =>
        this.orderService.updateOrderToPaid(orderId, paymentResult).pipe(
=======
      mergeMap(({ orderId, sessionId }) =>
        this.orderService.updateOrderToPaid(orderId, sessionId).pipe(
>>>>>>> cd75363 (Payment Stuff)
          map((order) => OrderActions.updateOrderToPaidSuccess({ order })),
          catchError((err: any) =>
            of(
              OrderActions.updateOrderToPaidFailure({
                error: err.error?.message || err.message || 'Failed to update order payment',
              })
            )
          )
        )
      )
    )
  );

  loadAllOrders$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.loadAllOrders),
      mergeMap(() =>
        this.orderService.getAllOrders().pipe(
          map((orders) => OrderActions.loadAllOrdersSuccess({ orders : orders.data })),
          catchError((err: any) =>
            of(
              OrderActions.loadAllOrdersFailure({
                error: err.error?.message || err.message || 'Failed to load orders (admin)',
              })
            )
          )
        )
      )
    )
  );

  updateOrderStatus$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.updateOrderStatus),
      mergeMap(({ orderId, isDelivered }) =>
        this.orderService.updateOrderStatus(orderId, isDelivered).pipe(
          map((order) => OrderActions.updateOrderStatusSuccess({ order })),
          catchError((err: any) =>
            of(
              OrderActions.updateOrderStatusFailure({
                error: err.error?.message || err.message || 'Failed to update order status',
              })
            )
          )
        )
      )
    )
  );

  deleteOrder$ = createEffect(() =>
    this.actions$.pipe(
      ofType(OrderActions.deleteOrder),
      mergeMap(({ orderId }) =>
        this.orderService.deleteOrder(orderId).pipe(
          map(() => OrderActions.deleteOrderSuccess({ orderId })),
          catchError((err: any) =>
            of(
              OrderActions.deleteOrderFailure({
                error: err.error?.message || err.message || 'Failed to delete order',
              })
            )
          )
        )
      )
    )
  );
}
