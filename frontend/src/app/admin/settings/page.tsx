'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  DollarSign,
  Package,
  Save,
  AlertCircle,
  Info,
  MessageSquare,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import settingsAPI from '@/lib/api/settings';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [commissionRate, setCommissionRate] = useState<number>(0.15);
  const [cancellationTime, setCancellationTime] = useState<number>(5);
  const [hasChanges, setHasChanges] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      
      // Komisyon oranını getir
      try {
        const commissionSettings = await settingsAPI.getByCategory('commission');
        if (commissionSettings.rate !== undefined) {
          setCommissionRate(commissionSettings.rate);
        }
      } catch (error) {
        console.log('Komisyon ayarı bulunamadı, varsayılan değer kullanılacak');
      }
      
      // İptal süresini getir
      try {
        const orderSettings = await settingsAPI.getByCategory('order');
        if (orderSettings.maxCancellationTime !== undefined) {
          setCancellationTime(orderSettings.maxCancellationTime);
        }
      } catch (error) {
        console.log('İptal süresi ayarı bulunamadı, varsayılan değer kullanılacak');
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
      toast.error('Ayarlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleCommissionChange = (value: number) => {
    setCommissionRate(value);
    setHasChanges(true);
  };

  const handleCancellationTimeChange = (value: number) => {
    setCancellationTime(value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Komisyon oranını kaydet
      await settingsAPI.updateByCategory('commission', { rate: commissionRate });
      
      // İptal süresini kaydet
      await settingsAPI.updateByCategory('order', { maxCancellationTime: cancellationTime });
      
      toast.success('Ayarlar başarıyla kaydedildi');
      setHasChanges(false);
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      toast.error('Ayarlar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      setSaving(true);
      await settingsAPI.initializeDefaults();
      toast.success('Varsayılan ayarlar oluşturuldu');
      await fetchSettings();
      setHasChanges(false);
    } catch (error) {
      console.error('Varsayılan ayarlar oluşturulurken hata:', error);
      toast.error('Varsayılan ayarlar oluşturulamadı');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sistem Ayarları</h1>
          <p className="text-muted-foreground">
            Platform genelindeki temel ayarları yönetin
          </p>
        </div>
      </div>

      {/* Entegrasyonlar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Entegrasyonlar
          </CardTitle>
          <CardDescription>
            Harici servis entegrasyonlarını yönetin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/admin/settings/whatsapp">
            <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">WhatsApp Business</h4>
                  <p className="text-sm text-muted-foreground">
                    WhatsApp üzerinden sipariş alma entegrasyonu
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>
        </CardContent>
      </Card>

      {/* Komisyon Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Komisyon Ayarları
          </CardTitle>
          <CardDescription>
            Platform komisyon oranını ayarlayın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="commissionRate">Komisyon Oranı (%)</Label>
              <Input
                id="commissionRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={(commissionRate * 100).toFixed(2)}
                onChange={(e) => handleCommissionChange(parseFloat(e.target.value) / 100)}
              />
              <p className="text-xs text-muted-foreground">
                Siparişlerden alınan platform komisyon oranı. Örn: 15 = %15
              </p>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Komisyon değişiklikleri yeni siparişlere uygulanacaktır. Mevcut siparişler etkilenmez.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Sipariş Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Sipariş Ayarları
          </CardTitle>
          <CardDescription>
            Sipariş işlem kurallarını belirleyin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="cancellationTime">İptal Süresi (dakika)</Label>
              <Input
                id="cancellationTime"
                type="number"
                min="1"
                max="60"
                value={cancellationTime}
                onChange={(e) => handleCancellationTimeChange(parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                Sipariş oluşturulduktan sonra iptal edilebilir maksimum süre
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kaydet Butonu */}
      <div className="flex items-center justify-between p-6 bg-muted/50 rounded-lg">
        <div className="text-sm text-muted-foreground">
          {hasChanges ? (
            <span className="text-orange-600 font-medium">
              Kaydedilmemiş değişiklikler var
            </span>
          ) : (
            <span>Tüm ayarlar güncel</span>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={handleInitializeDefaults}
            disabled={saving}
          >
            Varsayılanları Yükle
          </Button>
          <Button 
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            <Save className="h-4 w-4 mr-2" />
            Kaydet
          </Button>
        </div>
      </div>

      {/* Bilgi Notu */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Not:</strong> Bu sayfada sadece sistemde aktif olarak kullanılan ayarlar gösterilmektedir. 
          İlerleyen güncellemelerde daha fazla ayar eklenecektir.
        </AlertDescription>
      </Alert>
    </div>
  );
}