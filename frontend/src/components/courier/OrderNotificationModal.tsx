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
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
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
  MapPinned,
  Banknote,
  Timer,
  Truck,
  CheckCircle2,
  XCircle,
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
      <DialogContent className="sm:max-w-2xl w-[95vw] sm:w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Accessibility için gizli DialogTitle */}
        <VisuallyHidden>
          <DialogTitle>Yeni Sipariş Bildirimi</DialogTitle>
        </VisuallyHidden>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 text-white">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-white/20 rounded-full animate-pulse">
                  <Truck className="h-5 w-5" />
                </div>
                <h2 className="text-lg sm:text-xl font-bold">Yeni Sipariş!</h2>
              </div>
              <p className="text-sm sm:text-base text-white/90">
                Hemen kabul edip teslimat yapabilirsiniz
              </p>
            </div>
            <Badge className="bg-white/20 text-white border-white/30 animate-pulse shrink-0">
              YENİ
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Kazanç ve Firma Bilgileri - Mobilde üstte */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">Kazancınız</span>
              </div>
              <div className="text-right">
                <p className="text-2xl sm:text-3xl font-bold text-green-600">
                  ₺{orderData.courierEarning?.toFixed ? orderData.courierEarning.toFixed(2) : (orderData.price || 0)}
                </p>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium">{orderData.company?.name || 'Firma'}</p>
                  <p className="text-xs text-muted-foreground">#{orderData.orderNumber}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-xs">
                ₺{(orderData.totalPrice ?? orderData.price)?.toFixed ? (orderData.totalPrice ?? orderData.price).toFixed(2) : (orderData.totalPrice ?? orderData.price)}
              </Badge>
            </div>
          </div>

          {/* Paket Detayları - Mobilde responsive */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={getSizeBadgeVariant(orderData.packageSize)} className="flex-1 sm:flex-initial justify-center py-1.5">
              <Package className="mr-1 h-3 w-3" />
              {orderData.packageSize === 'SMALL' && 'Küçük'}
              {orderData.packageSize === 'MEDIUM' && 'Orta'}
              {orderData.packageSize === 'LARGE' && 'Büyük'}
              {orderData.packageSize === 'EXTRA_LARGE' && 'Çok Büyük'}
            </Badge>
            <Badge variant={getUrgencyBadgeVariant(orderData.urgency)} className="flex-1 sm:flex-initial justify-center py-1.5">
              <TrendingUp className="mr-1 h-3 w-3" />
              {orderData.urgency === 'NORMAL' && 'Normal'}
              {orderData.urgency === 'URGENT' && 'Acil'}
              {orderData.urgency === 'VERY_URGENT' && 'Çok Acil'}
            </Badge>
            <Badge variant={getDeliveryTypeBadgeVariant(orderData.deliveryType)} className="flex-1 sm:flex-initial justify-center py-1.5">
              <Clock className="mr-1 h-3 w-3" />
              {orderData.deliveryType === 'EXPRESS' ? 'Express' : 'Standart'}
            </Badge>
          </div>


          {/* Adresler - Mobilde daha kompakt */}
          <div className="space-y-3">
            {/* Alım Adresi */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-full shrink-0">
                  <MapPinned className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-blue-900 mb-1">ALIM ADRESİ</p>
                  <p className="text-sm text-gray-700 break-words">{orderData.pickupAddress?.address || 'Adres bilgisi yok'}</p>
                  {orderData.company?.phone && (
                    <a href={`tel:${orderData.company.phone}`} className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-700">
                      <Phone className="h-3 w-3" />
                      <span>{orderData.company.phone}</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Teslimat Adresi */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-full shrink-0">
                  <Navigation className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-green-900 mb-1">TESLİMAT ADRESİ</p>
                  <p className="text-sm text-gray-700 break-words">{orderData.deliveryAddress?.address || 'Adres bilgisi yok'}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <User className="h-3 w-3" />
                      <span>{orderData.recipientName}</span>
                    </div>
                    <a href={`tel:${orderData.recipientPhone}`} className="inline-flex items-center gap-1 text-xs text-green-600 hover:text-green-700">
                      <Phone className="h-3 w-3" />
                      <span>{orderData.recipientPhone}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mesafe ve Süre - Mobilde yan yana */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <Truck className="h-4 w-4" />
                <span className="text-xs">Mesafe</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{orderData.distance || 0} km</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                <Timer className="h-4 w-4" />
                <span className="text-xs">Tahmini Süre</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{orderData.estimatedTime || 0} dk</p>
            </div>
          </div>

          {/* Notlar - Mobilde daha belirgin */}
          {orderData.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-amber-800 mb-1">NOT</p>
                  <p className="text-sm text-amber-700 break-words">{orderData.notes}</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer - Mobilde sticky ve daha büyük butonlar */}
        <div className="border-t bg-gray-50 p-4 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <p>Siparişi kabul ederek teslimat sorumluluğunu alıyorsunuz.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleReject}
              disabled={loading}
              className="flex-1 h-12 sm:h-10 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reddet
            </Button>
            <Button
              onClick={handleAccept}
              disabled={loading}
              className="flex-1 h-12 sm:h-10 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              <span className="font-semibold">Kabul Et • ₺{orderData.courierEarning?.toFixed ? orderData.courierEarning.toFixed(2) : (orderData.price || 0)}</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
