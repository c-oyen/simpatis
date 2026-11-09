import { 
  LandParcel, 
  KecamatanBangka, 
  CommodityId, 
  FertilizerNeedRecord, 
  HarvestRecord, 
  PostHarvestLoss 
} from '../types';
import { COMMODITIES, KECAMATAN_LIST, formatDesaKelurahan, INITIAL_POST_HARVEST_LOSSES } from '../data/bangkaData';

export const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzleU7fO-odcpqMpUO4bYipfdDA5SO3PkbWQV57Ib0QZ5z1gCc8OHmgHyn-nyW0O1eK5Q/exec';

export function getCustomAppsScriptUrl(): string {
  try {
    const saved = localStorage.getItem('simpatis_custom_apps_script_url');
    if (saved && saved.trim().startsWith('http')) {
      return saved.trim();
    }
  } catch {}
  return APPS_SCRIPT_URL;
}

export function setCustomAppsScriptUrl(url: string): void {
  try {
    if (url && url.trim().startsWith('http')) {
      localStorage.setItem('simpatis_custom_apps_script_url', url.trim());
    } else {
      localStorage.removeItem('simpatis_custom_apps_script_url');
    }
  } catch {}
}

// Daftar Nama Sheet Resmi Sesuai Ketentuan Multi-Sheet
export const SHEET_NAMES = {
  DATA_PETANI_LAHAN: 'Data Petani & Lahan',
  KEBUTUHAN_PUPUK: 'Kebutuhan Pupuk',
  MONITORING_PRODUKSI: 'Monitoring Produksi',
  PENGENDALIAN_KEHILANGAN: 'Pengendalian Kehilangan Hasil'
} as const;

export type SupportedSheetName = typeof SHEET_NAMES[keyof typeof SHEET_NAMES];

// Peta Desa ke Kecamatan Resmi Kabupaten Bangka
export const VILLAGE_TO_KECAMATAN: Record<string, KecamatanBangka> = {
  // Sungailiat
  'sungailiat': 'Sungailiat', 'sri menanti': 'Sungailiat', 'kuday': 'Sungailiat', 'sinar baru': 'Sungailiat',
  'parit padang': 'Sungailiat', 'kenanga': 'Sungailiat', 'rebo': 'Sungailiat', 'surya timur': 'Sungailiat',
  'matras': 'Sungailiat', 'jelitik': 'Sungailiat', 'bukit betung': 'Sungailiat', 'lubuk kelik': 'Sungailiat',
  'sinar jaya jelutung': 'Sungailiat',
  // Belinyu
  'belinyu': 'Belinyu', 'kuto panji': 'Belinyu', 'remodong': 'Belinyu', 'bukit ketok': 'Belinyu',
  'mantung': 'Belinyu', 'air asam': 'Belinyu', 'air jukung': 'Belinyu', 'bintet': 'Belinyu', 'gunung muda': 'Belinyu',
  'gunung pelawan': 'Belinyu', 'lumut': 'Belinyu', 'riding panjang': 'Belinyu',
  // Merawang
  'merawang': 'Merawang', 'batu rusa': 'Merawang', 'kimak': 'Merawang', 'balunijuk': 'Merawang', 'jurung': 'Merawang',
  'air anyir': 'Merawang', 'jada bahrin': 'Merawang', 'pagarawan': 'Merawang', 'dwi makmur': 'Merawang',
  // Mendo Barat
  'kemuja': 'Mendo Barat', 'petaling': 'Mendo Barat', 'petaling banjar': 'Mendo Barat', 'zed': 'Mendo Barat',
  'paya benua': 'Mendo Barat', 'labu': 'Mendo Barat', 'kota kapur': 'Mendo Barat', 'penagan': 'Mendo Barat',
  'rukam': 'Mendo Barat', 'cengkong abang': 'Mendo Barat', 'mendo': 'Mendo Barat', 'air buluh': 'Mendo Barat',
  'air duren': 'Mendo Barat', 'kace': 'Mendo Barat', 'kace timur': 'Mendo Barat',
  // Pemali
  'pemali': 'Pemali', 'air ruai': 'Pemali', 'karya makmur': 'Pemali', 'penyamun': 'Pemali', 'sempan': 'Pemali',
  // Bakam
  'bakam': 'Bakam', 'bukit layang': 'Bakam', 'dalil': 'Bakam', 'kapuk': 'Bakam', 'mabat': 'Bakam',
  'mangka': 'Bakam', 'maras senang': 'Bakam', 'neknang': 'Bakam', 'tiang tarah': 'Bakam',
  // Riau Silip
  'riau': 'Riau Silip', 'silip': 'Riau Silip', 'beloreng': 'Riau Silip', 'berbura': 'Riau Silip',
  'cit': 'Riau Silip', 'deniang': 'Riau Silip', 'mapur': 'Riau Silip', 'pangkal niur': 'Riau Silip',
  'puguk': 'Riau Silip', 'banyuasin': 'Riau Silip', 'banyu asin': 'Riau Silip',
  // Puding Besar
  'puding besar': 'Puding Besar', 'kayu besi': 'Puding Besar', 'kotawaringin': 'Puding Besar',
  'saing': 'Puding Besar', 'tanah bawah': 'Puding Besar', 'nibung': 'Puding Besar'
};

// ============================================================================
// 1. DATA PETANI & LAHAN PARSERS & TRANSFORMERS
// ============================================================================
export interface SheetParcelRow {
  nama_petani?: string;
  kelompok_tani?: string;
  lokasi?: string;
  komoditas?: string;
  luas_lahan?: string | number;
  kemasaman?: string | number;
  sistem_irigasi?: string;
  timestamp?: string;
  [key: string]: any;
}

export function parseSheetRowToParcel(row: SheetParcelRow, index: number): LandParcel | null {
  // Dukung nama kolom snake_case, UPPERCASE, dan Title Case
  let namaPetani = (
    row.nama_petani || 
    row['NAMA PETANI'] || 
    row['Nama Petani'] || 
    row.namaPetani || 
    ''
  ).toString().trim();

  let poktan = (
    row.kelompok_tani || 
    row['KELOMPOK TANI'] || 
    row['Kelompok Tani'] || 
    row.poktan || 
    'Poktan Bangka'
  ).toString().trim();

  let lokasiStr = (
    row.lokasi || 
    row['LOKASI'] || 
    row['Lokasi'] || 
    ''
  ).toString().trim();

  let rawKomoditas = (
    row.komoditas || 
    row['KOMODITAS'] || 
    row['Komoditas'] || 
    'Padi Sawah'
  ).toString().trim();

  let rawLuas = (
    row.luas_lahan || 
    row['LUAS LAHAN'] || 
    row['Luas Lahan'] || 
    row.luasHa || 
    '1.5'
  ).toString().trim();

  let rawPh = (
    row.kemasaman || 
    row['KEMASAMAN'] || 
    row['Kemasaman'] || 
    row['Kemasaman (pH)'] || 
    row.phTanah || 
    ''
  ).toString().trim();

  let rawIrigasi = (
    row.sistem_pengairan ||
    row['SISTEM PENGAIRAN'] ||
    row['Sistem Pengairan'] ||
    row.sistem_irigasi || 
    row['SISTEM IRIGASI'] || 
    row['Sistem Irigasi'] || 
    row.sistemIrigasi || 
    ''
  ).toString().trim();

  // Pemulihan otomatis jika skrip lama menyisipkan timestamp di Kolom A sehingga data bergeser 1 kolom:
  if (/^\d{4}-\d{2}-\d{2}/.test(namaPetani) && poktan && !/^\d{4}-\d{2}-\d{2}/.test(poktan)) {
    namaPetani = poktan;
    poktan = lokasiStr || 'Poktan Bangka';
    lokasiStr = rawKomoditas || 'Bangka';
    rawKomoditas = rawLuas || 'Padi Sawah';
    rawLuas = rawPh || '1.5 Ha';
    rawPh = rawIrigasi || '5.2';
    rawIrigasi = (row[''] || '').toString().trim() || 'Irigasi';
  }

  // Filter baris kosong atau baris header yang terbaca
  if (!namaPetani || namaPetani.toLowerCase() === 'nama petani') {
    return null;
  }

  // Parsing Kecamatan & Desa dari lokasi
  let kecamatan: KecamatanBangka = 'Mendo Barat';
  let desa = 'Kemuja';
  const lokasiLower = lokasiStr.toLowerCase();

  const kecamatanList: KecamatanBangka[] = [
    'Sungailiat', 'Belinyu', 'Merawang', 'Mendo Barat', 'Pemali', 'Bakam', 'Riau Silip', 'Puding Besar'
  ];

  let foundKec = false;
  for (const kec of kecamatanList) {
    if (lokasiLower.includes(kec.toLowerCase())) {
      kecamatan = kec;
      foundKec = true;
      break;
    }
  }

  // Cek mapping desa untuk menentukan kecamatan jika belum terdeteksi
  for (const [villageKey, kecValue] of Object.entries(VILLAGE_TO_KECAMATAN)) {
    if (lokasiLower.includes(villageKey)) {
      if (!foundKec) {
        kecamatan = kecValue;
        foundKec = true;
      }
      desa = villageKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  desa = (row.kelurahan_desa || row['KELURAHAN/DESA'] || row['Kelurahan/Desa'] || row.desa || row['DESA'] || row['Desa'] || desa).toString().trim();
  desa = desa.replace(/^(desa|kelurahan)\s+/i, '').trim();

  if (!lokasiStr) {
    lokasiStr = `${desa}, Kec. ${kecamatan}`;
  } else {
    lokasiStr = lokasiStr.replace(/\b(desa|kelurahan)\s+/gi, '').trim();
    if (!desa) {
      desa = lokasiStr;
    }
  }

  // Deteksi Komoditas
  let komoditas: CommodityId = 'padi_sawah';
  const lowerKom = rawKomoditas.toLowerCase();
  if (lowerKom.includes('ladang') || lowerKom.includes('gogo') || lowerKom.includes('inpago')) {
    komoditas = 'padi_ladang';
  } else if (lowerKom.includes('rawit') || lowerKom.includes('ori 212')) {
    komoditas = 'cabai_rawit';
  } else if (lowerKom.includes('keriting') || lowerKom.includes('lado')) {
    komoditas = 'cabai_merah_keriting';
  } else if (lowerKom.includes('besar') || lowerKom.includes('gada')) {
    komoditas = 'cabai_besar';
  } else if (lowerKom.includes('padi')) {
    komoditas = 'padi_sawah';
  }

  let varietas = 'Varietas Unggul Bangka';
  const varMatch = rawKomoditas.match(/\(([^)]+)\)/);
  if (varMatch && varMatch[1]) {
    varietas = varMatch[1].trim();
  } else {
    varietas = rawKomoditas.replace(/Padi Sawah|Padi Ladang|Cabai Rawit|Cabai Merah Keriting|Cabai Besar/i, '').trim() || 'Unggul Standar';
  }

  // Luas Lahan (Ha)
  const luasClean = rawLuas.replace(',', '.');
  const luasMatch = luasClean.match(/([0-9.]+)/);
  const luasHa = luasMatch ? parseFloat(luasMatch[1]) : 1.5;

  // pH Tanah
  const phClean = rawPh.replace(',', '.');
  const phMatch = phClean.match(/([0-9.]+)/);
  const phTanah = phMatch ? parseFloat(phMatch[1]) : 5.2;

  // Sistem Pengairan
  let sistemIrigasi: LandParcel['sistemIrigasi'] = 'Irigasi';
  const irigasiLower = rawIrigasi.toLowerCase();
  if (irigasiLower.includes('tadah') || irigasiLower.includes('hujan')) {
    sistemIrigasi = 'Tadah Hujan';
  } else if (irigasiLower.includes('embung') || irigasiLower.includes('sumur') || irigasiLower.includes('bor')) {
    sistemIrigasi = 'Embung / Sumur Bor';
  } else {
    sistemIrigasi = 'Irigasi';
  }

  const kecCoords: Record<KecamatanBangka, { lat: number; lng: number }> = {
    'Sungailiat': { lat: -1.8624, lng: 106.1212 },
    'Belinyu': { lat: -1.6372, lng: 105.7725 },
    'Merawang': { lat: -2.0465, lng: 106.0963 },
    'Mendo Barat': { lat: -2.1554, lng: 105.9782 },
    'Pemali': { lat: -1.8901, lng: 106.0504 },
    'Bakam': { lat: -1.9723, lng: 105.8895 },
    'Riau Silip': { lat: -1.7482, lng: 105.9125 },
    'Puding Besar': { lat: -2.0125, lng: 105.9912 }
  };
  const baseCoord = kecCoords[kecamatan] || { lat: -1.95, lng: 106.05 };
  const jitterLat = ((index * 37) % 50 - 25) * 0.0015;
  const jitterLng = ((index * 43) % 50 - 25) * 0.0015;

  return {
    id: `LP-SHEET-${index + 1}`,
    kodePetak: `PETAK-GS-${String(index + 1).padStart(3, '0')}`,
    namaPetani,
    nik: `19010${(index % 8) + 1}${String(1000000000 + index * 9871).slice(-10)}`,
    poktan,
    kecamatan,
    desa,
    lokasi: lokasiStr,
    komoditas,
    namaKomoditasRaw: rawKomoditas,
    varietas,
    luasHa: Number(luasHa.toFixed(2)),
    phTanah: Number(phTanah.toFixed(1)),
    jenisTanah: phTanah < 5.0 ? 'Podsolik Merah Kuning (Ultisol)' : phTanah < 5.8 ? 'Aluvial' : 'Latosol',
    koordinat: {
      lat: Number((baseCoord.lat + jitterLat).toFixed(4)),
      lng: Number((baseCoord.lng + jitterLng).toFixed(4))
    },
    tahunTanam: 2026,
    sistemIrigasi,
    terakhirDiperbarui: new Date().toISOString().split('T')[0]
  };
}

export function parcelToSheetRow(parcel: LandParcel) {
  const commodityObj = COMMODITIES.find(c => c.id === parcel.komoditas);
  const commodityName = commodityObj ? commodityObj.nama : (parcel.komoditas || 'Padi Sawah');
  const varLabel = parcel.varietas && parcel.varietas !== 'Unggul Standar' ? `(${parcel.varietas})` : '';
  const fullKomoditas = parcel.namaKomoditasRaw || `${commodityName} ${varLabel}`.trim();
  const cleanDesa = (parcel.desa || '').replace(/^(desa|kelurahan)\s+/i, '').trim();
  let lokasiFormatted = parcel.lokasi 
    ? parcel.lokasi.replace(/\b(desa|kelurahan)\s+/gi, '').trim() 
    : '';
  if (!lokasiFormatted) {
    lokasiFormatted = cleanDesa ? `${cleanDesa}, Kec. ${parcel.kecamatan}` : `Kec. ${parcel.kecamatan}`;
  }

  return {
    sheetName: SHEET_NAMES.DATA_PETANI_LAHAN,
    // 7 Kolom Resmi Sesuai Format Google Sheets
    nama_petani: parcel.namaPetani,
    'NAMA PETANI': parcel.namaPetani,
    kelompok_tani: parcel.poktan,
    'KELOMPOK TANI': parcel.poktan,
    kelurahan_desa: cleanDesa,
    'KELURAHAN/DESA': cleanDesa,
    'Kelurahan/Desa': cleanDesa,
    desa: cleanDesa,
    'DESA': cleanDesa,
    lokasi: lokasiFormatted,
    'LOKASI': lokasiFormatted,
    komoditas: fullKomoditas,
    'KOMODITAS': fullKomoditas,
    luas_lahan: `${parcel.luasHa} ha`,
    'LUAS LAHAN': `${parcel.luasHa} ha`,
    kemasaman: parcel.phTanah ? `pH ${parcel.phTanah}` : '',
    'KEMASAMAN': parcel.phTanah ? `pH ${parcel.phTanah}` : '',
    sistem_pengairan: parcel.sistemIrigasi === 'Irigasi Teknis' ? 'Irigasi' : (parcel.sistemIrigasi || 'Irigasi'),
    'SISTEM PENGAIRAN': parcel.sistemIrigasi === 'Irigasi Teknis' ? 'Irigasi' : (parcel.sistemIrigasi || 'Irigasi'),
    sistem_irigasi: parcel.sistemIrigasi === 'Irigasi Teknis' ? 'Irigasi' : (parcel.sistemIrigasi || 'Irigasi'),
    'SISTEM IRIGASI': parcel.sistemIrigasi === 'Irigasi Teknis' ? 'Irigasi' : (parcel.sistemIrigasi || 'Irigasi')
  };
}

// ============================================================================
// 2. KEBUTUHAN PUPUK PARSERS & TRANSFORMERS
// ============================================================================
export interface SheetFertilizerRow {
  kelompok_tani?: string;
  lokasi?: string;
  komoditas?: string;
  luas_lahan?: string | number;
  luas_lahan_ha?: string | number;
  kios_penyalur?: string;
  kios_penyalur_resmi?: string;
  urea_kg?: string | number;
  kebutuhan_urea_kg?: string | number;
  npk_kg?: string | number;
  kebutuhan_npk_kg?: string | number;
  organik_kg?: string | number;
  kebutuhan_organik_kg?: string | number;
  musim_tanam?: string;
  keterangan?: string;
  [key: string]: any;
}

export function parseSheetRowToFertilizerNeed(row: SheetFertilizerRow, index: number): FertilizerNeedRecord | null {
  const poktan = (row.kelompok_tani || row['Kelompok Tani'] || row['KELOMPOK TANI'] || '').toString().trim();
  if (!poktan || /^\d{4}-\d{2}-\d{2}/.test(poktan)) {
    return null;
  }
  const lokasi = (row.lokasi || row['Lokasi'] || row['LOKASI'] || 'Desa Kemuja, Kec. Mendo Barat').toString();

  let kecamatan: KecamatanBangka = 'Mendo Barat';
  let desa = 'Kemuja';
  const kecamatanNames: KecamatanBangka[] = [
    'Sungailiat', 'Belinyu', 'Merawang', 'Mendo Barat', 'Pemali', 'Bakam', 'Riau Silip', 'Puding Besar'
  ];
  for (const kec of kecamatanNames) {
    if (new RegExp(kec, 'i').test(lokasi)) {
      kecamatan = kec;
      break;
    }
  }
  const rawDesa = (row.kelurahan_desa || row['KELURAHAN/DESA'] || row['Kelurahan/Desa'] || row.desa || row['DESA'] || row['Desa'] || '').toString().trim();
  if (rawDesa) {
    desa = rawDesa.replace(/^(desa|kelurahan)\s+/i, '').trim();
  } else {
    const desaMatch = lokasi.match(/(?:desa|kelurahan)?\s*([A-Za-z\s]+?)(?:,|$)/i);
    if (desaMatch && desaMatch[1]) {
      desa = desaMatch[1].replace(/^(desa|kelurahan)\s+/i, '').trim();
    }
  }
  desa = desa.replace(/^(desa|kelurahan)\s+/i, '').trim();

  const rawKom = (row.komoditas || row['Komoditas'] || 'padi_sawah').toString().toLowerCase();
  let komoditas: CommodityId = 'padi_sawah';
  if (rawKom.includes('ladang') || rawKom.includes('gogo')) komoditas = 'padi_ladang';
  else if (rawKom.includes('rawit')) komoditas = 'cabai_rawit';
  else if (rawKom.includes('keriting')) komoditas = 'cabai_merah_keriting';
  else if (rawKom.includes('besar')) komoditas = 'cabai_besar';

  const luasRaw = (row.luas_lahan || row.luas_lahan_ha || row['Luas Lahan (Ha)'] || '5.0').toString().replace(',', '.');
  const luasMatch = luasRaw.match(/([0-9.]+)/);
  const luasLahanHa = luasMatch ? parseFloat(luasMatch[1]) : 5.0;

  const kiosPenyalur = (row.kios_penyalur || row.kios_penyalur_resmi || row['Kios Penyalur Resmi'] || 'UD Sumber Rejeki Tani').toString();

  const parseNumber = (val: any, def: number) => {
    if (val === undefined || val === null || val === '') return def;
    const num = parseFloat(val.toString().replace(/[^0-9.]/g, ''));
    return isNaN(num) ? def : num;
  };

  const kebutuhanUreaKg = parseNumber(row.urea_kg || row.kebutuhan_urea_kg || row['Kebutuhan Urea (Kg)'], 1000);
  const kebutuhanNpkKg = parseNumber(row.npk_kg || row.kebutuhan_npk_kg || row['Kebutuhan NPK (Kg)'], 1500);
  const kebutuhanOrganikKg = parseNumber(row.organik_kg || row.kebutuhan_organik_kg || row['Kebutuhan Organik (Kg)'], 2500);
  const musimTanam = (row.musim_tanam || row['Musim Tanam'] || 'MT I 2026/2027').toString();
  const keterangan = (row.keterangan || row['Keterangan'] || 'Alokasi kebutuhan pupuk berimbang.').toString();

  return {
    id: `FND-GS-${index + 1}`,
    poktan,
    kecamatan,
    desa,
    komoditas,
    luasLahanHa,
    kiosPenyalur,
    kebutuhanUreaKg,
    kebutuhanNpkKg,
    kebutuhanOrganikKg,
    musimTanam,
    keterangan
  };
}

export function fertilizerNeedToSheetRow(need: FertilizerNeedRecord) {
  const comm = COMMODITIES.find(c => c.id === need.komoditas);
  const cleanDesa = (need.desa || '').replace(/^(desa|kelurahan)\s+/i, '').trim();
  const lokasiFormatted = cleanDesa ? `${cleanDesa}, Kec. ${need.kecamatan}` : `Kec. ${need.kecamatan}`;
  return {
    sheetName: SHEET_NAMES.KEBUTUHAN_PUPUK,
    kelompok_tani: need.poktan,
    'KELOMPOK TANI': need.poktan,
    lokasi: lokasiFormatted,
    'LOKASI': lokasiFormatted,
    kelurahan_desa: cleanDesa,
    'KELURAHAN/DESA': cleanDesa,
    'Kelurahan/Desa': cleanDesa,
    desa: cleanDesa,
    'DESA': cleanDesa,
    komoditas: comm ? comm.nama : 'Padi Sawah',
    'KOMODITAS': comm ? comm.nama : 'Padi Sawah',
    luas_lahan: `${need.luasLahanHa} Ha`,
    'LUAS LAHAN': `${need.luasLahanHa} Ha`,
    kios_penyalur: need.kiosPenyalur,
    'KIOS PENYALUR': need.kiosPenyalur,
    urea_kg: need.kebutuhanUreaKg,
    npk_kg: need.kebutuhanNpkKg,
    organik_kg: need.kebutuhanOrganikKg,
    musim_tanam: need.musimTanam,
    keterangan: need.keterangan
  };
}

// ============================================================================
// 3. MONITORING PRODUKSI PARSERS & TRANSFORMERS
// ============================================================================
export interface SheetHarvestRow {
  kode_panen?: string;
  nama_petani?: string;
  kelompok_tani?: string;
  lokasi?: string;
  kecamatan?: string;
  komoditas?: string;
  luas_panen_ha?: string | number;
  estimasi_ton?: string | number;
  estimasi_produksi_ton?: string | number;
  realisasi_ton?: string | number;
  realisasi_produksi_ton?: string | number;
  produktivitas?: string | number;
  produktivitas_ton_ha?: string | number;
  deviasi_persen?: string | number;
  tanggal_panen?: string;
  [key: string]: any;
}

export function parseSheetRowToHarvestRecord(row: SheetHarvestRow, index: number): HarvestRecord | null {
  const namaPetani = (row.nama_petani || row['Nama Petani'] || row['NAMA PETANI'] || '').toString().trim();
  const poktan = (row.kelompok_tani || row['Kelompok Tani'] || row['KELOMPOK TANI'] || '').toString().trim();
  const rawKode = (row.kode_panen || row['Kode Panen'] || row['KODE PANEN'] || '').toString().trim();

  // Filter out blank or corrupt timestamp rows
  if ((!namaPetani && !poktan && !rawKode) || /^\d{4}-\d{2}-\d{2}/.test(namaPetani) || /^\d{4}-\d{2}-\d{2}/.test(poktan)) {
    return null;
  }

  const kodePanen = rawKode || `PAN-GS-${String(index + 1).padStart(3, '0')}`;
  const lokasi = (row.lokasi || row.kecamatan || row['Kecamatan'] || 'Mendo Barat').toString();

  let kecamatan: KecamatanBangka = 'Mendo Barat';
  const kecamatanNames: KecamatanBangka[] = [
    'Sungailiat', 'Belinyu', 'Merawang', 'Mendo Barat', 'Pemali', 'Bakam', 'Riau Silip', 'Puding Besar'
  ];
  for (const kec of kecamatanNames) {
    if (new RegExp(kec, 'i').test(lokasi)) {
      kecamatan = kec;
      break;
    }
  }

  const rawKom = (row.komoditas || row['Komoditas'] || 'padi_sawah').toString().toLowerCase();
  let komoditas: CommodityId = 'padi_sawah';
  if (rawKom.includes('ladang') || rawKom.includes('gogo')) komoditas = 'padi_ladang';
  else if (rawKom.includes('rawit')) komoditas = 'cabai_rawit';
  else if (rawKom.includes('keriting')) komoditas = 'cabai_merah_keriting';
  else if (rawKom.includes('besar')) komoditas = 'cabai_besar';

  const parseNum = (v: any, def: number) => {
    if (v === undefined || v === null || v === '') return def;
    const num = parseFloat(v.toString().replace(/[^0-9.]/g, ''));
    return isNaN(num) ? def : num;
  };

  const luasPanenHa = parseNum(row.luas_panen_ha || row['Luas Panen (Ha)'], 2.0);
  const estimasiProduksiTon = parseNum(row.estimasi_ton || row.estimasi_produksi_ton || row['Estimasi Produksi (Ton)'], 12.0);
  const realisasiProduksiTon = parseNum(row.realisasi_ton || row.realisasi_produksi_ton || row['Realisasi Produksi (Ton)'], 12.5);
  const deviasiPersen = estimasiProduksiTon > 0 ? Number((((realisasiProduksiTon - estimasiProduksiTon) / estimasiProduksiTon) * 100).toFixed(2)) : 0;
  const produktivitasTonPerHa = luasPanenHa > 0 ? Number((realisasiProduksiTon / luasPanenHa).toFixed(2)) : 0;
  const tanggalPanen = (row.tanggal_panen || row['Tanggal Panen'] || new Date().toISOString().split('T')[0]).toString();

  return {
    id: `HRV-GS-${index + 1}`,
    kodePanen,
    kodePetak: `PETAK-PAN-${index + 1}`,
    poktan,
    namaPetani,
    kecamatan,
    komoditas,
    luasPanenHa,
    estimasiProduksiTon,
    realisasiProduksiTon,
    deviasiPersen,
    produktivitasTonPerHa,
    tanggalPanen
  };
}

export function harvestRecordToSheetRow(record: HarvestRecord) {
  const comm = COMMODITIES.find(c => c.id === record.komoditas);
  return {
    sheetName: SHEET_NAMES.MONITORING_PRODUKSI,
    kode_panen: record.kodePanen,
    nama_petani: record.namaPetani,
    kelompok_tani: record.poktan,
    lokasi: `Kec. ${record.kecamatan}`,
    komoditas: comm ? comm.nama : 'Padi Sawah',
    luas_panen_ha: `${record.luasPanenHa} Ha`,
    estimasi_ton: `${record.estimasiProduksiTon} Ton`,
    realisasi_ton: `${record.realisasiProduksiTon} Ton`,
    produktivitas: `${record.produktivitasTonPerHa} Ton/Ha`,
    deviasi_persen: `${record.deviasiPersen}%`,
    tanggal_panen: record.tanggalPanen
  };
}

// ============================================================================
// 4. PENGENDALIAN KEHILANGAN HASIL (LOSS CONTROL) PARSERS & TRANSFORMERS
// ============================================================================
export interface SheetLossRow {
  komoditas?: string;
  lokasi?: string;
  kecamatan?: string;
  kelompok_tani?: string;
  tahap_kehilangan?: string;
  persentase_susut?: string | number;
  bobot_susut_kg?: string | number;
  harga_satuan_rp?: string | number;
  total_kerugian_rp?: string | number;
  penyebab_utama?: string;
  intervensi_mekanisasi?: string;
  [key: string]: any;
}

export function parseSheetRowToLossRecord(row: SheetLossRow, index: number): PostHarvestLoss | null {
  const poktan = (row.kelompok_tani || row['Kelompok Tani'] || row['KELOMPOK TANI'] || '').toString().trim();
  const rawKom = (row.komoditas || row['Komoditas'] || row['KOMODITAS'] || '').toString().toLowerCase().trim();

  // Filter out blank or corrupt timestamp rows
  if ((!poktan && !rawKom) || /^\d{4}-\d{2}-\d{2}/.test(poktan) || /^\d{4}-\d{2}-\d{2}/.test(rawKom)) {
    return null;
  }
  let komoditas: CommodityId = 'padi_sawah';
  if (rawKom.includes('ladang') || rawKom.includes('gogo')) komoditas = 'padi_ladang';
  else if (rawKom.includes('rawit')) komoditas = 'cabai_rawit';
  else if (rawKom.includes('keriting')) komoditas = 'cabai_merah_keriting';
  else if (rawKom.includes('besar')) komoditas = 'cabai_besar';

  const lokasi = (row.lokasi || row.kecamatan || row['Kecamatan'] || 'Mendo Barat').toString();
  let kecamatan: KecamatanBangka = 'Mendo Barat';
  const kecamatanNames: KecamatanBangka[] = [
    'Sungailiat', 'Belinyu', 'Merawang', 'Mendo Barat', 'Pemali', 'Bakam', 'Riau Silip', 'Puding Besar'
  ];
  for (const kec of kecamatanNames) {
    if (new RegExp(kec, 'i').test(lokasi)) {
      kecamatan = kec;
      break;
    }
  }

  const rawNamaPetani = (
    row.nama_petani || 
    row['Nama Petani'] || 
    row['NAMA PETANI'] || 
    row.namaPetani || 
    ''
  ).toString().trim();

  let rawDesa = (
    row.desa || 
    row['Desa'] || 
    row['DESA'] || 
    row['Kelurahan/Desa'] || 
    row['kelurahan_desa'] || 
    ''
  ).toString().trim();

  if (!rawDesa && lokasi.includes(',')) {
    rawDesa = lokasi.split(',')[0].replace(/^(desa|kelurahan)\s+/i, '').trim();
  }

  const cleanNamaPetani = rawNamaPetani || poktan || 'Zulkifli Mansur';
  const cleanPoktan = poktan || rawNamaPetani || 'Poktan Maju Bersama';

  const rawTahap = (row.tahap_kehilangan || row['Tahap Kehilangan'] || '').toString();
  let tahapKehilangan: PostHarvestLoss['tahapKehilangan'] = 'Pengeringan / Penjemuran Lantai';
  if (rawTahap.includes('Pemanenan')) tahapKehilangan = 'Pemanenan & Sortasi Batang';
  else if (rawTahap.includes('Perontokan')) tahapKehilangan = 'Perontokan & Pengangkutan Lahan';
  else if (rawTahap.includes('Penyortiran')) tahapKehilangan = 'Penyortiran & Pengemasan Keranjang';
  else if (rawTahap.includes('Penyimpanan') || rawTahap.includes('Gudang')) tahapKehilangan = 'Penyimpanan Gudang & Truk Distribusi';

  const parseNum = (v: any, def: number) => {
    if (v === undefined || v === null || v === '') return def;
    const num = parseFloat(v.toString().replace(/[^0-9.]/g, ''));
    return isNaN(num) ? def : num;
  };

  let persentaseSusut = parseNum(
    row.persentase_susut || 
    row['Persentase Susut (%)'] || 
    row['% Kehilangan Hasil'] || 
    row['% Kehilangan'] || 
    row['% KEHILANGAN HASIL'], 
    3.5
  );

  // Jika persentase di spreadsheet tersimpan sebagai desimal (contoh: 0.1 untuk 10%, 0.05 untuk 5%, 0.048 untuk 4.8%)
  if (persentaseSusut > 0 && persentaseSusut <= 1.0) {
    persentaseSusut = Number((persentaseSusut * 100).toFixed(1));
  }
  const bobotSusutKg = parseNum(
    row.bobot_susut_kg || 
    row['Bobot Susut (Kg)'] || 
    row['Jumlah Kehilangan Hasil (kg)'] || 
    row['Jumlah Kehilangan Hasil'] || 
    row['BOBOT SUSUT (KG)'], 
    250
  );
  const hargaSatuanRp = parseNum(
    row.harga_satuan_rp || 
    row['Harga Satuan (Rp/Kg)'] || 
    row['Harga Satuan (Rp)'] || 
    row['Harga per kg'] || 
    row['HARGA PER KG'], 
    6500
  );
  const totalKerugianRp = parseNum(
    row.total_kerugian_rp || 
    row['Total Nilai Kerugian (Rp)'] || 
    row['Nilai Kehilangan Hasil'] || 
    row['Nilai Kehilangan'] || 
    row['NILAI KEHILANGAN HASIL'], 
    bobotSusutKg * hargaSatuanRp
  );
  const kategoriKeparahan = (row.katagori || row['Katagori'] || row['Kategori'] || row['Metode'] || row['KATAGORI'] || '').toString();
  const potensiHasilKg = parseNum(row.potensi_hasil_per_hektar_kg || row['Potensi Hasil Per Hektar (Kg)'] || row['Potensi Hasil'], komoditas === 'padi_ladang' ? 4000 : 6000);
  const penyebabUtama = (row.penyebab_utama || row['Penyebab Utama'] || (kategoriKeparahan ? `Tingkat ${kategoriKeparahan}` : 'Faktor OPT/Hama Tanaman')).toString();
  const intervensiMekanisasi = (row.intervensi_mekanisasi || row['Intervensi Mekanisasi'] || 'Pengendalian OPT terpadu dan mekanisasi panen').toString();

  return {
    id: `PHL-GS-${index + 1}`,
    harvestRecordId: `HRV-REF-${index + 1}`,
    namaPetani: cleanNamaPetani,
    desa: rawDesa,
    komoditas,
    kecamatan,
    poktan: cleanPoktan,
    tahapKehilangan,
    faktorKehilangan: row.faktor_kehilangan || (kategoriKeparahan.includes('Harvester') || kategoriKeparahan.includes('Thresher') ? 'Penanganan Pasca Panen' : 'OPT / Hama Penyakit'),
    kategoriKeparahan: kategoriKeparahan || (persentaseSusut <= 10 ? 'Ringan' : persentaseSusut <= 25 ? 'Sedang' : persentaseSusut <= 50 ? 'Berat' : 'Puso'),
    potensiHasilKg,
    persentaseSusut,
    bobotSusutKg,
    hargaSatuanRp,
    totalKerugianRp,
    penyebabUtama,
    intervensiMekanisasi
  };
}

export function lossRecordToSheetRow(loss: PostHarvestLoss) {
  const comm = COMMODITIES.find(c => c.id === loss.komoditas);
  const komoditiNama = comm ? comm.nama : (loss.komoditas === 'padi_ladang' ? 'Padi Ladang' : 'Padi Sawah');
  const potensi = loss.potensiHasilKg || (loss.komoditas === 'padi_ladang' ? 4000 : 6000);
  const kategori = loss.kategoriKeparahan || (loss.persentaseSusut <= 10 ? 'Ringan' : loss.persentaseSusut <= 25 ? 'Sedang' : loss.persentaseSusut <= 50 ? 'Berat' : 'Puso');
  const namaPetani = loss.namaPetani || loss.poktan || 'Zulkifli Mansur';
  const cleanDesa = loss.desa ? loss.desa.replace(/^(desa|kelurahan)\s+/i, '').trim() : '';
  const lokasiStr = cleanDesa ? `${cleanDesa}, Kec. ${loss.kecamatan}` : `Kec. ${loss.kecamatan}`;

  return {
    sheetName: SHEET_NAMES.PENGENDALIAN_KEHILANGAN,
    // Nama Petani & Kelurahan/Desa
    nama_petani: namaPetani,
    'Nama Petani': namaPetani,
    'NAMA PETANI': namaPetani,
    desa: cleanDesa,
    'Desa': cleanDesa,
    'DESA': cleanDesa,
    'Kelurahan/Desa': cleanDesa,
    'kelurahan_desa': cleanDesa,
    // Excel-aligned headers
    Komoditi: komoditiNama,
    komoditas: komoditiNama,
    'KOMODITAS': komoditiNama,
    Katagori: kategori,
    katagori: kategori,
    Kategori: kategori,
    'KATAGORI': kategori,
    '% Kehilangan Hasil': `${loss.persentaseSusut}%`,
    persentase_susut: `${loss.persentaseSusut}%`,
    'Potensi Hasil Per Hektar (Kg)': `${potensi}`,
    potensi_hasil_per_hektar_kg: `${potensi}`,
    'Jumlah Kehilangan Hasil (kg)': `${loss.bobotSusutKg}`,
    bobot_susut_kg: `${loss.bobotSusutKg} Kg`,
    'Harga per kg': `Rp ${loss.hargaSatuanRp.toLocaleString('id-ID')}`,
    harga_satuan_rp: `Rp ${loss.hargaSatuanRp.toLocaleString('id-ID')}`,
    'Nilai Kehilangan Hasil': `Rp ${loss.totalKerugianRp.toLocaleString('id-ID')}`,
    total_kerugian_rp: `Rp ${loss.totalKerugianRp.toLocaleString('id-ID')}`,
    // Contextual headers
    lokasi: lokasiStr,
    'LOKASI': lokasiStr,
    'Lokasi': lokasiStr,
    kecamatan: `Kec. ${loss.kecamatan}`,
    'Kecamatan': `Kec. ${loss.kecamatan}`,
    kelompok_tani: loss.poktan || namaPetani,
    'KELOMPOK TANI': loss.poktan || namaPetani,
    'Kelompok Tani': loss.poktan || namaPetani,
    tahap_kehilangan: loss.tahapKehilangan,
    penyebab_utama: loss.penyebabUtama,
    intervensi_mekanisasi: loss.intervensiMekanisasi
  };
}


// ============================================================================
// 5. GENERALIZED SPREADSHEET API CLIENT (MULTI-SHEET)
// ============================================================================

/**
 * Mengambil data dari Google Spreadsheet dengan parameter sheetName via server proxy atau direct Apps Script
 * Dilengkapi retry mechanism, timeout signal, dan pencegahan blocking pada sesi editor preview.
 */
export async function fetchFromSpreadsheet<T = any>(
  sheetName: SupportedSheetName,
  options?: { retries?: number; timeoutMs?: number }
): Promise<{ rows: T[]; source: string; isFallback?: boolean; error?: string }> {
  const maxRetries = options?.retries ?? 2;
  const timeoutMs = options?.timeoutMs ?? 8000;
  const activeScriptUrl = getCustomAppsScriptUrl();
  const encodedSheet = encodeURIComponent(sheetName);

  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      await new Promise(r => setTimeout(r, 600 * attempt));
    }

    // 1. Coba Server Proxy terlebih dahulu (aman dari CORS dan pembatasan iframe preview)
    try {
      const proxyUrl = `/api/sheets/data?sheetName=${encodedSheet}&scriptUrl=${encodeURIComponent(activeScriptUrl)}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(proxyUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: controller.signal
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.rows) && (data.rows.length > 0 || data.source !== 'Fallback')) {
          return {
            rows: data.rows,
            source: data.source || 'Google Spreadsheet via Server Proxy',
            isFallback: data.source === 'Fallback' || data.source === 'Server Fallback Cache'
          };
        }
      }
    } catch (proxyErr: any) {
      lastError = proxyErr;
    }

    // 2. Direct Fallback ke Google Apps Script Web App URL
    try {
      const directUrl = `${activeScriptUrl}?sheetName=${encodedSheet}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(directUrl, {
        method: 'GET',
        redirect: 'follow',
        signal: controller.signal
      });
      clearTimeout(timer);

      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return {
            rows,
            source: 'Google Spreadsheet (Direct Web App)'
          };
        }
      }
    } catch (directErr: any) {
      lastError = directErr;
    }
  }

  // 3. Khusus Pengendalian Kehilangan Hasil, coba akses API server lokal
  if (sheetName === SHEET_NAMES.PENGENDALIAN_KEHILANGAN) {
    try {
      const sRes = await fetch('/api/post-harvest-losses');
      if (sRes.ok) {
        const sLosses = await sRes.json();
        if (Array.isArray(sLosses) && sLosses.length > 0) {
          const mappedRows = sLosses.map(l => lossRecordToSheetRow(l));
          return {
            rows: mappedRows as any,
            source: 'Server Fallback Store',
            isFallback: true
          };
        }
      }
    } catch {}
  }

  return { 
    rows: [], 
    source: 'Fallback', 
    isFallback: true,
    error: lastError ? (lastError.message || 'Koneksi ke Google Sheets dibatasi sesi preview') : undefined
  };
}

/**
 * Mengirim payload ke Google Spreadsheet (Create / Update / Delete / SyncSheet)
 */
export async function postToSpreadsheet(
  sheetName: SupportedSheetName, 
  payload: Record<string, any>
): Promise<{ success: boolean; message: string; data?: any }> {
  const activeScriptUrl = getCustomAppsScriptUrl();
  const action = (payload.action || 'create').toString().toLowerCase();
  const id = (payload.id || payload.searchKey || '').toString();
  const searchKey = (payload.searchKey || payload.id || '').toString();

  const enrichedPayload = {
    ...payload,
    sheetName,
    action,
    id,
    searchKey
  };

  const queryParams = new URLSearchParams({
    sheetName,
    action,
    id,
    searchKey,
    scriptUrl: activeScriptUrl
  });

  // Salin atribut penting ke query parameters agar tidak hilang jika terjadi HTTP 302 redirect
  const keysToCopy = ['nama_petani', 'kelompok_tani', 'lokasi', 'desa', 'kecamatan', 'komoditas', 'luas_lahan', 'kemasaman', 'sistem_irigasi'];
  for (const k of keysToCopy) {
    if (payload[k] !== undefined && payload[k] !== null) {
      queryParams.set(k, String(payload[k]));
    }
  }

  // 1. Kirim via Server Proxy (Express)
  try {
    const res = await fetch(`/api/sheets/data?${queryParams.toString()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enrichedPayload)
    });

    if (res.ok) {
      const data = await res.json();
      return { 
        success: true, 
        message: data.message || `Data berhasil diproses ke Google Sheets (${sheetName})`,
        data 
      };
    }
  } catch (err) {
    // Continue to direct post
  }

  // 2. Direct POST ke Apps Script Web App (text/plain menghindari preflight CORS)
  try {
    const directUrl = `${activeScriptUrl}?${queryParams.toString()}`;
    const directRes = await fetch(directUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(enrichedPayload),
      redirect: 'follow'
    });

    if (directRes.ok) {
      return { 
        success: true, 
        message: `Data berhasil diproses langsung ke Google Sheets (${sheetName})` 
      };
    }
  } catch (directErr) {
    // Fallback ke GET
  }

  // 3. GET Fallback (Apps Script handleRequest mengeksekusi aksi dari doGet)
  try {
    const directGetUrl = `${activeScriptUrl}?${queryParams.toString()}`;
    await fetch(directGetUrl, { mode: 'no-cors' });
    return { success: true, message: `Permintaan telah dikirim ke Google Spreadsheet (${sheetName})` };
  } catch (e) {}

  return { success: false, message: `Gagal memproses data ke Google Sheets (${sheetName})` };
}

/**
 * Menyimpan data baru (Create) ke Google Spreadsheet
 */
export async function saveToSpreadsheet(sheetName: SupportedSheetName, payload: Record<string, any>): Promise<{ success: boolean; message: string }> {
  return postToSpreadsheet(sheetName, { action: 'create', ...payload });
}

/**
 * Memperbarui data yang ada (Update) di Google Spreadsheet
 */
export async function updateInSpreadsheet(sheetName: SupportedSheetName, payload: Record<string, any>): Promise<{ success: boolean; message: string }> {
  return postToSpreadsheet(sheetName, { action: 'update', ...payload });
}

/**
 * Menghapus data (Delete) dari Google Spreadsheet
 */
export async function deleteFromSpreadsheet(
  sheetName: SupportedSheetName, 
  id: string, 
  searchKey?: string, 
  payload?: Record<string, any>
): Promise<{ success: boolean; message: string }> {
  return postToSpreadsheet(sheetName, { 
    action: 'delete', 
    id, 
    searchKey: searchKey || id, 
    ...payload 
  });
}

/**
 * Sinkronisasi Seluruh Baris (Full Sync / Overwrite) ke Google Spreadsheet
 */
export async function syncAllRowsToSpreadsheet(sheetName: SupportedSheetName, rows: any[]): Promise<{ success: boolean; message: string }> {
  return postToSpreadsheet(sheetName, { action: 'syncSheet', rows });
}

// ============================================================================
// CONVENIENCE MODULE FUNCTIONS (CRUD & SYNC FOR ALL 4 SHEETS)
// ============================================================================

// ----------------------------------------------------------------------------
// 1. DATA PETANI & LAHAN
// ----------------------------------------------------------------------------
export async function fetchParcelsFromSpreadsheet(): Promise<{ parcels: LandParcel[]; source: string; rawCount: number }> {
  const result = await fetchFromSpreadsheet<SheetParcelRow>(SHEET_NAMES.DATA_PETANI_LAHAN);
  const parcels = result.rows
    .map((row, idx) => parseSheetRowToParcel(row, idx))
    .filter((p): p is LandParcel => p !== null);
  return {
    parcels,
    source: result.source,
    rawCount: parcels.length
  };
}

export async function saveParcelToSpreadsheet(parcel: LandParcel): Promise<{ success: boolean; message: string }> {
  const rowPayload = parcelToSheetRow(parcel);
  return saveToSpreadsheet(SHEET_NAMES.DATA_PETANI_LAHAN, rowPayload);
}

export async function updateParcelInSpreadsheet(parcel: LandParcel, allParcels?: LandParcel[]): Promise<{ success: boolean; message: string }> {
  const rowPayload = parcelToSheetRow(parcel);
  const res = await updateInSpreadsheet(SHEET_NAMES.DATA_PETANI_LAHAN, {
    ...rowPayload,
    searchKey: parcel.namaPetani,
    originalNama: parcel.namaPetani,
    id: parcel.id
  });
  if (allParcels && allParcels.length > 0) {
    syncAllParcelsToSpreadsheet(allParcels).catch(() => {});
  }
  return res;
}

export async function deleteParcelFromSpreadsheet(id: string, searchKey?: string, remainingParcels?: LandParcel[]): Promise<{ success: boolean; message: string }> {
  const res = await deleteFromSpreadsheet(SHEET_NAMES.DATA_PETANI_LAHAN, id, searchKey, { namaPetani: searchKey, id });
  return res;
}

export async function syncAllParcelsToSpreadsheet(parcels: LandParcel[]): Promise<{ success: boolean; message: string }> {
  const rows = parcels.map(p => parcelToSheetRow(p));
  return syncAllRowsToSpreadsheet(SHEET_NAMES.DATA_PETANI_LAHAN, rows);
}

// ----------------------------------------------------------------------------
// 2. KEBUTUHAN PUPUK
// ----------------------------------------------------------------------------
export async function fetchFertilizerNeedsFromSpreadsheet(): Promise<{ needs: FertilizerNeedRecord[]; rawCount: number; source: string }> {
  const result = await fetchFromSpreadsheet<SheetFertilizerRow>(SHEET_NAMES.KEBUTUHAN_PUPUK);
  const needs = result.rows
    .map((row, idx) => parseSheetRowToFertilizerNeed(row, idx))
    .filter((n): n is FertilizerNeedRecord => n !== null);
  return {
    needs,
    rawCount: needs.length,
    source: result.source
  };
}

export async function saveFertilizerNeedToSpreadsheet(need: FertilizerNeedRecord): Promise<{ success: boolean; message: string }> {
  const rowPayload = fertilizerNeedToSheetRow(need);
  return saveToSpreadsheet(SHEET_NAMES.KEBUTUHAN_PUPUK, rowPayload);
}

export async function updateFertilizerNeedInSpreadsheet(need: FertilizerNeedRecord, allNeeds?: FertilizerNeedRecord[]): Promise<{ success: boolean; message: string }> {
  const rowPayload = fertilizerNeedToSheetRow(need);
  const res = await updateInSpreadsheet(SHEET_NAMES.KEBUTUHAN_PUPUK, {
    ...rowPayload,
    searchKey: need.poktan,
    id: need.id
  });
  if (allNeeds && allNeeds.length > 0) {
    syncAllFertilizerNeedsToSpreadsheet(allNeeds).catch(() => {});
  }
  return res;
}

export async function deleteFertilizerNeedFromSpreadsheet(id: string, searchKey?: string, remainingNeeds?: FertilizerNeedRecord[]): Promise<{ success: boolean; message: string }> {
  const res = await deleteFromSpreadsheet(SHEET_NAMES.KEBUTUHAN_PUPUK, id, searchKey, { poktan: searchKey, id });
  if (remainingNeeds) {
    syncAllFertilizerNeedsToSpreadsheet(remainingNeeds).catch(() => {});
  }
  return res;
}

export async function syncAllFertilizerNeedsToSpreadsheet(needs: FertilizerNeedRecord[]): Promise<{ success: boolean; message: string }> {
  const rows = needs.map(n => fertilizerNeedToSheetRow(n));
  return syncAllRowsToSpreadsheet(SHEET_NAMES.KEBUTUHAN_PUPUK, rows);
}

// ----------------------------------------------------------------------------
// 3. MONITORING PRODUKSI
// ----------------------------------------------------------------------------
export async function fetchHarvestRecordsFromSpreadsheet(): Promise<{ harvests: HarvestRecord[]; rawCount: number; source: string }> {
  const result = await fetchFromSpreadsheet<SheetHarvestRow>(SHEET_NAMES.MONITORING_PRODUKSI);
  const harvests = result.rows
    .map((row, idx) => parseSheetRowToHarvestRecord(row, idx))
    .filter((h): h is HarvestRecord => h !== null);
  return {
    harvests,
    rawCount: harvests.length,
    source: result.source
  };
}

export async function saveHarvestRecordToSpreadsheet(record: HarvestRecord): Promise<{ success: boolean; message: string }> {
  const rowPayload = harvestRecordToSheetRow(record);
  return saveToSpreadsheet(SHEET_NAMES.MONITORING_PRODUKSI, rowPayload);
}

export async function updateHarvestRecordInSpreadsheet(record: HarvestRecord, allHarvests?: HarvestRecord[]): Promise<{ success: boolean; message: string }> {
  const rowPayload = harvestRecordToSheetRow(record);
  const res = await updateInSpreadsheet(SHEET_NAMES.MONITORING_PRODUKSI, {
    ...rowPayload,
    searchKey: record.kodePanen || record.namaPetani,
    id: record.id
  });
  if (allHarvests && allHarvests.length > 0) {
    syncAllHarvestRecordsToSpreadsheet(allHarvests).catch(() => {});
  }
  return res;
}

export async function deleteHarvestRecordFromSpreadsheet(id: string, searchKey?: string, remainingHarvests?: HarvestRecord[]): Promise<{ success: boolean; message: string }> {
  const res = await deleteFromSpreadsheet(SHEET_NAMES.MONITORING_PRODUKSI, id, searchKey, { kodePanen: searchKey, id });
  if (remainingHarvests) {
    syncAllHarvestRecordsToSpreadsheet(remainingHarvests).catch(() => {});
  }
  return res;
}

export async function syncAllHarvestRecordsToSpreadsheet(records: HarvestRecord[]): Promise<{ success: boolean; message: string }> {
  const rows = records.map(r => harvestRecordToSheetRow(r));
  return syncAllRowsToSpreadsheet(SHEET_NAMES.MONITORING_PRODUKSI, rows);
}

// ----------------------------------------------------------------------------
// 4. PENGENDALIAN KEHILANGAN HASIL
// ----------------------------------------------------------------------------
export async function fetchLossRecordsFromSpreadsheet(options?: { retries?: number; timeoutMs?: number }): Promise<{
  losses: PostHarvestLoss[];
  rawCount: number;
  source: string;
  isFallback?: boolean;
  error?: string;
}> {
  const result = await fetchFromSpreadsheet<SheetLossRow>(SHEET_NAMES.PENGENDALIAN_KEHILANGAN, options);
  const losses = result.rows
    .map((row, idx) => parseSheetRowToLossRecord(row, idx))
    .filter((l): l is PostHarvestLoss => l !== null);

  // Jika data berhasil diperoleh dari Google Spreadsheet / Proxy
  if (losses.length > 0) {
    try {
      localStorage.setItem('simpatis_loss_control_cache', JSON.stringify(losses));
      localStorage.setItem('sipetik_bangka_v2_postHarvestLosses', JSON.stringify(losses));
    } catch {}
    return {
      losses,
      rawCount: losses.length,
      source: result.source,
      isFallback: result.isFallback
    };
  }

  // Jika remote fetch kosong atau gagal akibat timeout/pembatasan sesi editor:
  // Muat data dari cache lokal (localStorage)
  try {
    const cached = localStorage.getItem('simpatis_loss_control_cache') || localStorage.getItem('sipetik_bangka_v2_postHarvestLosses');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          losses: parsed,
          rawCount: parsed.length,
          source: 'Cache Lokal (Offline)',
          isFallback: true,
          error: result.error
        };
      }
    }
  } catch {}

  // Fallback terakhir: muat data acuan terstandar agar tabel tidak pernah kosong akibat pembatasan koneksi
  return {
    losses: INITIAL_POST_HARVEST_LOSSES,
    rawCount: INITIAL_POST_HARVEST_LOSSES.length,
    source: 'Data Acuan Terstandar (Fallback)',
    isFallback: true,
    error: result.error
  };
}

export async function saveLossRecordToSpreadsheet(loss: PostHarvestLoss): Promise<{ success: boolean; message: string }> {
  const rowPayload = lossRecordToSheetRow(loss);
  return saveToSpreadsheet(SHEET_NAMES.PENGENDALIAN_KEHILANGAN, rowPayload);
}

export async function updateLossRecordInSpreadsheet(loss: PostHarvestLoss, allLosses?: PostHarvestLoss[]): Promise<{ success: boolean; message: string }> {
  const rowPayload = lossRecordToSheetRow(loss);
  const res = await updateInSpreadsheet(SHEET_NAMES.PENGENDALIAN_KEHILANGAN, {
    ...rowPayload,
    searchKey: loss.poktan || loss.tahapKehilangan,
    id: loss.id
  });
  if (allLosses && allLosses.length > 0) {
    syncAllLossRecordsToSpreadsheet(allLosses).catch(() => {});
  }
  return res;
}

export async function deleteLossRecordFromSpreadsheet(id: string, searchKey?: string, remainingLosses?: PostHarvestLoss[]): Promise<{ success: boolean; message: string }> {
  const res = await deleteFromSpreadsheet(SHEET_NAMES.PENGENDALIAN_KEHILANGAN, id, searchKey, { poktan: searchKey, id });
  if (remainingLosses) {
    syncAllLossRecordsToSpreadsheet(remainingLosses).catch(() => {});
  }
  return res;
}

export async function syncAllLossRecordsToSpreadsheet(losses: PostHarvestLoss[]): Promise<{ success: boolean; message: string }> {
  const rows = losses.map(l => lossRecordToSheetRow(l));
  return syncAllRowsToSpreadsheet(SHEET_NAMES.PENGENDALIAN_KEHILANGAN, rows);
}

/**
 * Helper untuk inisialisasi tab sheet jika kosong
 */
export async function seedGoogleSheetIfEmpty(): Promise<{ success: boolean; count: number }> {
  try {
    const res = await fetch('/api/sheets/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, count: data.count || 0 };
    }
  } catch (err) {
    // Background
  }
  return { success: false, count: 0 };
}
