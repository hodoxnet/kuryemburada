"use client";

import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export interface TimelineStep {
  label: string;
  time: Date | string | null;
  description?: string;
  status: "completed" | "current" | "pending";
}

interface OrderTimelineProps {
  steps: TimelineStep[];
  className?: string;
}

// Süre hesaplama fonksiyonu
function calculateDuration(from: Date, to: Date): string {
  const diffMs = to.getTime() - from.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 0) return "";
  if (diffSec < 60) return `${diffSec} sn. içinde`;

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} dk. içinde`;

  const diffHour = Math.floor(diffMin / 60);
  const remainingMin = diffMin % 60;
  if (remainingMin === 0) return `${diffHour} saat içinde`;
  return `${diffHour} saat ${remainingMin} dk. içinde`;
}

// Tarihi parse et
function parseDate(date: Date | string | null): Date | null {
  if (!date) return null;
  if (date instanceof Date) return date;
  return new Date(date);
}

// Sipariş için timeline adımları oluştur
export function createOrderTimelineSteps(order: {
  createdAt: Date | string;
  acceptedAt?: Date | string | null;
  pickedUpAt?: Date | string | null;
  deliveredAt?: Date | string | null;
  expectedDeliveryTime?: Date | string | null;
}): TimelineStep[] {
  const createdAt = parseDate(order.createdAt);
  const acceptedAt = parseDate(order.acceptedAt || null);
  const pickedUpAt = parseDate(order.pickedUpAt || null);
  const deliveredAt = parseDate(order.deliveredAt || null);
  const expectedDeliveryTime = parseDate(order.expectedDeliveryTime || null);

  const steps: TimelineStep[] = [
    {
      label: "Sipariş Alındı",
      time: createdAt,
      status: "completed",
    },
  ];

  // Kabul edildi adımı
  if (acceptedAt && createdAt) {
    steps.push({
      label: "Sipariş Kabul Edildi",
      time: acceptedAt,
      description: calculateDuration(createdAt, acceptedAt),
      status: "completed",
    });
  } else {
    steps.push({
      label: "Sipariş Kabul Edildi",
      time: null,
      status: deliveredAt || pickedUpAt ? "completed" : "pending",
    });
  }

  // Yola çıktı adımı
  if (pickedUpAt && acceptedAt) {
    steps.push({
      label: "Yola Çıktı",
      time: pickedUpAt,
      description: calculateDuration(acceptedAt, pickedUpAt),
      status: "completed",
    });
  } else if (pickedUpAt) {
    steps.push({
      label: "Yola Çıktı",
      time: pickedUpAt,
      status: "completed",
    });
  } else {
    steps.push({
      label: "Yola Çıktı",
      time: null,
      status: deliveredAt ? "completed" : "pending",
    });
  }

  // Teslim adımı
  if (deliveredAt && pickedUpAt) {
    steps.push({
      label: "Teslim Edildi",
      time: deliveredAt,
      description: calculateDuration(pickedUpAt, deliveredAt),
      status: "completed",
    });
  } else if (deliveredAt) {
    steps.push({
      label: "Teslim Edildi",
      time: deliveredAt,
      status: "completed",
    });
  } else if (expectedDeliveryTime) {
    steps.push({
      label: "Tahmini Teslimat",
      time: expectedDeliveryTime,
      status: "pending",
    });
  } else {
    steps.push({
      label: "Teslim Edildi",
      time: null,
      status: "pending",
    });
  }

  return steps;
}

export function OrderTimeline({ steps, className }: OrderTimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const time = parseDate(step.time);

        return (
          <div key={index} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Dikey çizgi */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-[11px] top-6 h-full w-0.5",
                  step.status === "completed"
                    ? "bg-green-500"
                    : "bg-gray-200"
                )}
              />
            )}

            {/* İkon */}
            <div className="relative z-10 flex-shrink-0">
              {step.status === "completed" ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : step.status === "current" ? (
                <Clock className="h-6 w-6 text-blue-500 animate-pulse" />
              ) : (
                <Circle className="h-6 w-6 text-gray-300" />
              )}
            </div>

            {/* İçerik */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "font-medium",
                    step.status === "completed"
                      ? "text-gray-900"
                      : step.status === "current"
                      ? "text-blue-600"
                      : "text-gray-400"
                  )}
                >
                  {step.label}
                </p>
                {time && (
                  <span
                    className={cn(
                      "text-sm tabular-nums",
                      step.status === "pending"
                        ? "text-gray-400"
                        : "text-gray-600"
                    )}
                  >
                    {format(time, "HH:mm", { locale: tr })}
                  </span>
                )}
              </div>
              {step.description && (
                <p className="mt-0.5 text-sm text-gray-500">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
