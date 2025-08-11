"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Onayla",
  cancelText = "İptal",
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={variant === "destructive" ? "border-red-200 dark:border-red-900" : ""}>
        <AlertDialogHeader>
          <AlertDialogTitle className={variant === "destructive" ? "text-red-600 dark:text-red-400" : ""}>
            {variant === "destructive" && (
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-2">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-semibold text-red-600 dark:text-red-400">DİKKAT!</div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{title}</div>
                </div>
              </div>
            )}
            {variant !== "destructive" && title}
          </AlertDialogTitle>
          {variant === "destructive" ? (
            <div className="space-y-3">
              <AlertDialogDescription className="text-gray-600 dark:text-gray-400 font-medium">
                {description}
              </AlertDialogDescription>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                  ⚠️ Bu işlem geri alınamaz ve tüm ilişkili veriler kalıcı olarak silinecektir!
                </div>
              </div>
            </div>
          ) : (
            <AlertDialogDescription>
              {description}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className={variant === "destructive" ? "hover:bg-gray-100 dark:hover:bg-gray-800" : ""}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={
              variant === "destructive"
                ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
                : ""
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}