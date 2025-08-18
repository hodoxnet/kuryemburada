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
  Navigation,
  Building,
  Timer,
  CheckCircle,
  AlertTriangle,
  Play,
  Flag,
  Camera
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ActiveDeliveries() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [deliveryProof, setDeliveryProof] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");

  useEffect(() => {
    loadActiveDeliveries();
    // Her 30 saniyede bir yenile
    const interval = setInterval(loadActiveDeliveries, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadActiveDeliveries = async () => {
    try {
      setLoading(true);
      const response = await orderService.getCourierOrders({
        status: undefined // Tüm aktif durumları getir
      });
      
      // Aktif durumları filtrele
      const activeStatuses = ['ACCEPTED', 'IN_PROGRESS'];
      const filtered = Array.isArray(response) ? 
        response.filter(order => activeStatuses.includes(order.status)) :
        [];
      
      setActiveOrders(filtered);
    } catch (error) {
      console.error("Aktif teslimatlar yüklenemedi:", error);
      toast.error("Teslimatlar yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleStartDelivery = async (order: any) => {
    try {
      setUpdatingOrderId(order.id);
      await orderService.updateOrderStatus(order.id, 'IN_PROGRESS');
      toast.success("Teslimat başlatıldı!");
      loadActiveDeliveries();
    } catch (error: any) {
      console.error("Teslimat başlatılamadı:", error);
      toast.error(error.response?.data?.message || "Teslimat başlatılırken hata oluştu");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleCompleteDelivery = (order: any) => {
    setSelectedOrder(order);
    setShowCompleteDialog(true);
  };

  const confirmCompleteDelivery = async () => {
    if (!selectedOrder) return;
    
    try {
      setUpdatingOrderId(selectedOrder.id);
      await orderService.updateOrderStatus(selectedOrder.id, 'DELIVERED', {
        deliveryProof: deliveryProof || undefined,
      });
      toast.success("Teslimat tamamlandı!");
      loadActiveDeliveries();
      setShowCompleteDialog(false);
      setSelectedOrder(null);
      setDeliveryProof("");
      setCompletionNotes("");
    } catch (error: any) {
      console.error("Teslimat tamamlanamadı:", error);
      toast.error(error.response?.data?.message || "Teslimat tamamlanırken hata oluştu");
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      ACCEPTED: "Kabul Edildi",
      IN_PROGRESS: "Teslimat Devam Ediyor",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      ACCEPTED: "warning",
      IN_PROGRESS: "default",
    };
    return colors[status] || "secondary";
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

  if (loading) {
    return <LoadingState text="Aktif teslimatlar yükleniyor..." />;
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Aktif Teslimatlar</h1>
        <p className="text-muted-foreground">
          Devam eden teslimatlarınızı takip edin ve durumlarını güncelleyin.
        </p>
      </div>

      {/* Özet Bilgisi */}
      {activeOrders.length > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="flex items-center gap-3 pt-6">
            <Package className="h-5 w-5 text-blue-600" />
            <p className="text-sm">
              <span className="font-medium">{activeOrders.length} adet</span> aktif teslimatınız bulunuyor.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Teslimatlar Listesi */}
      {activeOrders.length > 0 ? (
        <div className="grid gap-4">
          {activeOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        Sipariş #{order.orderNumber}
                      </CardTitle>
                      <Badge variant={getStatusColor(order.status)}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        <span>{order.company?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{format(new Date(order.createdAt), "dd MMM HH:mm", { locale: tr })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      ₺{order.courierEarning || order.price}
                    </div>
                    <div className="text-xs text-muted-foreground">Kazancınız</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Paket Bilgileri */}
                <div className="flex gap-2">
                  <Badge variant="outline">
                    <Package className="mr-1 h-3 w-3" />
                    {getPackageTypeLabel(order.packageType)}
                  </Badge>
                  {order.urgency === 'URGENT' && (
                    <Badge variant="destructive">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Acil
                    </Badge>
                  )}
                  {order.deliveryType === 'EXPRESS' && (
                    <Badge variant="secondary">
                      <Timer className="mr-1 h-3 w-3" />
                      Express
                    </Badge>
                  )}
                </div>

                {/* Adresler */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Alım Noktası</p>
                      <p className="text-sm text-muted-foreground">
                        {order.pickupAddress?.address || "Adres bilgisi yok"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <Navigation className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Teslimat Noktası</p>
                      <p className="text-sm text-muted-foreground">
                        {order.deliveryAddress?.address || "Adres bilgisi yok"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alıcı Bilgileri */}
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Alıcı: {order.recipientName}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{order.recipientPhone}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`tel:${order.recipientPhone}`, '_self')}
                    >
                      <Phone className="mr-2 h-4 w-4" />
                      Ara
                    </Button>
                  </div>
                </div>

                {/* İşlem Butonları */}
                <div className="flex gap-2">
                  {order.status === 'ACCEPTED' && (
                    <Button
                      onClick={() => handleStartDelivery(order)}
                      disabled={updatingOrderId === order.id}
                      className="flex-1"
                    >
                      {updatingOrderId === order.id ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Başlatılıyor...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Teslimatı Başlat
                        </>
                      )}
                    </Button>
                  )}
                  
                  {order.status === 'IN_PROGRESS' && (
                    <Button
                      onClick={() => handleCompleteDelivery(order)}
                      disabled={updatingOrderId === order.id}
                      className="flex-1"
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      Teslimatı Tamamla
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/courier/orders/${order.id}`)}
                  >
                    Detay
                  </Button>
                </div>

                {/* Notlar */}
                {order.notes && (
                  <div className="rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
                    <p className="text-sm">
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
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-1">Aktif teslimatınız bulunmuyor</h3>
            <p className="text-sm text-muted-foreground text-center">
              Yeni siparişler kabul ederek teslimat sürecinizi başlatabilirsiniz.
            </p>
            <Button 
              variant="outline" 
              onClick={() => router.push('/courier/available-orders')}
              className="mt-4"
            >
              <Package className="mr-2 h-4 w-4" />
              Yeni Siparişler
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Teslimat Tamamlama Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teslimatı Tamamla</DialogTitle>
            <DialogDescription>
              Teslimatın başarıyla tamamlandığını onaylamak için aşağıdaki bilgileri doldurun.
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm">
                  <span className="font-medium">Sipariş No:</span> #{selectedOrder.orderNumber}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Alıcı:</span> {selectedOrder.recipientName}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryProof">Teslimat Kanıtı (İsteğe bağlı)</Label>
                <Input
                  id="deliveryProof"
                  placeholder="Örn: Kapı numarası, teslimat yapılan kişi adı..."
                  value={deliveryProof}
                  onChange={(e) => setDeliveryProof(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="completionNotes">Notlar (İsteğe bağlı)</Label>
                <Textarea
                  id="completionNotes"
                  placeholder="Teslimat ile ilgili ek notlar..."
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCompleteDialog(false)}
              disabled={updatingOrderId !== null}
            >
              İptal
            </Button>
            <Button
              onClick={confirmCompleteDelivery}
              disabled={updatingOrderId !== null}
            >
              {updatingOrderId !== null ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Tamamlanıyor...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Teslimatı Tamamla
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}