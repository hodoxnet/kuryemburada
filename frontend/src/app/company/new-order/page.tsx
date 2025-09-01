'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { orderService, CreateOrderDto, Address } from '@/lib/api/order.service';
import { serviceAreaService, ServiceArea } from '@/lib/api/service-area.service';
import GoogleMap from '@/components/shared/GoogleMap';
import { toast } from 'sonner';
import { ArrowLeft, MapPin, Package, Clock, User, Phone, FileText, Zap, Calendar, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/authStore';

const orderSchema = z.object({
  recipientName: z.string().min(2, 'Alıcı adı en az 2 karakter olmalıdır'),
  recipientPhone: z.string().min(10, 'Geçerli bir telefon numarası giriniz'),
  packageType: z.enum(['DOCUMENT', 'PACKAGE', 'FOOD', 'OTHER']),
  packageSize: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE']),
  deliveryType: z.enum(['STANDARD', 'EXPRESS']),
  urgency: z.enum(['NORMAL', 'URGENT', 'VERY_URGENT']),
  notes: z.string().optional(),
  scheduledPickupTime: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function NewOrderPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [pickupAddress, setPickupAddress] = useState<Address>();
  const [deliveryAddress, setDeliveryAddress] = useState<Address>();
  const [estimatedPrice, setEstimatedPrice] = useState<number>(0);
  const [estimatedTime, setEstimatedTime] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0); // Google Maps'ten gelen süre (dakika)
  const [useCompanyAddress, setUseCompanyAddress] = useState(false);
  const [companyAddressCoords, setCompanyAddressCoords] = useState<Address>();
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      packageType: 'PACKAGE',
      packageSize: 'MEDIUM',
      deliveryType: 'STANDARD',
      urgency: 'NORMAL',
    },
  });

  const packageType = watch('packageType');
  const packageSize = watch('packageSize');
  const deliveryType = watch('deliveryType');
  const urgency = watch('urgency');

  // Aktif hizmet bölgelerini çek
  useEffect(() => {
    const fetchServiceAreas = async () => {
      try {
        const areas = await serviceAreaService.getActive();
        setServiceAreas(areas);
      } catch (error) {
        console.error('Hizmet bölgeleri yüklenemedi:', error);
      }
    };
    fetchServiceAreas();
  }, []);

  // Adres veya fiyat parametreleri değiştiğinde fiyat hesapla
  useEffect(() => {
    if (pickupAddress && deliveryAddress && serviceAreas.length > 0 && distance > 0) {
      // Distance state'i varsa onu kullanarak hesapla
      calculatePrice();
    }
  }, [pickupAddress, deliveryAddress, serviceAreas, packageSize, deliveryType, urgency, distance]);

  // Firma adresini geocode et
  useEffect(() => {
    console.log('User data:', user);
    console.log('Company data:', user?.company);
    console.log('Company address:', user?.company?.address);
    
    // Address JSON obje olarak geliyor, detail alanını kullanmalıyız
    const companyAddress = user?.company?.address?.detail || user?.company?.address;
    
    if (companyAddress && typeof companyAddress === 'string') {
      let cancelled = false;
      const doGeocode = async () => {
        try {
          // Eğer yeni importLibrary API'si varsa geocoding kütüphanesini yükle
          if (typeof google !== 'undefined' && (google.maps as any)?.importLibrary) {
            const lib: any = await (google.maps as any).importLibrary('geocoding');
            const GeocoderCtor = lib?.Geocoder || (google.maps as any).Geocoder;
            if (!GeocoderCtor) return;
            const geocoder = new GeocoderCtor();
            geocoder.geocode({ address: companyAddress + ', Türkiye' }, (results: any, status: any) => {
              if (!cancelled && status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                setCompanyAddressCoords({
                  lat: location.lat(),
                  lng: location.lng(),
                  address: companyAddress,
                  detail: user?.company?.name,
                });
                console.log('Company address geocoded:', companyAddress, location.lat(), location.lng());
              }
            });
            return;
          }

          // Eski yol: Geocoder constructor hazırsa kullan
          if (typeof google !== 'undefined' && google.maps && typeof (google.maps as any).Geocoder === 'function') {
            const geocoder = new (google.maps as any).Geocoder();
            geocoder.geocode({ address: companyAddress + ', Türkiye' }, (results: any, status: any) => {
              if (!cancelled && status === 'OK' && results && results[0]) {
                const location = results[0].geometry.location;
                setCompanyAddressCoords({
                  lat: location.lat(),
                  lng: location.lng(),
                  address: companyAddress,
                  detail: user?.company?.name,
                });
                console.log('Company address geocoded:', companyAddress, location.lat(), location.lng());
              }
            });
            return;
          }
        } catch (e) {
          console.warn('Firma adresi geocode hatası:', e);
        }
      };

      // Kısa bekleme ile tekrar dene (harita yükleniyor olabilir)
      const interval = setInterval(() => {
        if (typeof google !== 'undefined' && google.maps) {
          doGeocode();
          clearInterval(interval);
        }
      }, 400);

      // Cleanup
      return () => { cancelled = true; clearInterval(interval); };
    }
  }, [user]);

  // Point-in-polygon algoritması
  const isPointInPolygon = (point: { lat: number; lng: number }, polygon: Array<{ lat: number; lng: number }>) => {
    let isInside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].lng, yi = polygon[i].lat;
      const xj = polygon[j].lng, yj = polygon[j].lat;
      
      const intersect = ((yi > point.lat) !== (yj > point.lat))
        && (point.lng < (xj - xi) * (point.lat - yi) / (yj - yi) + xi);
      if (intersect) isInside = !isInside;
    }
    return isInside;
  };

  // Hangi bölgede olduğunu bul
  const findServiceArea = (point: { lat: number; lng: number }) => {
    for (const area of serviceAreas) {
      if (area.boundaries && isPointInPolygon(point, area.boundaries)) {
        return area;
      }
    }
    return null;
  };

  // Fiyat hesaplama (bölge bazlı)
  const calculatePrice = (googleMapsDistance?: number, googleMapsDuration?: number) => {
    if (!pickupAddress || !deliveryAddress || serviceAreas.length === 0) return;

    // Google Maps'ten gelen mesafeyi kullan, yoksa state'teki distance'ı kullan
    let calculatedDistance: number;
    
    if (googleMapsDistance) {
      calculatedDistance = googleMapsDistance;
    } else if (distance > 0) {
      // Eğer daha önce Google Maps'ten mesafe geldiyse onu kullan
      calculatedDistance = distance;
    } else {
      // Haversine formülü (son çare)
      const R = 6371; // Dünya yarıçapı (km)
      const dLat = (deliveryAddress.lat - pickupAddress.lat) * Math.PI / 180;
      const dLon = (deliveryAddress.lng - pickupAddress.lng) * Math.PI / 180;
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(pickupAddress.lat * Math.PI / 180) * Math.cos(deliveryAddress.lat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      calculatedDistance = R * c; // Mesafe (km)
    }
    
    console.log('calculatePrice çağrıldı:', {
      parametre: googleMapsDistance,
      state: distance,
      kullanılan: calculatedDistance,
      yöntem: googleMapsDistance ? 'GoogleMaps' : (distance > 0 ? 'State' : 'Haversine')
    });
    
    setDistance(calculatedDistance);

    // Hangi bölgede olduğunu tespit et
    const pickupArea = findServiceArea(pickupAddress);
    const deliveryArea = findServiceArea(deliveryAddress);

    // En az bir adres hizmet bölgesi dışındaysa
    if (!pickupArea || !deliveryArea) {
      toast.error('Seçilen adreslerden en az biri hizmet bölgesi dışında!');
      setEstimatedPrice(0);
      return;
    }

    // Fiyatlandırma için kullanılacak bölgeyi seç (daha pahalı olanı kullan)
    const selectedArea = pickupArea.basePrice > deliveryArea.basePrice ? pickupArea : deliveryArea;

    // Mesafe limiti kontrolü
    if (selectedArea.maxDistance && calculatedDistance > selectedArea.maxDistance) {
      toast.error(`Bu bölge için maksimum mesafe ${selectedArea.maxDistance} km'dir`);
      setEstimatedPrice(0);
      return;
    }

    // Temel fiyat hesaplama
    let price = selectedArea.basePrice + (calculatedDistance * selectedArea.pricePerKm);

    // Paket boyutu katsayısı
    const sizeMultipliers: Record<string, number> = {
      SMALL: 1,
      MEDIUM: 1.2,
      LARGE: 1.5,
      EXTRA_LARGE: 2,
    };
    price *= sizeMultipliers[packageSize];

    // Teslimat tipi
    if (deliveryType === 'EXPRESS') {
      price *= 1.5;
    }

    // Aciliyet
    const urgencyMultipliers: Record<string, number> = {
      NORMAL: 1,
      URGENT: 1.3,
      VERY_URGENT: 1.6,
    };
    price *= urgencyMultipliers[urgency];

    setEstimatedPrice(Math.round(price * 100) / 100);
    
    // Google Maps'ten gelen süreyi kullan, yoksa tahmin et
    if (googleMapsDuration) {
      setEstimatedTime(googleMapsDuration);
    } else if (duration > 0) {
      setEstimatedTime(duration);
    } else {
      // Fallback: Mesafeye göre tahmin et (ortalama 20 km/h hız varsayımı)
      setEstimatedTime(Math.ceil(calculatedDistance * 3));
    }
  };

  const onSubmit = async (data: OrderFormData) => {
    if (!pickupAddress || !deliveryAddress) {
      toast.error('Lütfen alım ve teslimat adreslerini seçin');
      return;
    }

    try {
      setLoading(true);
      
      // scheduledPickupTime'ı ISO formatına çevir ve varsayılan değerleri ekle
      const orderData: CreateOrderDto = {
        ...data,
        pickupAddress,
        deliveryAddress,
        distance, // Google Maps'ten gelen mesafe
        estimatedTime: duration || estimatedTime, // Google Maps'ten gelen süre
        deliveryType: data.deliveryType || 'STANDARD',
        urgency: data.urgency || 'NORMAL',
        scheduledPickupTime: data.scheduledPickupTime 
          ? new Date(data.scheduledPickupTime).toISOString() 
          : undefined,
      };
      
      console.log('Sipariş oluşturuluyor:', {
        mesafe: distance,
        süre: duration || estimatedTime,
        googleMapsSüresi: duration,
        hesaplanmışSüre: estimatedTime
      });

      const response = await orderService.createOrder(orderData);
      
      toast.success('Sipariş başarıyla oluşturuldu!');
      router.push(`/company/orders/${response.id}`);
    } catch (error) {
      console.error('Sipariş oluşturulamadı:', error);
      toast.error('Sipariş oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      {/* Başlık */}
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/company')}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Kurye Çağır</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Hızlı ve güvenli teslimat için kurye çağırın
          </p>
        </div>
      </div>

      {/* Adım Göstergesi */}
      <div className="flex items-center justify-between mb-8">
        <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 1 ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>
            1
          </div>
          <span className="font-medium">Adres Bilgileri</span>
        </div>
        <div className="flex-1 h-1 bg-gray-200 mx-4">
          <div className={`h-full bg-primary transition-all ${
            step >= 2 ? 'w-full' : 'w-0'
          }`} />
        </div>
        <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            step >= 2 ? 'bg-primary text-white' : 'bg-gray-200'
          }`}>
            2
          </div>
          <span className="font-medium">Gönderi Bilgileri</span>
        </div>
      </div>

      {/* Form Adımları */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Hizmet Bölgeleri Bilgisi */}
          <Card className="border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="w-5 h-5 text-blue-500" />
                Hizmet Bölgelerimiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              {serviceAreas.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {serviceAreas.map((area) => (
                      <div key={area.id} className="p-3 bg-white dark:bg-gray-800 rounded-lg border hover:border-primary transition-colors">
                        <div className="font-medium text-sm">{area.name || area.district}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          ₺{area.basePrice} + ₺{area.pricePerKm}/km
                        </div>
                        {area.maxDistance && (
                          <div className="text-xs text-muted-foreground">
                            Max: {area.maxDistance}km
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    ⚠️ Sadece yukarıdaki bölgelerde hizmet verilmektedir. Alım ve teslimat noktaları bu bölgeler içinde olmalıdır.
                  </p>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Hizmet bölgeleri yükleniyor...</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Adres Seçimi</CardTitle>
              <CardDescription>
                Harita üzerinden alım ve teslimat noktalarını belirleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Firma adresi checkbox */}
              {(user?.company?.address?.detail || user?.company?.address) && (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Checkbox
                    id="useCompanyAddress"
                    checked={useCompanyAddress}
                    onCheckedChange={(checked) => {
                      setUseCompanyAddress(checked as boolean);
                      if (checked && companyAddressCoords) {
                        // Geocode edilmiş firma adresini kullan
                        setPickupAddress(companyAddressCoords);
                      } else {
                        setPickupAddress(undefined);
                      }
                    }}
                  />
                  <Label htmlFor="useCompanyAddress" className="cursor-pointer flex-1">
                    <div>
                      <div className="font-medium">Firma adresimi kullan</div>
                      <div className="text-sm text-muted-foreground">
                        {user.company.name} - {user.company.address?.detail || user.company.address}
                      </div>
                    </div>
                  </Label>
                </div>
              )}
              
              <GoogleMap
                onPickupSelect={(address) => {
                  setPickupAddress(address);
                  setUseCompanyAddress(false);
                }}
                onDeliverySelect={setDeliveryAddress}
                onDistanceChange={(newDistance, newDuration) => {
                  console.log('Google Maps mesafe güncellendi:', {
                    yeniMesafe: newDistance,
                    yeniSüre: newDuration
                  });
                  setDistance(newDistance);
                  setDuration(newDuration); // Google Maps'ten gelen süreyi kaydet
                  // Google Maps'ten gelen gerçek mesafe ve süre ile fiyat hesapla
                  if (pickupAddress && deliveryAddress) {
                    calculatePrice(newDistance, newDuration);
                  }
                }}
                pickupAddress={pickupAddress}
                deliveryAddress={deliveryAddress}
                serviceAreas={serviceAreas}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                if (!pickupAddress || !deliveryAddress) {
                  toast.error('Lütfen alım ve teslimat adreslerini seçin');
                  return;
                }
                calculatePrice();
                setStep(2);
              }}
              size="lg"
            >
              Devam Et
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sol Kolon */}
            <div className="space-y-6">
              {/* Alıcı Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Alıcı Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipientName">Alıcı Adı Soyadı</Label>
                    <Input
                      id="recipientName"
                      {...register('recipientName')}
                      placeholder="Örn: Ahmet Yılmaz"
                    />
                    {errors.recipientName && (
                      <p className="text-sm text-red-500 mt-1">{errors.recipientName.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="recipientPhone">Alıcı Telefonu</Label>
                    <Input
                      id="recipientPhone"
                      {...register('recipientPhone')}
                      placeholder="05XX XXX XX XX"
                    />
                    {errors.recipientPhone && (
                      <p className="text-sm text-red-500 mt-1">{errors.recipientPhone.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Paket Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Gönderi Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Gönderi Tipi</Label>
                    <RadioGroup
                      value={packageType}
                      onValueChange={(value) => setValue('packageType', value as any)}
                      className="grid grid-cols-2 gap-4 mt-2"
                    >
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="DOCUMENT" id="document" />
                        <Label htmlFor="document" className="cursor-pointer">
                          <FileText className="w-4 h-4 inline mr-2" />
                          Evrak
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="PACKAGE" id="package" />
                        <Label htmlFor="package" className="cursor-pointer">
                          <Package className="w-4 h-4 inline mr-2" />
                          Paket
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="FOOD" id="food" />
                        <Label htmlFor="food" className="cursor-pointer">
                          🍔 Yemek
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border rounded-lg p-3">
                        <RadioGroupItem value="OTHER" id="other" />
                        <Label htmlFor="other" className="cursor-pointer">
                          📦 Diğer
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Paket Boyutu</Label>
                    <Select
                      value={packageSize}
                      onValueChange={(value) => setValue('packageSize', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMALL">Küçük (Zarf, A4)</SelectItem>
                        <SelectItem value="MEDIUM">Orta (Ayakkabı kutusu)</SelectItem>
                        <SelectItem value="LARGE">Büyük (Koli)</SelectItem>
                        <SelectItem value="EXTRA_LARGE">Çok Büyük</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
                    <Textarea
                      id="notes"
                      {...register('notes')}
                      placeholder="Örn: Kırılacak ürün, dikkatli taşıyın..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sağ Kolon */}
            <div className="space-y-6">
              {/* Teslimat Seçenekleri */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Teslimat Seçenekleri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Teslimat Tipi</Label>
                    <RadioGroup
                      value={deliveryType}
                      onValueChange={(value) => setValue('deliveryType', value as any)}
                      className="mt-2 space-y-2"
                    >
                      <div className="flex items-center justify-between border rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="STANDARD" id="standard" />
                          <Label htmlFor="standard" className="cursor-pointer">
                            Standart Teslimat (45-60 dk)
                          </Label>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="EXPRESS" id="express" />
                          <Label htmlFor="express" className="cursor-pointer">
                            <Zap className="w-4 h-4 inline mr-1 text-yellow-500" />
                            Express Teslimat (20-30 dk)
                          </Label>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">+%50</Badge>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label>Aciliyet Durumu</Label>
                    <Select
                      value={urgency}
                      onValueChange={(value) => setValue('urgency', value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NORMAL">Normal</SelectItem>
                        <SelectItem value="URGENT">Acil</SelectItem>
                        <SelectItem value="VERY_URGENT">Çok Acil</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="scheduledPickupTime">
                      İleri Tarih/Saat (Opsiyonel)
                    </Label>
                    <Input
                      id="scheduledPickupTime"
                      type="datetime-local"
                      {...register('scheduledPickupTime')}
                      min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Hemen göndermek için boş bırakın
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Fiyat Özeti */}
              <Card>
                <CardHeader>
                  <CardTitle>Sipariş Özeti</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Alım Noktası:</span>
                      <span className="text-right max-w-[200px] truncate">
                        {pickupAddress?.address || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Teslimat Noktası:</span>
                      <span className="text-right max-w-[200px] truncate">
                        {deliveryAddress?.address || '-'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Tahmini Süre:</span>
                      <span>{estimatedTime} dakika</span>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Tahmini Tutar:</span>
                        <span className="text-2xl font-bold text-primary">
                          ₺{estimatedPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    * Fiyat, mesafe ve seçilen hizmet türüne göre hesaplanmıştır.
                    Kesin fiyat kurye tarafından belirlenecektir.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Butonlar */}
          <div className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              disabled={loading}
            >
              Geri
            </Button>
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? 'Oluşturuluyor...' : 'Sipariş Oluştur'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
