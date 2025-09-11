"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/shared/LoadingState";
import { 
  Package, 
  MapPin,
  Clock,
  DollarSign,
  Phone,
  AlertCircle,
  CheckCircle,
  Navigation,
  Building,
  Timer
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { orderService } from "@/lib/api/order.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrderNotificationModal } from "@/components/courier/OrderNotificationModal";
import { useSocket } from "@/contexts/SocketContext";

export default function AvailableOrders() {
  const router = useRouter();
  const { isConnected } = useSocket();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [acceptingOrderId, setAcceptingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationOrderData, setNotificationOrderData] = useState<any>(null);
  const [blockedByActiveOrder, setBlockedByActiveOrder] = useState<null | { orderId: string }>(null);

  useEffect(() => {
    loadAvailableOrders();
    // Her 30 saniyede bir yenile
    const interval = setInterval(loadAvailableOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Socket bildirimleri için event listener
  useEffect(() => {
    const handleSocketNotification = (event: CustomEvent) => {
      const data = event.detail;
      console.log('Available Orders - Socket bildirimi alındı:', data);
      
      // Yeni sipariş bildirimi geldiğinde listeyi güncelle (modal artık globalde)
      if (data.type === 'NEW_ORDER') {
        loadAvailableOrders();
      }
      
      // Sipariş başka kurye tarafından alındıysa modal'ı kapat ve listeyi güncelle
      if (data.type === 'ORDER_ACCEPTED_BY_ANOTHER') {
        // Eğer aynı sipariş için modal açıksa kapat
        if (notificationOrderData?.id === data.data?.orderId) {
          setShowNotificationModal(false);
          setNotificationOrderData(null);
          toast.info('Sipariş başka bir kurye tarafından kabul edildi');
        }
        // Listeyi güncelle
        loadAvailableOrders();
      }
    };

    const handleSocketToast = (event: CustomEvent) => {
      const { title, message, data } = event.detail;
      
      // Yeni sipariş bildirimi modal ile gösterildiği için toast gösterme
      if (data?.type === 'NEW_ORDER') {
        return; // Modal gösterilecek, toast'a gerek yok
      } else {
        // Diğer bildirimler için normal toast
        toast(title, {
          description: message,
          duration: 5000,
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('socket-notification', handleSocketNotification as EventListener);
      window.addEventListener('socket-toast', handleSocketToast as EventListener);

      return () => {
        window.removeEventListener('socket-notification', handleSocketNotification as EventListener);
        window.removeEventListener('socket-toast', handleSocketToast as EventListener);
      };
    }
  }, [notificationOrderData]);

  const loadAvailableOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getAvailableOrders();
      // response ya direkt array ya da {data: [], total, skip, take} formatında
      if (response && response.data && Array.isArray(response.data)) {
        setOrders(response.data);
      } else if (Array.isArray(response)) {
        setOrders(response);
      } else {
        setOrders([]);
      }
      setBlockedByActiveOrder(null);
    } catch (error) {
      console.error("Siparişler yüklenemedi:", error);
      // Eğer aktif sipariş nedeniyle 403 ise kullanıcıya bilgi göster
      const status = (error as any)?.response?.status;
      if (status === 403) {
        try {
          const stats = await orderService.getCourierStatistics();
          const activeId = stats?.activeOrder?.id || stats?.activeOrderId || stats?.currentOrderId;
          if (activeId) {
            setBlockedByActiveOrder({ orderId: activeId });
            setOrders([]);
            return;
          }
        } catch {}
      }
      toast.error("Siparişler yüklenirken bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (order: any) => {
    setSelectedOrder(order);
    setShowAcceptDialog(true);
  };

  const confirmAcceptOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      setAcceptingOrderId(selectedOrder.id);
      await orderService.acceptOrder(selectedOrder.id);
      toast.success("Sipariş başarıyla kabul edildi!");
      
      // Sipariş detayına yönlendir
      router.push(`/courier/orders/${selectedOrder.id}`);
    } catch (error: any) {
      console.error("Sipariş kabul edilemedi:", error);
      
      if (error.response?.status === 400) {
        toast.error("Bu sipariş başka bir kurye tarafından alınmış!");
        // Listeyi yenile
        loadAvailableOrders();
      } else {
        toast.error(error.response?.data?.message || "Sipariş kabul edilirken hata oluştu");
      }
    } finally {
      setAcceptingOrderId(null);
      setShowAcceptDialog(false);
      setSelectedOrder(null);
    }
  };

  const getPackageTypeLabel = (type: string) => {
    const labels: any = {
      DOCUMENT: "Evrak",
      PACKAGE: "Paket",
      FOOD: "Yemek",
      OTHER: "Diğer",
    };
    return labels[type] || type;
  };

  const getPackageSizeLabel = (size: string) => {
    const labels: any = {
      SMALL: "Küçük",
      MEDIUM: "Orta",
      LARGE: "Büyük",
      EXTRA_LARGE: "Çok Büyük",
    };
    return labels[size] || size;
  };

  const getUrgencyLabel = (urgency: string) => {
    const labels: any = {
      NORMAL: "Normal",
      URGENT: "Acil",
      VERY_URGENT: "Çok Acil",
    };
    return labels[urgency] || urgency;
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: any = {
      NORMAL: "default",
      URGENT: "warning",
      VERY_URGENT: "destructive",
    };
    return colors[urgency] || "default";
  };

  if (loading && orders.length === 0 && !blockedByActiveOrder) {
    return <LoadingState text="Siparişler yükleniyor..." />;
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Başlık */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Yeni Siparişler</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Kabul edebileceğiniz siparişler aşağıda listelenmektedir.
        </p>
      </div>

      {/* Bilgi Kartı */}
      {blockedByActiveOrder ? (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="flex flex-col gap-3 p-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <div className="text-sm flex-1 space-y-1">
                <p className="font-medium">Üzerinizde aktif bir sipariş var.</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Aktif siparişi tamamlayana kadar yeni siparişleri görüntüleyemezsiniz.
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push(`/courier/orders/${blockedByActiveOrder.orderId}`)}
              className="w-full sm:w-auto"
            >
              Aktif siparişi görüntüle
            </Button>
          </CardContent>
        </Card>
      ) : orders.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 p-4 sm:pt-6">
            <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
            <p className="text-xs sm:text-sm">
              <span className="font-medium">{orders.length} adet</span> yeni sipariş mevcut.
              Siparişleri kabul ederek teslimat sürecini başlatabilirsiniz.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Siparişler Listesi */}
      {!blockedByActiveOrder && orders.length > 0 ? (
        <div className="grid gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <CardTitle className="text-base sm:text-lg">
                        Sipariş #{order.orderNumber}
                      </CardTitle>
                      <Badge 
                        variant={getUrgencyColor(order.urgency)}
                        className="text-xs w-fit"
                      >
                        {getUrgencyLabel(order.urgency)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span className="truncate max-w-[150px] sm:max-w-none">{order.company?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(order.createdAt), "HH:mm", { locale: tr })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      ₺{(order.courierEarning ?? order.price)?.toFixed ? (order.courierEarning ?? order.price).toFixed(2) : (order.courierEarning ?? order.price)}
                    </div>
                    <div className="text-xs text-muted-foreground">Kazancınız</div>
                    {(() => {
                      const total = order.totalPrice ?? order.price;
                      const earning = order.courierEarning ?? order.price;
                      if (typeof total === 'number' && typeof earning === 'number' && total !== earning) {
                        return (
                          <div className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">Toplam: ₺{total.toFixed(2)}</div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
                {/* Paket Bilgileri */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    <Package className="mr-1 h-3 w-3" />
                    {getPackageTypeLabel(order.packageType)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getPackageSizeLabel(order.packageSize)}
                  </Badge>
                  {order.deliveryType === 'EXPRESS' && (
                    <Badge variant="secondary" className="text-xs">
                      <Timer className="mr-1 h-3 w-3" />
                      Express
                    </Badge>
                  )}
                </div>

                {/* Adresler */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-blue-100 shrink-0">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium">Alım Noktası</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate sm:whitespace-normal">
                        {order.pickupAddress?.address || "Adres bilgisi yok"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-green-100 shrink-0">
                      <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium">Teslimat Noktası</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate sm:whitespace-normal">
                        {order.deliveryAddress?.address || "Adres bilgisi yok"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mesafe ve Süre */}
                <div className="flex gap-3 sm:gap-4 rounded-lg bg-gray-50 p-2.5 sm:p-3 dark:bg-gray-800">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
                    <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Mesafe</p>
                      <p className="text-xs sm:text-sm font-medium">
                        {order.distance ? `${order.distance} km` : "Hesaplanıyor"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Tahmini Süre</p>
                      <p className="text-xs sm:text-sm font-medium">
                        {order.estimatedTime ? `${order.estimatedTime} dk` : "Hesaplanıyor"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alıcı Bilgileri */}
                <div className="rounded-lg border p-3">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-medium">Alıcı: {order.recipientName}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs sm:text-sm text-muted-foreground">{order.recipientPhone}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleAcceptOrder(order)}
                      disabled={acceptingOrderId === order.id}
                      className="w-full sm:w-auto"
                      size="sm"
                    >
                      {acceptingOrderId === order.id ? (
                        <>
                          <Clock className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                          <span className="text-xs sm:text-sm">Kabul ediliyor...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="text-xs sm:text-sm">Siparişi Kabul Et</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Notlar */}
                {order.notes && (
                  <div className="rounded-lg bg-yellow-50 p-2.5 sm:p-3 dark:bg-yellow-900/20">
                    <p className="text-xs sm:text-sm">
                      <span className="font-medium">Not:</span> {order.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12 px-4">
            <Package className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50 mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-1">Yeni sipariş bulunmamaktadır</h3>
            <p className="text-xs sm:text-sm text-muted-foreground text-center max-w-xs">
              Yeni siparişler geldiğinde burada görünecektir.
            </p>
            <Button 
              variant="outline" 
              onClick={loadAvailableOrders}
              className="mt-4"
              size="sm"
            >
              <Clock className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="text-xs sm:text-sm">Yenile</span>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Kabul Onay Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent className="w-[90vw] max-w-[425px] p-0 sm:p-6">
          <DialogHeader className="p-4 pb-0 sm:p-0 space-y-3">
            <DialogTitle className="text-lg sm:text-xl">Siparişi Kabul Et</DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-muted-foreground">
              Bu siparişi kabul etmek istediğinizden emin misiniz? Sipariş kabul edildikten sonra teslimat sürecini başlatmanız gerekecektir.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="px-4 sm:px-0 py-4 space-y-3 bg-gray-50 dark:bg-gray-800 sm:bg-transparent sm:rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sipariş No:</span>
                <span className="text-sm font-medium">#{selectedOrder.orderNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Kazanç:</span>
                <span className="text-lg font-bold text-green-600">
                  ₺{(selectedOrder.courierEarning || selectedOrder.price)?.toFixed ? 
                     (selectedOrder.courierEarning || selectedOrder.price).toFixed(2) : 
                     (selectedOrder.courierEarning || selectedOrder.price)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mesafe:</span>
                <span className="text-sm font-medium">{selectedOrder.distance || "0"} km</span>
              </div>
            </div>
          )}
          <DialogFooter className="p-4 pt-0 sm:p-0 flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={() => setShowAcceptDialog(false)}
              disabled={acceptingOrderId !== null}
              className="w-full sm:w-auto h-10 sm:h-9"
            >
              İptal
            </Button>
            <Button
              onClick={confirmAcceptOrder}
              disabled={acceptingOrderId !== null}
              className="w-full sm:w-auto h-10 sm:h-9 bg-green-600 hover:bg-green-700"
            >
              {acceptingOrderId !== null ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Kabul ediliyor...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Siparişi Kabul Et
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

  {/* Sipariş Bildirim Modal'ı globalde gösteriliyor (SocketContext) */}
    </div>
  );
}
