'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { orderService, Order } from '@/lib/api/order.service';
import { toast } from 'sonner';
import { 
  Package, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Calendar,
  Search,
  Filter,
  Eye,
  X,
  CheckCircle,
  XCircle,
  Truck,
  Timer,
  AlertCircle
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

const packageTypeLabels: Record<string, string> = {
  DOCUMENT: 'Döküman',
  PACKAGE: 'Paket',
  FOOD: 'Yiyecek',
  OTHER: 'Diğer',
};

const packageSizeLabels: Record<string, string> = {
  SMALL: 'Küçük',
  MEDIUM: 'Orta',
  LARGE: 'Büyük',
  EXTRA_LARGE: 'Çok Büyük',
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getCompanyOrders();
      // Data'nın array olduğundan emin ol
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error('Beklenmedik veri formatı:', data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error);
      toast.error('Siparişler yüklenirken bir hata oluştu');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    // orders'in array olduğundan emin ol
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
        order.trackingCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.recipientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.recipientPhone?.includes(searchTerm)
      );
    }

    // Tarihe göre sırala (en yeni önce)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Siparişi iptal etmek istediğinizden emin misiniz?')) return;

    try {
      await orderService.cancelOrder(orderId);
      toast.success('Sipariş iptal edildi');
      fetchOrders();
    } catch (error) {
      console.error('Sipariş iptal edilemedi:', error);
      toast.error('Sipariş iptal edilirken bir hata oluştu');
    }
  };

  const getOrderProgress = (status: string) => {
    const statuses = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'DELIVERED'];
    const currentIndex = statuses.indexOf(status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Siparişler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Başlık */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Siparişlerim</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Tüm siparişlerinizi buradan takip edebilirsiniz
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Toplam Sipariş</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Timer className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(orders) ? orders.filter(o => o.status === 'PENDING').length : 0}
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
              {Array.isArray(orders) ? orders.filter(o => o.status === 'IN_PROGRESS').length : 0}
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
              {Array.isArray(orders) ? orders.filter(o => o.status === 'DELIVERED').length : 0}
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
                placeholder="Takip kodu, alıcı adı veya telefon ara..."
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
                <SelectItem value="FAILED">Başarısız</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => router.push('/company/new-order')}>
              <Package className="w-4 h-4 mr-2" />
              Yeni Sipariş
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Siparişler Listesi */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Sipariş bulunamadı</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm || statusFilter !== 'ALL' 
                ? 'Filtrelere uygun sipariş bulunamadı'
                : 'Henüz siparişiniz bulunmuyor'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => {
            const StatusIcon = statusIcons[order.status];
            const progress = getOrderProgress(order.status);
            
            return (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
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
                            <p className="font-semibold">#{order.trackingCode}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={statusColors[order.status] as any}>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>

                      {/* İlerleme Çubuğu */}
                      {!['CANCELLED', 'FAILED'].includes(order.status) && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all"
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
                            <p className="text-muted-foreground">{order.pickupAddress.address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-red-500 mt-1" />
                          <div className="text-sm">
                            <p className="font-medium">Teslimat Noktası</p>
                            <p className="text-muted-foreground">{order.deliveryAddress.address}</p>
                          </div>
                        </div>
                      </div>

                      {/* Alıcı ve Paket Bilgileri */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{order.recipientName}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{order.recipientPhone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span>{packageTypeLabels[order.packageType]} - {packageSizeLabels[order.packageSize]}</span>
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
                        <p className="text-2xl font-bold">₺{order.totalPrice}</p>
                        <p className="text-sm text-muted-foreground">{order.distance?.toFixed(1)} km</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/company/orders/${order.id}`)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Detay
                        </Button>
                        {order.status === 'PENDING' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            İptal
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}