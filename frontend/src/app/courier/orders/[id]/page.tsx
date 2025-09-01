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
    <div className="container mx-auto p-4 sm:p-6 lg:py-8 max-w-7xl">
      {/* Başlık - Mobilde responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 lg:mb-8">
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 sm:h-10 sm:w-10"
            onClick={() => router.push('/courier')}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="flex-1 sm:flex-none">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Sipariş Detayı</h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
              #{order.orderNumber || order.trackingCode}
            </p>
          </div>
        </div>
        <Badge 
          variant="outline" 
          className="text-sm sm:text-base lg:text-lg px-3 py-1.5 sm:px-4 sm:py-2 self-start sm:self-auto"
        >
          {statusLabels[order.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sol Kolon - Harita ve Ana Bilgiler */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
          {/* Durum Kartı ve İşlem Butonları - Mobilde responsive */}
          {order.status === 'PENDING' && !order.courier && (
            <Card className="border-primary">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="w-full sm:w-auto">
                    <p className="text-base sm:text-lg font-semibold">Bu siparişi kabul etmek istiyor musunuz?</p>
                    <p className="text-sm sm:text-base text-muted-foreground mt-1">
                      Kazanç: ₺{order.courierEarning?.toFixed(2) || order.price?.toFixed(2)}
                    </p>
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handleAcceptOrder}
                    disabled={updating}
                    className="w-full sm:w-auto"
                  >
                    {updating ? 'İşleniyor...' : 'Siparişi Kabul Et'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {order.status === 'ACCEPTED' && (
            <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base sm:text-lg font-semibold">Alım Noktasına Gidin</p>
                      <p className="text-sm sm:text-base text-muted-foreground">Paketi teslim alıp yola çıkın</p>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-blue-600 text-sm sm:text-base"
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
                    className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                  >
                    {updating ? 'İşleniyor...' : 'Paketi Aldım'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {order.status === 'IN_PROGRESS' && (
            <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base sm:text-lg font-semibold">Teslimat Noktasına Gidin</p>
                      <p className="text-sm sm:text-base text-muted-foreground">Paketi alıcıya teslim edin</p>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-green-600 text-sm sm:text-base"
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
                    className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                  >
                    {updating ? 'İşleniyor...' : 'Teslim Ettim'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Harita - Mobilde responsive yükseklik */}
          <Card className="overflow-hidden">
            <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
              <CardTitle className="text-base sm:text-lg">Teslimat Rotası</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[300px] sm:h-[350px] lg:h-[400px] relative w-full">
                <SimpleGoogleMap
                  pickupAddress={order.pickupAddress}
                  deliveryAddress={order.deliveryAddress}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Alım ve Teslimat Noktaları - Harita dışında ayrı kart olarak */}
          <Card>
            <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
              <CardTitle className="text-base sm:text-lg">Rota Detayları</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="space-y-2 sm:space-y-3">
                {/* Alım Noktası - Mobilde responsive */}
                <div className="flex items-start justify-between p-2.5 sm:p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base text-green-900 dark:text-green-100">Alım Noktası</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">
                      {order.pickupAddress?.address}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-8 w-8 sm:h-9 sm:w-9 hover:bg-green-100 flex-shrink-0"
                    onClick={() => openInMaps(order.pickupAddress)}
                    title="Navigasyonu Başlat"
                  >
                    <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                  </Button>
                </div>

                {/* Teslimat Noktası - Mobilde responsive */}
                <div className="flex items-start justify-between p-2.5 sm:p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600 flex-shrink-0" />
                      <span className="font-medium text-sm sm:text-base text-red-900 dark:text-red-100">Teslimat Noktası</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-words">
                      {order.deliveryAddress?.address}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-8 w-8 sm:h-9 sm:w-9 hover:bg-red-100 flex-shrink-0"
                    onClick={() => openInMaps(order.deliveryAddress)}
                    title="Navigasyonu Başlat"
                  >
                    <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-600" />
                  </Button>
                </div>

                {/* Mesafe ve Süre Bilgisi - Mobilde responsive */}
                <div className="flex items-center justify-between p-2 text-xs sm:text-sm text-muted-foreground">
                  <span>Mesafe: {order.distance?.toFixed(1) || '?'} km</span>
                  <span>Tahmini Süre: {order.estimatedTime || '?'} dakika</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adres Bilgileri - Mobilde tek sütun */}
          <Card>
            <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
              <CardTitle className="text-base sm:text-lg">Adres Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2.5 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-blue-600">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="font-semibold text-sm sm:text-base">Alım Noktası</span>
                    </div>
                    {order.company && (
                      <Badge variant="outline" className="text-xs self-start sm:self-auto">
                        <Phone className="h-3 w-3 mr-1" />
                        {order.company.phone}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm break-words">{order.pickupAddress?.address}</p>
                  {order.pickupAddress?.detail && (
                    <p className="text-xs sm:text-sm text-muted-foreground italic">
                      "{order.pickupAddress.detail}"
                    </p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full h-9 sm:h-10 text-xs sm:text-sm"
                    onClick={() => openInMaps(order.pickupAddress)}
                  >
                    <Navigation className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                    Yol Tarifi Al
                  </Button>
                </div>
                <div className="space-y-2.5 sm:space-y-3 p-3 sm:p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-green-600">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="font-semibold text-sm sm:text-base">Teslimat Noktası</span>
                    </div>
                    <Badge variant="outline" className="text-xs self-start sm:self-auto">
                      <Phone className="h-3 w-3 mr-1" />
                      {order.recipientPhone}
                    </Badge>
                  </div>
                  <p className="text-xs sm:text-sm break-words">{order.deliveryAddress?.address}</p>
                  {order.deliveryAddress?.detail && (
                    <p className="text-xs sm:text-sm text-muted-foreground italic">
                      "{order.deliveryAddress.detail}"
                    </p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full h-9 sm:h-10 text-xs sm:text-sm"
                    onClick={() => openInMaps(order.deliveryAddress)}
                  >
                    <Navigation className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1.5 sm:mr-2" />
                    Yol Tarifi Al
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Kolon - Detaylar - Mobilde önce göster */}
        <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
          {/* Kazanç Bilgisi - Mobilde öne çıkan */}
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-500">
            <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Kazanç
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6">
              <p className="text-2xl sm:text-3xl font-bold text-green-600">
                ₺{order.courierEarning?.toFixed(2) || order.price?.toFixed(2)}
              </p>
              <div className="flex flex-col sm:flex-row sm:gap-4 mt-2">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Mesafe: {order.distance?.toFixed(1)} km
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Tahmini Süre: {order.estimatedDeliveryTime || order.estimatedTime} dk
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Firma Bilgileri - Mobilde kompakt */}
          {order.company && (
            <Card>
              <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Building className="h-4 w-4 sm:h-5 sm:w-5" />
                  Firma Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Firma Adı</p>
                  <p className="text-sm sm:text-base font-medium">{order.company.name}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Telefon</p>
                  <p className="text-sm sm:text-base font-medium">{order.company.phone}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alıcı Bilgileri - Mobilde kompakt */}
          <Card>
            <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                Alıcı Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Ad Soyad</p>
                <p className="text-sm sm:text-base font-medium">{order.recipientName}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Telefon</p>
                <p className="text-sm sm:text-base font-medium">{order.recipientPhone}</p>
              </div>
            </CardContent>
          </Card>

          {/* Paket Bilgileri - Mobilde kompakt */}
          <Card>
            <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                Paket Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Paket Tipi</p>
                <p className="text-sm sm:text-base font-medium">{packageTypeLabels[order.packageType]}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Paket Boyutu</p>
                <p className="text-sm sm:text-base font-medium">{packageSizeLabels[order.packageSize]}</p>
              </div>
              {order.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Notlar</p>
                    <p className="text-xs sm:text-sm break-words">{order.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Zaman Bilgileri - Mobilde kompakt */}
          <Card>
            <CardHeader className="px-4 py-3 sm:px-6 sm:py-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                Zaman Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-3">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Oluşturulma</p>
                <p className="text-xs sm:text-sm">
                  {format(new Date(order.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                </p>
              </div>
              {order.acceptedAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Kabul Edilme</p>
                    <p className="text-xs sm:text-sm">
                      {format(new Date(order.acceptedAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                    </p>
                  </div>
                </>
              )}
              {order.pickedUpAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Yola Çıkış</p>
                    <p className="text-xs sm:text-sm">
                      {format(new Date(order.pickedUpAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                    </p>
                  </div>
                </>
              )}
              {order.deliveredAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Teslim</p>
                    <p className="text-xs sm:text-sm">
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