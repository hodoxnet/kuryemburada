'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { orderService } from '@/lib/api/order.service';
import { toast } from 'sonner';
import {
  MapPin,
  Navigation,
  Package,
  Clock,
  DollarSign,
  Phone,
  User,
  AlertCircle,
  Building,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import { tr } from 'date-fns/locale';

interface OrderNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: any;
  onAccept?: () => void;
  onReject?: () => void;
}

export function OrderNotificationModal({
  isOpen,
  onClose,
  orderData,
  onAccept,
  onReject,
}: OrderNotificationModalProps) {
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Bildirim sesini sürekli çal
  useEffect(() => {
    if (!isOpen) {
      // Modal kapandığında sesi durdur
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
        soundIntervalRef.current = null;
      }
      return;
    }

    // Modal açıldığında sesi başlat
    const playNotificationSound = () => {
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio('/notification-sound.mp3');
          audioRef.current.volume = 0.5;
        }
        audioRef.current.play().catch((error) => {
          console.log('Ses çalma hatası:', error);
        });
      } catch (error) {
        console.log('Ses oluşturma hatası:', error);
      }
    };

    // Hemen bir kez çal
    playNotificationSound();

    // Her 2 saniyede bir tekrar çal
    soundIntervalRef.current = setInterval(() => {
      playNotificationSound();
    }, 2000);

    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
        soundIntervalRef.current = null;
      }
    };
  }, [isOpen]);

  const handleAccept = async () => {
    try {
      setLoading(true);
      
      // Sesi durdur
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current);
        soundIntervalRef.current = null;
      }
      
      await orderService.acceptOrder(orderData.id);
      toast.success('Sipariş başarıyla kabul edildi!');
      
      if (onAccept) {
        onAccept();
      }
      
      onClose();
      
      // Sipariş detay sayfasına yönlendir
      setTimeout(() => {
        window.location.href = `/courier/orders/${orderData.id}`;
      }, 1000);
    } catch (error: any) {
      console.error('Sipariş kabul hatası:', error);
      toast.error(error.response?.data?.message || 'Sipariş kabul edilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = useCallback(() => {
    // Sesi durdur
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
    
    if (onReject) {
      onReject();
    }
    onClose();
  }, [onReject, onClose]);

  if (!orderData) return null;

  // Paket boyutu badge rengi
  const getSizeBadgeVariant = (size: string) => {
    switch (size) {
      case 'SMALL': return 'secondary';
      case 'MEDIUM': return 'default';
      case 'LARGE': return 'outline';
      case 'EXTRA_LARGE': return 'destructive';
      default: return 'default';
    }
  };

  // Aciliyet badge rengi
  const getUrgencyBadgeVariant = (urgency: string) => {
    switch (urgency) {
      case 'NORMAL': return 'secondary';
      case 'URGENT': return 'outline';
      case 'VERY_URGENT': return 'destructive';
      default: return 'secondary';
    }
  };

  // Teslimat tipi badge rengi
  const getDeliveryTypeBadgeVariant = (type: string) => {
    return type === 'EXPRESS' ? 'destructive' : 'default';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl">Yeni Sipariş Bildirimi!</DialogTitle>
            <Badge variant="destructive" className="animate-pulse">
              Yeni Sipariş
            </Badge>
          </div>
          <DialogDescription>
            Yeni bir sipariş mevcut. Detayları inceleyip kabul edebilir veya reddedebilirsiniz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Firma Bilgileri */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{orderData.company?.name || 'Firma'}</p>
                    <p className="text-sm text-muted-foreground">
                      Sipariş No: {orderData.orderNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">
                    ₺{orderData.courierEarning || orderData.price}
                  </p>
                  <p className="text-xs text-muted-foreground">Kazanç</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Paket Detayları */}
          <div className="grid grid-cols-3 gap-2">
            <Badge variant={getSizeBadgeVariant(orderData.packageSize)}>
              <Package className="mr-1 h-3 w-3" />
              {orderData.packageSize === 'SMALL' && 'Küçük'}
              {orderData.packageSize === 'MEDIUM' && 'Orta'}
              {orderData.packageSize === 'LARGE' && 'Büyük'}
              {orderData.packageSize === 'EXTRA_LARGE' && 'Çok Büyük'}
            </Badge>
            <Badge variant={getUrgencyBadgeVariant(orderData.urgency)}>
              <TrendingUp className="mr-1 h-3 w-3" />
              {orderData.urgency === 'NORMAL' && 'Normal'}
              {orderData.urgency === 'URGENT' && 'Acil'}
              {orderData.urgency === 'VERY_URGENT' && 'Çok Acil'}
            </Badge>
            <Badge variant={getDeliveryTypeBadgeVariant(orderData.deliveryType)}>
              <Clock className="mr-1 h-3 w-3" />
              {orderData.deliveryType === 'EXPRESS' ? 'Express' : 'Standart'}
            </Badge>
          </div>

          <Separator />

          {/* Alım Adresi */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-100 rounded">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium text-sm">Alım Adresi</span>
            </div>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-sm">{orderData.pickupAddress?.address || 'Adres bilgisi yok'}</p>
                {orderData.company?.phone && (
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{orderData.company.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Teslimat Adresi */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-green-100 rounded">
                <Navigation className="h-4 w-4 text-green-600" />
              </div>
              <span className="font-medium text-sm">Teslimat Adresi</span>
            </div>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-sm">{orderData.deliveryAddress?.address || 'Adres bilgisi yok'}</p>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{orderData.recipientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{orderData.recipientPhone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mesafe ve Süre Bilgileri */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Mesafe</span>
                  </div>
                  <span className="font-semibold">{orderData.distance || 0} km</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Tahmini Süre</span>
                  </div>
                  <span className="font-semibold">{orderData.estimatedTime || 0} dk</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Notlar */}
          {orderData.notes && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Not</p>
                    <p className="text-sm text-yellow-700">{orderData.notes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uyarı */}
          <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <p className="text-sm text-orange-800">
              Lütfen siparişi <strong>kabul edin</strong> veya <strong>reddedin</strong>.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={loading}
          >
            Reddet
          </Button>
          <Button
            onClick={handleAccept}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Siparişi Kabul Et (₺{orderData.courierEarning || orderData.price})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}