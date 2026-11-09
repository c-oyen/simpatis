export type CommodityId = 
  | 'padi_sawah' 
  | 'padi_ladang' 
  | 'cabai_rawit' 
  | 'cabai_besar' 
  | 'cabai_merah_keriting';

export interface CommodityInfo {
  id: CommodityId;
  nama: string;
  namaIlmiah: string;
  kategori: 'Pangan' | 'Hortikultura';
  icon: string;
  satuan: 'Kg' | 'Ton';
  hargaAcuanRp: number; // per Kg
  siklusTanamHari: number;
  dosisPupukPerHa: {
    ureaKg: number;
    npkKg: number;
    sp36Kg: number;
    dolomitKg: number;
    organikKg: number;
  };
  deskripsi: string;
}

export type KecamatanBangka = 
  | 'Sungailiat' 
  | 'Belinyu' 
  | 'Merawang' 
  | 'Mendo Barat' 
  | 'Pemali' 
  | 'Bakam' 
  | 'Riau Silip' 
  | 'Puding Besar';

export interface KecamatanInfo {
  nama: KecamatanBangka;
  luasWilayahKm2: number;
  totalLahanTaniHa: number;
  komoditasUnggulan: CommodityId[];
  jumlahPoktan: number;
  koordinatorPpl: string;
  kontakPpl: string;
  pusatBpp: string;
  koordinat: { lat: number; lng: number };
}

export interface LandParcel {
  id: string;
  kodePetak: string;
  namaPetani: string;
  nik: string;
  poktan: string;
  kecamatan: KecamatanBangka;
  desa: string;
  komoditas: CommodityId;
  varietas: string;
  luasHa: number;
  phTanah: number;
  lokasi?: string;
  namaKomoditasRaw?: string;
  jenisTanah?: 'Podsolik Merah Kuning (Ultisol)' | 'Aluvial' | 'Latosol' | string;
  koordinat: { lat: number; lng: number };
  tahunTanam: number;
  sistemIrigasi: 'Tadah Hujan' | 'Irigasi' | 'Irigasi Teknis' | 'Embung / Sumur Bor';
  terakhirDiperbarui: string;
}

export type PlantingPhase = 
  | 'Persiapan Lahan' 
  | 'Penyemaian / Penanaman' 
  | 'Vegetatif & Pemupukan I' 
  | 'Generatif & Pemupukan II' 
  | 'Pengendalian OPT' 
  | 'Menjelang Panen' 
  | 'Panen Raya';

export interface PlantingSchedule {
  id: string;
  kodeJadwal: string;
  kecamatan: KecamatanBangka;
  komoditas: CommodityId;
  musimTanam: 'MT I (Rendengan/Penghujan)' | 'MT II (Gadu/Transisi)' | 'MT III (Kemarau Terkendali)' | 'MT I' | 'MT II' | 'MT III' | string;
  luasRencanaHa: number;
  tanggalMulaiOlah: string;
  tanggalTanam: string;
  tanggalPupuk1: string;
  tanggalPupuk2: string;
  tanggalPanenEstimasi: string;
  faseSaatIni: PlantingPhase;
  progresFasePersen: number;
  indeksKlimatologi: 'Optimal' | 'Waspada Curah Hujan Tinggi' | 'Waspada Defisit Air' | 'Waspada Kelembapan Tinggi';
  rekomendasiAgroklimat: string;
  peringatanOpt: string[];
}

export interface KiosPupukInfo {
  id: string;
  namaKios: string;
  kecamatan: KecamatanBangka;
  desa: string;
  alamat: string;
  penanggungJawab: string;
  kontak: string;
  wilayahBinaan: string[];
  statusOperasional: 'Aktif / Siap Salur' | 'Dalam Distribusi';
  stokTersedia: {
    ureaTon: number;
    npkTon: number;
    organikTon: number;
  };
}

export interface FertilizerNeedRecord {
  id: string;
  poktan: string;
  kecamatan: KecamatanBangka;
  desa: string;
  komoditas: CommodityId;
  luasLahanHa: number;
  kiosPenyalur: string;
  kebutuhanUreaKg: number;
  kebutuhanNpkKg: number;
  kebutuhanOrganikKg: number;
  musimTanam: string;
  keterangan: string;
}

export interface HarvestRecord {
  id: string;
  kodePanen: string;
  kodePetak: string;
  poktan: string;
  namaPetani: string;
  kecamatan: KecamatanBangka;
  komoditas: CommodityId;
  luasPanenHa: number;
  estimasiProduksiTon: number; // Berdasarkan ubinan / sampling
  realisasiProduksiTon: number; // Hasil timbang riil
  deviasiPersen: number; // Selisih % (realisasi - estimasi) / estimasi
  produktivitasTonPerHa: number;
  tanggalPanen: string;
}

export interface PostHarvestLoss {
  id: string;
  harvestRecordId: string;
  namaPetani?: string;
  desa?: string;
  komoditas: CommodityId;
  kecamatan: KecamatanBangka;
  poktan: string;
  tahapKehilangan: string;
  faktorKehilangan?: 'OPT / Hama Penyakit' | 'Pemupukan' | 'Penanganan Pasca Panen' | string;
  kategoriKeparahan?: string;
  potensiHasilKg?: number;
  persentaseSusut: number; // e.g. 25.0%
  bobotSusutKg: number;
  hargaSatuanRp: number; // Paten Rp 6.500
  totalKerugianRp: number; // bobotSusutKg * hargaSatuanRp
  penyebabUtama: string;
  intervensiMekanisasi: string;
}

export interface EconomicImpactSummary {
  peningkatanHasilPersen: number;
  penurunanSusutHasilPersen: number;
  penghematanBiayaPupukPersen: number;
  tambahanPendapatanRataRataRp: number; // per Ha per Musim
  totalNilaiEkonomiKabupatenRp: number;
  jumlahPetaniBerdampak: number;
  totalLahanTerkelolaHa: number;
}

export type UserRole = 
  | 'operator' // Operator Internal Pemkab / Dinas Bangka (Input & Edit Data)
  | 'publik';  // Masyarakat / Petani / Umum (Tampilan Informasi Bersih tanpa aksi edit)

export interface ActivityEvent {
  id: string;
  judul: string;
  tanggal: string;
  waktu: string;
  lokasi: string;
  kecamatan: KecamatanBangka | 'Seluruh Kabupaten';
  penyelenggara: string;
  kategori: 'Sosialisasi & Pelatihan' | 'Rembug Tani' | 'Penyaluran Pupuk' | 'Uji Coba Ubinan' | 'Monitoring Lapangan';
  targetPeserta: string;
  status: 'Akan Datang' | 'Berlangsung' | 'Selesai';
  deskripsi: string;
}

export interface FieldIssue {
  id: string;
  kodeTiket: string;
  pelaporNama: string;
  pelaporPeran: string;
  poktan: string;
  kecamatan: KecamatanBangka;
  desa: string;
  kategoriMasalah: 
    | 'Pupuk Langka / Distribusi Terhambat' 
    | 'Serangan Hama / Penyakit (OPT)' 
    | 'Irigasi / Saluran Air Rusak' 
    | 'Kerusakan Pasca Panen' 
    | 'Validasi Data Lahan & Petani';
  prioritas: 'Tinggi (Darurat)' | 'Sedang' | 'Rendah (Rutin)';
  deskripsi: string;
  tanggalLapor: string;
  status: 'Menunggu Disposisi' | 'Dalam Penanganan Petugas' | 'Selesai & Terverifikasi';
  tindakLanjutPetugas?: string;
  petugasPpl?: string;
  tanggalPenyelesaian?: string;
}

export interface StakeholderMessage {
  id: string;
  pengirim: string;
  rolePengirim: string;
  instansi: string;
  tanggalWaktu: string;
  topik: string;
  pesan: string;
  targetPemangku: string;
}

export interface EarlyWarningAlert {
  id: string;
  tingkat: 'Bahaya / Kritis' | 'Waspada' | 'Pemberitahuan';
  kategori: 'Agroklimat / Cuaca' | 'OPT / Hama' | 'Distribusi Pupuk' | 'Penyusutan Pasca Panen';
  judul: string;
  deskripsi: string;
  kecamatan: KecamatanBangka | 'Seluruh Wilayah';
  komoditas?: CommodityId;
  rekomendasiTindakan: string;
  tanggal: string;
  statusPenanganan: 'Perlu Tindakan Cepat' | 'Sedang Dipantau' | 'Terkendali';
}
