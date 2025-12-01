"use client";

import { Separator } from "@/components/ui/separator";

interface PriceDetails {
  grandTotal: number;
  totalNet: number;
  vatTotal: number;
  deliveryFee: number;
  riderTip: number;
  collectFromCustomer: number;
}

interface OrderPriceBreakdownProps {
  payload: any;
  fallbackPrice?: number;
}

// Payload'dan fiyat bilgilerini çıkart
export function extractPriceDetails(payload: any): PriceDetails {
  const price = payload?.price || {};

  // deliveryFees dizisinden toplam teslimat ücreti
  let deliveryFee = 0;
  if (Array.isArray(price.deliveryFees)) {
    deliveryFee = price.deliveryFees.reduce((sum: number, fee: any) => {
      return sum + parseFloat(fee?.value || fee?.amount || "0");
    }, 0);
  }

  return {
    grandTotal: parseFloat(price.grandTotal || "0"),
    totalNet: parseFloat(price.totalNet || "0"),
    vatTotal: parseFloat(price.vatTotal || "0"),
    deliveryFee,
    riderTip: parseFloat(price.riderTip || "0"),
    collectFromCustomer: parseFloat(price.collectFromCustomer || "0"),
  };
}

export function OrderPriceBreakdown({ payload, fallbackPrice }: OrderPriceBreakdownProps) {
  const priceDetails = extractPriceDetails(payload);

  // Eğer payload'da fiyat yoksa fallback kullan
  const hasPayloadPrices = priceDetails.grandTotal > 0 || priceDetails.totalNet > 0;

  if (!hasPayloadPrices && fallbackPrice) {
    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Toplam</span>
          <span className="font-medium">₺{fallbackPrice.toFixed(2)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Ara Toplam (Net) */}
      {priceDetails.totalNet > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Ara Toplam</span>
          <span>₺{priceDetails.totalNet.toFixed(2)}</span>
        </div>
      )}

      {/* Teslimat Ücreti */}
      {priceDetails.deliveryFee > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Teslimat Ücreti</span>
          <span>₺{priceDetails.deliveryFee.toFixed(2)}</span>
        </div>
      )}

      {/* KDV */}
      {priceDetails.vatTotal > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">KDV</span>
          <span>₺{priceDetails.vatTotal.toFixed(2)}</span>
        </div>
      )}

      {/* Bahşiş */}
      {priceDetails.riderTip > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Kurye Bahşişi</span>
          <span>₺{priceDetails.riderTip.toFixed(2)}</span>
        </div>
      )}

      <Separator className="my-2" />

      {/* Genel Toplam */}
      <div className="flex justify-between font-medium">
        <span>Toplam</span>
        <span className="text-lg">
          ₺{(priceDetails.grandTotal || fallbackPrice || 0).toFixed(2)}
        </span>
      </div>

      {/* Müşteriden Tahsil (farklıysa) */}
      {priceDetails.collectFromCustomer > 0 &&
       priceDetails.collectFromCustomer !== priceDetails.grandTotal && (
        <div className="flex justify-between text-sm text-orange-600">
          <span>Müşteriden Tahsil</span>
          <span>₺{priceDetails.collectFromCustomer.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
