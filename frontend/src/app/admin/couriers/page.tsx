"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, CheckCircle, XCircle, Star, Bike, FileText } from "lucide-react";
import { courierService, Courier } from "@/lib/api/courier.service";
import { handleApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function CouriersPage() {
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    active: 0,
    busy: 0,
  });

  // Kurye verilerini yükle
  const loadCouriers = async (status?: string) => {
    try {
      setLoading(true);
      const response = await courierService.getCouriers({
        status: status === "all" ? undefined : status?.toUpperCase(),
        take: 50,
      });
      setCouriers(response.data);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri yükle
  const loadStats = async () => {
    try {
      const data = await courierService.getCourierStats();
      setStats(data);
    } catch (error) {
      console.error("İstatistikler yüklenemedi:", error);
    }
  };

  useEffect(() => {
    loadCouriers(activeTab);
    loadStats();
  }, [activeTab]);

  // Tablo kolonları
  const columns: ColumnDef<Courier>[] = [
    {
      accessorKey: "fullName",
      header: "Ad Soyad",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.fullName}</div>
          <div className="text-sm text-muted-foreground">{row.original.tcNumber}</div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Telefon",
    },
    {
      accessorKey: "vehicleInfo",
      header: "Araç",
      cell: ({ row }) => {
        const vehicle = row.original.vehicleInfo;
        if (!vehicle) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="text-sm">
            {vehicle.brand && vehicle.model ? (
              <span>{vehicle.brand} {vehicle.model}</span>
            ) : (
              <span className="text-muted-foreground">Bilgi yok</span>
            )}
            {vehicle.plate && (
              <div className="text-muted-foreground">{vehicle.plate}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "rating",
      header: "Puan",
      cell: ({ row }) => {
        const rating = row.original.rating;
        if (!rating) return <span className="text-muted-foreground">-</span>;
        return (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating.toFixed(1)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "totalDeliveries",
      header: "Teslimat",
      cell: ({ row }) => (
        <span>{row.original.totalDeliveries || 0}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Durum",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status as any} />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Başvuru Tarihi",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {format(new Date(row.original.createdAt), "dd MMM yyyy", { locale: tr })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "İşlemler",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Link href={`/admin/couriers/${row.original.id}`}>
            <Button variant="ghost" size="icon">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          {row.original.status === "PENDING" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-green-600 hover:text-green-700"
                onClick={() => handleStatusUpdate(row.original.id, "APPROVED")}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleStatusUpdate(row.original.id, "REJECTED")}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Durum güncelleme
  const handleStatusUpdate = async (id: number, status: "APPROVED" | "REJECTED") => {
    try {
      await courierService.updateCourierStatus(id, { status });
      toast.success(
        status === "APPROVED" 
          ? "Kurye başvurusu onaylandı" 
          : "Kurye başvurusu reddedildi"
      );
      loadCouriers(activeTab);
      loadStats();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Kurye Yönetimi</h1>
        <p className="text-muted-foreground">
          Kurye başvurularını görüntüleyin ve yönetin
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Onaylı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Reddedildi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktif</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Meşgul</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.busy}</div>
          </CardContent>
        </Card>
      </div>

      {/* Kuryeler Tablosu */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Tümü</TabsTrigger>
              <TabsTrigger value="pending">Bekleyen</TabsTrigger>
              <TabsTrigger value="approved">Onaylı</TabsTrigger>
              <TabsTrigger value="rejected">Reddedildi</TabsTrigger>
              <TabsTrigger value="active">Aktif</TabsTrigger>
              <TabsTrigger value="busy">Meşgul</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState text="Kuryeler yükleniyor..." />
          ) : (
            <DataTable
              columns={columns}
              data={couriers}
              searchPlaceholder="Kurye ara..."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}