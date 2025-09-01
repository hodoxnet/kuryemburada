'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { orderService, Order } from '@/lib/api/order.service';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Eye, 
  Wifi, 
  WifiOff, 
  MapPin,
  Phone,
  User,
  Calendar,
  AlertCircle,
  Truck,
  Timer,
  ArrowRight,
  Search,
  MoreVertical,
  ChevronRight,
  Building
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { useSocket } from '@/contexts/SocketContext';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from '@/components/ui/skeleton';

export default function CompanyDashboard() {
  const router = useRouter();
  const { isConnected } = useSocket();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
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
        return 'warning';
      case 'ACCEPTED':
        return 'default';
      case 'IN_PROGRESS':
        return 'default';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
      case 'REJECTED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-3.5 w-3.5" />;
      case 'ACCEPTED':
        return <CheckCircle className="h-3.5 w-3.5" />;
      case 'IN_PROGRESS':
        return <Truck className="h-3.5 w-3.5" />;
      case 'DELIVERED':
        return <Package className="h-3.5 w-3.5" />;
      case 'CANCELLED':
      case 'REJECTED':
        return <XCircle className="h-3.5 w-3.5" />;
      default:
        return <AlertCircle className="h-3.5 w-3.5" />;
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
    
    let filtered = orders;
    
    // Status filter
    if (status && status !== 'all') {
      if (status === 'IN_PROGRESS') {
        filtered = filtered.filter(o => o.status === 'ACCEPTED' || o.status === 'IN_PROGRESS');
      } else if (status === 'CANCELLED') {
        filtered = filtered.filter(o => o.status === 'CANCELLED' || o.status === 'REJECTED');
      } else {
        filtered = filtered.filter(o => o.status === status);
      }
    }
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(o => 
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.recipientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.recipientPhone.includes(searchQuery)
      );
    }
    
    return filtered;
  };

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    className
  }: { 
    icon: any, 
    title: string, 
    value: number, 
    className?: string
  }) => (
    <Card className={cn("hover:shadow-md transition-all duration-200", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const OrderCard = ({ order }: { order: Order }) => (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold">#{order.orderNumber}</span>
              <Badge variant={getStatusColor(order.status)}>
                {getStatusIcon(order.status)}
                <span className="ml-1">{getStatusText(order.status)}</span>
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(order.createdAt), 'dd MMM yyyy', { locale: tr })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {format(new Date(order.createdAt), 'HH:mm', { locale: tr })}
              </div>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/company/orders/${order.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Detayları Gör
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`tel:${order.recipientPhone}`, '_self')}>
                <Phone className="mr-2 h-4 w-4" />
                Alıcıyı Ara
              </DropdownMenuItem>
              {order.courier && (
                <DropdownMenuItem onClick={() => window.open(`tel:${order.courier?.phone}`, '_self')}>
                  <Phone className="mr-2 h-4 w-4" />
                  Kuryeyi Ara
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="space-y-3">
          {/* Alıcı ve Kurye */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{order.recipientName}</p>
                <p className="text-xs text-muted-foreground">{order.recipientPhone}</p>
              </div>
            </div>

            {order.courier ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{order.courier.fullName}</p>
                  <p className="text-xs text-muted-foreground">{order.courier.phone}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Kurye bekleniyor</p>
              </div>
            )}
          </div>

          {/* Adres */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground mb-1">Teslimat Adresi</p>
              <p className="text-sm line-clamp-2">{order.deliveryAddress.address}</p>
            </div>
          </div>

          {/* Alt Bilgiler */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {order.packageType === 'DOCUMENT' ? 'Evrak' :
                   order.packageType === 'PACKAGE' ? 'Paket' :
                   order.packageType === 'FOOD' ? 'Yemek' : 'Diğer'}
                </span>
              </div>
              {order.urgency === 'URGENT' && (
                <Badge variant="destructive" className="text-xs">
                  <Timer className="mr-1 h-3 w-3" />
                  Acil
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-lg font-semibold">₺{(order.totalPrice ?? order.price).toFixed(2)}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => router.push(`/company/orders/${order.id}`)}
                className="h-8 px-2"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Firma Paneli</h1>
            <p className="text-muted-foreground">
              Siparişlerinizi yönetin ve takip edin
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge 
              variant={isConnected ? "secondary" : "destructive"} 
              className="py-1.5 px-3"
            >
              {isConnected ? (
                <>
                  <Wifi className="mr-1.5 h-3 w-3" />
                  <span className="hidden sm:inline">Bağlı</span>
                </>
              ) : (
                <>
                  <WifiOff className="mr-1.5 h-3 w-3" />
                  <span className="hidden sm:inline">Çevrimdışı</span>
                </>
              )}
            </Badge>
            <Button 
              onClick={() => router.push('/company/new-order')} 
              size="default"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Kurye Çağır</span>
              <span className="sm:hidden">Yeni</span>
            </Button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {loading ? (
            <>
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </>
          ) : (
            <>
              <StatCard
                icon={Package}
                title="Toplam Sipariş"
                value={stats.total}
              />
              <StatCard
                icon={Clock}
                title="Bekleyen"
                value={stats.pending}
                className="border-yellow-200 dark:border-yellow-900"
              />
              <StatCard
                icon={Truck}
                title="Yolda"
                value={stats.inProgress}
                className="border-blue-200 dark:border-blue-900"
              />
              <StatCard
                icon={CheckCircle}
                title="Teslim Edildi"
                value={stats.delivered}
                className="border-green-200 dark:border-green-900"
              />
              <StatCard
                icon={XCircle}
                title="İptal"
                value={stats.cancelled}
                className="border-red-200 dark:border-red-900"
              />
            </>
          )}
        </div>

        {/* Siparişler */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Siparişler</CardTitle>
                <CardDescription>Tüm siparişlerinizi buradan takip edebilirsiniz</CardDescription>
              </div>
              
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Sipariş ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full justify-start h-9 p-1">
                <TabsTrigger value="all" className="text-xs">
                  Tümü
                  {stats.total > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({stats.total})
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="PENDING" className="text-xs">
                  Bekleyen
                  {stats.pending > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({stats.pending})
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="IN_PROGRESS" className="text-xs">
                  Yolda
                  {stats.inProgress > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({stats.inProgress})
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="DELIVERED" className="text-xs">
                  Teslim
                  {stats.delivered > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({stats.delivered})
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="CANCELLED" className="text-xs">
                  İptal
                  {stats.cancelled > 0 && (
                    <span className="ml-1.5 text-xs text-muted-foreground">
                      ({stats.cancelled})
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={selectedTab} className="mt-4">
                {loading ? (
                  <div className="grid gap-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-48" />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {filterOrdersByStatus(selectedTab).length > 0 ? (
                      filterOrdersByStatus(selectedTab).map((order) => (
                        <OrderCard key={order.id} order={order} />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-full bg-muted mb-4">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-muted-foreground">
                          {searchQuery ? 'Arama sonucu bulunamadı' : 'Henüz sipariş bulunmuyor'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {searchQuery ? 'Farklı bir arama terimi deneyin' : 'Yeni sipariş oluşturmak için "Kurye Çağır" butonunu kullanın'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}