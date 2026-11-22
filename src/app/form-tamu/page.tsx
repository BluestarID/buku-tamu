"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import PegawaiCombobox, { Pegawai } from "@/components/PegawaiCombobox";
import { useToast } from "@/components/Toast";
import { Calendar, Clock, Loader2, AlertCircle } from "lucide-react";

export default function FormTamuPage() {
  const { success, error: toastError } = useToast();

  const [pegawaiList, setPegawaiList] = useState<Pegawai[]>([]);
  const [loadingPegawai, setLoadingPegawai] = useState(true);

  // Form State
  const [nama, setNama] = useState("");
  const [asalInstansi, setAsalInstansi] = useState("");
  const [keperluan, setKeperluan] = useState("");
  const [selectedPegawai, setSelectedPegawai] = useState<Pegawai | null>(null);

  // Cached Jadwal State (preserved across pegawai switches)
  const [cachedJadwalDate, setCachedJadwalDate] = useState("");
  const [cachedJadwalTime, setCachedJadwalTime] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<{
    nama?: string;
    asalInstansi?: string;
    keperluan?: string;
    pegawai?: string;
    jadwalDate?: string;
    jadwalTime?: string;
  }>({});

  const [submitting, setSubmitting] = useState(false);

  // Fetch Pegawai on mount
  useEffect(() => {
    async function fetchPegawai() {
      try {
        const res = await fetch("/api/pegawai");
        if (res.ok) {
          const data = await res.json();
          setPegawaiList(data);
        } else {
          toastError("Gagal mengambil daftar pegawai");
        }
      } catch (err) {
        console.error("Error fetching pegawai:", err);
        toastError("Gagal mengambil daftar pegawai");
      } finally {
        setLoadingPegawai(false);
      }
    }
    fetchPegawai();
  }, [toastError]);

  const isPegawaiUnavailable = selectedPegawai ? !selectedPegawai.status : false;

  const handleSelectPegawai = (p: Pegawai) => {
    setSelectedPegawai(p);
    if (errors.pegawai) {
      setErrors((prev) => ({ ...prev, pegawai: undefined }));
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!nama.trim()) {
      newErrors.nama = "Nama wajib diisi";
    }
    if (!asalInstansi.trim()) {
      newErrors.asalInstansi = "Asal instansi wajib diisi";
    }
    if (!keperluan.trim()) {
      newErrors.keperluan = "Keperluan wajib diisi";
    }
    if (!selectedPegawai) {
      newErrors.pegawai = "Pegawai wajib dipilih";
    }

    // Conditional validation for unavailable pegawai
    if (isPegawaiUnavailable) {
      if (!cachedJadwalDate) {
        newErrors.jadwalDate = "Tanggal jadwal wajib diisi";
      }
      if (!cachedJadwalTime) {
        newErrors.jadwalTime = "Waktu jadwal wajib diisi";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setNama("");
    setAsalInstansi("");
    setKeperluan("");
    setSelectedPegawai(null);
    setCachedJadwalDate("");
    setCachedJadwalTime("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      let combinedJadwal: string | null = null;
      if (isPegawaiUnavailable) {
        combinedJadwal = new Date(`${cachedJadwalDate}T${cachedJadwalTime}`).toISOString();
      }

      const res = await fetch("/api/tamu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: nama.trim(),
          asalInstansi: asalInstansi.trim(),
          keperluan: keperluan.trim(),
          idPegawai: selectedPegawai?.id,
          jadwalWaktu: combinedJadwal,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Gagal menyimpan data tamu");
      }

      // Explicit toast notification for scheduled visits or direct visits
      if (isPegawaiUnavailable) {
        success(
          `Kunjungan tamu untuk ${nama.trim()} berhasil dijadwalkan!`,
          "Kunjungan Dijadwalkan"
        );
      } else {
        success(
          `Data kedatangan tamu ${nama.trim()} berhasil dicatat!`,
          "Kunjungan Langsung"
        );
      }

      // Redirect to fresh empty form as required
      resetForm();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      toastError(msg, "Gagal Menyimpan");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/40 flex flex-col">
      <Navbar />

      {/* Main scrollable layout — clean white card, not dull grey */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 py-10">
        <div className="bg-white rounded-3xl shadow-xl shadow-neutral-200/50 border border-neutral-100 p-8 sm:p-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Formulir Tamu
            </h2>
            <p className="text-xs text-neutral-500 mt-1 font-medium">
              Catat data kunjungan langsung atau jadwalkan pertemuan dengan pegawai.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Field 1: Nama */}
            <div className="space-y-1.5">
              <label
                htmlFor="nama"
                className="block text-sm font-semibold text-neutral-800"
              >
                Nama
              </label>
              <input
                id="nama"
                type="text"
                value={nama}
                onChange={(e) => {
                  setNama(e.target.value);
                  if (errors.nama) setErrors((prev) => ({ ...prev, nama: undefined }));
                }}
                placeholder="Masukkan nama tamu"
                className={`w-full px-4 py-3 rounded-xl bg-white text-neutral-900 placeholder-neutral-400 border text-sm font-medium transition-all shadow-xs ${
                  errors.nama
                    ? "border-red-500 bg-red-50/20"
                    : "border-neutral-200 hover:border-neutral-300 focus:border-[#307cff] focus:outline-none focus:ring-4 focus:ring-[#307cff]/15"
                }`}
              />
              {errors.nama && (
                <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.nama}
                </p>
              )}
            </div>

            {/* Field 2: Asal Instansi */}
            <div className="space-y-1.5">
              <label
                htmlFor="asalInstansi"
                className="block text-sm font-semibold text-neutral-800"
              >
                Asal Instansi
              </label>
              <input
                id="asalInstansi"
                type="text"
                value={asalInstansi}
                onChange={(e) => {
                  setAsalInstansi(e.target.value);
                  if (errors.asalInstansi)
                    setErrors((prev) => ({ ...prev, asalInstansi: undefined }));
                }}
                placeholder="Masukkan nama instansi atau perusahaan"
                className={`w-full px-4 py-3 rounded-xl bg-white text-neutral-900 placeholder-neutral-400 border text-sm font-medium transition-all shadow-xs ${
                  errors.asalInstansi
                    ? "border-red-500 bg-red-50/20"
                    : "border-neutral-200 hover:border-neutral-300 focus:border-[#307cff] focus:outline-none focus:ring-4 focus:ring-[#307cff]/15"
                }`}
              />
              {errors.asalInstansi && (
                <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.asalInstansi}
                </p>
              )}
            </div>

            {/* Field 3: Keperluan */}
            <div className="space-y-1.5">
              <label
                htmlFor="keperluan"
                className="block text-sm font-semibold text-neutral-800"
              >
                Keperluan
              </label>
              <textarea
                id="keperluan"
                rows={3}
                value={keperluan}
                onChange={(e) => {
                  setKeperluan(e.target.value);
                  if (errors.keperluan)
                    setErrors((prev) => ({ ...prev, keperluan: undefined }));
                }}
                placeholder="Tuliskan keperluan kunjungan secara singkat"
                className={`w-full px-4 py-3 rounded-xl bg-white text-neutral-900 placeholder-neutral-400 border text-sm font-medium transition-all resize-none shadow-xs ${
                  errors.keperluan
                    ? "border-red-500 bg-red-50/20"
                    : "border-neutral-200 hover:border-neutral-300 focus:border-[#307cff] focus:outline-none focus:ring-4 focus:ring-[#307cff]/15"
                }`}
              />
              {errors.keperluan && (
                <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.keperluan}
                </p>
              )}
            </div>

            {/* Field 4: Pegawai */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-neutral-800">
                Pegawai
              </label>
              {loadingPegawai ? (
                <div className="w-full px-4 py-3 rounded-xl bg-neutral-50 flex items-center gap-2 text-sm text-neutral-400 border border-neutral-200">
                  <Loader2 className="w-4 h-4 animate-spin text-[#307cff]" />
                  <span>Memuat data pegawai...</span>
                </div>
              ) : (
                <PegawaiCombobox
                  pegawaiList={pegawaiList}
                  selectedId={selectedPegawai?.id ?? null}
                  onSelect={handleSelectPegawai}
                  error={errors.pegawai}
                />
              )}
              {errors.pegawai && (
                <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.pegawai}
                </p>
              )}
            </div>

            {/* Conditional Jadwal Section with smooth animation */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                isPegawaiUnavailable
                  ? "max-h-96 opacity-100 pt-3"
                  : "max-h-0 opacity-0 pointer-events-none"
              }`}
            >
              <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/70 space-y-4">
                {/* Red helper text */}
                <p className="text-sm font-semibold text-rose-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Pegawai tidak tersedia, silakan buat jadwal.
                </p>

                {/* Date & Time Picker */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date Picker */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="jadwalDate"
                      className="block text-xs font-bold text-neutral-700"
                    >
                      Tanggal Kunjungan
                    </label>
                    <div className="relative">
                      <input
                        id="jadwalDate"
                        type="date"
                        value={cachedJadwalDate}
                        onChange={(e) => {
                          setCachedJadwalDate(e.target.value);
                          if (errors.jadwalDate)
                            setErrors((prev) => ({ ...prev, jadwalDate: undefined }));
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white text-neutral-900 border text-sm font-medium transition-all shadow-xs ${
                          errors.jadwalDate
                            ? "border-red-500 bg-red-50/20"
                            : "border-neutral-200 hover:border-neutral-300 focus:border-[#307cff] focus:outline-none focus:ring-4 focus:ring-[#307cff]/15"
                        }`}
                      />
                      <Calendar className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3 pointer-events-none" />
                    </div>
                    {errors.jadwalDate && (
                      <p className="text-xs font-medium text-red-600 mt-1">
                        {errors.jadwalDate}
                      </p>
                    )}
                  </div>

                  {/* Time Picker */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="jadwalTime"
                      className="block text-xs font-bold text-neutral-700"
                    >
                      Waktu / Jam
                    </label>
                    <div className="relative">
                      <input
                        id="jadwalTime"
                        type="time"
                        value={cachedJadwalTime}
                        onChange={(e) => {
                          setCachedJadwalTime(e.target.value);
                          if (errors.jadwalTime)
                            setErrors((prev) => ({ ...prev, jadwalTime: undefined }));
                        }}
                        className={`w-full px-3.5 py-2.5 rounded-xl bg-white text-neutral-900 border text-sm font-medium transition-all shadow-xs ${
                          errors.jadwalTime
                            ? "border-red-500 bg-red-50/20"
                            : "border-neutral-200 hover:border-neutral-300 focus:border-[#307cff] focus:outline-none focus:ring-4 focus:ring-[#307cff]/15"
                        }`}
                      />
                      <Clock className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3 pointer-events-none" />
                    </div>
                    {errors.jadwalTime && (
                      <p className="text-xs font-medium text-red-600 mt-1">
                        {errors.jadwalTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button with vibrant #307cff accent color */}
            <div className="pt-4 flex justify-center">
              <button
                type="submit"
                disabled={submitting}
                className="w-40 py-3 px-6 rounded-xl bg-[#307cff] hover:bg-[#2563eb] active:scale-[0.98] text-white font-semibold text-sm transition-all duration-150 flex items-center justify-center shadow-lg shadow-[#307cff]/25 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
