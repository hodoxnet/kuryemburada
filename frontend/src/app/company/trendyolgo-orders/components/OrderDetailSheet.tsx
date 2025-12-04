"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  OrderTimeline,
  createOrderTimelineSteps,
} from "@/components/shared/OrderTimeline";
import { OrderPriceBreakdown } from "./OrderPriceBreakdown";
import { InvoicedModal } from "./InvoicedModal";
import { Order, orderService } from "@/lib/api/order.service";
import { Phone, Truck, Receipt } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { toast } from "sonner";

interface OrderDetailSheetProps {
  order: Order | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestCouriers?: (orderId: string) => Promise<void>;
  isRequestingCouriers?: boolean;
  onOrderUpdated?: () => void;
}

// Payload'dan ürün listesini çıkart
function extractProducts(payload: any) {
  const lines = payload?.lines || payload?.orderLines || payload?.products || [];
  return lines.map((line: any) => ({
    name: line.productName || line.name || "Ürün",
    quantity: parseInt(line.quantity || "1"),
    price: parseFloat(line.amount || line.price || "0"),
    barcode: line.barcode,
    merchantSku: line.merchantSku,
  }));
}

// Sipariş durumu renkleri
const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border border-amber-200",
  ACCEPTED: "bg-sky-50 text-sky-700 border border-sky-200",
  IN_PROGRESS: "bg-violet-50 text-violet-700 border border-violet-200",
  DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  CANCELLED: "bg-slate-50 text-slate-600 border border-slate-200",
  REJECTED: "bg-rose-50 text-rose-700 border border-rose-200",
};

// Sipariş durumu etiketleri
const statusLabels: Record<string, string> = {
  PENDING: "Beklemede",
  ACCEPTED: "Kabul Edildi",
  IN_PROGRESS: "Yolda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal Edildi",
  REJECTED: "Reddedildi",
};

// Trendyol Go durumu etiketleri
const trendyolGoStatusLabels: Record<string, string> = {
  Created: "Oluşturuldu",
  Picking: "Hazırlanıyor",
  Invoiced: "Faturalandı",
  Shipped: "Kargoda",
  Delivered: "Teslim Edildi",
  Cancelled: "İptal Edildi",
};

export function OrderDetailSheet({
  order,
  open,
  onOpenChange,
  onRequestCouriers,
  isRequestingCouriers,
  onOrderUpdated,
}: OrderDetailSheetProps) {
  const [invoicedModalOpen, setInvoicedModalOpen] = useState(false);
  const [sendingInvoiced, setSendingInvoiced] = useState(false);

  if (!order) return null;

  const payload = order.trendyolGoOrder?.payload;
  const products = extractProducts(payload);

  // Timeline için expected delivery time
  const expectedDeliveryTime = payload?.cargoTrackingInfo?.estimatedDeliveryDate;

  // Timeline adımlarını oluştur
  const timelineSteps = createOrderTimelineSteps({
    createdAt: order.createdAt,
    acceptedAt: order.acceptedAt,
    pickedUpAt: order.pickedUpAt,
    deliveredAt: order.deliveredAt,
    expectedDeliveryTime,
  });

  // Teslimat adresi
  const deliveryAddress = order.deliveryAddress as any;
  const pickupAddress = order.pickupAddress as any;

  // Kurye çağır butonu göster mi?
  const showRequestCouriersButton =
    order.status === "PENDING" && !order.courierId && onRequestCouriers;

  // Hazırlandı bildir butonu göster mi? (Trendyol Go status = Picking ise)
  const trendyolGoStatus = order.trendyolGoOrder?.status;
  const showInvoicedButton = trendyolGoStatus === "Picking";

  // Hazırlandı bildirimi gönder
  const handleSendInvoiced = async (data: {
    invoiceAmount: number;
    bagCount?: number;
  }) => {
    try {
      setSendingInvoiced(true);
      await orderService.sendTrendyolGoInvoiced(order.id, data);
      toast.success("Hazırlandı bildirimi gönderildi");
      setInvoicedModalOpen(false);
      if (onOrderUpdated) {
        onOrderUpdated();
      }
    } catch (error: any) {
      console.error("Invoiced bildirimi hatası:", error);
      const errorMessage = error?.response?.data?.message || "Bildirim gönderilemedi";
      toast.error(errorMessage);
    } finally {
      setSendingInvoiced(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md p-0 flex flex-col border-l border-slate-200">
          {/* Header */}
          <SheetHeader className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-base font-semibold text-slate-800">
                  Sipariş #{order.trendyolGoOrder?.orderNumber?.slice(-6) || order.orderNumber?.slice(-6)}
                </SheetTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {format(new Date(order.createdAt), "d MMM yyyy, HH:mm", { locale: tr })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="secondary" className={`${statusColors[order.status] || "bg-slate-100"} text-xs font-medium`}>
                  {statusLabels[order.status] || order.status}
                </Badge>
                {trendyolGoStatus && (
                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                    TGo: {trendyolGoStatusLabels[trendyolGoStatus] || trendyolGoStatus}
                  </Badge>
                )}
              </div>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            <div className="px-5 py-4 space-y-5">

              {/* Timeline */}
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Sipariş Durumu</p>
                <OrderTimeline steps={timelineSteps} />
              </div>

              {/* Hazırlandı Bildir Butonu */}
              {showInvoicedButton && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-orange-800 mb-3">
                    Sipariş hazırlandığında Trendyol Go&apos;ya bildirim gönderebilirsiniz.
                  </p>
                  <Button
                    onClick={() => setInvoicedModalOpen(true)}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    <Receipt className="w-4 h-4 mr-2" />
                    Hazırlandı Bildir
                  </Button>
                </div>
              )}

              {/* Müşteri */}
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Müşteri</p>
                <p className="font-medium text-slate-800">{order.recipientName}</p>
                <a
                  href={`tel:${order.recipientPhone}`}
                  className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5 mt-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {order.recipientPhone}
                </a>
              </div>

              {/* Adresler */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Adresler</p>

                <div className="flex gap-3">
                  <div className="w-1 bg-sky-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-0.5">Alım</p>
                    <p className="text-sm text-slate-700">
                      {pickupAddress?.address || pickupAddress?.detail || "Belirtilmemiş"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-1 bg-emerald-400 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-0.5">Teslimat</p>
                    <p className="text-sm text-slate-700">
                      {deliveryAddress?.address || deliveryAddress?.detail || "Belirtilmemiş"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ürünler */}
              {products.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Sipariş İçeriği</p>
                  <div className="space-y-2">
                    {products.map((product: any, index: number) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-600">{product.quantity}×</span>
                            <span className="text-sm text-slate-800">{product.name}</span>
                          </div>
                          {product.merchantSku && (
                            <p className="text-xs text-slate-400 ml-6 mt-0.5">
                              SKU: {product.merchantSku}
                            </p>
                          )}
                        </div>
                        {product.price > 0 && (
                          <span className="text-sm text-slate-600">₺{product.price.toFixed(2)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notlar */}
              {order.notes && (
                <div>
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Not</p>
                  <p className="text-sm text-slate-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    {order.notes}
                  </p>
                </div>
              )}

              {/* Fiyat */}
              <div className="bg-slate-50 rounded-lg p-4">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Ödeme</p>
                <OrderPriceBreakdown payload={payload} fallbackPrice={order.price} />

                {(order.distance || order.estimatedTime) && (
                  <div className="flex gap-4 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500">
                    {order.distance && <span>{order.distance.toFixed(1)} km</span>}
                    {order.estimatedTime && <span>~{order.estimatedTime} dk</span>}
                  </div>
                )}
              </div>

              {/* Trendyol Go Bilgileri */}
              {order.trendyolGoOrder && (
                <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-4">
                  <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Trendyol Go Bilgileri</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Paket ID</span>
                      <span className="font-mono text-slate-700">{order.trendyolGoOrder.packageId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sipariş No</span>
                      <span className="font-mono text-slate-700">{order.trendyolGoOrder.orderNumber}</span>
                    </div>
                    {order.trendyolGoOrder.invoiceAmount && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fiş Tutarı</span>
                        <span className="text-slate-700">₺{Number(order.trendyolGoOrder.invoiceAmount).toFixed(2)}</span>
                      </div>
                    )}
                    {order.trendyolGoOrder.pickedAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Alındı</span>
                        <span className="text-slate-700">
                          {format(new Date(order.trendyolGoOrder.pickedAt), "HH:mm", { locale: tr })}
                        </span>
                      </div>
                    )}
                    {order.trendyolGoOrder.invoicedAt && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Faturalandı</span>
                        <span className="text-slate-700">
                          {format(new Date(order.trendyolGoOrder.invoicedAt), "HH:mm", { locale: tr })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Kurye */}
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-3">Kurye</p>
                {order.courier ? (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{order.courier.fullName}</p>
                        <a
                          href={`tel:${order.courier.phone}`}
                          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5 mt-1"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {order.courier.phone}
                        </a>
                      </div>
                      {order.courier.rating && (
                        <span className="text-sm text-slate-600">★ {order.courier.rating.toFixed(1)}</span>
                      )}
                    </div>
                    {order.courier.vehicleInfo && (
                      <p className="text-xs text-slate-500 mt-2">
                        {(order.courier.vehicleInfo as any)?.brand}{" "}
                        {(order.courier.vehicleInfo as any)?.model} • {" "}
                        {(order.courier.vehicleInfo as any)?.plate}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-500 mb-3">Henüz kurye atanmadı</p>
                    {showRequestCouriersButton && (
                      <Button
                        onClick={() => onRequestCouriers(order.id)}
                        disabled={isRequestingCouriers}
                        variant="outline"
                        size="sm"
                        className="text-slate-600"
                      >
                        <Truck className="w-4 h-4 mr-1.5" />
                        {isRequestingCouriers ? "Gönderiliyor..." : "Kurye Çağır"}
                      </Button>
                    )}
                  </div>
                )}
              </div>

            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Invoiced Modal */}
      <InvoicedModal
        open={invoicedModalOpen}
        onOpenChange={setInvoicedModalOpen}
        orderId={order.id}
        onSubmit={handleSendInvoiced}
        isLoading={sendingInvoiced}
      />
    </>
  );
}
