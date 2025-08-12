'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { orderService, Order } from '@/lib/api/order.service';
import { toast } from 'sonner';
import { 
  Package, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Calendar,
  TrendingUp,
  DollarSign,
  CheckCircle,
  Timer,
  Truck,
  Eye
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

const statusLabels: Record<string, string> = {
  PENDING: 'Bekliyor',
  ACCEPTED: 'Onaylandı',
  IN_PROGRESS: 'Yolda',
  DELIVERED: 'Teslim Edildi',
  CANCELLED: 'İptal Edildi',
  FAILED: 'Başarısız',
};

export default function CourierDashboard() {
  const router = useRouter();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayEarnings: 0,
    todayDeliveries: 0,
    totalEarnings: 0,
    totalDeliveries: 0,
    rating: 0,
    activeOrder: null as Order | null,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // İstatistikleri ve siparişleri paralel olarak yükle
      const [statistics, available, my] = await Promise.all([
        orderService.getCourierStatistics(),
        orderService.getAvailableOrders(),
        orderService.getCourierOrders(),
      ]);
      
      setAvailableOrders(Array.isArray(available) ? available : []);
      setMyOrders(Array.isArray(my) ? my : []);
      
      // Backend'den gelen gerçek istatistikleri kullan
      setStats({
        todayEarnings: statistics.todayEarnings || 0,
        todayDeliveries: statistics.todayDeliveries || 0,
        totalEarnings: statistics.totalEarnings || 0,
        totalDeliveries: statistics.totalDeliveries || 0,
        rating: statistics.averageRating || 0,
        activeOrder: statistics.activeOrder || null,
      });
    } catch (error) {
      console.error('Dashboard verileri yüklenemedi:', error);
      toast.error('Veriler yüklenirken bir hata oluştu');
      // Hata durumunda varsayılan değerler
      setStats({
        todayEarnings: 0,
        todayDeliveries: 0,
        totalEarnings: 0,
        totalDeliveries: 0,
        rating: 0,
        activeOrder: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      await orderService.acceptOrder(orderId);
      toast.success('Sipariş kabul edildi');
      loadDashboardData();
    } catch (error) {
      console.error('Sipariş kabul edilemedi:', error);
      toast.error('Sipariş kabul edilirken bir hata oluştu');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      toast.success('Sipariş durumu güncellendi');
      loadDashboardData();
    } catch (error) {
      console.error('Sipariş durumu güncellenemedi:', error);
      toast.error('Sipariş durumu güncellenirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Kurye Paneli</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Siparişlerinizi yönetin ve kazancınızı takip edin
        </p>
      </div>

      {/* Aktif Sipariş Bildirimi */}
      {stats.activeOrder && (
        <Card className="mb-6 border-primary">
          <CardHeader className="bg-primary/10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Aktif Sipariş
              </CardTitle>
              <Badge variant="default">
                {statusLabels[stats.activeOrder.status]}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Alım Noktası</p>
                <p className="font-medium">{stats.activeOrder.pickupAddress?.address}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Teslimat Noktası</p>
                <p className="font-medium">{stats.activeOrder.deliveryAddress?.address}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              {stats.activeOrder.status === 'ACCEPTED' && (
                <Button 
                  onClick={() => handleUpdateOrderStatus(stats.activeOrder!.id, 'IN_PROGRESS')}
                  className="flex-1"
                >
                  Yola Çıktım
                </Button>
              )}
              {stats.activeOrder.status === 'IN_PROGRESS' && (
                <Button 
                  onClick={() => handleUpdateOrderStatus(stats.activeOrder!.id, 'DELIVERED')}
                  className="flex-1"
                  variant="default"
                >
                  Teslim Ettim
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => router.push(`/courier/orders/${stats.activeOrder!.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Detay
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <DollarSign className="h-8 w-8 text-green-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">₺{stats.todayEarnings.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Bugünkü Kazanç</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Package className="h-8 w-8 text-blue-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.todayDeliveries}</p>
                <p className="text-sm text-gray-500">Bugünkü Teslimat</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">₺{stats.totalEarnings.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Toplam Kazanç</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
                <p className="text-sm text-gray-500">Toplam Teslimat</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <svg className="h-8 w-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.rating.toFixed(1)}</p>
                <p className="text-sm text-gray-500">Ortalama Puan</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sipariş Havuzu */}
      <Card>
        <CardHeader>
          <CardTitle>Siparişler</CardTitle>
          <CardDescription>Mevcut siparişleri görüntüle ve kabul et</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="available">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available">
                Mevcut Siparişler ({availableOrders.length})
              </TabsTrigger>
              <TabsTrigger value="my">
                Siparişlerim ({myOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="mt-6">
              {availableOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Şu anda mevcut sipariş bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableOrders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">#{order.orderNumber}</Badge>
                              <Badge variant="secondary">
                                ₺{order.courierEarning?.toFixed(2) || order.price?.toFixed(2)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                                <div>
                                  <p className="font-medium">Alım</p>
                                  <p className="text-muted-foreground">
                                    {order.pickupAddress?.address}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-red-500 mt-0.5" />
                                <div>
                                  <p className="font-medium">Teslimat</p>
                                  <p className="text-muted-foreground">
                                    {order.deliveryAddress?.address}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>{order.distance?.toFixed(1)} km</span>
                              <span>{order.estimatedDeliveryTime || order.estimatedTime} dk</span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleAcceptOrder(order.id)}
                            >
                              Kabul Et
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => router.push(`/courier/orders/${order.id}`)}
                            >
                              Detay
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="my" className="mt-6">
              {myOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">Henüz siparişiniz bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">#{order.orderNumber}</Badge>
                              <Badge variant={statusColors[order.status] as any}>
                                {statusLabels[order.status]}
                              </Badge>
                              <Badge variant="secondary">
                                ₺{order.courierEarning?.toFixed(2) || order.price?.toFixed(2)}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium">Alıcı: {order.recipientName}</p>
                                <p className="text-muted-foreground">{order.recipientPhone}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                                </p>
                              </div>
                            </div>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => router.push(`/courier/orders/${order.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detay
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}