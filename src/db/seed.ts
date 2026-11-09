import { db } from './index.ts';
import * as schema from './schema.ts';
import { 
  INITIAL_LAND_PARCELS, 
  INITIAL_PLANTING_SCHEDULES, 
  INITIAL_FERTILIZER_NEEDS, 
  KIOS_PUPUK_LIST, 
  INITIAL_HARVEST_RECORDS, 
  INITIAL_POST_HARVEST_LOSSES, 
  INITIAL_FIELD_ISSUES, 
  INITIAL_ACTIVITIES 
} from '../data/bangkaData.ts';

export async function seedDatabaseIfEmpty() {
  if (!db) {
    console.log('PostgreSQL database not configured. Skipping SQL seed.');
    return;
  }

  try {
    const existingParcels = await db.select().from(schema.landParcels).limit(1);
    if (existingParcels.length > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    console.log('Seeding initial Bangka data into PostgreSQL...');

    // 1. Land Parcels
    for (const p of INITIAL_LAND_PARCELS) {
      await db.insert(schema.landParcels).values({
        id: p.id,
        kodePetak: p.kodePetak,
        namaPetani: p.namaPetani,
        nik: p.nik,
        poktan: p.poktan,
        kecamatan: p.kecamatan,
        desa: p.desa,
        komoditas: p.komoditas,
        varietas: p.varietas,
        luasHa: Number(p.luasHa),
        phTanah: Number(p.phTanah),
        sistemIrigasi: p.sistemIrigasi,
        tahunTanam: p.tahunTanam || 2026,
        lat: p.koordinat?.lat ?? -1.95,
        lng: p.koordinat?.lng ?? 106.12,
        terakhirDiperbarui: p.terakhirDiperbarui || '2026-10-24',
      }).onConflictDoNothing();
    }

    // 2. Planting Schedules
    for (const s of INITIAL_PLANTING_SCHEDULES) {
      await db.insert(schema.plantingSchedules).values({
        id: s.id,
        kodeJadwal: s.kodeJadwal,
        kecamatan: s.kecamatan,
        komoditas: s.komoditas,
        musimTanam: s.musimTanam,
        luasRencanaHa: Number(s.luasRencanaHa),
        tanggalMulaiOlah: s.tanggalMulaiOlah,
        tanggalTanam: s.tanggalTanam,
        tanggalPupuk1: s.tanggalPupuk1,
        tanggalPupuk2: s.tanggalPupuk2,
        tanggalPanenEstimasi: s.tanggalPanenEstimasi,
        faseSaatIni: s.faseSaatIni,
        progresFasePersen: Number(s.progresFasePersen),
        indeksKlimatologi: s.indeksKlimatologi,
        rekomendasiAgroklimat: s.rekomendasiAgroklimat,
      }).onConflictDoNothing();
    }

    // 3. Fertilizer Needs
    for (const f of INITIAL_FERTILIZER_NEEDS) {
      await db.insert(schema.fertilizerNeeds).values({
        id: f.id,
        poktan: f.poktan,
        kecamatan: f.kecamatan,
        desa: f.desa,
        komoditas: f.komoditas,
        luasLahanHa: Number(f.luasLahanHa),
        kiosPenyalur: f.kiosPenyalur,
        kebutuhanUreaKg: Number(f.kebutuhanUreaKg),
        kebutuhanNpkKg: Number(f.kebutuhanNpkKg),
        kebutuhanOrganikKg: Number(f.kebutuhanOrganikKg),
        musimTanam: f.musimTanam,
        keterangan: f.keterangan || '',
      }).onConflictDoNothing();
    }

    // 4. Kios Pupuk
    for (const k of KIOS_PUPUK_LIST) {
      await db.insert(schema.kiosPupuk).values({
        id: k.id,
        namaKios: k.namaKios,
        kecamatan: k.kecamatan,
        desa: k.desa,
        alamat: k.alamat,
        penanggungJawab: k.penanggungJawab,
        kontak: k.kontak,
        statusOperasional: k.statusOperasional,
        ureaTon: Number(k.stokTersedia?.ureaTon || 0),
        npkTon: Number(k.stokTersedia?.npkTon || 0),
        organikTon: Number(k.stokTersedia?.organikTon || 0),
      }).onConflictDoNothing();
    }

    // 5. Harvest Records
    for (const h of INITIAL_HARVEST_RECORDS) {
      await db.insert(schema.harvestRecords).values({
        id: h.id,
        kodePanen: h.kodePanen,
        kodePetak: h.kodePetak,
        poktan: h.poktan,
        namaPetani: h.namaPetani,
        kecamatan: h.kecamatan,
        komoditas: h.komoditas,
        luasPanenHa: Number(h.luasPanenHa),
        estimasiProduksiTon: Number(h.estimasiProduksiTon),
        realisasiProduksiTon: Number(h.realisasiProduksiTon),
        deviasiPersen: Number(h.deviasiPersen),
        produktivitasTonPerHa: Number(h.produktivitasTonPerHa),
        tanggalPanen: h.tanggalPanen,
      }).onConflictDoNothing();
    }

    // 6. Post Harvest Losses
    for (const l of INITIAL_POST_HARVEST_LOSSES) {
      await db.insert(schema.postHarvestLosses).values({
        id: l.id,
        harvestRecordId: l.harvestRecordId,
        komoditas: l.komoditas,
        kecamatan: l.kecamatan,
        poktan: l.poktan,
        tahapKehilangan: l.tahapKehilangan,
        persentaseSusut: Number(l.persentaseSusut),
        bobotSusutKg: Number(l.bobotSusutKg),
        hargaSatuanRp: Number(l.hargaSatuanRp),
        totalKerugianRp: Number(l.totalKerugianRp),
        penyebabUtama: l.penyebabUtama,
        intervensiMekanisasi: l.intervensiMekanisasi,
      }).onConflictDoNothing();
    }

    // 7. Field Issues
    for (const fi of INITIAL_FIELD_ISSUES) {
      await db.insert(schema.fieldIssues).values({
        id: fi.id,
        kodeTiket: fi.kodeTiket,
        pelaporNama: fi.pelaporNama,
        pelaporPeran: fi.pelaporPeran,
        poktan: fi.poktan,
        kecamatan: fi.kecamatan,
        desa: fi.desa,
        kategoriMasalah: fi.kategoriMasalah,
        prioritas: fi.prioritas,
        deskripsi: fi.deskripsi,
        tanggalLapor: fi.tanggalLapor,
        status: fi.status,
        tindakLanjutPetugas: fi.tindakLanjutPetugas || '',
        petugasPpl: fi.petugasPpl || '',
        tanggalPenyelesaian: fi.tanggalPenyelesaian || '',
      }).onConflictDoNothing();
    }

    // 8. Activities
    for (const a of INITIAL_ACTIVITIES) {
      await db.insert(schema.activities).values({
        id: a.id,
        judul: a.judul,
        tanggal: a.tanggal,
        waktu: a.waktu,
        lokasi: a.lokasi,
        kecamatan: a.kecamatan,
        penyelenggara: a.penyelenggara,
        kategori: a.kategori,
        targetPeserta: a.targetPeserta,
        status: a.status,
        deskripsi: a.deskripsi,
      }).onConflictDoNothing();
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding initial data:', error);
  }
}
