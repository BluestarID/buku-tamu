"use client";

import React, { useEffect } from "react";
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title = "Konfirmasi Pencatatan",
  message = "Yakin catat waktu sekarang?",
  confirmLabel = "Ya, Catat",
  cancelLabel = "Batal",
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onCancel();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-neutral-100 max-w-sm w-full p-6 animate-in zoom-in-95 duration-150">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#307cff] flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Tindakan ini akan mencatat waktu aktual saat ini.
            </p>
          </div>
        </div>

        <p className="text-sm font-medium text-neutral-700 py-3 border-y border-neutral-100">
          {message}
        </p>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-[#307cff] hover:bg-[#2563eb] text-white transition shadow-md shadow-[#307cff]/20 disabled:opacity-50"
          >
            {isLoading ? "Menyimpan..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
