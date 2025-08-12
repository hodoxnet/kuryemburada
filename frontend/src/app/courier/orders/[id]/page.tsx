'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { orderService, Order } from '@/lib/api/order.service';
import SimpleGoogleMap from '@/components/shared/SimpleGoogleMap';
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

  // Yol tarifi için navigasyon uygulamalarını aç
  const openInMaps = (address: any) => {
    if (!address || !address.lat || !address.lng) {
      toast.error('Adres koordinatları bulunamadı');
      return;
    }

    const destination = `${address.lat},${address.lng}`;
    const label = encodeURIComponent(address.address || 'Hedef Konum');
    
    // Mobil cihaz kontrolü
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Önce native uygulamaları dene
      if (isIOS) {
        // iOS için Apple Maps
        window.location.href = `maps://maps.apple.com/?daddr=${destination}&q=${label}`;
        
        // Eğer uygulama yoksa Google Maps web'e yönlendir
        setTimeout(() => {
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${label}`, '_blank');
        }, 500);
      } else {
        // Android için Google Maps uygulaması
        window.location.href = `google.navigation:q=${address.lat},${address.lng}`;
        
        // Eğer uygulama yoksa Google Maps web'e yönlendir
        setTimeout(() => {
          window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${label}`, '_blank');
        }, 500);
      }
    } else {
      // Masaüstü için Google Maps web
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}&destination_place_id=${label}`, '_blank');
    }
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
            <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">Alım Noktasına Gidin</p>
                      <p className="text-muted-foreground">Paketi teslim alıp yola çıkın</p>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-blue-600"
                        onClick={() => openInMaps(order.pickupAddress)}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Navigasyonu Başlat
                      </Button>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => handleUpdateStatus('IN_PROGRESS')}
                    disabled={updating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {updating ? 'İşleniyor...' : 'Paketi Aldım'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {order.status === 'IN_PROGRESS' && (
            <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Truck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold">Teslimat Noktasına Gidin</p>
                      <p className="text-muted-foreground">Paketi alıcıya teslim edin</p>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-green-600"
                        onClick={() => openInMaps(order.deliveryAddress)}
                      >
                        <Navigation className="h-3 w-3 mr-1" />
                        Teslimat Adresine Git
                      </Button>
                    </div>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={() => handleUpdateStatus('DELIVERED')}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700"
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
                <SimpleGoogleMap
                  pickupAddress={order.pickupAddress}
                  deliveryAddress={order.deliveryAddress}
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
                    size="icon"
                    className="ml-2 hover:bg-green-100"
                    onClick={() => openInMaps(order.pickupAddress)}
                    title="Navigasyonu Başlat"
                  >
                    <Navigation className="h-4 w-4 text-green-600" />
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
                    size="icon"
                    className="ml-2 hover:bg-red-100"
                    onClick={() => openInMaps(order.deliveryAddress)}
                    title="Navigasyonu Başlat"
                  >
                    <Navigation className="h-4 w-4 text-red-600" />
                  </Button>
                </div>

                {/* Mesafe ve Süre Bilgisi */}
                <div className="flex items-center justify-between p-2 text-sm text-muted-foreground">
                  <span>Mesafe: {order.distance?.toFixed(1) || '?'} km</span>
                  <span>Tahmini Süre: {order.estimatedTime || '?'} dakika</span>
                </div>
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
                <div className="space-y-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600">
                      <MapPin className="h-4 w-4" />
                      <span className="font-semibold">Alım Noktası</span>
                    </div>
                    {order.company && (
                      <Badge variant="outline" className="text-xs">
                        <Phone className="h-3 w-3 mr-1" />
                        {order.company.phone}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm">{order.pickupAddress?.address}</p>
                  {order.pickupAddress?.detail && (
                    <p className="text-sm text-muted-foreground italic">
                      "{order.pickupAddress.detail}"
                    </p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => openInMaps(order.pickupAddress)}
                  >
                    <Navigation className="h-3 w-3 mr-2" />
                    Yol Tarifi Al
                  </Button>
                </div>
                <div className="space-y-3 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-600">
                      <MapPin className="h-4 w-4" />
                      <span className="font-semibold">Teslimat Noktası</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      {order.recipientPhone}
                    </Badge>
                  </div>
                  <p className="text-sm">{order.deliveryAddress?.address}</p>
                  {order.deliveryAddress?.detail && (
                    <p className="text-sm text-muted-foreground italic">
                      "{order.deliveryAddress.detail}"
                    </p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full"
                    onClick={() => openInMaps(order.deliveryAddress)}
                  >
                    <Navigation className="h-3 w-3 mr-2" />
                    Yol Tarifi Al
                  </Button>
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