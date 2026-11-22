"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Navbar from "@/components/Navbar";
import CatatButton from "@/components/CatatButton";
import { formatDateTime } from "@/lib/utils";
import {
  Search,
  ArrowDown,
  ArrowUp,
  Users,
  Loader2,
} from "lucide-react";

interface Pegawai {
  id: number;
  nama: string;
  status: boolean;
}

interface TamuItem {
  id: number;
  nama: string;
  asalInstansi: string;
  keperluan: string;
  waktuDatang: string | null;
  waktuKeluar: string | null;
  jadwalWaktu: string | null;
  createdAt: string;
  pegawai: Pegawai;
}

export default function SemuaTamuPage() {
  const [items, setItems] = useState<TamuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);

  // Search & Sort state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch initial batch when search or sortOrder changes
  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: "semua",
        search: debouncedSearch,
        order: sortOrder,
        limit: "15",
      });

      const res = await fetch(`/api/tamu?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setNextCursor(data.nextCursor);
      }
    } catch (err) {
      console.error("Failed to fetch semua tamu:", err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, sortOrder]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Infinite scroll: fetch next batch
  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        type: "semua",
        search: debouncedSearch,
        order: sortOrder,
        cursor: String(nextCursor),
        limit: "15",
      });

      const res = await fetch(`/api/tamu?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => [...prev, ...data.items]);
        setNextCursor(data.nextCursor);
      }
    } catch (err) {
      console.error("Failed to load more tamu:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Handle scroll on table container
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (
      target.scrollHeight - target.scrollTop <= target.clientHeight + 60 &&
      nextCursor &&
      !loadingMore
    ) {
      loadMore();
    }
  };

  // Optimistic UI updates
  const handleOptimisticUpdate = (
    tamuId: number,
    field: "waktuDatang" | "waktuKeluar",
    timestamp: string
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === tamuId ? { ...item, [field]: timestamp } : item
      )
    );
  };

  const handleRollback = (
    tamuId: number,
    field: "waktuDatang" | "waktuKeluar",
    previousValue: string | null
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === tamuId ? { ...item, [field]: previousValue } : item
      )
    );
  };

  // Helper to derive status badge dynamically as required
  const renderStatusBadge = (tamu: TamuItem) => {
    if (tamu.jadwalWaktu && !tamu.waktuDatang) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-300 shadow-xs select-none">
          Dijadwalkan
        </span>
      );
    }

    if (tamu.waktuDatang && !tamu.waktuKeluar) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#307cff] border border-blue-200 shadow-xs select-none">
          Sedang Berkunjung
        </span>
      );
    }

    if (tamu.waktuDatang && tamu.waktuKeluar) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-xs select-none">
          Selesai
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#307cff] border border-blue-200 shadow-xs select-none">
        Sedang Berkunjung
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50/40 flex flex-col">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 flex flex-col">
        {/* Page title and description */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
              Semua Tamu
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5 font-medium">
              Riwayat dan status seluruh kunjungan tamu secara komprehensif.
            </p>
          </div>
        </div>

        {/* Top Controls: Search & Asc/Desc Sort Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
          {/* Realtime Search across Nama and Pegawai */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama tamu atau pegawai..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-neutral-900 placeholder-neutral-400 border border-neutral-200 hover:border-neutral-300 focus:border-[#307cff] focus:outline-none focus:ring-4 focus:ring-[#307cff]/15 text-sm font-medium transition-all shadow-xs"
            />
          </div>

          {/* Sort Asc/Desc Toggle by createdAt with #307cff accent */}
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"))
              }
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:border-[#307cff] hover:text-[#307cff] border border-neutral-200 text-neutral-700 text-sm font-semibold transition-all shadow-xs active:scale-95"
              title="Urutkan berdasarkan waktu pendaftaran (createdAt)"
            >
              {sortOrder === "desc" ? (
                <>
                  <ArrowDown className="w-4 h-4 text-[#307cff]" />
                  <span>Terbaru (Desc)</span>
                </>
              ) : (
                <>
                  <ArrowUp className="w-4 h-4 text-[#307cff]" />
                  <span>Terlama (Asc)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Table Container supporting both Horizontal and Vertical Scrolling */}
        <div
          ref={tableContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-auto max-h-[calc(100vh-250px)] rounded-2xl border border-neutral-200 bg-white shadow-md shadow-neutral-200/50 custom-scrollbar"
        >
          <table className="w-full text-left border-collapse min-w-[1100px]">
            {/* Sticky Header with centered headers as requested */}
            <thead className="sticky top-0 z-20 bg-[#1e293b] text-white select-none">
              <tr className="border-b border-neutral-700 text-xs font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 w-14 text-center border-r border-neutral-700/60">
                  No
                </th>
                <th className="py-3.5 px-4 min-w-[160px] text-center border-r border-neutral-700/60">
                  Nama
                </th>
                <th className="py-3.5 px-4 min-w-[160px] text-center border-r border-neutral-700/60">
                  Asal Instansi
                </th>
                <th className="py-3.5 px-4 min-w-[180px] text-center border-r border-neutral-700/60">
                  Keperluan
                </th>
                <th className="py-3.5 px-4 min-w-[170px] text-center border-r border-neutral-700/60">
                  Pegawai
                </th>
                <th className="py-3.5 px-4 min-w-[150px] text-center border-r border-neutral-700/60">
                  Status
                </th>
                <th className="py-3.5 px-4 min-w-[150px] text-center border-r border-neutral-700/60">
                  Waktu Datang
                </th>
                <th className="py-3.5 px-4 min-w-[150px] text-center border-r border-neutral-700/60">
                  Waktu Keluar
                </th>
                <th className="py-3.5 px-4 min-w-[160px] text-center">
                  Jadwal Waktu
                </th>
              </tr>
            </thead>

            {/* Table Body with alternating row colors */}
            <tbody className="divide-y divide-neutral-150 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-neutral-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#307cff]" />
                      <p className="font-semibold text-sm text-neutral-600">Memuat data semua tamu...</p>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                /* Creative Empty State */
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="max-w-xs mx-auto flex flex-col items-center justify-center text-center p-6">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#307cff] flex items-center justify-center mb-3 shadow-inner">
                        <Users className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-neutral-800">
                        Belum ada data tamu.
                      </h4>
                      <p className="text-xs text-neutral-500 mt-1">
                        {search
                          ? "Tidak ditemukan tamu atau pegawai yang sesuai kata kunci pencarian."
                          : "Data tamu yang baru dicatat akan muncul secara otomatis di tabel ini."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((tamu, index) => (
                  <tr
                    key={tamu.id}
                    className={`transition-colors ${
                      index % 2 === 0
                        ? "bg-white hover:bg-blue-50/40"
                        : "bg-blue-50/20 hover:bg-blue-50/50"
                    }`}
                  >
                    {/* No */}
                    <td className="py-3.5 px-4 text-center text-neutral-500 font-medium border-r border-neutral-100">
                      {index + 1}
                    </td>

                    {/* Nama */}
                    <td className="py-3.5 px-4 font-semibold text-neutral-900 border-r border-neutral-100">
                      {tamu.nama}
                    </td>

                    {/* Asal Instansi */}
                    <td className="py-3.5 px-4 text-neutral-700 font-medium border-r border-neutral-100">
                      {tamu.asalInstansi}
                    </td>

                    {/* Keperluan */}
                    <td className="py-3.5 px-4 text-neutral-600 border-r border-neutral-100 text-xs leading-relaxed max-w-xs truncate" title={tamu.keperluan}>
                      {tamu.keperluan}
                    </td>

                    {/* Pegawai: dot indicator REMOVED as requested */}
                    <td className="py-3.5 px-4 text-neutral-800 font-medium border-r border-neutral-100">
                      <span className="truncate">{tamu.pegawai?.nama}</span>
                    </td>

                    {/* Status Column: Derived non-clickable badge pill */}
                    <td className="py-3.5 px-4 text-center border-r border-neutral-100 whitespace-nowrap">
                      {renderStatusBadge(tamu)}
                    </td>

                    {/* Waktu Datang:
                        - If scheduled visit (jadwalWaktu not null) AND waktuDatang is null -> Catat button
                        - If normal visit (jadwalWaktu null) -> timestamp text
                        - If waktuDatang is not null regardless of type -> timestamp text */}
                    <td className="py-3.5 px-4 text-center border-r border-neutral-100 whitespace-nowrap">
                      {tamu.jadwalWaktu && !tamu.waktuDatang ? (
                        <CatatButton
                          tamuId={tamu.id}
                          field="waktuDatang"
                          currentValue={tamu.waktuDatang}
                          onOptimisticUpdate={handleOptimisticUpdate}
                          onRollback={handleRollback}
                        />
                      ) : (
                        <span className="font-semibold text-neutral-700 text-xs bg-neutral-100 px-2.5 py-1 rounded-lg">
                          {formatDateTime(tamu.waktuDatang)}
                        </span>
                      )}
                    </td>

                    {/* Waktu Keluar: always show Catat button if null, timestamp if filled */}
                    <td className="py-3.5 px-4 text-center border-r border-neutral-100 whitespace-nowrap">
                      {tamu.waktuKeluar ? (
                        <span className="font-semibold text-neutral-700 text-xs bg-neutral-100 px-2.5 py-1 rounded-lg">
                          {formatDateTime(tamu.waktuKeluar)}
                        </span>
                      ) : (
                        <CatatButton
                          tamuId={tamu.id}
                          field="waktuKeluar"
                          currentValue={tamu.waktuKeluar}
                          onOptimisticUpdate={handleOptimisticUpdate}
                          onRollback={handleRollback}
                        />
                      )}
                    </td>

                    {/* Jadwal Waktu:
                        - If jadwalWaktu is not null -> timestamp text
                        - If jadwalWaktu is null (non-scheduled visit) -> centered em dash "—" */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {tamu.jadwalWaktu ? (
                        <span className="font-semibold text-neutral-700 text-xs bg-neutral-100 px-2.5 py-1 rounded-lg">
                          {formatDateTime(tamu.jadwalWaktu)}
                        </span>
                      ) : (
                        <span className="text-neutral-400 font-bold">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Infinite Scroll Loading indicator */}
          {loadingMore && (
            <div className="py-3 bg-neutral-50/70 border-t border-neutral-200 flex items-center justify-center gap-2 text-xs text-neutral-600 font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-[#307cff]" />
              <span>Memuat data berikutnya...</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
