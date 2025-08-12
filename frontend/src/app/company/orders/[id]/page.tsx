'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { orderService, Order } from '@/lib/api/order.service';
import SimpleGoogleMap from '@/components/shared/SimpleGoogleMap';
import { Navigation2 } from 'lucide-react';
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
  XCircle,
  Timer,
  AlertCircle,
  DollarSign,
  FileText,
  Copy,
  Navigation,
  Zap
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

const deliveryTypeLabels: Record<string, string> = {
  STANDARD: 'Standart',
  EXPRESS: 'Express',
};

const urgencyLabels: Record<string, string> = {
  NORMAL: 'Normal',
  URGENT: 'Acil',
  VERY_URGENT: 'Çok Acil',
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [realDistance, setRealDistance] = useState<number | null>(null);

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
      router.push('/company/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !confirm('Siparişi iptal etmek istediğinizden emin misiniz?')) return;

    try {
      await orderService.cancelOrder(order.id);
      toast.success('Sipariş iptal edildi');
      fetchOrder(order.id);
    } catch (error) {
      console.error('Sipariş iptal edilemedi:', error);
      toast.error('Sipariş iptal edilirken bir hata oluştu');
    }
  };

  const copyTrackingCode = () => {
    if (order?.trackingCode) {
      navigator.clipboard.writeText(order.trackingCode);
      toast.success('Takip kodu kopyalandı');
    }
  };

  const getOrderProgress = (status: string) => {
    const statuses = ['PENDING', 'ACCEPTED', 'IN_PROGRESS', 'DELIVERED'];
    const currentIndex = statuses.indexOf(status);
    return ((currentIndex + 1) / statuses.length) * 100;
  };

  const getStatusSteps = () => {
    return [
      {
        label: 'Sipariş Oluşturuldu',
        status: 'PENDING',
        completed: true,
        time: order?.createdAt,
      },
      {
        label: 'Kurye Atandı',
        status: 'ACCEPTED',
        completed: ['ACCEPTED', 'IN_PROGRESS', 'DELIVERED'].includes(order?.status || ''),
        time: order?.acceptedAt,
      },
      {
        label: 'Yola Çıktı',
        status: 'IN_PROGRESS',
        completed: ['IN_PROGRESS', 'DELIVERED'].includes(order?.status || ''),
        time: order?.pickedUpAt,
      },
      {
        label: 'Teslim Edildi',
        status: 'DELIVERED',
        completed: order?.status === 'DELIVERED',
        time: order?.deliveredAt,
      },
    ];
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
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Sipariş bulunamadı</p>
          <Button onClick={() => router.push('/company/orders')} className="mt-4">
            Siparişlere Dön
          </Button>
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[order.status];
  const progress = getOrderProgress(order.status);

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Başlık */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/company/orders')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Sipariş Detayı</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              #{order.trackingCode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={copyTrackingCode}>
            <Copy className="w-4 h-4 mr-2" />
            Takip Kodunu Kopyala
          </Button>
          {order.status === 'PENDING' && (
            <Button variant="destructive" onClick={handleCancelOrder}>
              <XCircle className="w-4 h-4 mr-2" />
              Siparişi İptal Et
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Sipariş Bilgileri */}
        <div className="lg:col-span-2 space-y-6">
          {/* Durum Kartı */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <StatusIcon className={`h-5 w-5 ${
                    order.status === 'DELIVERED' ? 'text-green-500' :
                    order.status === 'CANCELLED' || order.status === 'FAILED' ? 'text-red-500' :
                    order.status === 'PENDING' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  Sipariş Durumu
                </CardTitle>
                <Badge variant={statusColors[order.status] as any}>
                  {statusLabels[order.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* İlerleme Çubuğu */}
              {!['CANCELLED', 'FAILED'].includes(order.status) && (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                    <div 
                      className="bg-primary h-3 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Durum Adımları */}
                  <div className="space-y-4">
                    {getStatusSteps().map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center ${
                          step.completed ? 'bg-primary text-white' : 'bg-gray-200'
                        }`}>
                          {step.completed && <CheckCircle className="w-3 h-3" />}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${!step.completed && 'text-muted-foreground'}`}>
                            {step.label}
                          </p>
                          {step.time && (
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(step.time), 'dd MMMM yyyy HH:mm', { locale: tr })}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* İptal/Başarısız Durumu */}
              {['CANCELLED', 'FAILED'].includes(order.status) && (
                <div className="text-center py-8">
                  <StatusIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">
                    {order.status === 'CANCELLED' ? 'Sipariş İptal Edildi' : 'Sipariş Başarısız'}
                  </p>
                  {order.notes && (
                    <p className="text-sm text-muted-foreground">{order.notes}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Harita */}
          <Card>
            <CardHeader>
              <CardTitle>Teslimat Rotası</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[400px] relative">
                <SimpleGoogleMap
                  pickupAddress={order.pickupAddress}
                  deliveryAddress={order.deliveryAddress}
                  onDistanceChange={(newDistance, newDuration) => {
                    // Google Maps'ten gelen gerçek mesafeyi kaydet
                    setRealDistance(newDistance);
                  }}
                />
              </div>
              
              {/* Alım ve Teslimat Noktaları Info Kartları */}
              <div className="p-4 space-y-3">
                {/* Alım Noktası */}
                <div className="flex items-start justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900 dark:text-green-100">Alım Noktası:</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {order.pickupAddress?.address}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => {
                      const addr = order.pickupAddress;
                      if (addr?.lat && addr?.lng) {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr.lat},${addr.lng}`, '_blank');
                      }
                    }}
                  >
                    <Navigation2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Teslimat Noktası */}
                <div className="flex items-start justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-red-600" />
                      <span className="font-medium text-red-900 dark:text-red-100">Teslimat Noktası:</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {order.deliveryAddress?.address}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => {
                      const addr = order.deliveryAddress;
                      if (addr?.lat && addr?.lng) {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr.lat},${addr.lng}`, '_blank');
                      }
                    }}
                  >
                    <Navigation2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mesafe ve Süre Bilgisi */}
                <div className="flex items-center justify-between p-2 text-sm text-muted-foreground">
                  <span>Mesafe: {realDistance?.toFixed(1) || order.distance?.toFixed(1) || '?'} km</span>
                  <span>Tahmini Süre: {order.estimatedDeliveryTime || order.estimatedTime || '?'} dakika</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kurye Bilgileri */}
          {order.courier && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Kurye Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {order.courier.fullName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.courier.vehicleInfo?.brand} {order.courier.vehicleInfo?.model}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="flex items-center gap-1 text-sm">
                      <Phone className="h-4 w-4" />
                      {order.courier.phone}
                    </p>
                    {order.courier.vehicleInfo?.plate && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Plaka: {order.courier.vehicleInfo.plate}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sağ Kolon - Detaylar */}
        <div className="space-y-6">
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
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Teslimat Tipi</p>
                <div className="flex items-center gap-2">
                  {order.deliveryType === 'EXPRESS' && <Zap className="h-4 w-4 text-yellow-500" />}
                  <p className="font-medium">{deliveryTypeLabels[order.deliveryType || 'STANDARD']}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Aciliyet</p>
                <Badge variant={order.urgency === 'VERY_URGENT' ? 'destructive' : order.urgency === 'URGENT' ? 'warning' : 'default'}>
                  {urgencyLabels[order.urgency || 'NORMAL']}
                </Badge>
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

          {/* Fiyat Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Fiyat Detayı
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Mesafe</p>
                <p className="font-medium">{order.distance?.toFixed(1)} km</p>
              </div>
              <Separator />
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Tahmini Süre</p>
                <p className="font-medium">{order.estimatedDeliveryTime || '-'} dk</p>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <p className="font-semibold">Toplam</p>
                <p className="font-bold text-primary">₺{order.totalPrice}</p>
              </div>
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
              {order.scheduledPickupTime && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Planlanan Alım</p>
                    <p className="text-sm">
                      {format(new Date(order.scheduledPickupTime), 'dd MMMM yyyy HH:mm', { locale: tr })}
                    </p>
                  </div>
                </>
              )}
              {order.deliveredAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Teslim Zamanı</p>
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