"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { MobileHeader } from "./MobileHeader";
import { MobileTabs, TabItem } from "./MobileTabs";
import { MobileDrawer, DrawerMenuItem } from "./MobileDrawer";
import { Home, Bell, Package, CreditCard } from "lucide-react";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { useAuthStore } from "@/stores/authStore";

interface CourierMobileLayoutProps {
  children: React.ReactNode;
  menuItems: DrawerMenuItem[];
}

// Route'a göre sayfa başlıklarını belirle
const pageTitles: Record<string, string> = {
  '/courier': 'Dashboard',
  '/courier/dashboard': 'Dashboard',
  '/courier/available-orders': 'Yeni Siparişler',
  '/courier/deliveries/active': 'Aktif Teslimatlar',
  '/courier/deliveries/history': 'Teslimat Geçmişi',
  '/courier/notifications': 'Bildirimler',
  '/courier/earnings': 'Kazançlarım',
  '/courier/documents': 'Belgelerim',
  '/courier/settings': 'Ayarlar',
};

export function CourierMobileLayout({ children, menuItems }: CourierMobileLayoutProps) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const getUnreadCount = useNotificationStore((s) => s.getUnreadCount);

  // Bildirim sayısını al
  const ownerKey = user ? `${user.role}:${user.courier?.id || user.id}` : 'UNKNOWN';
  const unreadCount = getUnreadCount(ownerKey);

  // Sayfa başlığını belirle
  const pageTitle = useMemo(() => {
    // Önce tam eşleşme ara
    if (pageTitles[pathname]) {
      return pageTitles[pathname];
    }
    
    // Sipariş detay sayfası kontrolü
    if (pathname.startsWith('/courier/orders/')) {
      return 'Sipariş Detayı';
    }

    // Partial match için kontrol et
    for (const [path, title] of Object.entries(pageTitles)) {
      if (pathname.startsWith(path)) {
        return title;
      }
    }

    return 'Kurye Paneli';
  }, [pathname]);

  // Bottom tabs için en önemli 4 menü öğesi
  const bottomTabs = useMemo<TabItem[]>(() => {
    const tabs: TabItem[] = [
      {
        title: 'Anasayfa',
        href: '/courier/dashboard',
        icon: Home,
      },
      {
        title: 'Yeni',
        href: '/courier/available-orders',
        icon: Bell,
        badge: unreadCount > 0 ? unreadCount : undefined,
      },
      {
        title: 'Aktif',
        href: '/courier/deliveries/active',
        icon: Package,
      },
      {
        title: 'Kazançlar',
        href: '/courier/earnings',
        icon: CreditCard,
      },
    ];

    return tabs;
  }, [unreadCount]);

  // ESC tuşu ile drawer'ı kapatma
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false);
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [drawerOpen]);

  // Route değişiminde drawer'ı kapat
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 md:hidden">
      {/* Mobile Header */}
      <MobileHeader 
        title={pageTitle}
        onMenuClick={() => setDrawerOpen(true)}
      />

      {/* Mobile Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        menuItems={menuItems}
        title="Kurye Paneli"
      />

      {/* Main Content */}
      <main className="pt-14 pb-20">
        <div className="px-4">
          {children}
        </div>
      </main>

      {/* Bottom Tabs */}
      <MobileTabs tabs={bottomTabs} />
    </div>
  );
}