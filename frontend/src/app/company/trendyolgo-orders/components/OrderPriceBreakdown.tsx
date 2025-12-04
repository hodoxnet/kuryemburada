"use client";

import { Separator } from "@/components/ui/separator";

interface PriceDetails {
  grossAmount: number;
  totalDiscount: number;
  totalPrice: number;
  totalCargo: number;
}

interface OrderPriceBreakdownProps {
  payload: any;
  fallbackPrice?: number;
}

// Payload'dan fiyat bilgilerini çıkart (Trendyol Go formatı)
export function extractPriceDetails(payload: any): PriceDetails {
  return {
    grossAmount: parseFloat(payload?.grossAmount || "0"),
    totalDiscount: parseFloat(payload?.totalDiscount || "0"),
    totalPrice: parseFloat(payload?.totalPrice || "0"),
    totalCargo: parseFloat(payload?.totalCargo || "0"),
  };
}

export function OrderPriceBreakdown({ payload, fallbackPrice }: OrderPriceBreakdownProps) {
  const priceDetails = extractPriceDetails(payload);

  // Eğer payload'da fiyat yoksa fallback kullan
  const hasPayloadPrices = priceDetails.grossAmount > 0 || priceDetails.totalPrice > 0;

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
      {/* Brüt Tutar */}
      {priceDetails.grossAmount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Brüt Tutar</span>
          <span>₺{priceDetails.grossAmount.toFixed(2)}</span>
        </div>
      )}

      {/* İndirim */}
      {priceDetails.totalDiscount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>İndirim</span>
          <span>-₺{priceDetails.totalDiscount.toFixed(2)}</span>
        </div>
      )}

      {/* Kargo Ücreti */}
      {priceDetails.totalCargo > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Kargo Ücreti</span>
          <span>₺{priceDetails.totalCargo.toFixed(2)}</span>
        </div>
      )}

      <Separator className="my-2" />

      {/* Genel Toplam */}
      <div className="flex justify-between font-medium">
        <span>Toplam</span>
        <span className="text-lg">
          ₺{(priceDetails.totalPrice || priceDetails.grossAmount || fallbackPrice || 0).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
