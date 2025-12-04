"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { orderService } from "@/lib/api/order.service";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InvoicedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onSubmit: (data: { invoiceAmount: number; bagCount?: number }) => Promise<void>;
  isLoading?: boolean;
}

export function InvoicedModal({
  open,
  onOpenChange,
  orderId,
  onSubmit,
  isLoading,
}: InvoicedModalProps) {
  const [invoiceAmount, setInvoiceAmount] = useState<string>("");
  const [bagCount, setBagCount] = useState<string>("");
  const [minAmount, setMinAmount] = useState<number>(0);
  const [maxAmount, setMaxAmount] = useState<number>(0);
  const [loadingRange, setLoadingRange] = useState(false);

  // Min/max tutar aralığını Trendyol Go'dan çek
  useEffect(() => {
    const fetchRange = async () => {
      if (!open || !orderId) return;

      try {
        setLoadingRange(true);
        const result = await orderService.getTrendyolGoInvoiceAmountRange(orderId);
        setMinAmount(result.min);
        setMaxAmount(result.max);
        // Varsayılan olarak max değeri set et
        setInvoiceAmount(result.max.toFixed(2));
      } catch (error) {
        console.error("Invoice amount range alınamadı:", error);
        // Hata durumunda varsayılan değer gösterme
        toast.error("Fiş tutarı aralığı alınamadı");
      } finally {
        setLoadingRange(false);
      }
    };

    fetchRange();
  }, [open, orderId]);

  // Modal kapanınca form temizle
  useEffect(() => {
    if (!open) {
      setInvoiceAmount("");
      setBagCount("");
      setMinAmount(0);
      setMaxAmount(0);
    }
  }, [open]);

  const handleSubmit = async () => {
    const amount = parseFloat(invoiceAmount);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Geçerli bir fiş tutarı girin");
      return;
    }

    if (minAmount > 0 && maxAmount > 0) {
      if (amount < minAmount || amount > maxAmount) {
        toast.error(`Fiş tutarı ₺${minAmount.toFixed(2)} - ₺${maxAmount.toFixed(2)} arasında olmalıdır`);
        return;
      }
    }

    await onSubmit({
      invoiceAmount: amount,
      bagCount: bagCount ? parseInt(bagCount) : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hazırlandı Bildir</DialogTitle>
          <DialogDescription>
            Sipariş hazırlandığında Trendyol Go&apos;ya bildirim gönderin. Fiş tutarını girerek devam edin.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Fiş Tutarı */}
          <div className="space-y-2">
            <Label htmlFor="invoiceAmount">
              Fiş Tutarı (₺) <span className="text-red-500">*</span>
            </Label>
            {loadingRange ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Tutar aralığı alınıyor...
              </div>
            ) : (
              <>
                <Input
                  id="invoiceAmount"
                  type="number"
                  step="0.01"
                  min={minAmount}
                  max={maxAmount}
                  placeholder="0.00"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                />
                {minAmount > 0 && maxAmount > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Trendyol Go tarafından izin verilen aralık: ₺{minAmount.toFixed(2)} - ₺{maxAmount.toFixed(2)}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Poşet Sayısı */}
          <div className="space-y-2">
            <Label htmlFor="bagCount">Poşet Sayısı (Opsiyonel)</Label>
            <Input
              id="bagCount"
              type="number"
              min="0"
              placeholder="0"
              value={bagCount}
              onChange={(e) => setBagCount(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            İptal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || loadingRange || !invoiceAmount}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              "Bildir"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
