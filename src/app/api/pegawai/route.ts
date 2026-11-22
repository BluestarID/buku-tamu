import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const pegawaiList = await prisma.pegawai.findMany({
      orderBy: { nama: "asc" },
    });
    return NextResponse.json(pegawaiList);
  } catch (error) {
    console.error("Failed to fetch pegawai:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data pegawai" },
      { status: 500 }
    );
  }
}
