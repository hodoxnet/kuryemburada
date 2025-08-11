"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Loading tamamlandıktan sonra kontrol et
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  // Loading durumunda spinner göster
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Authenticated değilse hiçbir şey gösterme (yönlendirme yapılacak)
  if (!isAuthenticated) {
    return null;
  }

  // Admin rolü kontrolü
  if (user?.role !== 'SUPER_ADMIN') {
    router.push('/unauthorized');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar title="Admin Panel" />
      <Header />
      <main className="p-4 md:p-6 md:ml-64">
        {children}
      </main>
    </div>
  );
}