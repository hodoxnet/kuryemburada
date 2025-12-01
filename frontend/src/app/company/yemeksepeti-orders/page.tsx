'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { orderService, Order } from '@/lib/api/order.service';
import { toast } from 'sonner';
import {
  UtensilsCrossed,
  MapPin,
  Clock,
  User,
  Phone,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Truck,
  Timer,
  AlertCircle,
  Package,
  ExternalLink,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const statusColors: Record<string, string> = {
  PENDING: 'warning',
  ACCEPTED: 'info',
  IN_PROGRESS: 'info',
  DELIVERED: 'success',
  CANCELLED: 'destructive',
  FAILED: 'destructive',
};

const statusIcons: Record<string, any> = {
  PENDING: Timer,
  ACCEPTED: CheckCircle,
  IN_PROGRESS: Truck,
  DELIVERED: CheckCircle,
  CANCELLED: XCircle,
  FAILED: AlertCircle,
};

const statusLabels: Record<string, string> = {
  PENDING: 'Bekliyor',
  ACCEPTED: 'Onaylandı',
  IN_PROGRESS: 'Yolda',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  FAILED: 'Başarısız',
};

const integrationStatusLabels: Record<string, string> = {
  dispatched: 'Gönderildi',
  order_created: 'Sipariş Oluşturuldu',
  failed: 'Başarısız',
  order_accepted: 'Kabul Edildi',
  order_rejected: 'Reddedildi',
  order_picked_up: 'Alındı',
};

const integrationStatusColors: Record<string, string> = {
  dispatched: 'warning',
  order_created: 'success',
  failed: 'destructive',
  order_accepted: 'success',
  order_rejected: 'destructive',
  order_picked_up: 'info',
};

export default function YemeksepetiOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [requestingCouriers, setRequestingCouriers] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await orderService.getYemeksepetiOrders({ take: 100 });
      if (result && result.data) {
        setOrders(result.data);
        setTotal(result.total);
      } else {
        setOrders([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Yemeksepeti siparişleri yüklenemedi:', error);
      toast.error('Siparişler yüklenirken bir hata oluştu');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (!Array.isArray(orders)) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [...orders];

    // Durum filtresi
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.yemeksepetiOrder?.remoteOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.recipientPhone?.includes(searchTerm)
      );
    }

    // Tarihe göre sırala (en yeni önce)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleRequestCouriers = async (orderId: string) => {
    try {
      setRequestingCouriers(orderId);
      await orderService.requestCouriers(orderId);
      toast.success('Kuryelere bildirim gönderildi');
    } catch (error: any) {
      console.error('Kurye çağırma hatası:', error);
      const errorMessage = error?.response?.data?.message || 'Kurye çağırılamadı';
      toast.error(errorMessage);
    } finally {
      setRequestingCouriers(null);
    }
  };

  const getOrderProgress = (status: string) => {
    const statuses = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'DELIVERED'];
    const currentIndex = statuses.indexOf(status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  // Yemeksepeti payload'dan ürünleri çıkar
  const getOrderItems = (order: Order) => {
    const payload = order.yemeksepetiOrder?.payload;
    if (!payload) return [];

    // Yemeksepeti payload yapısına göre ürünleri çıkar
    // Payload yapısı değişkenlik gösterebilir
    const items = payload.items || payload.orderItems || payload.products || [];
    return items;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yemeksepeti siparişleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Başlık */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <UtensilsCrossed className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Yemeksepeti Siparişleri</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Yemeksepeti entegrasyonundan gelen siparişler
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchOrders}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Timer className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Yolda</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'IN_PROGRESS').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Teslim Edildi</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orders.filter(o => o.status === 'DELIVERED').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Sipariş no, Yemeksepeti sipariş no, alıcı adı veya telefon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Durum Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tüm Durumlar</SelectItem>
                <SelectItem value="PENDING">Bekliyor</SelectItem>
                <SelectItem value="ACCEPTED">Onaylandı</SelectItem>
                <SelectItem value="IN_PROGRESS">Yolda</SelectItem>
                <SelectItem value="DELIVERED">Teslim Edildi</SelectItem>
                <SelectItem value="CANCELLED">İptal Edildi</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Siparişler Listesi */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UtensilsCrossed className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Yemeksepeti siparişi bulunamadı</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm || statusFilter !== 'ALL'
                ? 'Filtrelere uygun sipariş bulunamadı'
                : 'Henüz Yemeksepeti siparişiniz bulunmuyor'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => {
            const StatusIcon = statusIcons[order.status];
            const progress = getOrderProgress(order.status);
            const integrationStatus = order.yemeksepetiOrder?.status || 'dispatched';

            return (
              <Card key={order.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    {/* Sol Kısım - Sipariş Bilgileri */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`h-5 w-5 ${
                            order.status === 'DELIVERED' ? 'text-green-500' :
                            order.status === 'CANCELLED' || order.status === 'FAILED' ? 'text-red-500' :
                            order.status === 'PENDING' ? 'text-yellow-500' : 'text-blue-500'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">#{order.orderNumber}</p>
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                <UtensilsCrossed className="w-3 h-3 mr-1" />
                                Yemeksepeti
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={integrationStatusColors[integrationStatus] as any}>
                            {integrationStatusLabels[integrationStatus] || integrationStatus}
                          </Badge>
                          <Badge variant={statusColors[order.status] as any}>
                            {statusLabels[order.status]}
                          </Badge>
                        </div>
                      </div>

                      {/* Yemeksepeti Sipariş No */}
                      {order.yemeksepetiOrder?.remoteOrderId && (
                        <div className="flex items-center gap-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <ExternalLink className="h-4 w-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                            Yemeksepeti Sipariş No: {order.yemeksepetiOrder.remoteOrderId}
                          </span>
                        </div>
                      )}

                      {/* İlerleme Çubuğu */}
                      {!['CANCELLED', 'FAILED'].includes(order.status) && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}

                      {/* Adres Bilgileri */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-green-500 mt-1" />
                          <div className="text-sm">
                            <p className="font-medium">Alım Noktası</p>
                            <p className="text-muted-foreground">{order.pickupAddress?.address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-red-500 mt-1" />
                          <div className="text-sm">
                            <p className="font-medium">Teslimat Noktası</p>
                            <p className="text-muted-foreground">{order.deliveryAddress?.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Alıcı Bilgileri */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{order.recipientName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{order.recipientPhone}</span>
                        </div>
                      </div>

                      {/* Kurye Bilgisi */}
                      {order.courier && (
                        <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <Truck className="h-4 w-4 text-primary" />
                          <div className="text-sm">
                            <p className="font-medium">
                              Kurye: {order.courier.fullName}
                            </p>
                            <p className="text-muted-foreground">{order.courier.phone}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sağ Kısım - Fiyat ve İşlemler */}
                    <div className="flex flex-col items-end justify-between gap-3">
                      <div className="text-right">
                        <p className="text-2xl font-bold">₺{order.price?.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{order.distance?.toFixed(1)} km</p>
                      </div>

                      <div className="flex gap-2">
                        {order.status === 'PENDING' && !order.courierId && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleRequestCouriers(order.id)}
                            disabled={requestingCouriers === order.id}
                            className="bg-orange-500 hover:bg-orange-600"
                          >
                            <Truck className="w-4 h-4 mr-1" />
                            {requestingCouriers === order.id ? 'Gönderiliyor...' : 'Kurye Çağır'}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openOrderDetails(order)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detay
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Sipariş Detay Modal */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-orange-500" />
              Yemeksepeti Sipariş Detayı
            </DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber} numaralı siparişin detayları
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Sipariş Numaraları */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-muted-foreground">Sipariş No</p>
                  <p className="font-semibold">{selectedOrder.orderNumber}</p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">Yemeksepeti Sipariş No</p>
                  <p className="font-semibold text-orange-700 dark:text-orange-400">
                    {selectedOrder.yemeksepetiOrder?.remoteOrderId || '-'}
                  </p>
                </div>
              </div>

              {/* Durum Bilgileri */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Sipariş Durumu</p>
                  <Badge variant={statusColors[selectedOrder.status] as any}>
                    {statusLabels[selectedOrder.status]}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Entegrasyon Durumu</p>
                  <Badge variant={integrationStatusColors[selectedOrder.yemeksepetiOrder?.status || 'dispatched'] as any}>
                    {integrationStatusLabels[selectedOrder.yemeksepetiOrder?.status || 'dispatched']}
                  </Badge>
                </div>
              </div>

              {/* Müşteri Bilgileri */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Müşteri Bilgileri
                </h4>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1">
                  <p><span className="text-muted-foreground">Ad:</span> {selectedOrder.recipientName}</p>
                  <p><span className="text-muted-foreground">Telefon:</span> {selectedOrder.recipientPhone}</p>
                </div>
              </div>

              {/* Adres Bilgileri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-green-500" />
                    Alım Adresi
                  </h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm">{selectedOrder.pickupAddress?.address}</p>
                    {selectedOrder.pickupAddress?.detail && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedOrder.pickupAddress.detail}</p>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    Teslimat Adresi
                  </h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm">{selectedOrder.deliveryAddress?.address}</p>
                    {selectedOrder.deliveryAddress?.detail && (
                      <p className="text-sm text-muted-foreground mt-1">{selectedOrder.deliveryAddress.detail}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sipariş Ürünleri */}
              {selectedOrder.yemeksepetiOrder?.payload && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Sipariş İçeriği
                  </h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {getOrderItems(selectedOrder).length > 0 ? (
                      <ul className="space-y-2">
                        {getOrderItems(selectedOrder).map((item: any, index: number) => (
                          <li key={index} className="flex justify-between items-center">
                            <span>{item.name || item.productName || item.title || `Ürün ${index + 1}`}</span>
                            <span className="text-muted-foreground">
                              x{item.quantity || item.count || 1}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Ürün detayları Yemeksepeti payload'ında mevcut değil
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Notlar */}
              {selectedOrder.notes && (
                <div>
                  <h4 className="font-medium mb-2">Notlar</h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Kurye Bilgileri */}
              {selectedOrder.courier && (
                <div>
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Kurye Bilgileri
                  </h4>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-1">
                    <p><span className="text-muted-foreground">Ad:</span> {selectedOrder.courier.fullName}</p>
                    <p><span className="text-muted-foreground">Telefon:</span> {selectedOrder.courier.phone}</p>
                  </div>
                </div>
              )}

              {/* Fiyat Bilgileri */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Mesafe:</span>
                  <span>{selectedOrder.distance?.toFixed(1)} km</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tahmini Süre:</span>
                  <span>{selectedOrder.estimatedTime} dakika</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold mt-2 pt-2 border-t">
                  <span>Toplam:</span>
                  <span>₺{selectedOrder.price?.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
