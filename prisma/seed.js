"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Seeding database...");
    // Clean existing data
    await prisma.tamu.deleteMany({});
    await prisma.pegawai.deleteMany({});
    await prisma.resepsionis.deleteMany({});
    // Seed Resepsionis
    const hashedPassword = await bcryptjs_1.default.hash("password123", 10);
    const resepsionis1 = await prisma.resepsionis.create({
        data: {
            nama: "Siti Rahmawati",
            username: "resepsionis",
            password: hashedPassword,
        },
    });
    const adminPassword = await bcryptjs_1.default.hash("admin123", 10);
    await prisma.resepsionis.create({
        data: {
            nama: "Admin Tamu",
            username: "admin",
            password: adminPassword,
        },
    });
    console.log("Resepsionis seeded:", resepsionis1.username);
    // Seed Pegawai
    const pegawaiData = [
        { nama: "Dr. Ir. Budi Santoso, M.Kom", status: true },
        { nama: "Siti Nurhaliza, S.T.", status: false },
        { nama: "Ahmad Fauzi, M.M.", status: true },
        { nama: "Dewi Lestari, S.Kom", status: false },
        { nama: "Hendra Gunawan, S.E.", status: true },
        { nama: "Rina Kartika, S.Si.", status: false },
        { nama: "Doni Pratama, S.H.", status: true },
        { nama: "Maya Indah, M.Psi.", status: false },
        { nama: "Fajar Nugroho, M.T.", status: true },
        { nama: "Putri Anggraini, S.Ds.", status: false },
    ];
    const createdPegawai = [];
    for (const p of pegawaiData) {
        const created = await prisma.pegawai.create({ data: p });
        createdPegawai.push(created);
    }
    console.log(`Seeded ${createdPegawai.length} Pegawai.`);
    // Helpers for dates
    const now = new Date();
    const minutesAgo = (mins) => new Date(now.getTime() - mins * 60 * 1000);
    const hoursAgo = (hours) => new Date(now.getTime() - hours * 60 * 60 * 1000);
    const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const hoursAhead = (hours) => new Date(now.getTime() + hours * 60 * 60 * 1000);
    const daysAhead = (days) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    // Seed Tamu (covering: Dijadwalkan, Sedang Berkunjung, Selesai)
    const tamuList = [
        // 1. Sedang Berkunjung (waktuDatang != null, waktuKeluar == null, jadwalWaktu == null)
        {
            nama: "Aditya Pratama",
            asalInstansi: "PT Telkom Indonesia",
            keperluan: "Konsultasi teknis infrastruktur jaringan",
            idPegawai: createdPegawai[0].id, // Budi (true)
            waktuDatang: minutesAgo(45),
            waktuKeluar: null,
            jadwalWaktu: null,
            createdAt: minutesAgo(45),
        },
        // 2. Dijadwalkan (jadwalWaktu != null, waktuDatang == null, waktuKeluar == null)
        {
            nama: "Bambang Pamungkas",
            asalInstansi: "Kementerian Kominfo",
            keperluan: "Koordinasi program digitalisasi layanan publik",
            idPegawai: createdPegawai[1].id, // Siti Nurhaliza (false)
            waktuDatang: null,
            waktuKeluar: null,
            jadwalWaktu: hoursAhead(2),
            createdAt: hoursAgo(2),
        },
        // 3. Selesai (waktuDatang != null, waktuKeluar != null)
        {
            nama: "Citra Kirana",
            asalInstansi: "Universitas Indonesia",
            keperluan: "Penyerahan proposal riset kolaboratif",
            idPegawai: createdPegawai[2].id, // Ahmad Fauzi (true)
            waktuDatang: hoursAgo(4),
            waktuKeluar: hoursAgo(3),
            jadwalWaktu: null,
            createdAt: hoursAgo(4),
        },
        // 4. Dijadwalkan (jadwalWaktu != null, waktuDatang == null, waktuKeluar == null)
        {
            nama: "Dian Sastrowardoyo",
            asalInstansi: "PT Bank Mandiri (Persero) Tbk",
            keperluan: "Pembahasan integrasi payment gateway corporate",
            idPegawai: createdPegawai[3].id, // Dewi Lestari (false)
            waktuDatang: null,
            waktuKeluar: null,
            jadwalWaktu: daysAhead(1),
            createdAt: hoursAgo(5),
        },
        // 5. Sedang Berkunjung
        {
            nama: "Eko Prasetyo",
            asalInstansi: "PT Astra International",
            keperluan: "Pemeriksaan logistik dan audit inventaris",
            idPegawai: createdPegawai[4].id, // Hendra Gunawan (true)
            waktuDatang: minutesAgo(20),
            waktuKeluar: null,
            jadwalWaktu: null,
            createdAt: minutesAgo(20),
        },
        // 6. Selesai (asalnya Dijadwalkan, sudah datang dan sudah keluar)
        {
            nama: "Farhan Maulana",
            asalInstansi: "Dinas Pendidikan DKI Jakarta",
            keperluan: "Sosialisasi program beasiswa tahun 2027",
            idPegawai: createdPegawai[5].id, // Rina Kartika (false)
            waktuDatang: hoursAgo(6),
            waktuKeluar: hoursAgo(4),
            jadwalWaktu: hoursAgo(6),
            createdAt: daysAgo(1),
        },
        // 7. Dijadwalkan (jadwalWaktu != null, waktuDatang == null)
        {
            nama: "Gita Gutawa",
            asalInstansi: "Yayasan Musik Nusantara",
            keperluan: "Penyelenggaraan konser amal kemanusiaan",
            idPegawai: createdPegawai[7].id, // Maya Indah (false)
            waktuDatang: null,
            waktuKeluar: null,
            jadwalWaktu: daysAhead(2),
            createdAt: hoursAgo(8),
        },
        // 8. Sedang Berkunjung (asalnya dijadwalkan, sudah datang, belum keluar)
        {
            nama: "Hadi Syaputra",
            asalInstansi: "Badan Siber dan Sandi Negara (BSSN)",
            keperluan: "Peninjauan kepatuhan standar keamanan data",
            idPegawai: createdPegawai[1].id, // Siti Nurhaliza (false)
            waktuDatang: minutesAgo(15),
            waktuKeluar: null,
            jadwalWaktu: minutesAgo(30),
            createdAt: hoursAgo(10),
        },
        // 9. Selesai
        {
            nama: "Indah Permatasari",
            asalInstansi: "PT Paragon Technology and Innovation",
            keperluan: "Presentasi produk csr dan kemitraan",
            idPegawai: createdPegawai[6].id, // Doni Pratama (true)
            waktuDatang: hoursAgo(8),
            waktuKeluar: hoursAgo(6),
            jadwalWaktu: null,
            createdAt: hoursAgo(8),
        },
        // 10. Dijadwalkan
        {
            nama: "Joko Widodo",
            asalInstansi: "Pemerintah Kota Surakarta",
            keperluan: "Silaturahmi dan studi banding tata kelola kota",
            idPegawai: createdPegawai[3].id, // Dewi Lestari (false)
            waktuDatang: null,
            waktuKeluar: null,
            jadwalWaktu: daysAhead(3),
            createdAt: hoursAgo(12),
        },
        // 11. Sedang Berkunjung
        {
            nama: "Kartika Sari",
            asalInstansi: "PT GoTo Gojek Tokopedia Tbk",
            keperluan: "Diskusi integrasi API logistik dan fulfillment",
            idPegawai: createdPegawai[8].id, // Fajar Nugroho (true)
            waktuDatang: minutesAgo(35),
            waktuKeluar: null,
            jadwalWaktu: null,
            createdAt: minutesAgo(35),
        },
        // 12. Selesai
        {
            nama: "Lukman Hakim",
            asalInstansi: "Kantor Akuntan Publik Anwar & Rekan",
            keperluan: "Audit keuangan kuartal 4",
            idPegawai: createdPegawai[4].id, // Hendra Gunawan (true)
            waktuDatang: daysAgo(1),
            waktuKeluar: daysAgo(1),
            jadwalWaktu: null,
            createdAt: daysAgo(1),
        },
        // 13. Dijadwalkan
        {
            nama: "Mega Utami",
            asalInstansi: "Kompas Gramedia",
            keperluan: "Wawancara liputan khusus inovasi kantor",
            idPegawai: createdPegawai[9].id, // Putri Anggraini (false)
            waktuDatang: null,
            waktuKeluar: null,
            jadwalWaktu: daysAhead(4),
            createdAt: daysAgo(1),
        },
        // 14. Selesai
        {
            nama: "Naufal Zaki",
            asalInstansi: "Institut Teknologi Bandung",
            keperluan: "Kunjungan magang mahasiswa program studi informatika",
            idPegawai: createdPegawai[0].id, // Budi Santoso (true)
            waktuDatang: daysAgo(2),
            waktuKeluar: daysAgo(2),
            jadwalWaktu: null,
            createdAt: daysAgo(2),
        },
        // 15. Dijadwalkan
        {
            nama: "Oki Setiana",
            asalInstansi: "Rumah Zakat",
            keperluan: "Penyaluran dana santunan anak yatim",
            idPegawai: createdPegawai[5].id, // Rina Kartika (false)
            waktuDatang: null,
            waktuKeluar: null,
            jadwalWaktu: hoursAhead(6),
            createdAt: daysAgo(2),
        },
        // 16. Sedang Berkunjung
        {
            nama: "Prasetyo Wibowo",
            asalInstansi: "PT PLN (Persero)",
            keperluan: "Pengecekan gardu listrik dan instalasi cadangan daya",
            idPegawai: createdPegawai[2].id, // Ahmad Fauzi (true)
            waktuDatang: minutesAgo(10),
            waktuKeluar: null,
            jadwalWaktu: null,
            createdAt: minutesAgo(10),
        },
        // 17. Selesai
        {
            nama: "Qori Sandioriva",
            asalInstansi: "Duta Lingkungan Hidup",
            keperluan: "Kampanye pengurangan sampah plastik perkantoran",
            idPegawai: createdPegawai[6].id, // Doni Pratama (true)
            waktuDatang: daysAgo(3),
            waktuKeluar: daysAgo(3),
            jadwalWaktu: null,
            createdAt: daysAgo(3),
        },
        // 18. Dijadwalkan
        {
            nama: "Raden Mas Danang",
            asalInstansi: "Keraton Yogyakarta",
            keperluan: "Undangan resmi peringatan upacara adat",
            idPegawai: createdPegawai[7].id, // Maya Indah (false)
            waktuDatang: null,
            waktuKeluar: null,
            jadwalWaktu: daysAhead(5),
            createdAt: daysAgo(3),
        },
        // 19. Selesai
        {
            nama: "Salsabila Rahma",
            asalInstansi: "PT Shopee International Indonesia",
            keperluan: "Penjajakan kerja sama seller onboarding",
            idPegawai: createdPegawai[8].id, // Fajar Nugroho (true)
            waktuDatang: daysAgo(4),
            waktuKeluar: daysAgo(4),
            jadwalWaktu: null,
            createdAt: daysAgo(4),
        },
        // 20. Dijadwalkan
        {
            nama: "Taufik Hidayat",
            asalInstansi: "PBSI (Persatuan Bulutangkis Seluruh Indonesia)",
            keperluan: "Penyelenggaraan turnamen eksekutif antar perusahaan",
            idPegawai: createdPegawai[1].id, // Siti Nurhaliza (false)
            waktuDatang: null,
            waktuKeluar: null,
            jadwalWaktu: daysAhead(6),
            createdAt: daysAgo(4),
        },
        // 21. Sedang Berkunjung
        {
            nama: "Utari Damayanti",
            asalInstansi: "PT Unilever Indonesia Tbk",
            keperluan: "Diskusi supply chain dan pengadaan fasilitas kantor",
            idPegawai: createdPegawai[0].id, // Budi Santoso (true)
            waktuDatang: minutesAgo(5),
            waktuKeluar: null,
            jadwalWaktu: null,
            createdAt: minutesAgo(5),
        },
        // 22. Dijadwalkan
        {
            nama: "Vicky Prasetyo",
            asalInstansi: "Event Organizer Kreatif Gemilang",
            keperluan: "Presentasi konsep perayaan ulang tahun kantor",
            idPegawai: createdPegawai[3].id, // Dewi Lestari (false)
            waktuDatang: null,
            waktuKeluar: null,
            jadwalWaktu: daysAhead(7),
            createdAt: daysAgo(5),
        },
    ];
    for (const t of tamuList) {
        await prisma.tamu.create({
            data: {
                idResepsionis: resepsionis1.id,
                idPegawai: t.idPegawai,
                nama: t.nama,
                asalInstansi: t.asalInstansi,
                keperluan: t.keperluan,
                waktuDatang: t.waktuDatang,
                waktuKeluar: t.waktuKeluar,
                jadwalWaktu: t.jadwalWaktu,
                createdAt: t.createdAt,
            },
        });
    }
    console.log(`Seeded ${tamuList.length} Tamu entries.`);
    console.log("Seeding finished successfully!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
