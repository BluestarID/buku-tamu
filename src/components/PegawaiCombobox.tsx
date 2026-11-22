"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

export interface Pegawai {
  id: number;
  nama: string;
  status: boolean;
}

interface PegawaiComboboxProps {
  pegawaiList: Pegawai[];
  selectedId: number | null;
  onSelect: (pegawai: Pegawai) => void;
  error?: string;
}

export default function PegawaiCombobox({
  pegawaiList,
  selectedId,
  onSelect,
  error,
}: PegawaiComboboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedPegawai = pegawaiList.find((p) => p.id === selectedId);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  const filteredPegawai = pegawaiList.filter((p) =>
    p.nama.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger Button with clean white background and accent focus */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white text-neutral-900 border text-left text-sm font-medium transition-all shadow-xs ${
          error
            ? "border-red-500 bg-red-50/20"
            : isOpen
            ? "border-[#307cff] ring-4 ring-[#307cff]/15"
            : "border-neutral-200 hover:border-neutral-300"
        }`}
      >
        <span className="truncate">
          {selectedPegawai ? (
            <span className="flex items-center gap-2">
              <span className="font-medium">{selectedPegawai.nama}</span>
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  selectedPegawai.status ? "bg-emerald-500" : "bg-rose-500"
                }`}
                title={selectedPegawai.status ? "Tersedia" : "Tidak Tersedia"}
              />
            </span>
          ) : (
            <span className="text-neutral-400">Pilih Pegawai...</span>
          )}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-[#307cff]" : ""
          }`}
        />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search field */}
          <div className="p-2.5 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50/50">
            <Search className="w-4 h-4 text-neutral-400 shrink-0 ml-1.5" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama pegawai..."
              className="w-full bg-transparent text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none py-1"
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar">
            {filteredPegawai.length === 0 ? (
              <div className="py-5 text-center text-sm text-neutral-400 font-medium">
                Pegawai tidak ditemukan
              </div>
            ) : (
              filteredPegawai.map((pegawai) => {
                const isSelected = pegawai.id === selectedId;
                return (
                  <button
                    key={pegawai.id}
                    type="button"
                    onClick={() => {
                      onSelect(pegawai);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors text-left ${
                      isSelected
                        ? "bg-[#307cff]/10 text-[#307cff] font-semibold"
                        : "text-neutral-800 hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {isSelected && <Check className="w-4 h-4 shrink-0 text-[#307cff]" />}
                      <span className="truncate">{pegawai.nama}</span>
                    </div>

                    {/* Dot status indicator inside the dropdown only */}
                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          pegawai.status ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        title={pegawai.status ? "Tersedia" : "Tidak Tersedia"}
                      />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
