export interface YemeksepetiDispatchOrder {
  token: string;
  code: string;
  comments?: {
    customerComment?: string;
    [key: string]: any;
  };
  createdAt?: string;
  customer?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    mobilePhone?: string;
    flags?: string[];
    [key: string]: any;
  };
  delivery?: {
    address?: any;
    expectedDeliveryTime?: string;
    expressDelivery?: boolean;
    riderPickupTime?: string | null;
    [key: string]: any;
  };
  discounts?: any[];
  expeditionType?: 'pickup' | 'delivery';
  expiryDate?: string;
  extraParameters?: Record<string, unknown>;
  invoicingInformation?: Record<string, unknown>;
  localInfo?: {
    countryCode?: string;
    currencySymbol?: string;
    platform?: string;
    platformKey?: string;
    [key: string]: any;
  };
  payment?: {
    status?: string;
    type?: string;
    [key: string]: any;
  };
  test?: boolean;
  shortCode?: string | null;
  preOrder?: boolean;
  pickup?: any;
  platformRestaurant?: {
    id?: string;
    name?: string;
    [key: string]: any;
  };
  price?: Record<string, any>;
  products?: any[];
  corporateTaxId?: string;
  integrationInfo?: Record<string, any>;
  mobileOrder?: boolean;
  webOrder?: boolean;
  vouchers?: any[];
  PreparationTimeAdjustments?: Record<string, any>;
  callbackUrls?: {
    orderAcceptedUrl?: string;
    orderRejectedUrl?: string;
    orderPickedUpUrl?: string;
    orderPreparedUrl?: string;
    orderProductModificationUrl?: string;
    orderPreparationTimeAdjustmentUrl?: string;
    [key: string]: any;
  };
}
