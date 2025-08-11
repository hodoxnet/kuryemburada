"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { LoadingState } from "@/components/shared/LoadingState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, CheckCircle, XCircle, Trash2 } from "lucide-react";
import { companyService, Company } from "@/lib/api/company.service";
import { handleApiError } from "@/lib/api-client";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export default function CompaniesPage() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    active: 0,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    companyId: "",
    companyName: "",
  });

  // Firma verilerini yükle
  const loadCompanies = async (status?: string) => {
    try {
      setLoading(true);
      const response = await companyService.getCompanies({
        status: status === "all" ? undefined : status?.toUpperCase(),
        take: 50,
      });
      setCompanies(response.data);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri yükle
  const loadStats = async () => {
    try {
      const data = await companyService.getCompanyStats();
      setStats(data);
    } catch (error) {
      console.error("İstatistikler yüklenemedi:", error);
    }
  };

  useEffect(() => {
    loadCompanies(activeTab);
    loadStats();
  }, [activeTab]);

  // Tablo kolonları
  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: "name",
      header: "Firma Adı",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "taxNumber",
      header: "Vergi No",
    },
    {
      accessorKey: "phone",
      header: "Telefon",
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
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.push(`/admin/companies/${row.original.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.status === "PENDING" && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-green-600 hover:text-green-700"
                onClick={() => handleStatusUpdate(row.original.id, "APPROVED")}
                title="Onayla"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-600 hover:text-red-700"
                onClick={() => handleStatusUpdate(row.original.id, "REJECTED")}
                title="Reddet"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
          {(row.original.status === "APPROVED" || row.original.status === "REJECTED") && (
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-700"
              onClick={() => setDeleteDialog({
                open: true,
                companyId: row.original.id,
                companyName: row.original.name,
              })}
              title="Sil"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Durum güncelleme
  const handleStatusUpdate = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      await companyService.updateCompanyStatus(id, { status });
      toast.success(
        status === "APPROVED" 
          ? "Firma başvurusu onaylandı" 
          : "Firma başvurusu reddedildi"
      );
      loadCompanies(activeTab);
      loadStats();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  // Firma silme
  const handleDelete = async () => {
    try {
      await companyService.deleteCompany(deleteDialog.companyId);
      toast.success("Firma başarıyla silindi");
      loadCompanies(activeTab);
      loadStats();
      setDeleteDialog({ open: false, companyId: "", companyName: "" });
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Firma Yönetimi</h1>
        <p className="text-muted-foreground">
          Firma başvurularını görüntüleyin ve yönetin
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid gap-4 md:grid-cols-5">
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
      </div>

      {/* Firmalar Tablosu */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">Tümü</TabsTrigger>
              <TabsTrigger value="pending">Bekleyen</TabsTrigger>
              <TabsTrigger value="approved">Onaylı</TabsTrigger>
              <TabsTrigger value="rejected">Reddedildi</TabsTrigger>
              <TabsTrigger value="active">Aktif</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingState text="Firmalar yükleniyor..." />
          ) : (
            <DataTable
              columns={columns}
              data={companies}
              searchPlaceholder="Firma ara..."
            />
          )}
        </CardContent>
      </Card>

      {/* Silme Dialog */}
      <ConfirmDialog
        open={deleteDialog.open}
        onOpenChange={(open) => !open && setDeleteDialog({ open: false, companyId: "", companyName: "" })}
        title="Firmayı Sil"
        description={`${deleteDialog.companyName} firmasını silmek istediğinizden emin misiniz?`}
        onConfirm={handleDelete}
        confirmText="Evet, Firmayı Sil"
        cancelText="Vazgeç"
        variant="destructive"
      />
    </div>
  );
}