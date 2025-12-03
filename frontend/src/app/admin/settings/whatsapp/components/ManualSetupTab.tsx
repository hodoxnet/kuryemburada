'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Wrench,
  Save,
  ExternalLink,
  Info,
  Copy,
  Check,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';
import whatsappAPI, { WhatsAppConfig } from '@/lib/api/whatsapp';

interface ManualSetupTabProps {
  onSuccess: () => void;
  existingConfig: WhatsAppConfig | null;
}

export function ManualSetupTab({ onSuccess, existingConfig }: ManualSetupTabProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const [formData, setFormData] = useState({
    phoneNumberId: existingConfig?.phoneNumberId || '',
    businessAccountId: existingConfig?.businessAccountId || '',
    accessToken: '',
    webhookVerifyToken: '',
  });

  const webhookUrl = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/whatsapp/webhook`
    : 'https://api.kuryemburada.com/whatsapp/webhook';

  const handleCopyWebhook = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success('Webhook URL kopyalandı');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.phoneNumberId || !formData.businessAccountId || !formData.accessToken) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    setLoading(true);

    try {
      await whatsappAPI.manualSetup({
        phoneNumberId: formData.phoneNumberId,
        businessAccountId: formData.businessAccountId,
        accessToken: formData.accessToken,
        webhookVerifyToken: formData.webhookVerifyToken || undefined,
      });

      toast.success('WhatsApp bağlantısı başarıyla kuruldu!');
      onSuccess();
    } catch (error: any) {
      console.error('Manuel kurulum hatası:', error);
      toast.error(error.response?.data?.message || 'Bağlantı kurulamadı');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          Manuel Kurulum
        </CardTitle>
        <CardDescription>
          Meta Developer Portal'dan aldığınız API bilgilerini girerek bağlantı kurun
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Webhook URL */}
          <div className="bg-muted/50 rounded-lg p-4">
            <Label className="text-sm font-medium">Webhook URL</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Bu URL'i Meta Developer Portal'da Webhook URL olarak ayarlayın
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm bg-background px-3 py-2 rounded border overflow-x-auto">
                {webhookUrl}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyWebhook}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phoneNumberId">
                Phone Number ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumberId"
                placeholder="123456789012345"
                value={formData.phoneNumberId}
                onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Meta Developer Portal &gt; WhatsApp &gt; API Setup &gt; Phone number ID
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="businessAccountId">
                Business Account ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="businessAccountId"
                placeholder="123456789012345"
                value={formData.businessAccountId}
                onChange={(e) => setFormData({ ...formData, businessAccountId: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Meta Developer Portal &gt; WhatsApp &gt; API Setup &gt; WhatsApp Business Account ID
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accessToken">
                Access Token <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="accessToken"
                  type={showToken ? 'text' : 'password'}
                  placeholder="EAAxxxxxxx..."
                  value={formData.accessToken}
                  onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Permanent access token (System User token önerilir)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="webhookVerifyToken">Webhook Verify Token (Opsiyonel)</Label>
              <Input
                id="webhookVerifyToken"
                placeholder="rastgele-bir-token"
                value={formData.webhookVerifyToken}
                onChange={(e) => setFormData({ ...formData, webhookVerifyToken: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Boş bırakırsanız otomatik oluşturulur. Meta'da aynı token'ı kullanın.
              </p>
            </div>
          </div>

          {/* Bilgi Notu */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Kurulum Adımları:</strong>
              <ol className="list-decimal ml-4 mt-2 space-y-1 text-sm">
                <li>
                  <a
                    href="https://developers.facebook.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Meta Developer Portal
                  </a>
                  'a gidin
                </li>
                <li>WhatsApp ürününü uygulamanıza ekleyin</li>
                <li>API Setup sayfasından Phone Number ID ve Business Account ID alın</li>
                <li>Permanent access token oluşturun</li>
                <li>Webhook URL olarak yukarıdaki adresi girin</li>
                <li>Webhook fields: messages, messaging_postbacks seçin</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                window.open(
                  'https://developers.facebook.com/docs/whatsapp/cloud-api/get-started',
                  '_blank'
                )
              }
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Dokümantasyon
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Kaydet ve Bağlan
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
