export interface OrderItem {
    product : string,
    name : string, 
    quantity : number,
    price : number,
    discountPercentage? : number,
    image? : string ,
    subTotal? : number,
    _id? : string

}

export interface ShippingAddress {
    address : string,
    city : string,
    postalCode : string,
    country : string
}

export type PaymentMethod = 'stripe' | 'cash_on_delivery' 

export interface PaymentResult {
    id? : string,
    status? : string,
    update_time? : string,
    [key : string] : any;
}

export interface Order {
  _id?: string;
  user?: string | any;
  orderItems: OrderItem[]; 
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  stripeReceiptUrl?: string;
  itemsPrice?: number;
  shippingPrice?: number;
  taxPrice?: number;
  totalPrice?: number;
  isPaid?: boolean;
  paidAt?: string; 
  isDelivered?: boolean;
  deliveredAt?: string;
  stockReserved?: boolean;
  createdAt?: string;
  updatedAt?: string;
  paymentResult?: PaymentResult;
}