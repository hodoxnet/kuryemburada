"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Building2,
  Bike,
  DollarSign,
  Settings,
  FileText,
  CreditCard,
  Users,
  Home,
  LogOut,
  Menu,
  X,
  MapPin,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { AuthService } from "@/lib/auth";

const defaultMenuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    title: "Firma Yönetimi",
    href: "/admin/companies",
    icon: Building2,
  },
  {
    title: "Kurye Yönetimi",
    href: "/admin/couriers",
    icon: Bike,
  },
  {
    title: "Bölge Yönetimi",
    href: "/admin/service-areas",
    icon: MapPin,
  },
  {
    title: "Sistem Ayarları",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "Raporlar",
    href: "/admin/reports",
    icon: FileText,
  },
  {
    title: "Ödemeler",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    title: "Kullanıcılar",
    href: "/admin/users",
    icon: Users,
  },
];

interface SidebarProps {
  title?: string;
  menuItems?: Array<{
    title: string;
    href: string;
    icon: any;
  }>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function Sidebar({ 
  title = "Kurye Admin", 
  menuItems = defaultMenuItems,
  open,
  onOpenChange 
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Props'tan gelen open değeri varsa onu kullan, yoksa local state kullan
  const isOpen = open !== undefined ? open : isMobileOpen;
  const setIsOpen = onOpenChange || setIsMobileOpen;

  const handleLogout = () => {
    clearAuth();
    AuthService.clearAuth();
    toast.success('Çıkış yapıldı');
    router.push('/auth');
  };

  return (
    <>
      {/* Mobile menu button - eğer onOpenChange prop'u yoksa göster */}
      {!onOpenChange && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 transition-transform bg-background border-r",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b px-6">
            <h1 className="text-xl font-bold">{title}</h1>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || 
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
