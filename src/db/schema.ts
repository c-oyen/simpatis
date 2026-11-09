import { pgTable, text, serial, doublePrecision, integer, timestamp } from 'drizzle-orm/pg-core';

// Users table for operator / auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').default('operator'),
  nama: text('nama'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Land Parcels (Data Petani & Lahan)
export const landParcels = pgTable('land_parcels', {
  id: text('id').primaryKey(),
  kodePetak: text('kode_petak').notNull(),
  namaPetani: text('nama_petani').notNull(),
  nik: text('nik').notNull(),
  poktan: text('poktan').notNull(),
  kecamatan: text('kecamatan').notNull(),
  desa: text('desa').notNull(),
  komoditas: text('komoditas').notNull(),
  varietas: text('varietas').notNull(),
  luasHa: doublePrecision('luas_ha').notNull(),
  phTanah: doublePrecision('ph_tanah').notNull(),
  sistemIrigasi: text('sistem_irigasi').notNull(),
  tahunTanam: integer('tahun_tanam').default(2026),
  lat: doublePrecision('lat').default(-1.95),
  lng: doublePrecision('lng').default(106.12),
  terakhirDiperbarui: text('terakhir_diperbarui').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Planting Schedules (Kalendar Tanam & Musim)
export const plantingSchedules = pgTable('planting_schedules', {
  id: text('id').primaryKey(),
  kodeJadwal: text('kode_jadwal').notNull(),
  kecamatan: text('kecamatan').notNull(),
  komoditas: text('komoditas').notNull(),
  musimTanam: text('musim_tanam').notNull(),
  luasRencanaHa: doublePrecision('luas_rencana_ha').notNull(),
  tanggalMulaiOlah: text('tanggal_mulai_olah').notNull(),
  tanggalTanam: text('tanggal_tanam').notNull(),
  tanggalPupuk1: text('tanggal_pupuk_1').notNull(),
  tanggalPupuk2: text('tanggal_pupuk_2').notNull(),
  tanggalPanenEstimasi: text('tanggal_panen_estimasi').notNull(),
  faseSaatIni: text('fase_saat_ini').notNull(),
  progresFasePersen: integer('progres_fase_persen').notNull(),
  indeksKlimatologi: text('indeks_klimatologi').notNull(),
  rekomendasiAgroklimat: text('rekomendasi_agroklimat').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Fertilizer Needs (Kebutuhan Pupuk)
export const fertilizerNeeds = pgTable('fertilizer_needs', {
  id: text('id').primaryKey(),
  poktan: text('poktan').notNull(),
  kecamatan: text('kecamatan').notNull(),
  desa: text('desa').notNull(),
  komoditas: text('komoditas').notNull(),
  luasLahanHa: doublePrecision('luas_lahan_ha').notNull(),
  kiosPenyalur: text('kios_penyalur').notNull(),
  kebutuhanUreaKg: doublePrecision('kebutuhan_urea_kg').notNull(),
  kebutuhanNpkKg: doublePrecision('kebutuhan_npk_kg').notNull(),
  kebutuhanOrganikKg: doublePrecision('kebutuhan_organik_kg').notNull(),
  musimTanam: text('musim_tanam').notNull(),
  keterangan: text('keterangan').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Kios Pupuk Lengkap (KPL)
export const kiosPupuk = pgTable('kios_pupuk', {
  id: text('id').primaryKey(),
  namaKios: text('nama_kios').notNull(),
  kecamatan: text('kecamatan').notNull(),
  desa: text('desa').notNull(),
  alamat: text('alamat').notNull(),
  penanggungJawab: text('penanggung_jawab').notNull(),
  kontak: text('kontak').notNull(),
  statusOperasional: text('status_operasional').notNull(),
  ureaTon: doublePrecision('urea_ton').default(0),
  npkTon: doublePrecision('npk_ton').default(0),
  organikTon: doublePrecision('organik_ton').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

// Harvest Records (Monitoring Produksi)
export const harvestRecords = pgTable('harvest_records', {
  id: text('id').primaryKey(),
  kodePanen: text('kode_panen').notNull(),
  kodePetak: text('kode_petak').notNull(),
  poktan: text('poktan').notNull(),
  namaPetani: text('nama_petani').notNull(),
  kecamatan: text('kecamatan').notNull(),
  komoditas: text('komoditas').notNull(),
  luasPanenHa: doublePrecision('luas_panen_ha').notNull(),
  estimasiProduksiTon: doublePrecision('estimasi_produksi_ton').notNull(),
  realisasiProduksiTon: doublePrecision('realisasi_produksi_ton').notNull(),
  deviasiPersen: doublePrecision('deviasi_persen').notNull(),
  produktivitasTonPerHa: doublePrecision('produktivitas_ton_per_ha').notNull(),
  tanggalPanen: text('tanggal_panen').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Post Harvest Losses (Pengendalian Kehilangan)
export const postHarvestLosses = pgTable('post_harvest_losses', {
  id: text('id').primaryKey(),
  harvestRecordId: text('harvest_record_id').notNull(),
  komoditas: text('komoditas').notNull(),
  kecamatan: text('kecamatan').notNull(),
  poktan: text('poktan').notNull(),
  tahapKehilangan: text('tahap_kehilangan').notNull(),
  persentaseSusut: doublePrecision('persentase_susut').notNull(),
  bobotSusutKg: doublePrecision('bobot_susut_kg').notNull(),
  hargaSatuanRp: doublePrecision('harga_satuan_rp').notNull(),
  totalKerugianRp: doublePrecision('total_kerugian_rp').notNull(),
  penyebabUtama: text('penyebab_utama').notNull(),
  intervensiMekanisasi: text('intervensi_mekanisasi').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Field Issues / Pengaduan Lapangan
export const fieldIssues = pgTable('field_issues', {
  id: text('id').primaryKey(),
  kodeTiket: text('kode_tiket').notNull(),
  pelaporNama: text('pelapor_nama').notNull(),
  pelaporPeran: text('pelapor_peran').notNull(),
  poktan: text('poktan').notNull(),
  kecamatan: text('kecamatan').notNull(),
  desa: text('desa').notNull(),
  kategoriMasalah: text('kategori_masalah').notNull(),
  prioritas: text('prioritas').notNull(),
  deskripsi: text('deskripsi').notNull(),
  tanggalLapor: text('tanggal_lapor').notNull(),
  status: text('status').notNull(),
  tindakLanjutPetugas: text('tindak_lanjut_petugas'),
  petugasPpl: text('petugas_ppl'),
  tanggalPenyelesaian: text('tanggal_penyelesaian'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Activities (Agenda Kegiatan Resmi)
export const activities = pgTable('activities', {
  id: text('id').primaryKey(),
  judul: text('judul').notNull(),
  tanggal: text('tanggal').notNull(),
  waktu: text('waktu').notNull(),
  lokasi: text('lokasi').notNull(),
  kecamatan: text('kecamatan').notNull(),
  penyelenggara: text('penyelenggara').notNull(),
  kategori: text('kategori').notNull(),
  targetPeserta: text('target_peserta').notNull(),
  status: text('status').notNull(),
  deskripsi: text('deskripsi').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
