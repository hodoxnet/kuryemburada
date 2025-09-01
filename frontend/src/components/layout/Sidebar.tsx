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
  Users,
  Home,
  LogOut,
  Menu,
  X,
  MapPin,
  Calculator,
  Wallet,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { AuthService } from "@/lib/auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
    title: "Mutabakatlar",
    href: "/admin/reconciliations",
    icon: Calculator,
  },
  {
    title: "Firma Ödemeleri",
    href: "/admin/company-balance",
    icon: Wallet,
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
  open = false,
  onOpenChange 
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Props'tan gelen open değeri varsa onu kullan
  useEffect(() => {
    if (open !== undefined) {
      setIsMobileOpen(open);
    }
  }, [open]);

  const handleLogout = () => {
    clearAuth();
    AuthService.clearAuth();
    toast.success('Çıkış yapıldı');
    router.push('/auth');
  };

  const handleLinkClick = () => {
    // Mobilde link'e tıklandığında menüyü kapat
    if (onOpenChange) {
      onOpenChange(false);
    }
    setIsMobileOpen(false);
  };

  const NavigationContent = () => (
    <>
      {/* Logo/Title */}
      <div className="flex h-16 items-center justify-between border-b px-6">
        <h1 className="text-xl font-bold">{title}</h1>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && item.href !== "/company" && item.href !== "/courier" && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
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
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - Always visible on large screens */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex h-full flex-col border-r bg-background">
          <NavigationContent />
        </div>
      </aside>

      {/* Mobile Sidebar - Sheet component for better mobile experience */}
      <Sheet open={isMobileOpen} onOpenChange={(open) => {
        setIsMobileOpen(open);
        if (onOpenChange) {
          onOpenChange(open);
        }
      }}>
        <SheetContent side="left" className="w-64 p-0">
          <VisuallyHidden>
            <SheetTitle>Navigasyon Menüsü</SheetTitle>
          </VisuallyHidden>
          <div className="flex h-full flex-col">
            <NavigationContent />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
