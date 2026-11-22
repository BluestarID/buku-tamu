"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!username.trim() || !password) {
      setErrorMessage("Username atau password salah. Silakan coba lagi.");
      return;
    }

    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username: username.trim(),
        password,
      });

      if (res?.error) {
        setErrorMessage("Username atau password salah. Silakan coba lagi.");
        setLoading(false);
      } else {
        router.push("/form-tamu");
        router.refresh();
      }
    } catch {
      setErrorMessage("Username atau password salah. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50/50 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-neutral-200/60 border border-neutral-100 p-8 sm:p-10">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#307cff]/10 text-[#307cff] font-bold text-xl mb-3">
            BT
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Masuk Aplikasi
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-medium">
            Sistem Informasi Buku Tamu Resepsionis
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-neutral-800"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#307cff] focus:outline-none focus:ring-4 focus:ring-[#307cff]/15 transition-all text-sm font-medium"
              placeholder="Masukkan username"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-neutral-800"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              required
              className="w-full px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#307cff] focus:outline-none focus:ring-4 focus:ring-[#307cff]/15 transition-all text-sm font-medium"
              placeholder="Masukkan password"
            />
          </div>

          <div className="pt-2 flex flex-col items-center">
            {/* Submit button with vibrant #307cff accent color */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-xl bg-[#307cff] hover:bg-[#2563eb] active:scale-[0.98] text-white font-semibold text-sm transition-all duration-150 flex items-center justify-center shadow-lg shadow-[#307cff]/25 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                "Masuk"
              )}
            </button>

            {/* Error message directly under the submit button as specified */}
            {errorMessage && (
              <p
                role="alert"
                className="mt-3.5 text-center text-sm font-medium text-rose-600 animate-in fade-in duration-200"
              >
                {errorMessage}
              </p>
            )}
          </div>
        </form>

        <div className="mt-8 pt-5 border-t border-neutral-100 text-center text-xs text-neutral-500">
          Akun demo: <span className="font-semibold text-neutral-800">resepsionis</span> / <span className="font-semibold text-neutral-800">password123</span>
        </div>
      </div>
    </div>
  );
}
