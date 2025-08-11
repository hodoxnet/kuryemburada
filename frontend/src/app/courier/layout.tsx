"use client";

import { useState } from "react";
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
  Clock
} from "lucide-react";

const courierMenuItems = [
  {
    title: "Dashboard",
    href: "/courier/dashboard",
    icon: Home,
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

  // Loading durumu
  if (loading) {
    return <LoadingState text="Yükleniyor..." />;
  }

  // Yetki kontrolü
  if (!user || !hasRole(['COURIER'])) {
    router.push('/unauthorized');
    return null;
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