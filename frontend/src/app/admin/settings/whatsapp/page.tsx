'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  MessageSquare,
  Settings,
  BarChart3,
  Zap,
  Wrench,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import whatsappAPI, { WhatsAppConfig } from '@/lib/api/whatsapp';
import { QuickSetupTab } from './components/QuickSetupTab';
import { ManualSetupTab } from './components/ManualSetupTab';
import { SettingsTab } from './components/SettingsTab';
import { StatisticsTab } from './components/StatisticsTab';
import { FacebookSDK } from '@/components/FacebookSDK';

export default function WhatsAppSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [testing, setTesting] = useState(false);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const data = await whatsappAPI.getConfig();
      setConfig(data);
    } catch (error) {
      console.error('WhatsApp config yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleTestConnection = async () => {
    try {
      setTesting(true);
      const result = await whatsappAPI.testConnection();

      if (result.success) {
        toast.success(`Bağlantı başarılı! ${result.businessName || ''}`);
        await fetchConfig();
      } else {
        toast.error(result.message || 'Bağlantı başarısız');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bağlantı test edilemedi');
    } finally {
      setTesting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('WhatsApp bağlantısını kesmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await whatsappAPI.disconnect();
      toast.success('Bağlantı kesildi');
      setConfig(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bağlantı kesilemedi');
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
    <>
      <FacebookSDK />
      <div className="container mx-auto py-6 space-y-6 max-w-5xl">
        {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-green-600" />
            WhatsApp Entegrasyonu
          </h1>
          <p className="text-muted-foreground">
            WhatsApp Business API bağlantısını yönetin
          </p>
        </div>
      </div>

      {/* Bağlantı Durumu Kartı */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Bağlantı Durumu</CardTitle>
            {config ? (
              <Badge variant={config.isVerified ? 'default' : 'secondary'} className={config.isVerified ? 'bg-green-600' : ''}>
                {config.isVerified ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Bağlı
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Doğrulanmadı
                  </>
                )}
              </Badge>
            ) : (
              <Badge variant="outline">
                <XCircle className="h-3 w-3 mr-1" />
                Bağlı Değil
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {config ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Phone Number ID</p>
                  <p className="font-medium font-mono">{config.phoneNumberId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Business Account ID</p>
                  <p className="font-medium font-mono">{config.businessAccountId}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bağlantı Yöntemi</p>
                  <p className="font-medium">
                    {config.connectionMethod === 'EMBEDDED_SIGNUP' ? 'Hızlı Kurulum' : 'Manuel Kurulum'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Son Test</p>
                  <p className="font-medium">
                    {config.lastTestedAt
                      ? new Date(config.lastTestedAt).toLocaleString('tr-TR')
                      : 'Henüz test edilmedi'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <p className="text-muted-foreground">Webhook URL (Bu URL'i Meta'ya kopyalayın)</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{config.webhookUrl}</code>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConnection}
                    disabled={testing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${testing ? 'animate-spin' : ''}`} />
                    Test Et
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDisconnect}
                  >
                    Bağlantıyı Kes
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                WhatsApp Business hesabınız henüz bağlı değil.
              </p>
              <p className="text-sm text-muted-foreground">
                Aşağıdaki seçeneklerden birini kullanarak bağlantı kurabilirsiniz.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue={config ? 'settings' : 'quick-setup'} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick-setup" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span className="hidden sm:inline">Hızlı Kurulum</span>
          </TabsTrigger>
          <TabsTrigger value="manual-setup" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Manuel Kurulum</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2" disabled={!config}>
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Ayarlar</span>
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2" disabled={!config}>
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">İstatistikler</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick-setup">
          <QuickSetupTab onSuccess={fetchConfig} />
        </TabsContent>

        <TabsContent value="manual-setup">
          <ManualSetupTab onSuccess={fetchConfig} existingConfig={config} />
        </TabsContent>

        <TabsContent value="settings">
          {config && <SettingsTab config={config} onUpdate={fetchConfig} />}
        </TabsContent>

        <TabsContent value="statistics">
          {config && <StatisticsTab />}
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}
