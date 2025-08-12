'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { orderService, Order } from '@/lib/api/order.service';
import GoogleMap from '@/components/shared/GoogleMap';
import { toast } from 'sonner';
import { 
  ArrowLeft,
  Package, 
  MapPin, 
  Clock, 
  User, 
  Phone, 
  Calendar,
  Truck,
  CheckCircle,
  Navigation,
  DollarSign,
  FileText,
  Building
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

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

export default function CourierOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchOrder(params.id as string);
    }
  }, [params.id]);

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(id);
      setOrder(data);
    } catch (error) {
      console.error('Sipariş yüklenemedi:', error);
      toast.error('Sipariş yüklenirken bir hata oluştu');
      router.push('/courier');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async () => {
    if (!order) return;
    try {
      setUpdating(true);
      await orderService.acceptOrder(order.id);
      toast.success('Sipariş kabul edildi');
      fetchOrder(order.id);
    } catch (error) {
      console.error('Sipariş kabul edilemedi:', error);
      toast.error('Sipariş kabul edilirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!order) return;
    try {
      setUpdating(true);
      await orderService.updateOrderStatus(order.id, status);
      
      const messages = {
        'IN_PROGRESS': 'Yola çıktınız',
        'DELIVERED': 'Teslimat tamamlandı',
        'CANCELLED': 'Sipariş iptal edildi'
      };
      
      toast.success(messages[status as keyof typeof messages] || 'Durum güncellendi');
      fetchOrder(order.id);
    } catch (error) {
      console.error('Durum güncellenemedi:', error);
      toast.error('Durum güncellenirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  const openInMaps = (address: any) => {
    const query = encodeURIComponent(address.address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Sipariş yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Sipariş bulunamadı</p>
          <Button onClick={() => router.push('/courier')} className="mt-4">
            Panele Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/courier')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Sipariş Detayı</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              #{order.orderNumber || order.trackingCode}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {statusLabels[order.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Harita ve Ana Bilgiler */}
        <div className="lg:col-span-2 space-y-6">
          {/* Durum Kartı ve İşlem Butonları */}
          {order.status === 'PENDING' && !order.courier && (
            <Card className="border-primary">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">Bu siparişi kabul etmek istiyor musunuz?</p>
                    <p className="text-muted-foreground">Kazanç: ₺{order.courierEarning?.toFixed(2) || order.price?.toFixed(2)}</p>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handleAcceptOrder}
                    disabled={updating}
                  >
                    {updating ? 'İşleniyor...' : 'Siparişi Kabul Et'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {order.status === 'ACCEPTED' && (
            <Card className="border-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">Paketi aldınız mı?</p>
                    <p className="text-muted-foreground">Alım noktasına gidin ve paketi teslim alın</p>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    disabled={updating}
                  >
                    {updating ? 'İşleniyor...' : 'Yola Çıktım'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {order.status === 'IN_PROGRESS' && (
            <Card className="border-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">Teslimatı tamamladınız mı?</p>
                    <p className="text-muted-foreground">Alıcıya teslim ettikten sonra onaylayın</p>
                  </div>
                  <Button 
                    size="lg" 
                    variant="default"
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    disabled={updating}
                  >
                    {updating ? 'İşleniyor...' : 'Teslim Ettim'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Harita */}
          <Card>
            <CardHeader>
              <CardTitle>Teslimat Rotası</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] relative">
                <GoogleMap
                  pickupAddress={order.pickupAddress}
                  deliveryAddress={order.deliveryAddress}
                  onPickupSelect={() => {}}
                  onDeliverySelect={() => {}}
                />
              </div>
              <div className="p-4 grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => openInMaps(order.pickupAddress)}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Alım Noktasına Git
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => openInMaps(order.deliveryAddress)}
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Teslimat Noktasına Git
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Adres Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>Adres Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <MapPin className="h-4 w-4" />
                    <span className="font-semibold">Alım Noktası</span>
                  </div>
                  <p className="text-sm">{order.pickupAddress?.address}</p>
                  {order.pickupAddress?.detail && (
                    <p className="text-sm text-muted-foreground">{order.pickupAddress.detail}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-red-600">
                    <MapPin className="h-4 w-4" />
                    <span className="font-semibold">Teslimat Noktası</span>
                  </div>
                  <p className="text-sm">{order.deliveryAddress?.address}</p>
                  {order.deliveryAddress?.detail && (
                    <p className="text-sm text-muted-foreground">{order.deliveryAddress.detail}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Kolon - Detaylar */}
        <div className="space-y-6">
          {/* Kazanç Bilgisi */}
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Kazanç
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                ₺{order.courierEarning?.toFixed(2) || order.price?.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Mesafe: {order.distance?.toFixed(1)} km
              </p>
              <p className="text-sm text-muted-foreground">
                Tahmini Süre: {order.estimatedDeliveryTime || order.estimatedTime} dk
              </p>
            </CardContent>
          </Card>

          {/* Firma Bilgileri */}
          {order.company && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Firma Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Firma Adı</p>
                  <p className="font-medium">{order.company.name}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium">{order.company.phone}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alıcı Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Alıcı Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Ad Soyad</p>
                <p className="font-medium">{order.recipientName}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Telefon</p>
                <p className="font-medium">{order.recipientPhone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Paket Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Paket Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Paket Tipi</p>
                <p className="font-medium">{packageTypeLabels[order.packageType]}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Paket Boyutu</p>
                <p className="font-medium">{packageSizeLabels[order.packageSize]}</p>
              </div>
              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Notlar</p>
                    <p className="text-sm">{order.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Zaman Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Zaman Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Oluşturulma</p>
                <p className="text-sm">
                  {format(new Date(order.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                </p>
              </div>
              {order.acceptedAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Kabul Edilme</p>
                    <p className="text-sm">
                      {format(new Date(order.acceptedAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                    </p>
                  </div>
                </>
              )}
              {order.pickedUpAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Yola Çıkış</p>
                    <p className="text-sm">
                      {format(new Date(order.pickedUpAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                    </p>
                  </div>
                </>
              )}
              {order.deliveredAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Teslim</p>
                    <p className="text-sm">
                      {format(new Date(order.deliveredAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}