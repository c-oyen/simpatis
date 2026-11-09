import { 
  CommodityInfo, 
  KecamatanInfo, 
  LandParcel, 
  PlantingSchedule, 
  KiosPupukInfo,
  FertilizerNeedRecord,
  HarvestRecord, 
  PostHarvestLoss,
  EconomicImpactSummary,
  ActivityEvent,
  FieldIssue,
  StakeholderMessage,
  EarlyWarningAlert,
  KecamatanBangka
} from '../types';

export const COMMODITIES: CommodityInfo[] = [
  {
    id: 'padi_sawah',
    nama: 'Padi Sawah',
    namaIlmiah: 'Oryza sativa L. (Sawah Irigasi & Tadah Hujan)',
    kategori: 'Pangan',
    icon: 'Wheat',
    satuan: 'Ton',
    hargaAcuanRp: 6900, // per kg GKP
    siklusTanamHari: 115,
    dosisPupukPerHa: {
      ureaKg: 200,
      npkKg: 300,
      sp36Kg: 100,
      dolomitKg: 500,
      organikKg: 2000
    },
    deskripsi: 'Sentra lumbung beras mandiri Bangka terpusat di Mendo Barat, Puding Besar, dan Riau Silip dengan sistem irigasi teknis dan semi-teknis.'
  },
  {
    id: 'padi_ladang',
    nama: 'Padi Ladang',
    namaIlmiah: 'Oryza sativa L. (Padi Gogo Lahan Kering)',
    kategori: 'Pangan',
    icon: 'Wheat',
    satuan: 'Ton',
    hargaAcuanRp: 7500, // per kg gabah kering panen
    siklusTanamHari: 130,
    dosisPupukPerHa: {
      ureaKg: 175,
      npkKg: 250,
      sp36Kg: 80,
      dolomitKg: 600,
      organikKg: 2500
    },
    deskripsi: 'Budidaya padi gogo tradisional lahan kering khas Bangka, toleran kekeringan dan tanah masam Podsolik Merah Kuning.'
  },
  {
    id: 'cabai_rawit',
    nama: 'Cabai Rawit',
    namaIlmiah: 'Capsicum frutescens',
    kategori: 'Hortikultura',
    icon: 'Flame',
    satuan: 'Kg',
    hargaAcuanRp: 48000, // per kg
    siklusTanamHari: 90,
    dosisPupukPerHa: {
      ureaKg: 150,
      npkKg: 350,
      sp36Kg: 150,
      dolomitKg: 800,
      organikKg: 5000
    },
    deskripsi: 'Komoditas hortikultura penyumbang inflasi utama daerah Bangka dengan produktivitas panen berulang mingguan.'
  },
  {
    id: 'cabai_besar',
    nama: 'Cabai Besar',
    namaIlmiah: 'Capsicum annuum L. var. acuminatum',
    kategori: 'Hortikultura',
    icon: 'Flame',
    satuan: 'Kg',
    hargaAcuanRp: 38000, // per kg
    siklusTanamHari: 85,
    dosisPupukPerHa: {
      ureaKg: 160,
      npkKg: 380,
      sp36Kg: 150,
      dolomitKg: 800,
      organikKg: 4500
    },
    deskripsi: 'Cabai TW/Teropong merah tebal untuk kebutuhan pasar basah dan pasokan kuliner olahan khas Bangka.'
  },
  {
    id: 'cabai_merah_keriting',
    nama: 'Cabai Merah Keriting',
    namaIlmiah: 'Capsicum annuum L.',
    kategori: 'Hortikultura',
    icon: 'Flame',
    satuan: 'Kg',
    hargaAcuanRp: 45000, // per kg
    siklusTanamHari: 80,
    dosisPupukPerHa: {
      ureaKg: 150,
      npkKg: 360,
      sp36Kg: 140,
      dolomitKg: 800,
      organikKg: 5000
    },
    deskripsi: 'Komoditas hortikultura unggulan dengan permintaan harian tertinggi di pasar Sungailiat, Belinyu, dan Pangkalpinang.'
  }
];

export const KECAMATAN_LIST: KecamatanInfo[] = [
  {
    nama: 'Sungailiat',
    luasWilayahKm2: 146.59,
    totalLahanTaniHa: 4820,
    komoditasUnggulan: ['cabai_merah_keriting', 'cabai_rawit', 'padi_sawah'],
    jumlahPoktan: 52,
    koordinatorPpl: 'Ir. Hendra Kusuma, M.Si',
    kontakPpl: '0812-7890-1122',
    pusatBpp: 'BPP Sungailiat (Jl. Jenderal Sudirman)',
    koordinat: { lat: -1.8624, lng: 106.1212 }
  },
  {
    nama: 'Belinyu',
    luasWilayahKm2: 546.50,
    totalLahanTaniHa: 14200,
    komoditasUnggulan: ['padi_ladang', 'cabai_rawit', 'cabai_besar'],
    jumlahPoktan: 78,
    koordinatorPpl: 'Rustam Effendi, S.Pt',
    kontakPpl: '0813-6712-4433',
    pusatBpp: 'BPP Belinyu (Jl. Mayor Syafrie)',
    koordinat: { lat: -1.6372, lng: 105.7725 }
  },
  {
    nama: 'Merawang',
    luasWilayahKm2: 204.60,
    totalLahanTaniHa: 8950,
    komoditasUnggulan: ['cabai_merah_keriting', 'padi_sawah', 'cabai_rawit'],
    jumlahPoktan: 64,
    koordinatorPpl: 'Dra. Siti Rahmah, S.P',
    kontakPpl: '0852-6901-7788',
    pusatBpp: 'BPP Merawang (Desa Batu Rusa)',
    koordinat: { lat: -2.0465, lng: 106.0963 }
  },
  {
    nama: 'Mendo Barat',
    luasWilayahKm2: 574.91,
    totalLahanTaniHa: 21400,
    komoditasUnggulan: ['padi_sawah', 'padi_ladang', 'cabai_besar'],
    jumlahPoktan: 96,
    koordinatorPpl: 'Ahmad Baihaqi, S.P',
    kontakPpl: '0811-7170-8899',
    pusatBpp: 'BPP Mendo Barat (Desa Petaling Banjar)',
    koordinat: { lat: -2.1554, lng: 105.9782 }
  },
  {
    nama: 'Pemali',
    luasWilayahKm2: 128.80,
    totalLahanTaniHa: 5640,
    komoditasUnggulan: ['cabai_rawit', 'cabai_merah_keriting', 'padi_sawah'],
    jumlahPoktan: 48,
    koordinatorPpl: 'Nurjanah, S.Pt',
    kontakPpl: '0821-8234-5566',
    pusatBpp: 'BPP Pemali (Desa Air Duren)',
    koordinat: { lat: -1.8901, lng: 106.0504 }
  },
  {
    nama: 'Bakam',
    luasWilayahKm2: 433.00,
    totalLahanTaniHa: 16300,
    komoditasUnggulan: ['padi_ladang', 'cabai_besar', 'padi_sawah'],
    jumlahPoktan: 68,
    koordinatorPpl: 'Yusuf Maulana, S.P',
    kontakPpl: '0813-7345-9900',
    pusatBpp: 'BPP Bakam (Desa Tiang Tara)',
    koordinat: { lat: -1.9723, lng: 105.8895 }
  },
  {
    nama: 'Riau Silip',
    luasWilayahKm2: 494.60,
    totalLahanTaniHa: 13800,
    komoditasUnggulan: ['padi_sawah', 'padi_ladang', 'cabai_merah_keriting'],
    jumlahPoktan: 72,
    koordinatorPpl: 'Bambang Supriyadi, S.TP',
    kontakPpl: '0812-7199-4455',
    pusatBpp: 'BPP Riau Silip (Desa Cit)',
    koordinat: { lat: -1.7482, lng: 105.9125 }
  },
  {
    nama: 'Puding Besar',
    luasWilayahKm2: 387.60,
    totalLahanTaniHa: 12400,
    komoditasUnggulan: ['padi_sawah', 'cabai_rawit', 'cabai_besar'],
    jumlahPoktan: 62,
    koordinatorPpl: 'Wahyudi, S.P',
    kontakPpl: '0853-8012-3344',
    pusatBpp: 'BPP Puding Besar (Desa Kayu Besi)',
    koordinat: { lat: -2.0125, lng: 105.9912 }
  }
];

export const DESA_PER_KECAMATAN: Record<KecamatanBangka, string[]> = {
  'Sungailiat': [
    'Sungailiat', 'Sri Menanti', 'Kuday', 'Sinar Baru', 'Parit Padang', 
    'Kenanga', 'Rebo', 'Surya Timur', 'Matras', 'Jelitik', 'Bukit Betung', 'Lubuk Kelik', 'Sinar Jaya Jelutung'
  ],
  'Belinyu': [
    'Belinyu', 'Kuto Panji', 'Remodong Indah', 'Bukit Ketok', 'Mantung', 
    'Air Asam', 'Air Jukung', 'Bintet', 'Gunung Muda', 'Gunung Pelawan', 'Lumut', 'Riding Panjang'
  ],
  'Merawang': [
    'Merawang', 'Batu Rusa', 'Kimak', 'Balunijuk', 'Jurung', 'Air Anyir', 
    'Jada Bahrin', 'Pagarawan', 'Riding Panjang', 'Dwi Makmur'
  ],
  'Mendo Barat': [
    'Kemuja', 'Petaling', 'Petaling Banjar', 'Zed', 'Paya Benua', 
    'Labu', 'Kota Kapur', 'Penagan', 'Rukam', 'Cengkong Abang', 
    'Mendo', 'Air Buluh', 'Air Duren', 'Kace', 'Kace Timur'
  ],
  'Pemali': [
    'Air Duren', 'Air Ruai', 'Karya Makmur', 'Pemali', 'Penyamun', 'Sempan'
  ],
  'Bakam': [
    'Bakam', 'Bukit Layang', 'Dalil', 'Kapuk', 'Mabat', 'Mangka', 'Maras Senang', 'Neknang', 'Tiang Tarah'
  ],
  'Riau Silip': [
    'Riau', 'Silip', 'Berbura', 'Cit', 'Deniang', 'Mapur', 'Pangkal Niur', 'Pugul', 'Banyu Asin'
  ],
  'Puding Besar': [
    'Puding Besar', 'Kayu Besi', 'Kotawaringin', 'Labu', 'Saing', 'Tanah Bawah', 'Nibung'
  ]
};

/**
 * Format label desa atau kelurahan:
 * Khusus Kecamatan Sungailiat, semua adalah "Kelurahan", KECUALI "Rebo" yang tetap "Desa Rebo".
 * Untuk kecamatan lainnya, tetap "Desa ...".
 */
export function formatDesaKelurahan(kecamatan?: string, desa?: string): string {
  if (!desa) return '';
  const cleanDesa = desa.trim();
  const desaLower = cleanDesa.toLowerCase();

  if (desaLower.startsWith('kelurahan ') || desaLower.startsWith('desa ')) {
    return cleanDesa;
  }

  if (kecamatan === 'Sungailiat') {
    if (desaLower === 'rebo') {
      return `Desa ${cleanDesa}`;
    }
    return `Kelurahan ${cleanDesa}`;
  }

  return `Desa ${cleanDesa}`;
}

/**
 * Label field input: khusus Kecamatan Sungailiat menggunakan "Kelurahan / Desa", kecamatan lainnya "Desa"
 */
export function getDesaFieldLabel(kecamatan?: string): string {
  if (kecamatan === 'Sungailiat') {
    return 'Kelurahan / Desa';
  }
  return 'Desa';
}

export const INITIAL_LAND_PARCELS: LandParcel[] = [
  {
    id: 'LP-BGK-001',
    kodePetak: 'PETAK-MB-001',
    namaPetani: 'Zulkifli Mansur',
    nik: '1901041203780002',
    poktan: 'Poktan Maju Bersama',
    kecamatan: 'Mendo Barat',
    desa: 'Kemuja',
    komoditas: 'padi_sawah',
    varietas: 'Inpari 32 HDB',
    luasHa: 2.5,
    phTanah: 5.4,
    jenisTanah: 'Aluvial',
    koordinat: { lat: -2.148, lng: 105.981 },
    tahunTanam: 2025,
    sistemIrigasi: 'Irigasi',
    terakhirDiperbarui: '2026-10-18'
  },
  {
    id: 'LP-BGK-002',
    kodePetak: 'PETAK-BL-004',
    namaPetani: 'H. Ruslan Effendi',
    nik: '1901021405750001',
    poktan: 'Gapoktan Sahabat Tani',
    kecamatan: 'Belinyu',
    desa: 'Gunung Muda',
    komoditas: 'padi_ladang',
    varietas: 'Lokal Inpago 9',
    luasHa: 3.0,
    phTanah: 4.8,
    jenisTanah: 'Podsolik Merah Kuning (Ultisol)',
    koordinat: { lat: -1.642, lng: 105.781 },
    tahunTanam: 2024,
    sistemIrigasi: 'Tadah Hujan',
    terakhirDiperbarui: '2026-10-17'
  },
  {
    id: 'LP-BGK-003',
    kodePetak: 'PETAK-SL-009',
    namaPetani: 'Bujang Sanusi',
    nik: '1901010809800004',
    poktan: 'Poktan Sinar Harapan',
    kecamatan: 'Sungailiat',
    desa: 'Rebo',
    komoditas: 'cabai_merah_keriting',
    varietas: 'Lado F1',
    luasHa: 1.2,
    phTanah: 6.0,
    jenisTanah: 'Latosol',
    koordinat: { lat: -1.874, lng: 106.135 },
    tahunTanam: 2026,
    sistemIrigasi: 'Embung / Sumur Bor',
    terakhirDiperbarui: '2026-10-19'
  },
  {
    id: 'LP-BGK-004',
    kodePetak: 'PETAK-MR-003',
    namaPetani: 'Samsuri',
    nik: '1901032511820003',
    poktan: 'Poktan Makmur Sentosa',
    kecamatan: 'Merawang',
    desa: 'Kimak',
    komoditas: 'cabai_rawit',
    varietas: 'Ori 212',
    luasHa: 1.0,
    phTanah: 5.6,
    jenisTanah: 'Podsolik Merah Kuning (Ultisol)',
    koordinat: { lat: -2.039, lng: 106.082 },
    tahunTanam: 2026,
    sistemIrigasi: 'Embung / Sumur Bor',
    terakhirDiperbarui: '2026-10-20'
  },
  {
    id: 'LP-BGK-005',
    kodePetak: 'PETAK-PD-012',
    namaPetani: 'M. Taufik Hidayat',
    nik: '1901081604790001',
    poktan: 'Poktan Tunas Baru',
    kecamatan: 'Puding Besar',
    desa: 'Kayu Besi',
    komoditas: 'cabai_besar',
    varietas: 'Gada MK F1',
    luasHa: 1.5,
    phTanah: 5.8,
    jenisTanah: 'Aluvial',
    koordinat: { lat: -2.021, lng: 105.998 },
    tahunTanam: 2025,
    sistemIrigasi: 'Irigasi',
    terakhirDiperbarui: '2026-10-18'
  },
  {
    id: 'LP-BGK-006',
    kodePetak: 'PETAK-RS-007',
    namaPetani: 'Junaidi Arsyad',
    nik: '1901072908840002',
    poktan: 'Poktan Sumber Rejeki',
    kecamatan: 'Riau Silip',
    desa: 'Cit',
    komoditas: 'padi_sawah',
    varietas: 'Inpari 42 Agritan',
    luasHa: 2.0,
    phTanah: 5.2,
    jenisTanah: 'Aluvial',
    koordinat: { lat: -1.752, lng: 105.921 },
    tahunTanam: 2025,
    sistemIrigasi: 'Irigasi',
    terakhirDiperbarui: '2026-10-16'
  },
  {
    id: 'LP-BGK-007',
    kodePetak: 'PETAK-BK-002',
    namaPetani: 'Kasim Wijaya',
    nik: '1901061907770003',
    poktan: 'Poktan Bina Tani',
    kecamatan: 'Bakam',
    desa: 'Mangka',
    komoditas: 'padi_ladang',
    varietas: 'Inpago 8',
    luasHa: 1.8,
    phTanah: 4.9,
    jenisTanah: 'Podsolik Merah Kuning (Ultisol)',
    koordinat: { lat: -1.981, lng: 105.892 },
    tahunTanam: 2024,
    sistemIrigasi: 'Tadah Hujan',
    terakhirDiperbarui: '2026-10-15'
  },
  {
    id: 'LP-BGK-008',
    kodePetak: 'PETAK-PM-005',
    namaPetani: 'Suwandi',
    nik: '1901050302860001',
    poktan: 'Poktan Harapan Jaya',
    kecamatan: 'Pemali',
    desa: 'Air Duren',
    komoditas: 'cabai_rawit',
    varietas: 'Bara F1',
    luasHa: 0.8,
    phTanah: 5.7,
    jenisTanah: 'Latosol',
    koordinat: { lat: -1.895, lng: 106.048 },
    tahunTanam: 2026,
    sistemIrigasi: 'Embung / Sumur Bor',
    terakhirDiperbarui: '2026-10-21'
  }
];

export const INITIAL_PLANTING_SCHEDULES: PlantingSchedule[] = [
  {
    id: 'CAL-001',
    kodeJadwal: 'MT-PADI-MB-2026-1',
    kecamatan: 'Mendo Barat',
    komoditas: 'padi_sawah',
    musimTanam: 'MT I (Rendengan/Penghujan)',
    luasRencanaHa: 120.0,
    tanggalMulaiOlah: '2026-10-01',
    tanggalTanam: '2026-10-20',
    tanggalPupuk1: '2026-11-05',
    tanggalPupuk2: '2026-11-25',
    tanggalPanenEstimasi: '2027-02-15',
    faseSaatIni: 'Penyemaian / Penanaman',
    progresFasePersen: 85,
    indeksKlimatologi: 'Optimal',
    rekomendasiAgroklimat: 'Kondisi curah hujan 150-200 mm/bulan sangat cocok untuk persemaian bibit padi dan olah tanah basah.',
    peringatanOpt: ['Wereng Batang Coklat (WBC)', 'Penggerek Batang Padi']
  },
  {
    id: 'CAL-002',
    kodeJadwal: 'MT-CBR-SL-2026-2',
    kecamatan: 'Sungailiat',
    komoditas: 'cabai_merah_keriting',
    musimTanam: 'MT II (Gadu/Transisi)',
    luasRencanaHa: 18.5,
    tanggalMulaiOlah: '2026-09-15',
    tanggalTanam: '2026-10-05',
    tanggalPupuk1: '2026-10-18',
    tanggalPupuk2: '2026-11-05',
    tanggalPanenEstimasi: '2026-12-25',
    faseSaatIni: 'Vegetatif & Pemupukan I',
    progresFasePersen: 65,
    indeksKlimatologi: 'Optimal',
    rekomendasiAgroklimat: 'Pengaturan bedengan tinggi dan mulsa plastik perak untuk menjaga kelembapan serta mencegah layu fusarium.',
    peringatanOpt: ['Kutu Daun (Thrips)', 'Antraknosa (Patek)']
  },
  {
    id: 'CAL-003',
    kodeJadwal: 'MT-CBRW-MR-2026-1',
    kecamatan: 'Merawang',
    komoditas: 'cabai_rawit',
    musimTanam: 'MT I (Rendengan/Penghujan)',
    luasRencanaHa: 14.0,
    tanggalMulaiOlah: '2026-09-20',
    tanggalTanam: '2026-10-10',
    tanggalPupuk1: '2026-10-25',
    tanggalPupuk2: '2026-11-15',
    tanggalPanenEstimasi: '2027-01-10',
    faseSaatIni: 'Vegetatif & Pemupukan I',
    progresFasePersen: 45,
    indeksKlimatologi: 'Waspada Curah Hujan Tinggi',
    rekomendasiAgroklimat: 'Perhatikan drainase pembuang agar piringan tanaman cabai tidak tergenang.',
    peringatanOpt: ['Lalat Buah', 'Bercak Daun Cercospora']
  },
  {
    id: 'CAL-004',
    kodeJadwal: 'MT-PADIL-BK-2026-1',
    kecamatan: 'Bakam',
    komoditas: 'padi_ladang',
    musimTanam: 'MT I (Rendengan/Penghujan)',
    luasRencanaHa: 45.0,
    tanggalMulaiOlah: '2026-10-10',
    tanggalTanam: '2026-10-28',
    tanggalPupuk1: '2026-11-15',
    tanggalPupuk2: '2026-12-05',
    tanggalPanenEstimasi: '2027-03-10',
    faseSaatIni: 'Persiapan Lahan',
    progresFasePersen: 70,
    indeksKlimatologi: 'Optimal',
    rekomendasiAgroklimat: 'Tugal benih bersamaan saat tanah mulai lembap terkena awal hujan musim rendengan.',
    peringatanOpt: ['Ulat Grayak', 'Burung Pipit']
  }
];

export const KIOS_PUPUK_LIST: KiosPupukInfo[] = [
  {
    id: 'KIOS-001',
    namaKios: 'UD Sumber Rejeki Tani',
    kecamatan: 'Mendo Barat',
    desa: 'Kemuja',
    alamat: 'Jl. Raya Pangkalpinang - Muntok Km 22, Kemuja',
    penanggungJawab: 'H. Sudirman, S.E',
    kontak: '0812-7100-3344',
    wilayahBinaan: ['Kemuja', 'Petaling', 'Zed', 'Paya Benua'],
    statusOperasional: 'Aktif / Siap Salur',
    stokTersedia: {
      ureaTon: 28.5,
      npkTon: 42.0,
      organikTon: 15.0
    }
  },
  {
    id: 'KIOS-002',
    namaKios: 'Kios Pupuk Sahabat Tani Sungailiat',
    kecamatan: 'Sungailiat',
    desa: 'Kenanga',
    alamat: 'Jl. Jenderal Sudirman No. 88, Kenanga',
    penanggungJawab: 'Budi Santoso',
    kontak: '0813-6822-5500',
    wilayahBinaan: ['Kenanga', 'Rebo', 'Sinar Baru', 'Parit Padang'],
    statusOperasional: 'Aktif / Siap Salur',
    stokTersedia: {
      ureaTon: 18.0,
      npkTon: 26.5,
      organikTon: 12.0
    }
  },
  {
    id: 'KIOS-003',
    namaKios: 'Toko Tani Mandiri Belinyu',
    kecamatan: 'Belinyu',
    desa: 'Gunung Muda',
    alamat: 'Jl. Gajah Mada No. 12, Belinyu',
    penanggungJawab: 'Acin / Ruslan',
    kontak: '0852-6711-8899',
    wilayahBinaan: ['Gunung Muda', 'Lumut', 'Riau', 'Bintet'],
    statusOperasional: 'Aktif / Siap Salur',
    stokTersedia: {
      ureaTon: 32.0,
      npkTon: 38.0,
      organikTon: 20.0
    }
  },
  {
    id: 'KIOS-004',
    namaKios: 'CV Agro Kimak Sejahtera',
    kecamatan: 'Merawang',
    desa: 'Kimak',
    alamat: 'Jl. Raya Kimak Dusun 2, Merawang',
    penanggungJawab: 'Iskandar Zulkarnain',
    kontak: '0821-7890-4411',
    wilayahBinaan: ['Kimak', 'Batu Rusa', 'Balunijuk', 'Jelimpo'],
    statusOperasional: 'Aktif / Siap Salur',
    stokTersedia: {
      ureaTon: 15.5,
      npkTon: 24.0,
      organikTon: 10.0
    }
  },
  {
    id: 'KIOS-005',
    namaKios: 'KPL Berkah Tani Puding',
    kecamatan: 'Puding Besar',
    desa: 'Kayu Besi',
    alamat: 'Jl. Raya Desa Kayu Besi, Puding Besar',
    penanggungJawab: 'M. Syamsudin',
    kontak: '0813-7922-1133',
    wilayahBinaan: ['Kayu Besi', 'Nibung', 'Kota Waringin', 'Labu'],
    statusOperasional: 'Aktif / Siap Salur',
    stokTersedia: {
      ureaTon: 22.0,
      npkTon: 30.5,
      organikTon: 14.0
    }
  },
  {
    id: 'KIOS-006',
    namaKios: 'Kios Tani Makmur Riau Silip',
    kecamatan: 'Riau Silip',
    desa: 'Cit',
    alamat: 'Jl. Lintas Belinyu - Sungailiat, Desa Cit',
    penanggungJawab: 'Hendri Gunawan',
    kontak: '0853-6677-2288',
    wilayahBinaan: ['Cit', 'Pangkal Niur', 'Banyu Asin', 'Mapur'],
    statusOperasional: 'Aktif / Siap Salur',
    stokTersedia: {
      ureaTon: 20.0,
      npkTon: 28.0,
      organikTon: 11.0
    }
  }
];

export const INITIAL_FERTILIZER_NEEDS: FertilizerNeedRecord[] = [
  {
    id: 'FND-001',
    poktan: 'Poktan Maju Bersama',
    kecamatan: 'Mendo Barat',
    desa: 'Kemuja',
    komoditas: 'padi_sawah',
    luasLahanHa: 25.0,
    kiosPenyalur: 'UD Sumber Rejeki Tani',
    kebutuhanUreaKg: 5000,
    kebutuhanNpkKg: 7500,
    kebutuhanOrganikKg: 12500,
    musimTanam: 'MT I 2026/2027',
    keterangan: 'Kebutuhan pemupukan dasar dan susulan 1 hamparan sawah irigasi.'
  },
  {
    id: 'FND-002',
    poktan: 'Poktan Sinar Harapan',
    kecamatan: 'Sungailiat',
    desa: 'Rebo',
    komoditas: 'cabai_merah_keriting',
    luasLahanHa: 8.5,
    kiosPenyalur: 'Kios Pupuk Sahabat Tani Sungailiat',
    kebutuhanUreaKg: 1275,
    kebutuhanNpkKg: 3060,
    kebutuhanOrganikKg: 8500,
    musimTanam: 'MT II 2026',
    keterangan: 'Alokasi pemupukan berimbang untuk menjaga kontinuitas bunga dan buah cabai.'
  },
  {
    id: 'FND-003',
    poktan: 'Gapoktan Sahabat Tani',
    kecamatan: 'Belinyu',
    desa: 'Gunung Muda',
    komoditas: 'padi_ladang',
    luasLahanHa: 30.0,
    kiosPenyalur: 'Toko Tani Mandiri Belinyu',
    kebutuhanUreaKg: 5250,
    kebutuhanNpkKg: 7500,
    kebutuhanOrganikKg: 15000,
    musimTanam: 'MT I 2026/2027',
    keterangan: 'Penetapan dosis pupuk gogo lahan kering berpasir dengan penambahan organik.'
  },
  {
    id: 'FND-004',
    poktan: 'Poktan Makmur Sentosa',
    kecamatan: 'Merawang',
    desa: 'Kimak',
    komoditas: 'cabai_rawit',
    luasLahanHa: 6.0,
    kiosPenyalur: 'CV Agro Kimak Sejahtera',
    kebutuhanUreaKg: 900,
    kebutuhanNpkKg: 2100,
    kebutuhanOrganikKg: 6000,
    musimTanam: 'MT I 2026',
    keterangan: 'Kebutuhan fertigasi dan pupuk tabur fase pembentukan cabang generatif.'
  },
  {
    id: 'FND-005',
    poktan: 'Poktan Tunas Baru',
    kecamatan: 'Puding Besar',
    desa: 'Kayu Besi',
    komoditas: 'cabai_besar',
    luasLahanHa: 10.0,
    kiosPenyalur: 'KPL Berkah Tani Puding',
    kebutuhanUreaKg: 1600,
    kebutuhanNpkKg: 3800,
    kebutuhanOrganikKg: 9000,
    musimTanam: 'MT I 2026',
    keterangan: 'Dosis rekomendasi Dinas Pertanian untuk komoditas cabai besar teropong.'
  },
  {
    id: 'FND-006',
    poktan: 'Poktan Sumber Rejeki',
    kecamatan: 'Riau Silip',
    desa: 'Cit',
    komoditas: 'padi_sawah',
    luasLahanHa: 20.0,
    kiosPenyalur: 'Kios Tani Makmur Riau Silip',
    kebutuhanUreaKg: 4000,
    kebutuhanNpkKg: 6000,
    kebutuhanOrganikKg: 10000,
    musimTanam: 'MT I 2026/2027',
    keterangan: 'Kebutuhan kelompok tani lumbung pangan Cit untuk pemupukan berimbang.'
  }
];

export const INITIAL_HARVEST_RECORDS: HarvestRecord[] = [
  {
    id: 'HRV-001',
    kodePanen: 'PAN-PADI-0891',
    kodePetak: 'PETAK-MB-001',
    poktan: 'Poktan Maju Bersama',
    namaPetani: 'Zulkifli Mansur',
    kecamatan: 'Mendo Barat',
    komoditas: 'padi_sawah',
    luasPanenHa: 2.5,
    estimasiProduksiTon: 16.8, // Dari ubinan 4.2 kg/petak 2.5mx2.5m x 1600 = 6.72 ton/ha x 2.5 ha
    realisasiProduksiTon: 17.2,
    deviasiPersen: 2.38,
    produktivitasTonPerHa: 6.88,
    tanggalPanen: '2026-10-14'
  },
  {
    id: 'HRV-002',
    kodePanen: 'PAN-CBR-0321',
    kodePetak: 'PETAK-SL-009',
    poktan: 'Poktan Sinar Harapan',
    namaPetani: 'Bujang Sanusi',
    kecamatan: 'Sungailiat',
    komoditas: 'cabai_merah_keriting',
    luasPanenHa: 1.2,
    estimasiProduksiTon: 12.0, // Estimasi 10 ton/ha
    realisasiProduksiTon: 12.6,
    deviasiPersen: 5.0,
    produktivitasTonPerHa: 10.5,
    tanggalPanen: '2026-10-16'
  },
  {
    id: 'HRV-003',
    kodePanen: 'PAN-PADIL-0412',
    kodePetak: 'PETAK-BL-004',
    poktan: 'Gapoktan Sahabat Tani',
    namaPetani: 'H. Ruslan Effendi',
    kecamatan: 'Belinyu',
    komoditas: 'padi_ladang',
    luasPanenHa: 3.0,
    estimasiProduksiTon: 10.5,
    realisasiProduksiTon: 10.8,
    deviasiPersen: 2.86,
    produktivitasTonPerHa: 3.6,
    tanggalPanen: '2026-10-18'
  },
  {
    id: 'HRV-004',
    kodePanen: 'PAN-CBRW-0112',
    kodePetak: 'PETAK-MR-003',
    poktan: 'Poktan Makmur Sentosa',
    namaPetani: 'Samsuri',
    kecamatan: 'Merawang',
    komoditas: 'cabai_rawit',
    luasPanenHa: 1.0,
    estimasiProduksiTon: 8.5,
    realisasiProduksiTon: 8.9,
    deviasiPersen: 4.71,
    produktivitasTonPerHa: 8.9,
    tanggalPanen: '2026-10-19'
  },
  {
    id: 'HRV-005',
    kodePanen: 'PAN-CBB-0551',
    kodePetak: 'PETAK-PD-012',
    poktan: 'Poktan Tunas Baru',
    namaPetani: 'M. Taufik Hidayat',
    kecamatan: 'Puding Besar',
    komoditas: 'cabai_besar',
    luasPanenHa: 1.5,
    estimasiProduksiTon: 15.0,
    realisasiProduksiTon: 15.4,
    deviasiPersen: 2.67,
    produktivitasTonPerHa: 10.27,
    tanggalPanen: '2026-10-21'
  }
];

export const INITIAL_POST_HARVEST_LOSSES: PostHarvestLoss[] = [
  {
    id: 'PHL-001',
    harvestRecordId: 'HRV-001',
    namaPetani: 'Zulkifli Mansur',
    desa: 'Kemuja',
    komoditas: 'padi_sawah',
    kecamatan: 'Mendo Barat',
    poktan: 'Poktan Maju Bersama',
    tahapKehilangan: 'Perontokan & Pengangkutan Lahan',
    persentaseSusut: 3.2,
    bobotSusutKg: 550,
    hargaSatuanRp: 6900,
    totalKerugianRp: 3795000,
    penyebabUtama: 'Gabah tercecer saat perontokan manual gebot bambu dan karung bocor saat diangkut motor kebun.',
    intervensiMekanisasi: 'Bantuan unit Thresher mekanis mobile dan terpal HDPE penangkap gabah ceceran.'
  },
  {
    id: 'PHL-002',
    harvestRecordId: 'HRV-002',
    namaPetani: 'Bujang Sanusi',
    desa: 'Rebo',
    komoditas: 'cabai_merah_keriting',
    kecamatan: 'Sungailiat',
    poktan: 'Poktan Sinar Harapan',
    tahapKehilangan: 'Penyortiran & Pengemasan Keranjang',
    persentaseSusut: 4.5,
    bobotSusutKg: 560,
    hargaSatuanRp: 45000,
    totalKerugianRp: 25200000,
    penyebabUtama: 'Cabai memar dan patah tangkai akibat penumpukan keranjang bambu berlebih tanpa sekat rongga udara.',
    intervensiMekanisasi: 'Penggunaan krat plastik aerasi (plastic crate food grade) bertingkat khusus hortikultura.'
  },
  {
    id: 'PHL-003',
    harvestRecordId: 'HRV-003',
    namaPetani: 'H. Ruslan Effendi',
    desa: 'Air Jukung',
    komoditas: 'padi_ladang',
    kecamatan: 'Belinyu',
    poktan: 'Gapoktan Sahabat Tani',
    tahapKehilangan: '',
    persentaseSusut: 3.8,
    bobotSusutKg: 410,
    hargaSatuanRp: 7500,
    totalKerugianRp: 3075000,
    penyebabUtama: 'Penjemuran di terpal tanah terbuka terganggu hujan sore mendadak dan dimakan unggas liar.',
    intervensiMekanisasi: 'Implementasi Solar Dryer Dome UV mini bantuan Dinas Pertanian Kab. Bangka.'
  },
  {
    id: 'PHL-004',
    harvestRecordId: 'HRV-004',
    namaPetani: 'Samsuri',
    desa: 'Batu Rusa',
    komoditas: 'cabai_rawit',
    kecamatan: 'Merawang',
    poktan: 'Poktan Makmur Sentosa',
    tahapKehilangan: 'Pemanenan & Sortasi Batang',
    persentaseSusut: 2.8,
    bobotSusutKg: 250,
    hargaSatuanRp: 48000,
    totalKerugianRp: 12000000,
    penyebabUtama: 'Pemetikan saat embun basah pagi hari memicu pembusukan cepat oleh cendawan pasca-panen.',
    intervensiMekanisasi: 'SOP petik kering setelah pukul 08:30 dan wadah berongga berventilasi.'
  }
];

export const INITIAL_ECONOMIC_IMPACT: EconomicImpactSummary = {
  peningkatanHasilPersen: 19.2,
  penurunanSusutHasilPersen: 4.8, // Susut ditekan dari baseline
  penghematanBiayaPupukPersen: 15.6, // Berkat perhitungan dosis presisi
  tambahanPendapatanRataRataRp: 8250000, // per Ha per Musim
  totalNilaiEkonomiKabupatenRp: 38400000000, // Nilai ekonomi terverifikasi
  jumlahPetaniBerdampak: 4850,
  totalLahanTerkelolaHa: 19200
};

export const INITIAL_ACTIVITIES: ActivityEvent[] = [
  {
    id: 'ACT-001',
    judul: 'Sosialisasi Kebutuhan Pupuk & Kalender Tanam MT I 2026/2027',
    tanggal: '2026-10-24',
    waktu: '08:30 - 12:00 WIB',
    lokasi: 'Balai Penyuluhan Pertanian (BPP) Mendo Barat',
    kecamatan: 'Mendo Barat',
    penyelenggara: 'Dinas Pangan & Pertanian Kab. Bangka',
    kategori: 'Sosialisasi & Pelatihan',
    targetPeserta: '45 Ketua Kelompok Tani Padi Sawah & Ladang',
    status: 'Akan Datang',
    deskripsi: 'Penetapan kuota kebutuhan pupuk berimbang Urea, NPK, dan Organik serta sinkronisasi jadwal olah tanah MT I.'
  },
  {
    id: 'ACT-002',
    judul: 'Bimtek Pengendalian Susut Pasca Panen Cabai Merah Keriting & Rawit',
    tanggal: '2026-10-26',
    waktu: '09:00 - 13:00 WIB',
    lokasi: 'Aula Balai Desa Rebo, Sungailiat',
    kecamatan: 'Sungailiat',
    penyelenggara: 'Bidang Hortikultura Dinas Pertanian Kab. Bangka',
    kategori: 'Sosialisasi & Pelatihan',
    targetPeserta: '40 Petani Cabai Poktan Sinar Harapan',
    status: 'Akan Datang',
    deskripsi: 'Pelatihan teknik sortasi, penanganan pasca-petik, dan pengemasan krat aerasi untuk menekan susut bobot cabai.'
  },
  {
    id: 'ACT-003',
    judul: 'Uji Coba Pengambilan Sampel Ubinan Padi Sawah 2.5m x 2.5m',
    tanggal: '2026-10-15',
    waktu: '07:30 - 10:30 WIB',
    lokasi: 'Hamparan Sawah Poktan Maju Bersama, Petak MB-001',
    kecamatan: 'Mendo Barat',
    penyelenggara: 'Petugas Data Statistik Pertanian Dinas',
    kategori: 'Uji Coba Ubinan',
    targetPeserta: 'PPL Pendamping & Pengurus Poktan',
    status: 'Selesai',
    deskripsi: 'Pengukuran akurasi ubinan varietas Inpari 32 menghasilkan rata-rata 4.2 kg/ubinan (setara 6.72 ton/ha GKP).'
  }
];

export const INITIAL_FIELD_ISSUES: FieldIssue[] = [
  {
    id: 'ISS-001',
    kodeTiket: 'TKT-2026-0089',
    pelaporNama: 'Zulkifli (Ketua Poktan)',
    pelaporPeran: 'Kelompok Tani',
    poktan: 'Poktan Maju Bersama',
    kecamatan: 'Mendo Barat',
    desa: 'Kemuja',
    kategoriMasalah: 'Serangan Hama / Penyakit (OPT)',
    prioritas: 'Tinggi (Darurat)',
    deskripsi: 'Ditemukan gejala serangan wereng batang coklat (WBC) fase anakan aktif pada hamparan sawah 12 Ha.',
    tanggalLapor: '2026-10-18',
    status: 'Dalam Penanganan Petugas',
    petugasPpl: 'Ahmad Baihaqi, S.P',
    tindakLanjutPetugas: 'Telah dilakukan penyemprotan insektisida sistemik berimbang dan pemantauan lampu perangkap.'
  },
  {
    id: 'ISS-002',
    kodeTiket: 'TKT-2026-0092',
    pelaporNama: 'H. Sudirman (Petani Cabai)',
    pelaporPeran: 'Kelompok Tani',
    poktan: 'Poktan Sinar Harapan',
    kecamatan: 'Sungailiat',
    desa: 'Rebo',
    kategoriMasalah: 'Pupuk Langka / Distribusi Terhambat',
    prioritas: 'Tinggi (Darurat)',
    deskripsi: 'Kebutuhan pupuk NPK Phonska untuk pemupukan susulan cabai merah keriting mendesak disalurkan.',
    tanggalLapor: '2026-10-20',
    status: 'Menunggu Disposisi',
    tindakLanjutPetugas: 'Diteruskan ke distributor kios resmi untuk percepatan pengiriman stok.'
  }
];

export const INITIAL_STAKEHOLDER_MESSAGES: StakeholderMessage[] = [
  {
    id: 'MSG-001',
    pengirim: 'Kepala Dinas Pangan & Pertanian Kab. Bangka',
    rolePengirim: 'Dinas Pertanian',
    instansi: 'Pemerintah Kabupaten Bangka',
    tanggalWaktu: '2026-10-21 14:15 WIB',
    topik: 'Instruksi Pengamanan Pasokan Komoditas Cabai & Padi Menjelang Akhir Tahun',
    pesan: 'Kepada seluruh petugas operator dan koordinator BPP 8 Kecamatan: Mohon pantau ketat data kebutuhan pupuk dan realisasi panen cabai serta padi sawah untuk menjamin ketahanan pangan dan kestabilan harga pasar.',
    targetPemangku: 'Operator Kecamatan & Penyuluh Lapangan'
  }
];

export const INITIAL_EARLY_WARNINGS: EarlyWarningAlert[] = [
  {
    id: 'WRN-001',
    tingkat: 'Waspada',
    kategori: 'Agroklimat / Cuaca',
    judul: 'Potensi Curah Hujan Tinggi di Sentra Padi Mendo Barat & Puding Besar',
    deskripsi: 'Prakiraan BMKG menunjukkan peningkatan intensitas hujan sore hari di atas 180 mm/minggu.',
    kecamatan: 'Mendo Barat',
    komoditas: 'padi_sawah',
    rekomendasiTindakan: 'Buka pintu pembuang saluran tersier irigasi dan bersihkan sampah gulma bendungan.',
    tanggal: '2026-10-21',
    statusPenanganan: 'Sedang Dipantau'
  },
  {
    id: 'WRN-002',
    tingkat: 'Pemberitahuan',
    kategori: 'OPT / Hama',
    judul: 'Kewaspadaan Antraknosa (Patek) pada Cabai Merah Keriting & Rawit',
    deskripsi: 'Kelembapan tinggi di wilayah Sungailiat dan Pemali memicu spora jamur Colletotrichum capsici.',
    kecamatan: 'Sungailiat',
    komoditas: 'cabai_merah_keriting',
    rekomendasiTindakan: 'Lakukan perempelan daun tua bagian bawah dan semprot fungisida tembaga.',
    tanggal: '2026-10-20',
    statusPenanganan: 'Terkendali'
  }
];
