import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Calendar, 
  Store, 
  Sprout, 
  Percent, 
  ArrowRight, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  CheckCircle2, 
  Layers, 
  Users, 
  BarChart3, 
  ShieldCheck,
  Wheat,
  Clock
} from 'lucide-react';

interface HomeLandingViewProps {
  onNavigateTab: (tab: string) => void;
}

export const HomeLandingView: React.FC<HomeLandingViewProps> = ({ onNavigateTab }) => {
  const { 
    landParcels, 
    harvestRecords, 
    fertilizerNeeds, 
    kiosPupukList,
    postHarvestLosses,
    economicImpact 
  } = useApp();

  // Metrics calculation
  const totalLahanHa = landParcels.reduce((acc, p) => acc + p.luasHa, 0);
  const totalPoktanCount = new Set(landParcels.map(p => p.poktan)).size;
  const avgProduktivitas = harvestRecords.length > 0 
    ? (harvestRecords.reduce((acc, h) => acc + h.produktivitasTonPerHa, 0) / harvestRecords.length).toFixed(2)
    : '4.85';
  const avgSusut = postHarvestLosses.length > 0
    ? (postHarvestLosses.reduce((acc, l) => acc + l.persentaseSusut, 0) / postHarvestLosses.length).toFixed(1)
    : '3.8';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION: Nuansa Hijau Zamrud Pertanian (Emerald to Deep Teal) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white shadow-2xl border border-emerald-800/40">
        {/* Subtle decorative background glow & grid */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_50%)] pointer-events-none"></div>
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative px-6 py-10 sm:px-10 sm:py-14 lg:py-16 max-w-5xl mx-auto space-y-8">
          {/* Official Badge Header */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-800/70 border border-emerald-600/60 text-emerald-100 text-xs sm:text-sm font-semibold tracking-wide shadow-xs backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Pemerintah Kabupaten Bangka · Dinas Pangan dan Pertanian</span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              SIMPATIS BANGKA
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-medium text-emerald-200/95 max-w-3xl leading-relaxed">
              Sistem Informasi Meningkatkan Efisiensi dan Produksi Komoditas Strategis di Kabupaten Bangka.
            </p>
          </div>

          {/* 2-Line Welcome Description */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-900/60 border border-emerald-700/50 backdrop-blur-xs space-y-1.5 text-stone-100 text-sm sm:text-base leading-relaxed">
            <p className="font-semibold text-amber-300">
              Selamat datang di SIMPATIS BANGKA
            </p>
            <p className="text-emerald-100/90">
              Platform digital praktis untuk membantu petani dan pelaku pertanian mengelola lahan, jadwal tanam, kebutuhan pupuk, hingga pemantauan hasil panen jadi jauh lebih mudah.
            </p>
          </div>

          {/* Quick CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('kalender')}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm sm:text-base rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <Calendar className="w-5 h-5 text-emerald-950 group-hover:scale-110 transition-transform" />
              <span>Cek Kalendar Tanam & Musim</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigateTab('pupuk')}
              className="px-6 py-3.5 bg-emerald-800/80 hover:bg-emerald-700 text-white font-semibold text-sm sm:text-base rounded-xl border border-emerald-600/70 shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer group"
            >
              <Store className="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" />
              <span>Cek Kebutuhan Pupuk</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* STATISTIK KUNCI (Tabular Numbers & Clean Government Metric Tiles) */}
          {/* ========================================================================= */}
          <div className="pt-6 border-t border-emerald-800/60 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Stat 1: Total Luas Lahan Terdata */}
            <div className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-3.5 sm:p-4">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>Total Luas Lahan Terdata</span>
              </div>
              <div className="font-mono text-xl sm:text-2xl font-extrabold text-white">
                {economicImpact?.totalLahanTerkelolaHa 
                  ? `${economicImpact.totalLahanTerkelolaHa.toLocaleString('id-ID')} Ha` 
                  : `${totalLahanHa.toFixed(1)} Ha`}
              </div>
              <div className="text-[11px] text-emerald-300/80 mt-0.5">8 Kecamatan Kab. Bangka</div>
            </div>

            {/* Stat 2: Poktan Binaan */}
            <div className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-3.5 sm:p-4">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium mb-1">
                <Users className="w-3.5 h-3.5" />
                <span>Poktan Binaan</span>
              </div>
              <div className="font-mono text-xl sm:text-2xl font-extrabold text-amber-300">
                248 <span className="text-xs font-normal text-emerald-200">Poktan</span>
              </div>
              <div className="text-[11px] text-emerald-300/80 mt-0.5">Terdaftar Simluhtan & Dinas</div>
            </div>

            {/* Stat 3: Rata-rata Produktivitas */}
            <div className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-3.5 sm:p-4">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium mb-1">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Rata-rata Produktivitas</span>
              </div>
              <div className="font-mono text-xl sm:text-2xl font-extrabold text-white">
                {avgProduktivitas} <span className="text-xs font-normal text-emerald-200">Ton/Ha</span>
              </div>
              <div className="text-[11px] text-emerald-300/80 mt-0.5">Ubinan & Timbangan Gabah</div>
            </div>

            {/* Stat 4: Target Susut */}
            <div className="bg-emerald-900/40 border border-emerald-700/40 rounded-xl p-3.5 sm:p-4">
              <div className="flex items-center gap-2 text-emerald-300 text-xs font-medium mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Target Susut</span>
              </div>
              <div className="font-mono text-xl sm:text-2xl font-extrabold text-emerald-300">
                &lt; 5.0%
              </div>
              <div className="text-[11px] text-emerald-300/80 mt-0.5">Realisasi saat ini: {avgSusut}%</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. PINTASAN MENU UTAMA (Interactive Navigation Cards) */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              Pintasan Menu Utama
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: Data Petani & Lahan */}
          <div 
            onClick={() => onNavigateTab('lahan')}
            className="group bg-white rounded-2xl p-6 border border-stone-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-800 group-hover:text-amber-300 transition-colors">
                  <Sprout className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  {landParcels.length} Petak Terdata
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                Data Petani & Lahan
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Menampilkan status hamparan, kelompok tani, luas lahan, dan irigasi teknis dengan tombol aksi langsung.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span>Buka Data Petani & Lahan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 2: Kebutuhan Pupuk */}
          <div 
            onClick={() => onNavigateTab('pupuk')}
            className="group bg-white rounded-2xl p-6 border border-stone-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-100 group-hover:bg-emerald-800 group-hover:text-amber-300 transition-colors">
                  <Store className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  24 Kios Resmi KPL
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                Kebutuhan Pupuk
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Terdapat 24 kios resmi KPL Bangka untuk penyaluran pupuk bersubsidi (Urea, NPK, dan Organik) per kelompok tani dan musim tanam.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span>Buka Kebutuhan Pupuk</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* Card 3: Pengendalian Kehilangan Hasil */}
          <div 
            onClick={() => onNavigateTab('susut')}
            className="group bg-white rounded-2xl p-6 border border-stone-200 hover:border-emerald-500 hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center border border-rose-100 group-hover:bg-emerald-800 group-hover:text-amber-300 transition-colors">
                  <Percent className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-semibold text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                  Loss Control Aktif
                </span>
              </div>
              <h3 className="text-lg font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
                Pengendalian Kehilangan Hasil
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Analisis titik rawan susut pascapanen (harvesting loss) dan intervensi alsintan mekanisasi (combine harvester, terpal UV, lantai jemur) untuk menekan kerugian.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-800">
              <span>Buka Pengendalian Kehilangan</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. INFORMASI LAYANAN MASYARAKAT (Bagian Paling Bawah) */}
      {/* ========================================================================= */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 shadow-xs font-black text-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                Informasi Layanan Masyarakat
              </h3>
              <p className="text-xs text-stone-500">
                Hubungi saluran resmi untuk verifikasi data kelompok tani, alokasi pupuk, dan konsultasi penyuluh pertanian lapangan.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold w-fit">
            <Clock className="w-3.5 h-3.5" />
            <span>Senin - Jumat: 07.30 - 16.00 WIB</span>
          </div>
        </div>

        {/* Official Address, Contact & Email */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm text-stone-700">
          {/* Instansi & Alamat */}
          <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <MapPin className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-stone-900">
                Dinas Pangan dan Pertanian Kabupaten Bangka
              </div>
              <div className="text-stone-600 leading-relaxed text-xs">
                Jl. Diponegoro No.10, Parit Padang, Sungailiat, Kabupaten Bangka, Kepulauan Bangka Belitung 33215
              </div>
            </div>
          </div>

          {/* Telepon Kontak */}
          <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <Phone className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-stone-900">
                Telepon Kantor
              </div>
              <div className="font-mono text-sm font-semibold text-emerald-900">
                +62 717 92300
              </div>
              <div className="text-stone-500 text-xs">
                Layanan Informasi & Administrasi Dinas
              </div>
            </div>
          </div>

          {/* Surel Resmi */}
          <div className="flex items-start gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
            <Mail className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-stone-900">
                Pos-el / Email Resmi
              </div>
              <div className="font-mono text-sm font-semibold text-emerald-900">
                dinpanpertan@bangka.go.id
              </div>
              <div className="text-stone-500 text-xs">
                Korespondensi & Pengaduan Resmi
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
