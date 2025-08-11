"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/shared/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Calculator } from "lucide-react";
import { pricingService, PricingRule } from "@/lib/api/pricing.service";
import { handleApiError } from "@/lib/api-client";
import { toast } from "sonner";

export default function PricingPage() {
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await pricingService.getPricingRules();
      // Backend paginated response döndürüyor, data array'ini al
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

  const handleToggleRule = async (id: number, isActive: boolean) => {
    try {
      await pricingService.updatePricingRule(id, { isActive: !isActive });
      toast.success(isActive ? "Kural pasif edildi" : "Kural aktif edildi");
      loadRules();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const handleDeleteRule = async (id: number) => {
    if (!confirm("Bu kuralı silmek istediğinizden emin misiniz?")) return;
    
    try {
      await pricingService.deletePricingRule(id);
      toast.success("Kural silindi");
      loadRules();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  const getRuleTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DISTANCE: "Mesafe Bazlı",
      ZONE: "Bölge Bazlı",
      TIME: "Zaman Bazlı",
      PACKAGE: "Paket Tipi",
      CUSTOM: "Özel",
    };
    return labels[type] || type;
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
          <Button variant="outline">
            <Calculator className="mr-2 h-4 w-4" />
            Fiyat Hesapla
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kural
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingState text="Kurallar yükleniyor..." />
      ) : (
        <div className="grid gap-4">
          {rules.map((rule) => (
            <Card key={rule.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CardTitle className="text-lg">{rule.name}</CardTitle>
                    <Badge variant="outline">{getRuleTypeLabel(rule.ruleType)}</Badge>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={rule.isActive}
                      onCheckedChange={() => handleToggleRule(rule.id, rule.isActive)}
                    />
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Taban Fiyat:</span>
                    <p className="font-medium">₺{rule.basePrice}</p>
                  </div>
                  {rule.pricePerKm && (
                    <div>
                      <span className="text-muted-foreground">Km Başı:</span>
                      <p className="font-medium">₺{rule.pricePerKm}</p>
                    </div>
                  )}
                  {rule.multiplier && (
                    <div>
                      <span className="text-muted-foreground">Çarpan:</span>
                      <p className="font-medium">x{rule.multiplier}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Öncelik:</span>
                    <p className="font-medium">{rule.priority}</p>
                  </div>
                </div>
                {rule.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{rule.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}