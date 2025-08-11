"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/shared/LoadingState";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { 
  Home,
  Building2, 
  Package, 
  FileText, 
  BarChart3, 
  Settings
} from "lucide-react";

const companyMenuItems = [
  {
    title: "Dashboard",
    href: "/company/dashboard",
    icon: Home,
  },
  {
    title: "Siparişler",
    href: "/company/orders",
    icon: Package,
  },
  {
    title: "Firma Bilgileri",
    href: "/company/profile",
    icon: Building2,
  },
  {
    title: "Raporlar",
    href: "/company/reports",
    icon: BarChart3,
  },
  {
    title: "Ayarlar",
    href: "/company/settings",
    icon: Settings,
  },
];

export default function CompanyLayout({
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
  if (!user || !hasRole(['COMPANY'])) {
    router.push('/unauthorized');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar
        title="Firma Paneli"
        menuItems={companyMenuItems}
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