import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tamuId = Number(id);

    if (isNaN(tamuId)) {
      return NextResponse.json({ error: "ID Tamu tidak valid" }, { status: 400 });
    }

    const body = await req.json();
    const { field } = body;

    if (field !== "waktuDatang" && field !== "waktuKeluar") {
      return NextResponse.json(
        { error: "Field harus berupa 'waktuDatang' atau 'waktuKeluar'" },
        { status: 400 }
      );
    }

    const now = new Date();
    const updated = await prisma.tamu.update({
      where: { id: tamuId },
      data: {
        [field]: now,
      },
      include: {
        pegawai: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update tamu:", error);
    return NextResponse.json(
      { error: "Gagal mencatat waktu" },
      { status: 500 }
    );
  }
}
