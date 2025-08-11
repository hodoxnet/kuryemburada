"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calculator,
  DollarSign,
  TrendingUp,
  Activity,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { pricingService, PricingRule } from "@/lib/api/pricing.service";
import { handleApiError } from "@/lib/api-client";
import { toast } from "sonner";

interface CreatePricingRuleDto {
  name: string;
  description?: string;
  basePrice: number;
  pricePerKm: number;
  pricePerMinute: number;
  minimumPrice: number;
  rushHourMultiplier?: number;
  weatherMultiplier?: number;
  isActive?: boolean;
}

export default function PricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [calculateDialogOpen, setCalculateDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
  const [formData, setFormData] = useState<CreatePricingRuleDto>({
    name: '',
    description: '',
    basePrice: 15,
    pricePerKm: 3,
    pricePerMinute: 0.5,
    minimumPrice: 10,
    rushHourMultiplier: 1.5,
    weatherMultiplier: 1.2,
    isActive: true,
  });
  const [calculateForm, setCalculateForm] = useState({
    distance: 5,
    duration: 15,
    packageSize: 'MEDIUM',
    deliveryType: 'STANDARD',
    urgency: 'NORMAL',
  });
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await pricingService.getPricingRules();
      setRules(response.data || []);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const handleOpenDialog = (rule?: PricingRule) => {
    if (rule) {
      setSelectedRule(rule);
      setFormData({
        name: rule.name,
        description: rule.description || '',
        basePrice: rule.basePrice,
        pricePerKm: rule.pricePerKm || 0,
        pricePerMinute: rule.pricePerMinute || 0,
        minimumPrice: rule.minimumPrice || 0,
        rushHourMultiplier: rule.rushHourMultiplier || 1,
        weatherMultiplier: rule.weatherMultiplier || 1,
        isActive: rule.isActive,
      });
    } else {
      setSelectedRule(null);
      setFormData({
        name: '',
        description: '',
        basePrice: 15,
        pricePerKm: 3,
        pricePerMinute: 0.5,
        minimumPrice: 10,
        rushHourMultiplier: 1.5,
        weatherMultiplier: 1.2,
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedRule(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedRule) {
        await pricingService.updatePricingRule(selectedRule.id, formData);
        toast.success('Fiyatlandırma kuralı güncellendi');
      } else {
        await pricingService.createPricingRule(formData);
        toast.success('Fiyatlandırma kuralı oluşturuldu');
      }
      handleCloseDialog();
      loadRules();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleToggleRule = async (id: string, isActive: boolean) => {
    try {
      await pricingService.toggleActive(id);
      toast.success(isActive ? "Kural pasif edildi" : "Kural aktif edildi");
      loadRules();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleDeleteRule = async () => {
    if (!selectedRule) return;
    
    try {
      await pricingService.deletePricingRule(selectedRule.id);
      toast.success("Kural silindi");
      setDeleteDialogOpen(false);
      setSelectedRule(null);
      loadRules();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleCalculatePrice = async () => {
    try {
      const result = await pricingService.calculatePrice({
        distance: calculateForm.distance,
        duration: calculateForm.duration,
        packageSize: calculateForm.packageSize as any,
        deliveryType: calculateForm.deliveryType as any,
        urgency: calculateForm.urgency as any,
      });
      setCalculatedPrice(result.price);
      toast.success(`Hesaplanan fiyat: ₺${result.price.toFixed(2)}`);
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fiyatlandırma Yönetimi</h1>
          <p className="text-muted-foreground">
            Fiyatlandırma kurallarını yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCalculateDialogOpen(true)}>
            <Calculator className="mr-2 h-4 w-4" />
            Fiyat Hesapla
          </Button>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kural
          </Button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kural</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktif Kural</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.filter(r => r.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Taban Fiyat</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{(rules.reduce((sum, r) => sum + r.basePrice, 0) / rules.length || 0).toFixed(1)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ortalama Km Fiyatı</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{(rules.reduce((sum, r) => sum + (r.pricePerKm || 0), 0) / rules.length || 0).toFixed(1)}
            </div>
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <LoadingState text="Kurallar yükleniyor..." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Fiyatlandırma Kuralları</CardTitle>
            <CardDescription>
              Sistemde tanımlı tüm fiyatlandırma kuralları
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kural Adı</TableHead>
                  <TableHead>Taban Fiyat</TableHead>
                  <TableHead>Km Başı</TableHead>
                  <TableHead>Dakika Başı</TableHead>
                  <TableHead>Minimum Fiyat</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rule.name}</div>
                        {rule.description && (
                          <div className="text-sm text-muted-foreground">{rule.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>₺{rule.basePrice}</TableCell>
                    <TableCell>₺{rule.pricePerKm || 0}</TableCell>
                    <TableCell>₺{rule.pricePerMinute || 0}</TableCell>
                    <TableCell>₺{rule.minimumPrice || 0}</TableCell>
                    <TableCell>
                      <Badge variant={rule.isActive ? 'success' : 'secondary'}>
                        {rule.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenDialog(rule)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleRule(rule.id, rule.isActive)}>
                            <Activity className="mr-2 h-4 w-4" />
                            {rule.isActive ? 'Pasif Yap' : 'Aktif Yap'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedRule(rule);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Kural Ekleme/Düzenleme Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRule ? 'Fiyatlandırma Kuralı Düzenle' : 'Yeni Fiyatlandırma Kuralı'}
            </DialogTitle>
            <DialogDescription>
              Fiyatlandırma kuralı bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Kural Adı</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Standart Mesafe Fiyatlandırması"
              />
            </div>

            <div>
              <Label htmlFor="description">Açıklama (Opsiyonel)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Kural açıklaması..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="basePrice">Taban Fiyat (₺)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="minimumPrice">Minimum Fiyat (₺)</Label>
                <Input
                  id="minimumPrice"
                  type="number"
                  step="0.01"
                  value={formData.minimumPrice}
                  onChange={(e) => setFormData({ ...formData, minimumPrice: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pricePerKm">Km Başı Fiyat (₺)</Label>
                <Input
                  id="pricePerKm"
                  type="number"
                  step="0.01"
                  value={formData.pricePerKm}
                  onChange={(e) => setFormData({ ...formData, pricePerKm: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="pricePerMinute">Dakika Başı Fiyat (₺)</Label>
                <Input
                  id="pricePerMinute"
                  type="number"
                  step="0.01"
                  value={formData.pricePerMinute}
                  onChange={(e) => setFormData({ ...formData, pricePerMinute: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rushHourMultiplier">Yoğun Saat Çarpanı</Label>
                <Input
                  id="rushHourMultiplier"
                  type="number"
                  step="0.1"
                  value={formData.rushHourMultiplier}
                  onChange={(e) => setFormData({ ...formData, rushHourMultiplier: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="weatherMultiplier">Hava Durumu Çarpanı</Label>
                <Input
                  id="weatherMultiplier"
                  type="number"
                  step="0.1"
                  value={formData.weatherMultiplier}
                  onChange={(e) => setFormData({ ...formData, weatherMultiplier: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              {selectedRule ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Fiyat Hesaplama Dialog */}
      <Dialog open={calculateDialogOpen} onOpenChange={setCalculateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fiyat Hesapla</DialogTitle>
            <DialogDescription>
              Sipariş detaylarını girerek tahmini fiyat hesaplayın
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="distance">Mesafe (km)</Label>
                <Input
                  id="distance"
                  type="number"
                  value={calculateForm.distance}
                  onChange={(e) => setCalculateForm({ ...calculateForm, distance: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="duration">Süre (dakika)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={calculateForm.duration}
                  onChange={(e) => setCalculateForm({ ...calculateForm, duration: Number(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="packageSize">Paket Boyutu</Label>
              <Select
                value={calculateForm.packageSize}
                onValueChange={(value) => setCalculateForm({ ...calculateForm, packageSize: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMALL">Küçük</SelectItem>
                  <SelectItem value="MEDIUM">Orta</SelectItem>
                  <SelectItem value="LARGE">Büyük</SelectItem>
                  <SelectItem value="EXTRA_LARGE">Çok Büyük</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="deliveryType">Teslimat Tipi</Label>
              <Select
                value={calculateForm.deliveryType}
                onValueChange={(value) => setCalculateForm({ ...calculateForm, deliveryType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STANDARD">Standart</SelectItem>
                  <SelectItem value="EXPRESS">Express</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="urgency">Aciliyet</Label>
              <Select
                value={calculateForm.urgency}
                onValueChange={(value) => setCalculateForm({ ...calculateForm, urgency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="URGENT">Acil</SelectItem>
                  <SelectItem value="VERY_URGENT">Çok Acil</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {calculatedPrice !== null && (
              <div className="p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Tahmini Fiyat</p>
                <p className="text-2xl font-bold">₺{calculatedPrice.toFixed(2)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCalculateDialogOpen(false)}>
              Kapat
            </Button>
            <Button onClick={handleCalculatePrice}>
              Hesapla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Silme Onay Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kuralı Sil</DialogTitle>
            <DialogDescription>
              {selectedRule?.name} kuralını silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button variant="destructive" onClick={handleDeleteRule}>
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}