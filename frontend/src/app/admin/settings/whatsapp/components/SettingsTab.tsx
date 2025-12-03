'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Save,
  Bell,
  MessageSquare,
  Loader2,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import whatsappAPI, { WhatsAppConfig } from '@/lib/api/whatsapp';

interface SettingsTabProps {
  config: WhatsAppConfig;
  onUpdate: () => void;
}

export function SettingsTab({ config, onUpdate }: SettingsTabProps) {
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  const [formData, setFormData] = useState({
    welcomeMessage: config.welcomeMessage,
    offHoursMessage: config.offHoursMessage || '',
    notifyOnOrderApproval: config.notifyOnOrderApproval,
    notifyOnCourierAssign: config.notifyOnCourierAssign,
    notifyOnDelivery: config.notifyOnDelivery,
    isActive: config.isActive,
  });

  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Merhaba! Bu bir test mesajıdır.');

  const handleSave = async () => {
    setLoading(true);

    try {
      await whatsappAPI.updateSettings({
        welcomeMessage: formData.welcomeMessage,
        offHoursMessage: formData.offHoursMessage || undefined,
        notifyOnOrderApproval: formData.notifyOnOrderApproval,
        notifyOnCourierAssign: formData.notifyOnCourierAssign,
        notifyOnDelivery: formData.notifyOnDelivery,
        isActive: formData.isActive,
      });

      toast.success('Ayarlar kaydedildi');
      onUpdate();
    } catch (error: any) {
      console.error('Ayarlar kaydetme hatası:', error);
      toast.error(error.response?.data?.message || 'Ayarlar kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testPhone) {
      toast.error('Lütfen telefon numarası girin');
      return;
    }

    setTestLoading(true);

    try {
      await whatsappAPI.sendTestMessage(testPhone, testMessage);
      toast.success('Test mesajı gönderildi');
    } catch (error: any) {
      console.error('Test mesajı hatası:', error);
      toast.error(error.response?.data?.message || 'Test mesajı gönderilemedi');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mesaj Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Mesaj Ayarları
          </CardTitle>
          <CardDescription>
            WhatsApp bot mesajlarını özelleştirin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="welcomeMessage">Hoş Geldin Mesajı</Label>
            <Textarea
              id="welcomeMessage"
              placeholder="Hoş geldiniz! Size nasıl yardımcı olabilirim?"
              value={formData.welcomeMessage}
              onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Yeni bir müşteri mesaj attığında gösterilecek karşılama mesajı
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="offHoursMessage">Mesai Dışı Mesajı (Opsiyonel)</Label>
            <Textarea
              id="offHoursMessage"
              placeholder="Şu an mesai saatleri dışındayız. En kısa sürede size dönüş yapacağız."
              value={formData.offHoursMessage}
              onChange={(e) => setFormData({ ...formData, offHoursMessage: e.target.value })}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Mesai saatleri dışında gelen mesajlara otomatik yanıt (boş bırakırsanız devre dışı)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Bildirim Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bildirim Ayarları
          </CardTitle>
          <CardDescription>
            Müşterilere gönderilecek otomatik bildirimleri yapılandırın
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sipariş Onay Bildirimi</Label>
              <p className="text-xs text-muted-foreground">
                Firma siparişi onayladığında müşteriye bildirim gönder
              </p>
            </div>
            <Switch
              checked={formData.notifyOnOrderApproval}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, notifyOnOrderApproval: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Kurye Atama Bildirimi</Label>
              <p className="text-xs text-muted-foreground">
                Kurye atandığında müşteriye kurye bilgilerini gönder
              </p>
            </div>
            <Switch
              checked={formData.notifyOnCourierAssign}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, notifyOnCourierAssign: checked })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Teslimat Bildirimi</Label>
              <p className="text-xs text-muted-foreground">
                Sipariş teslim edildiğinde müşteriye bildirim gönder
              </p>
            </div>
            <Switch
              checked={formData.notifyOnDelivery}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, notifyOnDelivery: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Sistem Ayarları */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Sistem Ayarları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>WhatsApp Aktif</Label>
              <p className="text-xs text-muted-foreground">
                WhatsApp üzerinden sipariş almayı aktif/pasif yap
              </p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Test Mesajı */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Test Mesajı Gönder
          </CardTitle>
          <CardDescription>
            WhatsApp bağlantısını test etmek için mesaj gönderin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="testPhone">Telefon Numarası</Label>
              <Input
                id="testPhone"
                placeholder="+905xxxxxxxxx"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                E.164 formatında (ülke koduyla birlikte)
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="testMsg">Mesaj</Label>
              <Input
                id="testMsg"
                placeholder="Test mesajı"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleSendTestMessage}
            disabled={testLoading}
          >
            {testLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Test Mesajı Gönder
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Kaydet Butonu */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Ayarları Kaydet
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
