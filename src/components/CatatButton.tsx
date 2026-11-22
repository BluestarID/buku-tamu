"use client";

import React, { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { useToast } from "./Toast";

interface CatatButtonProps {
  tamuId: number;
  field: "waktuDatang" | "waktuKeluar";
  currentValue: string | null;
  onOptimisticUpdate: (
    tamuId: number,
    field: "waktuDatang" | "waktuKeluar",
    timestamp: string
  ) => void;
  onRollback: (
    tamuId: number,
    field: "waktuDatang" | "waktuKeluar",
    previousValue: string | null
  ) => void;
  onSuccess?: () => void;
}

export default function CatatButton({
  tamuId,
  field,
  currentValue,
  onOptimisticUpdate,
  onRollback,
  onSuccess,
}: CatatButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { error: toastError, success: toastSuccess } = useToast();

  const handleConfirm = async () => {
    const previousVal = currentValue;
    const nowIso = new Date().toISOString();

    // 1. Optimistic UI: immediately replace the button with current timestamp
    onOptimisticUpdate(tamuId, field, nowIso);
    setModalOpen(false);
    setLoading(true);

    try {
      const res = await fetch(`/api/tamu/${tamuId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan waktu ke server");
      }

      toastSuccess(
        `Waktu ${field === "waktuDatang" ? "datang" : "keluar"} berhasil dicatat!`
      );
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Catat time error:", err);
      // 2. Rollback UI on error & show toast notification
      onRollback(tamuId, field, previousVal);
      toastError(
        "Gagal mencatat waktu ke server. Perubahan dibatalkan.",
        "Terjadi Kesalahan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="px-3.5 py-1.5 rounded-lg bg-[#307cff] hover:bg-[#2563eb] active:scale-95 text-white text-xs font-semibold shadow-sm transition-all duration-150 inline-flex items-center justify-center cursor-pointer"
      >
        Catat
      </button>

      <ConfirmModal
        isOpen={modalOpen}
        title="Konfirmasi Catat Waktu"
        message="Yakin catat waktu sekarang?"
        confirmLabel="Ya, Catat"
        cancelLabel="Batal"
        isLoading={loading}
        onConfirm={handleConfirm}
        onCancel={() => setModalOpen(false)}
      />
    </>
  );
}
