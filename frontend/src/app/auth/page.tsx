"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Building, Truck } from "lucide-react";

export default function AuthSelectorPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Kurye Operasyon Sistemi
          </CardTitle>
          <CardDescription className="text-base">
            Lütfen hesap tipinizi seçin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={() => router.push('/admin/login')}
            variant="outline"
            className="w-full h-16 text-left justify-start hover:bg-red-50 hover:border-red-200 transition-colors group"
          >
            <div className="flex items-center w-full">
              <Shield className="mr-4 h-6 w-6 text-red-600 group-hover:text-red-700" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Sistem Yöneticisi</div>
                <div className="text-sm text-muted-foreground">Admin paneline erişim</div>
              </div>
            </div>
          </Button>
          
          <Button
            onClick={() => router.push('/company/login')}
            variant="outline"
            className="w-full h-16 text-left justify-start hover:bg-blue-50 hover:border-blue-200 transition-colors group"
          >
            <div className="flex items-center w-full">
              <Building className="mr-4 h-6 w-6 text-blue-600 group-hover:text-blue-700" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Firma Girişi</div>
                <div className="text-sm text-muted-foreground">Sipariş ve takip işlemleri</div>
              </div>
            </div>
          </Button>
          
          <Button
            onClick={() => router.push('/courier/login')}
            variant="outline"
            className="w-full h-16 text-left justify-start hover:bg-green-50 hover:border-green-200 transition-colors group"
          >
            <div className="flex items-center w-full">
              <Truck className="mr-4 h-6 w-6 text-green-600 group-hover:text-green-700" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 dark:text-gray-100">Kurye Girişi</div>
                <div className="text-sm text-muted-foreground">Teslimat işlemleri</div>
              </div>
            </div>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}