'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Zap,
  CheckCircle2,
  ExternalLink,
  Info,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import whatsappAPI from '@/lib/api/whatsapp';

interface QuickSetupTabProps {
  onSuccess: () => void;
}

export function QuickSetupTab({ onSuccess }: QuickSetupTabProps) {
  const [loading, setLoading] = useState(false);

  const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID;
  const metaConfigId = process.env.NEXT_PUBLIC_META_CONFIG_ID;

  // Facebook SDK ile Embedded Signup
  const handleEmbeddedSignup = async () => {
    // Meta App ID kontrolü
    if (!metaAppId) {
      toast.error('Meta App ID yapılandırılmamış. Lütfen .env.local dosyasına NEXT_PUBLIC_META_APP_ID ekleyin.');
      return;
    }

    // Facebook SDK kontrolü
    if (typeof window === 'undefined' || !(window as any).FB) {
      toast.error('Facebook SDK yüklenemedi. Lütfen sayfayı yenileyin.');
      return;
    }

    setLoading(true);

    try {
      // Facebook Login with WhatsApp Business permissions
      (window as any).FB.login(
        async (response: any) => {
          if (response.authResponse) {
            const code = response.authResponse.code;

            try {
              // Backend'e code gönder
              await whatsappAPI.oauthCallback({ code });
              toast.success('WhatsApp Business hesabı başarıyla bağlandı!');
              onSuccess();
            } catch (error: any) {
              console.error('OAuth callback hatası:', error);
              toast.error(error.response?.data?.message || 'Bağlantı kurulamadı');
            }
          } else {
            toast.error('Facebook girişi iptal edildi');
          }
          setLoading(false);
        },
        {
          config_id: metaConfigId,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            setup: {
              // WhatsApp Embedded Signup için gerekli parametreler
            },
          },
        }
      );
    } catch (error) {
      console.error('Embedded Signup hatası:', error);
      toast.error('Bağlantı başlatılamadı');
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Hızlı Kurulum (Embedded Signup)
        </CardTitle>
        <CardDescription>
          Meta'nın resmi OAuth akışı ile WhatsApp Business hesabınızı tek tıkla bağlayın
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avantajlar */}
        <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
          <h4 className="font-medium text-green-800 dark:text-green-400 mb-2">Avantajlar</h4>
          <ul className="space-y-2 text-sm text-green-700 dark:text-green-500">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Webhook otomatik yapılandırılır
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Telefon numarası otomatik kaydedilir
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Access token otomatik alınır
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Güvenli ve resmi Meta akışı
            </li>
          </ul>
        </div>

        {/* Meta App ID Uyarısı */}
        {!metaAppId && (
          <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-400">
              <strong>Yapılandırma Gerekli:</strong>
              <p className="mt-1 text-sm">
                Hızlı kurulum için <code className="bg-orange-100 dark:bg-orange-900/30 px-1 rounded">NEXT_PUBLIC_META_APP_ID</code> ve{' '}
                <code className="bg-orange-100 dark:bg-orange-900/30 px-1 rounded">NEXT_PUBLIC_META_CONFIG_ID</code>{' '}
                environment değişkenlerini <code className="bg-orange-100 dark:bg-orange-900/30 px-1 rounded">.env.local</code> dosyasına eklemeniz gerekiyor.
              </p>
              <p className="mt-2 text-sm">
                Alternatif olarak <strong>Manuel Kurulum</strong> sekmesini kullanabilirsiniz.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Gereksinimler */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Gereksinimler:</strong>
            <ul className="list-disc ml-4 mt-2 space-y-1 text-sm">
              <li>Aktif bir Facebook Business hesabı</li>
              <li>WhatsApp Business hesabı veya yeni oluşturma imkanı</li>
              <li>Doğrulanmış bir telefon numarası</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Bağlan Butonu */}
        <div className="flex flex-col items-center gap-4 py-4">
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white px-8"
            onClick={handleEmbeddedSignup}
            disabled={loading || !metaAppId}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Bağlanıyor...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                WhatsApp Business ile Bağlan
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground text-center max-w-md">
            Butona tıkladığınızda Facebook giriş penceresi açılacak ve WhatsApp Business
            hesabınızı seçmeniz istenecektir.
          </p>
        </div>

        {/* Meta Developer Portal Linki */}
        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Daha fazla bilgi için{' '}
            <a
              href="https://developers.facebook.com/docs/whatsapp/embedded-signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Meta Developer dokümantasyonunu
              <ExternalLink className="h-3 w-3" />
            </a>{' '}
            inceleyebilirsiniz.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
