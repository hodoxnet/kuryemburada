"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (user?.role === 'COMPANY') {
      router.push('/company');
    } else if (user?.role === 'COURIER') {
      router.push('/courier/dashboard');
    } else {
      router.push('/auth');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold">Yetkisiz Erişim</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Bu sayfaya erişim yetkiniz bulunmamaktadır.
          </p>
          <p className="text-sm text-muted-foreground">
            Eğer bu sayfaya erişiminiz olması gerektiğini düşünüyorsanız, 
            sistem yöneticinizle iletişime geçin.
          </p>
          <div className="flex gap-2 justify-center pt-4">
            <Button onClick={handleGoBack}>
              Ana Sayfaya Dön
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/auth')}
            >
              Farklı Hesapla Giriş Yap
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
