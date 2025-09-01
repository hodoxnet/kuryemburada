'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { orderService, Order } from '@/lib/api/order.service';
import { Package, Clock, CheckCircle, XCircle, Plus, Eye, Wifi, WifiOff, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useSocket } from '@/contexts/SocketContext';

export default function CompanyDashboard() {
  const router = useRouter();
  const { isConnected } = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    delivered: 0,
    cancelled: 0,
  });

  useEffect(() => {
    loadOrders();
  }, []);

  // Socket bildirimleri için event listener
  useEffect(() => {
    const handleSocketNotification = (event: CustomEvent) => {
      const data = event.detail;
      console.log('Company Dashboard - Socket bildirimi alındı:', data);
      
      // Sipariş ile ilgili bildirimler geldiğinde siparişleri yeniden yükle
      if (data.type === 'ORDER_ACCEPTED' || data.type === 'ORDER_STATUS_UPDATE') {
        setTimeout(() => {
          loadOrders(); // Siparişleri güncelle
        }, 1000);
      }
    };

    const handleSocketToast = (event: CustomEvent) => {
      const { title, message, data } = event.detail;
      
      // Sipariş kabul edildi bildirimi için özel toast
      if (data?.type === 'ORDER_ACCEPTED') {
        toast.success(title, {
          description: message,
          duration: 8000,
          action: {
            label: 'Siparişi Gör',
            onClick: () => {
              if (data?.orderId) {
                router.push(`/company/orders/${data.orderId}`);
              }
            }
          },
        });
      } else if (data?.type === 'ORDER_STATUS_UPDATE') {
        // Sipariş durumu güncellemesi için özel toast
        const orderId = data?.orderId || data?.data?.orderId || data?.data?.order?.id;
        toast.info(title, {
          description: message,
          duration: 6000,
          action: orderId ? {
            label: 'Siparişi Gör',
            onClick: () => {
              router.push(`/company/orders/${orderId}`);
            }
          } : undefined,
        });
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
  }, [router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getCompanyOrders();
      // Data'nın array olduğundan emin ol
      const ordersArray = Array.isArray(data) ? data : [];
      setOrders(ordersArray);
      
      // İstatistikleri hesapla
      const statistics = ordersArray.reduce((acc, order) => {
        acc.total++;
        switch (order.status) {
          case 'PENDING':
            acc.pending++;
            break;
          case 'ACCEPTED':
          case 'IN_PROGRESS':
            acc.inProgress++;
            break;
          case 'DELIVERED':
            acc.delivered++;
            break;
          case 'CANCELLED':
          case 'REJECTED':
            acc.cancelled++;
            break;
        }
        return acc;
      }, { total: 0, pending: 0, inProgress: 0, delivered: 0, cancelled: 0 });
      
      setStats(statistics);
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error);
      toast.error('Siparişler yüklenirken bir hata oluştu');
      setOrders([]);
      setStats({
        total: 0,
        pending: 0,
        inProgress: 0,
        delivered: 0,
        cancelled: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Bekliyor';
      case 'ACCEPTED':
        return 'Kabul Edildi';
      case 'IN_PROGRESS':
        return 'Yolda';
      case 'DELIVERED':
        return 'Teslim Edildi';
      case 'CANCELLED':
        return 'İptal Edildi';
      case 'REJECTED':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  const filterOrdersByStatus = (status?: string) => {
    // orders'in array olduğundan emin ol
    if (!Array.isArray(orders)) return [];
    if (!status) return orders;
    if (status === 'IN_PROGRESS') {
      return orders.filter(o => o.status === 'ACCEPTED' || o.status === 'IN_PROGRESS');
    }
    return orders.filter(o => o.status === status);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Firma Paneli</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Siparişlerinizi yönetin ve takip edin
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge 
            variant={isConnected ? "secondary" : "destructive"} 
            className="py-2 px-4"
          >
            {isConnected ? (
              <Wifi className="mr-2 h-3 w-3" />
            ) : (
              <WifiOff className="mr-2 h-3 w-3" />
            )}
            {isConnected ? "Anlık Bildirim Aktif" : "Bağlantı Yok"}
          </Badge>
          <Button onClick={() => router.push('/company/new-order')} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Kurye Çağır
          </Button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Package className="w-8 h-8 text-gray-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-gray-500">Toplam Sipariş</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-gray-500">Bekleyen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Package className="w-8 h-8 text-blue-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-sm text-gray-500">Yolda</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.delivered}</p>
                <p className="text-sm text-gray-500">Teslim Edildi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <XCircle className="w-8 h-8 text-red-500" />
              <div className="text-right">
                <p className="text-2xl font-bold">{stats.cancelled}</p>
                <p className="text-sm text-gray-500">İptal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sipariş Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle>Siparişler</CardTitle>
          <CardDescription>Tüm siparişlerinizi buradan takip edebilirsiniz</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">Tümü ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Bekleyen ({stats.pending})</TabsTrigger>
              <TabsTrigger value="in_progress">Yolda ({stats.inProgress})</TabsTrigger>
              <TabsTrigger value="delivered">Teslim ({stats.delivered})</TabsTrigger>
              <TabsTrigger value="cancelled">İptal ({stats.cancelled})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <OrderTable orders={filterOrdersByStatus()} />
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <OrderTable orders={filterOrdersByStatus('PENDING')} />
            </TabsContent>

            <TabsContent value="in_progress" className="mt-6">
              <OrderTable orders={filterOrdersByStatus('IN_PROGRESS')} />
            </TabsContent>

            <TabsContent value="delivered" className="mt-6">
              <OrderTable orders={filterOrdersByStatus('DELIVERED')} />
            </TabsContent>

            <TabsContent value="cancelled" className="mt-6">
              <OrderTable orders={filterOrdersByStatus('CANCELLED')} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Sipariş Tablosu Komponenti
function OrderTable({ orders }: { orders: Order[] }) {
  const router = useRouter();
  
  // orders'in array olduğundan emin ol
  const orderList = Array.isArray(orders) ? orders : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Bekliyor';
      case 'ACCEPTED':
        return 'Kabul Edildi';
      case 'IN_PROGRESS':
        return 'Yolda';
      case 'DELIVERED':
        return 'Teslim Edildi';
      case 'CANCELLED':
        return 'İptal Edildi';
      case 'REJECTED':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  if (!orderList || orderList.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500">Henüz sipariş bulunmuyor</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4">Sipariş No</th>
            <th className="text-left py-3 px-4">Alıcı</th>
            <th className="text-left py-3 px-4">Teslimat Adresi</th>
            <th className="text-left py-3 px-4">Kurye</th>
            <th className="text-left py-3 px-4">Durum</th>
            <th className="text-left py-3 px-4">Fiyat</th>
            <th className="text-left py-3 px-4">Tarih</th>
            <th className="text-left py-3 px-4">İşlemler</th>
          </tr>
        </thead>
        <tbody>
          {orderList.map((order) => (
            <tr key={order.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="py-3 px-4">
                <span className="font-mono text-sm">{order.orderNumber}</span>
              </td>
              <td className="py-3 px-4">
                <div>
                  <p className="font-medium">{order.recipientName}</p>
                  <p className="text-sm text-gray-500">{order.recipientPhone}</p>
                </div>
              </td>
              <td className="py-3 px-4">
                <p className="text-sm line-clamp-2 max-w-xs">
                  {order.deliveryAddress.address}
                </p>
              </td>
              <td className="py-3 px-4">
                {order.courier ? (
                  <div>
                    <p className="font-medium">{order.courier.fullName}</p>
                    <p className="text-sm text-gray-500">{order.courier.phone}</p>
                  </div>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </td>
              <td className="py-3 px-4">
                <Badge className={getStatusColor(order.status)}>
                  {getStatusText(order.status)}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <span className="font-medium">₺{order.price.toFixed(2)}</span>
              </td>
              <td className="py-3 px-4">
                <span className="text-sm">
                  {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm', { locale: tr })}
                </span>
              </td>
              <td className="py-3 px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/company/orders/${order.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}