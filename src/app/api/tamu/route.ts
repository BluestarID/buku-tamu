import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { nama, asalInstansi, keperluan, idPegawai, jadwalWaktu } = body;

    // Validation
    if (!nama?.trim() || !asalInstansi?.trim() || !keperluan?.trim() || !idPegawai) {
      return NextResponse.json(
        { error: "Semua data wajib diisi" },
        { status: 400 }
      );
    }

    const pegawai = await prisma.pegawai.findUnique({
      where: { id: Number(idPegawai) },
    });

    if (!pegawai) {
      return NextResponse.json(
        { error: "Pegawai tidak ditemukan" },
        { status: 400 }
      );
    }

    // Determine idResepsionis
    let idResepsionis = 1;
    if (session?.user && (session.user as unknown as { id: string }).id) {
      idResepsionis = Number((session.user as unknown as { id: string }).id);
    } else {
      const defaultResepsionis = await prisma.resepsionis.findFirst();
      if (defaultResepsionis) {
        idResepsionis = defaultResepsionis.id;
      }
    }

    let waktuDatang: Date | null = null;
    let finalJadwalWaktu: Date | null = null;

    if (pegawai.status) {
      // If pegawai is available (status: true): set waktuDatang = now() automatically
      waktuDatang = new Date();
      finalJadwalWaktu = null;
    } else {
      // If pegawai is unavailable (status: false): save jadwalWaktu, waktuDatang = null
      if (!jadwalWaktu) {
        return NextResponse.json(
          { error: "Jadwal waktu wajib diisi untuk pegawai yang tidak tersedia" },
          { status: 400 }
        );
      }
      finalJadwalWaktu = new Date(jadwalWaktu);
      waktuDatang = null;
    }

    const newTamu = await prisma.tamu.create({
      data: {
        idResepsionis,
        idPegawai: pegawai.id,
        nama: nama.trim(),
        asalInstansi: asalInstansi.trim(),
        keperluan: keperluan.trim(),
        waktuDatang,
        waktuKeluar: null,
        jadwalWaktu: finalJadwalWaktu,
      },
      include: {
        pegawai: true,
      },
    });

    return NextResponse.json(newTamu, { status: 201 });
  } catch (error) {
    console.error("Failed to create tamu:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data tamu" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // "jadwal" | "semua"
    const search = searchParams.get("search")?.trim() || "";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

    // Build Prisma where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (type === "jadwal") {
      where.jadwalWaktu = { not: null };
    }

    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { pegawai: { nama: { contains: search } } },
      ];
    }

    const items = await prisma.tamu.findMany({
      where,
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: Number(cursor) } : undefined,
      orderBy: [{ createdAt: order }, { id: order }],
      include: {
        pegawai: true,
      },
    });

    let nextCursor: number | null = null;
    let resultItems = items;
    if (items.length > limit) {
      const extraItem = items.pop();
      nextCursor = items[items.length - 1].id;
      resultItems = items;
    }

    return NextResponse.json({
      items: resultItems,
      nextCursor,
    });
  } catch (error) {
    console.error("Failed to fetch tamu list:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data tamu" },
      { status: 500 }
    );
  }
}
