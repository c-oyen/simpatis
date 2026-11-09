import { CommodityId, KecamatanBangka } from '../types';

export interface MonthlyClimateBangka {
  bulanAngka: number; // 1 - 12
  namaBulan: string;
  curahHujanMm: number;
  hariHujan: number;
  suhuRataRataC: number;
  kelembapanPersen: number;
  karakterIklim: 'Puncak Penghujan (Rendengan)' | 'Peralihan I (Transisi)' | 'Kemarau Terkendali (Gadu)' | 'Peralihan II (Awal Rendengan)';
  sifatHujan: 'Atas Normal' | 'Normal Basah' | 'Normal Kering' | 'Bawah Normal';
  deskripsiBMKG: string;
}

export const BMKG_CLIMATE_BANGKA: MonthlyClimateBangka[] = [
  {
    bulanAngka: 1,
    namaBulan: 'Januari',
    curahHujanMm: 310,
    hariHujan: 21,
    suhuRataRataC: 26.5,
    kelembapanPersen: 88,
    karakterIklim: 'Puncak Penghujan (Rendengan)',
    sifatHujan: 'Atas Normal',
    deskripsiBMKG: 'Monsun barat aktif, curah hujan tinggi dan intensif di seluruh wilayah pesisir dan daratan Bangka. Kondisi air melimpah.'
  },
  {
    bulanAngka: 2,
    namaBulan: 'Februari',
    curahHujanMm: 245,
    hariHujan: 17,
    suhuRataRataC: 26.8,
    kelembapanPersen: 85,
    karakterIklim: 'Puncak Penghujan (Rendengan)',
    sifatHujan: 'Normal Basah',
    deskripsiBMKG: 'Curah hujan mulai berangsur turun dibanding Januari, namun kelembapan tanah masih optimal untuk fase generatif padi.'
  },
  {
    bulanAngka: 3,
    namaBulan: 'Maret',
    curahHujanMm: 215,
    hariHujan: 15,
    suhuRataRataC: 27.2,
    kelembapanPersen: 83,
    karakterIklim: 'Peralihan I (Transisi)',
    sifatHujan: 'Normal Basah',
    deskripsiBMKG: 'Masa peralihan dari musim hujan ke transisi gadu. Penyinaran matahari meningkat, sangat mendukung persemaian dan tanam cabai.'
  },
  {
    bulanAngka: 4,
    namaBulan: 'April',
    curahHujanMm: 195,
    hariHujan: 14,
    suhuRataRataC: 27.5,
    kelembapanPersen: 82,
    karakterIklim: 'Peralihan I (Transisi)',
    sifatHujan: 'Normal Basah',
    deskripsiBMKG: 'Awal Musim Tanam Gadu (MT II). Kondisi agroklimat ideal untuk hortikultura dan padi sawah dengan irigasi terkontrol.'
  },
  {
    bulanAngka: 5,
    namaBulan: 'Mei',
    curahHujanMm: 165,
    hariHujan: 12,
    suhuRataRataC: 27.8,
    kelembapanPersen: 80,
    karakterIklim: 'Kemarau Terkendali (Gadu)',
    sifatHujan: 'Normal Kering',
    deskripsiBMKG: 'Curah hujan menengah, intensitas penyinaran matahari tinggi. Masa emas pertumbuhan cabai merah dan cabai rawit.'
  },
  {
    bulanAngka: 6,
    namaBulan: 'Juni',
    curahHujanMm: 125,
    hariHujan: 9,
    suhuRataRataC: 28.1,
    kelembapanPersen: 77,
    karakterIklim: 'Kemarau Terkendali (Gadu)',
    sifatHujan: 'Normal Kering',
    deskripsiBMKG: 'Periode kemarau basah. Lahan tadah hujan mulai mengalami defisit lengas tanah. Irigasi suplementer (embung/sumur bor) dibutuhkan.'
  },
  {
    bulanAngka: 7,
    namaBulan: 'Juli',
    curahHujanMm: 95,
    hariHujan: 7,
    suhuRataRataC: 28.4,
    kelembapanPersen: 74,
    karakterIklim: 'Kemarau Terkendali (Gadu)',
    sifatHujan: 'Bawah Normal',
    deskripsiBMKG: 'Bulan terkering di Bangka. Hama pengisap (thrips & kutu kebul) meningkat pada cabai, namun risiko penyakit jamur/patek minimal.'
  },
  {
    bulanAngka: 8,
    namaBulan: 'Agustus',
    curahHujanMm: 110,
    hariHujan: 8,
    suhuRataRataC: 28.3,
    kelembapanPersen: 76,
    karakterIklim: 'Kemarau Terkendali (Gadu)',
    sifatHujan: 'Normal Kering',
    deskripsiBMKG: 'Akhir periode musim kemarau. Sangat baik untuk penjemuran panen (pasca panen) dan persiapan olah tanah awal musim hujan.'
  },
  {
    bulanAngka: 9,
    namaBulan: 'September',
    curahHujanMm: 180,
    hariHujan: 13,
    suhuRataRataC: 27.6,
    kelembapanPersen: 81,
    karakterIklim: 'Peralihan II (Awal Rendengan)',
    sifatHujan: 'Normal Basah',
    deskripsiBMKG: 'Awal pembasahan tanah menjelang musim rendengan. Waktu tepat untuk pembersihan parit drainase dan pengolahan tanah awal.'
  },
  {
    bulanAngka: 10,
    namaBulan: 'Oktober',
    curahHujanMm: 240,
    hariHujan: 17,
    suhuRataRataC: 27.1,
    kelembapanPersen: 84,
    karakterIklim: 'Peralihan II (Awal Rendengan)',
    sifatHujan: 'Normal Basah',
    deskripsiBMKG: 'Awal Musim Tanam Rendengan (MT I). Curah hujan mencukupi untuk persemaian padi sawah dan tugal padi ladang di Bangka.'
  },
  {
    bulanAngka: 11,
    namaBulan: 'November',
    curahHujanMm: 330,
    hariHujan: 22,
    suhuRataRataC: 26.6,
    kelembapanPersen: 89,
    karakterIklim: 'Puncak Penghujan (Rendengan)',
    sifatHujan: 'Atas Normal',
    deskripsiBMKG: 'Puncak tanam serentak padi sawah dan ladang di Mendo Barat, Puding Besar, dan Riau Silip. Ketersediaan air penuh.'
  },
  {
    bulanAngka: 12,
    namaBulan: 'Desember',
    curahHujanMm: 375,
    hariHujan: 24,
    suhuRataRataC: 26.3,
    kelembapanPersen: 91,
    karakterIklim: 'Puncak Penghujan (Rendengan)',
    sifatHujan: 'Atas Normal',
    deskripsiBMKG: 'Curah hujan tertinggi tahunan. Waspada luapan saluran air dan genangan pada lahan datar. Cabai memerlukan bedengan tinggi.'
  }
];

// =========================================================================
// DATA REFERENSI IKLIM RESMI STASIUN KLIMATOLOGI BMKG BABEL PER KECAMATAN
// Sumber Publikasi Resmi: https://sites.google.com/bmkg.go.id/papaniklimbabel
// =========================================================================
export interface BmkgKecamatanClimate {
  kecamatan: KecamatanBangka;
  curahHujanBulananMm: number;
  kategoriHujan: 'Atas Normal' | 'Normal Basah' | 'Normal Kering' | 'Bawah Normal';
  hariHujan: number;
  kelembapanPersen: number;
  suhuRataRataC: number;
  kondisiCuaca: string;
  catatanKlimatologi: string;
  stasiunPengamat: string;
  papanIklimUrl: string;
}

export const BMKG_IKLIM_KECAMATAN_BANGKA: Record<KecamatanBangka, BmkgKecamatanClimate> = {
  'Mendo Barat': {
    kecamatan: 'Mendo Barat',
    curahHujanBulananMm: 330,
    kategoriHujan: 'Atas Normal',
    hariHujan: 22,
    kelembapanPersen: 92,
    suhuRataRataC: 26.5,
    kondisiCuaca: 'Hujan Ringan',
    catatanKlimatologi: 'Zona agroklimat basah sentra persawahan Mendo Barat (Kemuja/Zed). Curah hujan bulanan tergolong Atas Normal (330 mm), pasokan air permukaan melimpah. Waspada kelembapan tinggi 92% RH memicu blast dan hawar daun.',
    stasiunPengamat: 'Stasiun Klimatologi Kepulauan Bangka Belitung',
    papanIklimUrl: 'https://sites.google.com/bmkg.go.id/papaniklimbabel'
  },
  'Merawang': {
    kecamatan: 'Merawang',
    curahHujanBulananMm: 310,
    kategoriHujan: 'Atas Normal',
    hariHujan: 20,
    kelembapanPersen: 88,
    suhuRataRataC: 26.8,
    kondisiCuaca: 'Berawan Tebal',
    catatanKlimatologi: 'Wilayah agroklimat penyangga pesisir timur. Curah hujan tinggi Atas Normal (310 mm), ketersediaan lengas tanah optimal untuk tanaman pangan dan hortikultura.',
    stasiunPengamat: 'Stasiun Klimatologi Kepulauan Bangka Belitung',
    papanIklimUrl: 'https://sites.google.com/bmkg.go.id/papaniklimbabel'
  },
  'Puding Besar': {
    kecamatan: 'Puding Besar',
    curahHujanBulananMm: 325,
    kategoriHujan: 'Atas Normal',
    hariHujan: 21,
    kelembapanPersen: 90,
    suhuRataRataC: 26.6,
    kondisiCuaca: 'Hujan Ringan',
    catatanKlimatologi: 'Sentra agroklimat dataran bergelombang (Nibung/Kayu Besi). Curah hujan bulanan Atas Normal (325 mm), air tanah dan parit tersier mencukupi untuk musim tanam aktif.',
    stasiunPengamat: 'Stasiun Klimatologi Kepulauan Bangka Belitung',
    papanIklimUrl: 'https://sites.google.com/bmkg.go.id/papaniklimbabel'
  },
  'Sungailiat': {
    kecamatan: 'Sungailiat',
    curahHujanBulananMm: 295,
    kategoriHujan: 'Normal Basah',
    hariHujan: 19,
    kelembapanPersen: 86,
    suhuRataRataC: 27.2,
    kondisiCuaca: 'Cerah Berawan',
    catatanKlimatologi: 'Zona pesisir timur ibu kota kabupaten. Curah hujan kategori Normal Basah (295 mm), angin laut aktif, penyinaran matahari cukup tinggi.',
    stasiunPengamat: 'Stasiun Klimatologi Kepulauan Bangka Belitung',
    papanIklimUrl: 'https://sites.google.com/bmkg.go.id/papaniklimbabel'
  },
  'Pemali': {
    kecamatan: 'Pemali',
    curahHujanBulananMm: 305,
    kategoriHujan: 'Atas Normal',
    hariHujan: 20,
    kelembapanPersen: 87,
    suhuRataRataC: 26.9,
    kondisiCuaca: 'Berawan',
    catatanKlimatologi: 'Kawasan tangkapan air dan perkebunan lada Pemali. Curah hujan Atas Normal (305 mm) mendukung fase pertumbuhan vegetatif tanaman.',
    stasiunPengamat: 'Stasiun Klimatologi Kepulauan Bangka Belitung',
    papanIklimUrl: 'https://sites.google.com/bmkg.go.id/papaniklimbabel'
  },
  'Bakam': {
    kecamatan: 'Bakam',
    curahHujanBulananMm: 315,
    kategoriHujan: 'Atas Normal',
    hariHujan: 20,
    kelembapanPersen: 89,
    suhuRataRataC: 26.7,
    kondisiCuaca: 'Hujan Ringan',
    catatanKlimatologi: 'Zona pedalaman barat daya Bangka. Curah hujan tinggi Atas Normal (315 mm), lengas tanah tinggi, debit embung dan sumur pantau terjaga stabil.',
    stasiunPengamat: 'Stasiun Klimatologi Kepulauan Bangka Belitung',
    papanIklimUrl: 'https://sites.google.com/bmkg.go.id/papaniklimbabel'
  },
  'Riau Silip': {
    kecamatan: 'Riau Silip',
    curahHujanBulananMm: 320,
    kategoriHujan: 'Atas Normal',
    hariHujan: 21,
    kelembapanPersen: 90,
    suhuRataRataC: 26.6,
    kondisiCuaca: 'Hujan Ringan',
    catatanKlimatologi: 'Sentra persawahan pasang surut & lebak Pangkal Niur. Curah hujan Atas Normal (320 mm), saluran drainase perlu dijaga agar tidak terjadi genangan berlebih.',
    stasiunPengamat: 'Stasiun Klimatologi Kepulauan Bangka Belitung',
    papanIklimUrl: 'https://sites.google.com/bmkg.go.id/papaniklimbabel'
  },
  'Belinyu': {
    kecamatan: 'Belinyu',
    curahHujanBulananMm: 280,
    kategoriHujan: 'Normal Basah',
    hariHujan: 18,
    kelembapanPersen: 85,
    suhuRataRataC: 27.5,
    kondisiCuaca: 'Cerah Berawan',
    catatanKlimatologi: 'Ujung utara Pulau Bangka. Curah hujan Normal Basah (280 mm) dengan hari cerah yang memadai untuk penjemuran gabah dan olah tanah.',
    stasiunPengamat: 'Stasiun Klimatologi Kepulauan Bangka Belitung',
    papanIklimUrl: 'https://sites.google.com/bmkg.go.id/papaniklimbabel'
  }
};

export type IrrigationType = 
  | 'Irigasi' 
  | 'Tadah Hujan' 
  | 'Embung / Sumur Bor' 
  | 'Lahan Rawa / Lebak';

export type LandTopography = 
  | 'Lahan Dataran Rendah' 
  | 'Lahan Kering / Perbukitan' 
  | 'Lahan Rawa Lebak Pasang Surut';

export interface CropSuitabilityResult {
  komoditasId: CommodityId;
  namaKomoditas: string;
  kecamatan: KecamatanBangka;
  bulanTanam: number; // 1-12
  namaBulan: string;
  irigasi: IrrigationType;
  tipeLahan: LandTopography;
  
  // Evaluation Scores
  statusKesesuaian: 'Sangat Direkomendasikan (Optimal)' | 'Cukup Sesuai (Dengan Rekayasa Teknis)' | 'Kurang Disarankan (Risiko Tinggi)';
  skorKesesuaian: number; // 0 - 100
  badgeColor: string;
  
  // Specific BSIP recommendations for Bangka
  varietasRekomendasi: string[];
  alasanAgroklimat: string;
  mitigasiRisiko: string[];
  kebutuhanAirMmPerHari: number;
  hamaPenyakitUtama: string[];

  // Dynamic Calculated Dates
  tanggalMulaiOlah: string;
  tanggalTanam: string;
  tanggalPupuk1: string;
  tanggalPupuk2: string;
  tanggalFaseKritisOpt: string;
  tanggalEstimasiPanen: string;
  totalHariBudidaya: number;

  // Practical Field Guidance
  tahapanBudidaya: {
    fase: string;
    rentangHari: string;
    tanggalTarget: string;
    aktivitasKunci: string;
    kebutuhanNutrisi: string;
  }[];
}

// Rekomendasi Varietas Unggul BSIP Bangka Belitung
export const VARIETAS_BSIP_BANGKA: Record<CommodityId, {
  utama: string[];
  karakteristik: string;
  siklusHari: number;
}> = {
  padi_sawah: {
    utama: ['Inpari 32 HDB', 'Inpara 8 (Toleran Rendaman)', 'Danau Gaung', 'Ciherang Sub-1'],
    karakteristik: 'Tahan hawar daun bakteri (HDB), anakan produktif tinggi, dan sangat adaptif pada lahan sawah irigasi maupun sawah lebak Bangka.',
    siklusHari: 115
  },
  padi_ladang: {
    utama: ['Inpago 8', 'Inpago 9', 'Inpago 10', 'Luhur 1'],
    karakteristik: 'Toleran kekeringan, tahan keracunan aluminium (Al) pada tanah masam Ultisol Bangka, dan rasa nasi pulen disukai masyarakat lokal.',
    siklusHari: 130
  },
  cabai_rawit: {
    utama: ['Ori 212', 'Bara F1', 'Genie', 'Bhaskara'],
    karakteristik: 'Tahan layu bakteri (Ralstonia solanacearum) pada tanah masam, buah lebat berulang, dan toleran cuaca panas kelembaban fluktuatif.',
    siklusHari: 90
  },
  cabai_besar: {
    utama: ['Gada MK F1', 'Elegance', 'Imola', 'Pilar F1'],
    karakteristik: 'Batang kokoh, buah besar padat tahan pengangkutan antar-pulau, serta tahan layu jamur fusarium.',
    siklusHari: 85
  },
  cabai_merah_keriting: {
    utama: ['PM999 F1', 'Kencana', 'Lembang-1', 'Kastilo'],
    karakteristik: 'Adaptif iklim tropis kepulauan Bangka, buah keriting merah mengkilap, dan relatif toleran terhadap antraknosa (patek).',
    siklusHari: 80
  }
};

/**
 * Helper to calculate dynamic dates formatted as DD MMMM YYYY
 */
export const addDaysToDate = (startDateStr: string, days: number): string => {
  const d = new Date(startDateStr);
  if (isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const formatIndonesianDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parts[0];
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parts[2];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${day} ${monthNames[monthIdx]} ${year}`;
};

/**
 * Core Algorithm: Evaluates real crop suitability based on BMKG Climate,
 * BSIP Babel Agricultural guidelines, and user inputs.
 */
export const evaluateCropSuitability = (
  komoditasId: CommodityId,
  kecamatan: KecamatanBangka,
  tglTanam: string,
  irigasi: IrrigationType,
  tipeLahan?: LandTopography
): CropSuitabilityResult => {
  const dateObj = new Date(tglTanam);
  const bulan = isNaN(dateObj.getTime()) ? 10 : dateObj.getMonth() + 1; // 1-12
  const climate = BMKG_CLIMATE_BANGKA.find(c => c.bulanAngka === bulan) || BMKG_CLIMATE_BANGKA[9];
  const varietasInfo = VARIETAS_BSIP_BANGKA[komoditasId];
  
  let skor = 75;
  let alasan = '';
  const mitigasi: string[] = [];
  const hamaPenyakit: string[] = [];
  let kebutuhanAirMm = 4.5;

  const isRainySeason = [10, 11, 12, 1, 2].includes(bulan);
  const isTransitionSeason = [3, 4, 9].includes(bulan);
  const isDrySeason = [5, 6, 7, 8].includes(bulan);

  if (komoditasId === 'padi_sawah') {
    kebutuhanAirMm = 7.5;
    if (irigasi === 'Tadah Hujan') {
      if (isRainySeason) {
        skor = 95;
        alasan = `Sangat optimal! Bulan ${climate.namaBulan} memiliki curah hujan ${climate.curahHujanMm} mm dengan ${climate.hariHujan} hari hujan, memasok kebutuhan air alami lahan sawah tadah hujan di ${kecamatan}.`;
        mitigasi.push('Bersihkan saluran pembagi air agar genangan air macak-macak merata.');
        mitigasi.push('Gunakan varietas tahan rendaman Inpara 8 jika petak sawah berdekatan dengan daerah rawa/aliran sungai.');
        hamaPenyakit.push('Wereng Batang Coklat (WBC)', 'Penggerek Batang Padi Kuning');
      } else if (isTransitionSeason) {
        skor = 70;
        alasan = `Cukup sesuai, namun curah hujan mulai fluktuatif (${climate.curahHujanMm} mm/bulan). Disarankan memiliki tandon embung terdekat.`;
        mitigasi.push('Terapkan sistem irigasi berselang (AWD) untuk efisiensi air.');
        hamaPenyakit.push('Tikus Sawah', 'Penyakit Hawar Daun Bakteri (Kresek)');
      } else {
        skor = 40;
        alasan = `Kurang disarankan untuk sawah tadah hujan tanpa irigasi suplementer di bulan ${climate.namaBulan} karena curah hujan rendah (${climate.curahHujanMm} mm). Risiko tinggi cekaman kekeringan saat bunting/pengisian bulir.`;
        mitigasi.push('Wajib menyiapkan pompa air sumur bor atau embung jika tetap menanam.');
        mitigasi.push('Pertimbangkan rotasi tanaman palawija/kacang-kacangan untuk memutus siklus hama.');
        hamaPenyakit.push('Walang Sangit', 'Kekeringan / Malai Hampa');
      }
    } else {
      // Irigasi Teknis / Embung
      skor = 90;
      alasan = `Sangat direkomendasikan. Dengan sistem ${irigasi}, pasokan air di ${kecamatan} terjamin stabil sepanjang siklus ${varietasInfo.siklusHari} hari.`;
      mitigasi.push('Keringkan sawah saat pemupukan ke-2 agar pupuk terserap maksimal oleh perakaran.');
      hamaPenyakit.push('Penggerek Batang Padi', 'Tikus Sawah');
    }
  } else if (komoditasId === 'padi_ladang') {
    kebutuhanAirMm = 5.0;
    if (isRainySeason || bulan === 9) {
      skor = 92;
      alasan = `Waktu primadona untuk padi ladang/gogo Bangka! Tanah mulai lembap terkena awal hujan monsun, memacu daya kecambah benih tugal.`;
      mitigasi.push('Lakukan penugalan serentak dalam hamparan poktan untuk meminimalisir serangan burung.');
      mitigasi.push('Tambahkan dolomit (kapur pertanian) 600 kg/Ha saat olah tanah untuk menetralkan pH tanah Podsolik Merah Kuning.');
      hamaPenyakit.push('Ulat Grayak (Spodoptera frugiperda)', 'Burung Pipit', 'Penyakit Blast (Pyricularia oryzae)');
    } else {
      skor = 45;
      alasan = `Kurang disarankan. Padi ladang di bulan ${climate.namaBulan} rentan kekurangan lengas tanah di fase pembentukan malai.`;
      mitigasi.push('Gunakan varietas super adaptif kering seperti Inpago 9 atau Inpago 10.');
      hamaPenyakit.push('Kekeringan', 'Semut Perusak Benih');
    }
  } else {
    // Cabai (Rawit, Besar, Keriting)
    kebutuhanAirMm = 4.0;
    if (isTransitionSeason || (isDrySeason && irigasi !== 'Tadah Hujan')) {
      skor = 94;
      alasan = `Sangat ideal untuk komoditas cabai! Penyinaran matahari melimpah dengan kelembapan udara 74-82% RH menekan spora jamur antraknosa dan memaksimalkan pembungaan.`;
      mitigasi.push('Pasang mulsa plastik hitam perak (MPHP) untuk menjaga kelembapan tanah dan menekan gulma.');
      mitigasi.push('Gunakan sistem siram kocor terjadwal pada pagi hari (pukul 07.00 - 09.00).');
      hamaPenyakit.push('Thrips', 'Kutu Kebul (Bemisia tabaci)', 'Tungau Merah');
    } else if (isRainySeason) {
      skor = 65;
      alasan = `Cukup sesuai dengan catatan rekayasa teknis ketat. Curah hujan tinggi (${climate.curahHujanMm} mm/bulan) dan kelembapan >85% sangat memicu jamur antraknosa (patek) dan busuk buah jika drainase buruk.`;
      mitigasi.push('Tinggikan bedengan minimal 40-50 cm dengan parit pembuangan air yang lancar.');
      mitigasi.push('Aplikasi trichoderma pada media tanam dan semprot fungisida tembaga secara preventif setelah hujan lebat.');
      mitigasi.push('Gunakan varietas tahan cuaca lembap: ' + varietasInfo.utama.slice(0, 2).join(', '));
      hamaPenyakit.push('Antraknosa / Patek (Colletotrichum)', 'Layu Bakteri (Ralstonia)', 'Lalat Buah');
    } else {
      skor = 55;
      alasan = `Memerlukan sumber air mandiri. Pada bulan ${climate.namaBulan}, cabai tidak boleh kekurangan air di fase pembungaan.`;
      mitigasi.push('Gunakan irigasi tetes atau sumur bor.');
      hamaPenyakit.push('Kutu Daun', 'Layu Fusarium');
    }
  }

  // Adjust status label and color
  let statusKesesuaian: CropSuitabilityResult['statusKesesuaian'] = 'Cukup Sesuai (Dengan Rekayasa Teknis)';
  let badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';

  if (skor >= 85) {
    statusKesesuaian = 'Sangat Direkomendasikan (Optimal)';
    badgeColor = 'bg-emerald-100 text-emerald-900 border-emerald-300';
  } else if (skor < 60) {
    statusKesesuaian = 'Kurang Disarankan (Risiko Tinggi)';
    badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
  }

  // Calculate Dates
  const tMulaiOlah = addDaysToDate(tglTanam, -15);
  const tTanam = tglTanam;
  const tPupuk1 = addDaysToDate(tglTanam, komoditasId.startsWith('padi') ? 14 : 10);
  const tPupuk2 = addDaysToDate(tglTanam, komoditasId.startsWith('padi') ? 35 : 28);
  const tFaseKritis = addDaysToDate(tglTanam, komoditasId.startsWith('padi') ? 60 : 50);
  const tPanen = addDaysToDate(tglTanam, varietasInfo.siklusHari);

  // Dynamic Phase Breakdown
  const tahapanBudidaya = [
    {
      fase: '1. Pengolahan Lahan & Remedi pH Tanah',
      rentangHari: 'H-15 s/d H-1',
      tanggalTarget: `${formatIndonesianDate(tMulaiOlah)} s/d ${formatIndonesianDate(addDaysToDate(tglTanam, -1))}`,
      aktivitasKunci: 'Pembalikan tanah, pembersihan gulma, pembuatan parit keliling, dan penaburan Kapur Pertanian (Dolomit) + Pupuk Organik.',
      kebutuhanNutrisi: 'Kapur Pertanian 500-800 kg/Ha & Kompos 2.000-5.000 kg/Ha.'
    },
    {
      fase: '2. Penanaman Bibit / Tugal Benih',
      rentangHari: 'Hari H (0 HST)',
      tanggalTarget: formatIndonesianDate(tTanam),
      aktivitasKunci: komoditasId.startsWith('padi') 
        ? 'Pindah tanam bibit umur 15-21 HSS (sistem jajar legowo 2:1 atau 4:1) dengan air macak-macak.'
        : 'Pindah tanam bibit cabai berdaun 4-5 helai pada lubang tanam mulsa, siram air perangsang akar.',
      kebutuhanNutrisi: 'Pupuk dasar NPK Phonska 1/3 dosis.'
    },
    {
      fase: '3. Fase Vegetatif & Pemupukan Susulan I',
      rentangHari: 'H+7 s/d H+14',
      tanggalTarget: formatIndonesianDate(tPupuk1),
      aktivitasKunci: 'Penyulaman bibit mati, penyiangan gulma awal, serta pengamatan dini gejala serangan hama bibit.',
      kebutuhanNutrisi: 'Urea (1/2 dosis) + NPK (1/3 dosis) untuk percepatan pembentukan anakan & tajuk.'
    },
    {
      fase: '4. Fase Generatif & Pemupukan Susulan II',
      rentangHari: 'H+28 s/d H+35',
      tanggalTarget: formatIndonesianDate(tPupuk2),
      aktivitasKunci: komoditasId.startsWith('padi')
        ? 'Pengaturan muka air 3-5 cm saat bunting, pasang umpan tikus, dan sanitasi gulma pematang.'
        : 'Pemasangan ajir bambu penopang ranting dan pewiwilan tunas air.',
      kebutuhanNutrisi: 'Sisa Urea (1/2 dosis) + NPK (1/3 dosis terakhir) kaya kalium & fosfat.'
    },
    {
      fase: '5. Pengawalan OPT Kritis & Pengisian Buah/Bulir',
      rentangHari: komoditasId.startsWith('padi') ? 'H+55 s/d H+75' : 'H+45 s/d H+65',
      tanggalTarget: formatIndonesianDate(tFaseKritis),
      aktivitasKunci: `Monitoring intensif serangan ${hamaPenyakit.slice(0, 2).join(' dan ')}. Pastikan air mencukupi saat pengisian.`,
      kebutuhanNutrisi: 'Pupuk daun kalsium & boron cair untuk mencegah kerontokan bunga dan malai hampa.'
    },
    {
      fase: '6. Panen Raya & Penanganan Pasca Panen',
      rentangHari: `H+${varietasInfo.siklusHari}`,
      tanggalTarget: formatIndonesianDate(tPanen),
      aktivitasKunci: komoditasId.startsWith('padi')
        ? 'Panen saat 90-95% bulir menguning, gunakan thresher/combine harvester untuk meminimalisir losses <3%.'
        : 'Pemetikan buah masak fisiologis (90% warna merah) di pagi hari saat embun kering, wadahi keranjang berventilasi.',
      kebutuhanNutrisi: 'Keringkan segera hingga kadar air aman simpan (GKP 14%, cabai segar langsung distribusi).'
    }
  ];

  return {
    komoditasId,
    namaKomoditas: komoditasId === 'padi_sawah' ? 'Padi Sawah' : komoditasId === 'padi_ladang' ? 'Padi Ladang' : komoditasId === 'cabai_rawit' ? 'Cabai Rawit' : komoditasId === 'cabai_besar' ? 'Cabai Besar' : 'Cabai Merah Keriting',
    kecamatan,
    bulanTanam: bulan,
    namaBulan: climate.namaBulan,
    irigasi,
    tipeLahan: tipeLahan || 'Lahan Dataran Rendah',
    statusKesesuaian,
    skorKesesuaian: skor,
    badgeColor,
    varietasRekomendasi: varietasInfo.utama,
    alasanAgroklimat: alasan,
    mitigasiRisiko: mitigasi,
    kebutuhanAirMmPerHari: kebutuhanAirMm,
    hamaPenyakitUtama: hamaPenyakit,
    tanggalMulaiOlah: tMulaiOlah,
    tanggalTanam: tTanam,
    tanggalPupuk1: tPupuk1,
    tanggalPupuk2: tPupuk2,
    tanggalFaseKritisOpt: tFaseKritis,
    tanggalEstimasiPanen: tPanen,
    totalHariBudidaya: varietasInfo.siklusHari,
    tahapanBudidaya
  };
};
