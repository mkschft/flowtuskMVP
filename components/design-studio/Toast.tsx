"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, CheckCircle, Download, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ToastType = "success" | "info" | "download" | "link";

export type ToastProps = {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
};

const iconMap = {
  success: CheckCircle,
  info: Copy,
  download: Download,
  link: ExternalLink,
};

export function Toast({ id, message, type = "success", duration = 2500, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const Icon = iconMap[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 px-4 py-3 bg-background border-2 border-border rounded-lg shadow-lg min-w-[300px] max-w-[400px]"
    >
      <Icon className="w-5 h-5 text-green-600 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={() => onClose(id)}
      >
        <X className="w-4 h-4" />
      </Button>
    </motion.div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastProps[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

