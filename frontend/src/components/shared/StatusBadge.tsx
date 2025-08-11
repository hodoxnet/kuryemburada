import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType = 
  | "PENDING"
  | "APPROVED" 
  | "REJECTED"
  | "ACTIVE"
  | "INACTIVE"
  | "BLOCKED"
  | "COMPLETED"
  | "IN_PROGRESS"
  | "CANCELLED"
  | "FAILED"
  | "BUSY";

interface StatusConfig {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  className?: string;
}

const statusConfig: Record<StatusType, StatusConfig> = {
  PENDING: {
    label: "Beklemede",
    variant: "warning",
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  APPROVED: {
    label: "Onaylandı",
    variant: "success",
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  REJECTED: {
    label: "Reddedildi",
    variant: "destructive",
  },
  ACTIVE: {
    label: "Aktif",
    variant: "success",
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  INACTIVE: {
    label: "Pasif",
    variant: "secondary",
  },
  BLOCKED: {
    label: "Engellendi",
    variant: "destructive",
  },
  COMPLETED: {
    label: "Tamamlandı",
    variant: "success",
    className: "bg-green-100 text-green-800 hover:bg-green-200",
  },
  IN_PROGRESS: {
    label: "Devam Ediyor",
    variant: "default",
    className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  },
  CANCELLED: {
    label: "İptal Edildi",
    variant: "secondary",
  },
  FAILED: {
    label: "Başarısız",
    variant: "destructive",
  },
  BUSY: {
    label: "Meşgul",
    variant: "warning",
    className: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (!config) {
    return <Badge variant="outline">{status}</Badge>;
  }

  return (
    <Badge
      variant={config.variant as any}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}