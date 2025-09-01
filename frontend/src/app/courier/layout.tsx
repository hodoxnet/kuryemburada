"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/shared/LoadingState";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { 
  Home,
  Package, 
  FileText, 
  CreditCard, 
  Settings, 
  Clock,
  Bell
} from "lucide-react";

const courierMenuItems = [
  {
    title: "Dashboard",
    href: "/courier/dashboard",
    icon: Home,
  },
  {
    title: "Yeni Siparişler",
    href: "/courier/available-orders",
    icon: Bell,
  },
  {
    title: "Aktif Teslimatlar",
    href: "/courier/deliveries/active",
    icon: Package,
  },
  {
    title: "Teslimat Geçmişi",
    href: "/courier/deliveries/history",
    icon: Clock,
  },
  {
    title: "Kazançlarım",
    href: "/courier/earnings",
    icon: CreditCard,
  },
  {
    title: "Belgelerim",
    href: "/courier/documents",
    icon: FileText,
  },
  {
    title: "Ayarlar",
    href: "/courier/settings",
    icon: Settings,
  },
];

export default function CourierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Yetki kontrolü
  useEffect(() => {
    if (!loading && (!user || !hasRole(['COURIER']))) {
      router.push('/unauthorized');
    }
  }, [user, loading, hasRole, router]);

  // Loading durumu
  if (loading) {
    return <LoadingState text="Yükleniyor..." />;
  }

  // Yetki kontrolü - Yönlendirme yapılıyor
  if (!user || !hasRole(['COURIER'])) {
    return <LoadingState text="Yönlendiriliyor..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        title="Kurye Paneli"
        menuItems={courierMenuItems}
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Page Content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}