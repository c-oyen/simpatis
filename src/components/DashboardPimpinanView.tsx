import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BangkaMapInteractive } from './BangkaMapInteractive';
import { COMMODITIES, KECAMATAN_LIST } from '../data/bangkaData';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3, 
  Layers, 
  ShieldCheck, 
  ArrowUpRight, 
  DollarSign, 
  Calendar, 
  Flame, 
  Sprout, 
  ArrowRight,
  FileCheck,
  Award,
  Zap,
  Info,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
  X
} from 'lucide-react';
import { EarlyWarningAlert } from '../types';

interface DashboardPimpinanProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardPimpinanView: React.FC<DashboardPimpinanProps> = ({ onNavigateTab }) => {
  const { 
    landParcels, 
    plantingSchedules, 
    fertilizerNeeds,
    kiosPupukList, 
    harvestRecords, 
    postHarvestLosses, 
    earlyWarnings,
    updateEarlyWarningStatus,
    economicImpact,
    setShowOfficialModal,
    isExecutiveUnlocked,
    unlockExecutive,
    lockExecutive,
    changeExecutivePin
  } = useApp();

  // PIN input states for gate
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [changePinSuccess, setChangePinSuccess] = useState(false);
  const [changePinError, setChangePinError] = useState('');

  // Valuation calculator states grounded in Document Section D & Section 3 (Hipotesis hal 5-6)
  const [totalTonaseMusim, setTotalTonaseMusim] = useState<number>(1000);
  const [susutAwalPersen, setSusutAwalPersen] = useState<number>(10);
  const [susutSetelahPersen, setSusutSetelahPersen] = useState<number>(7);
  const [hargaJualRpKg, setHargaJualRpKg] = useState<number>(8000);
  const [luasLahanHa, setLuasLahanHa] = useState<number>(500);
  const [tambahanProdTonHa, setTambahanProdTonHa] = useState<number>(0.2);

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockExecutive(pinInput);
    if (!success) {
      setPinError(true);
    } else {
      setPinError(false);
      setPinInput('');
    }
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length < 4) {
      setChangePinError('PIN baru minimal harus 4 digit angka/karakter');
      return;
    }
    const success = changeExecutivePin(oldPin, newPin);
    if (success) {
      setChangePinSuccess(true);
      setChangePinError('');
      setTimeout(() => {
        setIsChangePinModalOpen(false);
        setChangePinSuccess(false);
        setOldPin('');
        setNewPin('');
      }, 1500);
    } else {
      setChangePinError('PIN lama tidak sesuai!');
    }
  };

  // 1. Tambahan tonase (kg) = total hasil panen (kg) * (persentase awal - setelah intervensi)
  const hasilTerselamatkanTon = totalTonaseMusim * ((susutAwalPersen - susutSetelahPersen) / 100);
  const hasilTerselamatkanKg = hasilTerselamatkanTon * 1000;
  const nilaiHasilTerselamatkanRp = hasilTerselamatkanKg * hargaJualRpKg;

  // 2. Tambahan produksi ton = tambahan produktivitas (ton/ha) * luas panen (ha)
  const tambahanProduksiTon = tambahanProdTonHa * luasLahanHa;
  const tambahanProduksiKg = tambahanProduksiTon * 1000;
  const nilaiTambahanProduksiRp = tambahanProduksiKg * hargaJualRpKg;

  // Total indikatif sebelum biaya
  const totalIndikatifRp = nilaiHasilTerselamatkanRp + nilaiTambahanProduksiRp;

  // Key KPI stats
  const totalPetak = landParcels.length;
  const petakValid = landParcels.filter(p => p.luasHa > 0).length;
  const kelengkapanDataPct = totalPetak > 0 ? Math.round((petakValid / totalPetak) * 100) : 100;

  const totalKebutuhanPupuk = fertilizerNeeds.reduce((acc, f) => acc + f.kebutuhanUreaKg + f.kebutuhanNpkKg, 0);
  const totalStokKios = kiosPupukList.reduce((acc, k) => acc + (k.stokTersedia.ureaTon + k.stokTersedia.npkTon) * 1000, 0);
  const ketepatanPupukPct = totalKebutuhanPupuk > 0 ? Math.min(100, Math.round((totalStokKios / totalKebutuhanPupuk) * 100)) : 94;

  const totalLuasPanenHa = harvestRecords.reduce((acc, h) => acc + h.luasPanenHa, 0);
  const totalProduksiTon = harvestRecords.reduce((acc, h) => acc + h.realisasiProduksiTon, 0);
  const avgProduktivitas = totalLuasPanenHa > 0 ? (totalProduksiTon / totalLuasPanenHa).toFixed(2) : '3.45';

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // IF NOT UNLOCKED: Render security gate
  if (!isExecutiveUnlocked) {
    return (
      <div className="max-w-xl mx-auto my-8 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 text-white p-6 sm:p-8 text-center relative">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-300/40 text-amber-300 mx-auto flex items-center justify-center shadow-inner mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-amber-400/20 text-amber-200 rounded-full border border-amber-300/30">
            Akses Khusus Terbatas
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-3">
            Portal Eksekutif Pimpinan Daerah
          </h2>
          <p className="text-xs text-stone-300 mt-2 leading-relaxed">
            Dashboard ini memuat 8 Indikator Kinerja Utama (IKU), evaluasi risiko dini, dan kalkulasi valuasi ekonomi daerah yang bersifat internal khusus Pimpinan (Bupati / Kepala Dinas / Tim Transformasi).
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Masukkan PIN Otorisasi Pimpinan:
              </label>
              <div className="relative">
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="Masukkan 4 digit PIN..."
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className={`w-full px-4 py-2.5 text-center text-lg font-mono tracking-widest font-bold rounded-xl border transition-colors ${
                    pinError 
                      ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-rose-500' 
                      : 'border-stone-300 bg-stone-50 focus:border-emerald-600 focus:bg-white'
                  }`}
                />
              </div>
              {pinError && (
                <p className="text-xs text-rose-600 font-medium mt-1.5 flex items-center gap-1 justify-center">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>PIN Otorisasi salah. Silakan coba lagi.</span>
                </p>
              )}
              <div className="text-[11px] text-stone-400 text-center mt-2">
                *PIN bawaan pimpinan: <strong className="text-stone-700 font-mono">2026</strong> (dapat Anda ganti setelah masuk).
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-amber-300" />
              <span>Buka Akses Pimpinan</span>
            </button>
          </form>

          <div className="pt-4 border-t border-stone-200 text-center space-y-2">
            <span className="text-xs text-stone-500">Bukan pimpinan? Silakan gunakan modul operasional:</span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => onNavigateTab('lahan')}
                className="text-xs font-semibold text-emerald-800 hover:underline px-2 py-1 rounded bg-stone-100"
              >
                Data Lahan & Petani
              </button>
              <button
                onClick={() => onNavigateTab('kalender')}
                className="text-xs font-semibold text-emerald-800 hover:underline px-2 py-1 rounded bg-stone-100"
              >
                Kalender Tanam
              </button>
              <button
                onClick={() => onNavigateTab('pupuk')}
                className="text-xs font-semibold text-emerald-800 hover:underline px-2 py-1 rounded bg-stone-100"
              >
                Kebutuhan Pupuk
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Security Control Bar (When Unlocked) */}
      <div className="bg-stone-900 text-white px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-emerald-300">Sesi Otoritas Pimpinan Aktif</span>
          <span className="text-stone-400 hidden sm:inline">· Dashboard ini terkunci untuk publik</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsChangePinModalOpen(true)}
            className="px-2.5 py-1 text-[11px] font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-md transition-colors cursor-pointer flex items-center gap-1 border border-stone-700"
          >
            <KeyRound className="w-3 h-3 text-amber-300" />
            <span>Ganti PIN</span>
          </button>
          <button
            onClick={lockExecutive}
            className="px-2.5 py-1 text-[11px] font-semibold bg-rose-900/80 hover:bg-rose-900 text-rose-200 rounded-md transition-colors cursor-pointer flex items-center gap-1 border border-rose-800"
            title="Kunci sesi agar tidak bisa dibuka orang lain"
          >
            <Lock className="w-3 h-3" />
            <span>Kunci Sesi Pimpinan</span>
          </button>
        </div>
      </div>

      {/* Executive Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-stone-900 rounded-xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
          <ShieldCheck className="w-64 h-64 text-amber-300" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 border border-amber-300/30 rounded-full text-amber-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>Dashboard Pimpinan · Dokumen Aksi Transformasi Kepemimpinan 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            SIMPATIS BANGKA
          </h1>
          <p className="text-emerald-100/90 text-sm mt-1 leading-relaxed">
            Sistem Informasi Peningkatan Efisiensi Tanam dan Hasil Produksi Komoditas Utama di Kabupaten Bangka.
            Menghubungkan data digital, pengawasan pupuk, pengendalian kehilangan hasil, dan keputusan strategis kepala daerah.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowOfficialModal(true)}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-2"
            >
              <FileCheck className="w-4 h-4 text-emerald-950" />
              <span>Buka Dokumen Resmi & Berita Acara</span>
            </button>
            <button
              onClick={() => onNavigateTab('koordinasi')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Pusat Koordinasi & Tindak Lanjut</span>
            </button>
          </div>
        </div>
      </div>

      {/* 8 INDIKATOR KINERJA UTAMA (IKU - HALAMAN 11 DOKUMEN) */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <h2 className="text-base font-bold text-stone-900">
                8 Indikator Kinerja Utama (IKU) Monitoring & Evaluasi
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Target SMART Bab J (Hal. 11 Dokumen Rancangan): Penilaian berkala akurasi, efisiensi koordinasi, dan valuasi ekonomi.
            </p>
          </div>
          <div className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            Status: Menuju Target Jangka Menengah (2–12 Bln)
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          {/* IKU 1: Kelengkapan Data Sasaran */}
          <div className="p-4 bg-stone-50/80 rounded-lg border border-stone-200">
            <div className="text-xs text-stone-500 font-medium">1. Kelengkapan Data Sasaran</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-800">{kelengkapanDataPct}%</span>
              <span className="text-[11px] text-stone-500">Target: ≥80% s.d ≥90%</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(kelengkapanDataPct, 100)}%` }}></div>
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              {petakValid} dari {totalPetak} petak lahan tani terdaftar lengkap
            </p>
          </div>

          {/* IKU 2: Ketepatan Waktu Pembaruan */}
          <div className="p-4 bg-stone-50/80 rounded-lg border border-stone-200">
            <div className="text-xs text-stone-500 font-medium">2. Ketepatan Waktu Pembaruan</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-800">92.4%</span>
              <span className="text-[11px] text-stone-500">Target: ≥90%</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '92.4%' }}></div>
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              Validasi catatan lapangan sesuai jadwal jatuh tempo
            </p>
          </div>

          {/* IKU 3: Ketepatan Jadwal Tanam */}
          <div className="p-4 bg-stone-50/80 rounded-lg border border-stone-200">
            <div className="text-xs text-stone-500 font-medium">3. Ketepatan Jadwal Tanam</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-800">88.5%</span>
              <span className="text-[11px] text-stone-500">Baseline Disepakati</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: '88.5%' }}></div>
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              Kesesuaian realisasi olah tanah MT I terhadap kalender agroklimat
            </p>
          </div>

          {/* IKU 4: Ketepatan Informasi Pupuk */}
          <div className="p-4 bg-stone-50/80 rounded-lg border border-stone-200">
            <div className="text-xs text-stone-500 font-medium">4. Ketepatan Informasi Pupuk</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-800">{ketepatanPupukPct}%</span>
              <span className="text-[11px] text-stone-500">Meningkat</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${Math.min(ketepatanPupukPct, 100)}%` }}></div>
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              Sinkronisasi data kebutuhan RDKK, penyaluran kios, dan penebusan
            </p>
          </div>

          {/* IKU 5: Penurunan Kehilangan Hasil */}
          <div className="p-4 bg-stone-50/80 rounded-lg border border-stone-200">
            <div className="text-xs text-stone-500 font-medium">5. Penurunan Kehilangan Hasil</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-800">-{economicImpact.penurunanSusutHasilPersen}%</span>
              <span className="text-[11px] text-stone-500">Target Relatif 3–5%</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '92%' }}></div>
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              Penurunan susut pasca panen lada & gabah dari baseline awal
            </p>
          </div>

          {/* IKU 6: Produktivitas Ton/Ha */}
          <div className="p-4 bg-stone-50/80 rounded-lg border border-stone-200">
            <div className="text-xs text-stone-500 font-medium">6. Produktivitas Per Hektare</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-800">{avgProduktivitas} Ton/Ha</span>
              <span className="text-[11px] text-stone-500">Kondisi Sebanding</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '85%' }}></div>
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              Rata-rata tertimbang hasil ubinan dan timbang riil komoditas utama
            </p>
          </div>

          {/* IKU 7: Pengguna Aktif */}
          <div className="p-4 bg-stone-50/80 rounded-lg border border-stone-200">
            <div className="text-xs text-stone-500 font-medium">7. Pengguna Aktif Terdaftar</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-800">{economicImpact.jumlahPetaniBerdampak.toLocaleString('id-ID')}</span>
              <span className="text-[11px] text-stone-500">Poktan & PPL</span>
            </div>
            <div className="w-full bg-stone-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '78%' }}></div>
            </div>
            <p className="text-[11px] text-stone-500 mt-2">
              420 Poktan binaan di 8 BPP Kecamatan Kab. Bangka
            </p>
          </div>

          {/* IKU 8: Manfaat Ekonomi Bersih */}
          <div className="p-4 bg-stone-50/80 rounded-lg border border-emerald-300 bg-emerald-50/40">
            <div className="text-xs text-emerald-800 font-semibold">8. Manfaat Ekonomi Terverifikasi</div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold font-mono text-emerald-900">
                {formatRupiah(economicImpact.totalNilaiEkonomiKabupatenRp)}
              </span>
            </div>
            <div className="w-full bg-emerald-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-700 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
            <p className="text-[11px] text-emerald-700 mt-2 font-medium">
              Positif sesuai metode valuasi Bab D (bersih dari biaya saprodi)
            </p>
          </div>
        </div>
      </div>

      {/* PETA WILAYAH INTERAKTIF KABUPATEN BANGKA */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="text-base font-bold text-stone-900">
              Peta Wilayah & Geospasial Pertanian 8 Kecamatan
            </h2>
          </div>
          <button
            onClick={() => onNavigateTab('lahan')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <span>Buka Modul Detail Lahan & Petani</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <BangkaMapInteractive />
      </div>

      {/* EARLY WARNING SYSTEM (PERINGATAN DINI KEPALA DAERAH) */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-stone-900">
                Peringatan Dini Operasional (Early Warning System)
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Notifikasi kritis agroklimat, OPT (hama penyakit), kelangkaan pupuk, dan kerentanan susut panen per kecamatan.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('koordinasi')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
          >
            <span>Kelola di Modul Koordinasi & Tindak Lanjut</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {earlyWarnings.map((alert) => {
            const isCritical = alert.tingkat.includes('Kritis');
            const isWarning = alert.tingkat.includes('Waspada');
            return (
              <div 
                key={alert.id}
                className={`p-4 rounded-lg border transition-all ${
                  isCritical 
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
                    : isWarning 
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950' 
                    : 'bg-blue-50/70 border-blue-200 text-blue-950'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isCritical ? 'bg-rose-200 text-rose-800' : isWarning ? 'bg-amber-200 text-amber-800' : 'bg-blue-200 text-blue-800'
                      }`}>
                        {alert.tingkat}
                      </span>
                      <span className="text-xs text-stone-500">· {alert.kategori} · {alert.kecamatan}</span>
                    </div>
                    <h3 className="font-bold text-sm text-stone-900">
                      {alert.judul}
                    </h3>
                  </div>
                  <span className="text-[10px] text-stone-400 shrink-0">{alert.tanggal}</span>
                </div>

                <p className="text-xs text-stone-700 mt-2 leading-relaxed">
                  {alert.deskripsi}
                </p>

                <div className="mt-3 pt-3 border-t border-stone-200/60 bg-white/60 p-2.5 rounded-md">
                  <div className="text-[11px] font-semibold text-stone-800">
                    Rekomendasi Tindakan Cepat:
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    {alert.rekomendasiTindakan}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs pt-1">
                  <span className={`font-semibold text-[11px] ${
                    alert.statusPenanganan === 'Perlu Tindakan Cepat' 
                      ? 'text-rose-700' 
                      : alert.statusPenanganan === 'Sedang Dipantau' 
                      ? 'text-amber-700' 
                      : 'text-emerald-700'
                  }`}>
                    Status: {alert.statusPenanganan}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    {alert.statusPenanganan !== 'Terkendali' && (
                      <button
                        onClick={() => updateEarlyWarningStatus(alert.id, 'Terkendali')}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-stone-300 hover:border-emerald-500 hover:text-emerald-700 rounded transition-colors shadow-2xs cursor-pointer"
                      >
                        Tandai Selesai
                      </button>
                    )}
                    <button
                      onClick={() => onNavigateTab('koordinasi')}
                      className="px-2.5 py-1 text-[11px] font-semibold bg-stone-900 text-white hover:bg-stone-800 rounded transition-colors shadow-2xs cursor-pointer"
                    >
                      Buka Disposisi
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RINGKASAN & SIMULASI VALUASI MANFAAT EKONOMI (METODE BAB D HALAMAN 5-6) */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-stone-200 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-bold text-stone-900">
                Ringkasan & Metode Valuasi Ekonomi (Bab D Hal. 5–6)
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Simulasi interaktif perhitungan manfaat ekonomi: Penyelamatan kehilangan hasil panen + peningkatan produktivitas riil.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500">Pola Perhitungan:</span>
            <span className="text-xs font-semibold bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200">
              Formula Resmi Dokumen 2026
            </span>
          </div>
        </div>

        {/* Dynamic Formula Display matching Section D.2 & D.3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Interactive Parameters Slider */}
          <div className="space-y-4 bg-stone-50 p-5 rounded-lg border border-stone-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
              <span>Parameter Asumsi Valuasi (Tabel D.3 Hal. 5–6)</span>
            </h3>

            <div>
              <div className="flex justify-between text-xs text-stone-700 mb-1">
                <span>Total Hasil Panen Baseline Wilayah:</span>
                <span className="font-bold font-mono">{totalTonaseMusim.toLocaleString('id-ID')} Ton/musim</span>
              </div>
              <input
                type="range"
                min="200"
                max="5000"
                step="100"
                value={totalTonaseMusim}
                onChange={(e) => setTotalTonaseMusim(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Kehilangan Awal (%):</label>
                <input
                  type="number"
                  min="5"
                  max="25"
                  step="0.5"
                  value={susutAwalPersen}
                  onChange={(e) => setSusutAwalPersen(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Kehilangan Pasca Intervensi (%):</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  step="0.5"
                  value={susutSetelahPersen}
                  onChange={(e) => setSusutSetelahPersen(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Harga Jual Rata-rata (Rp/Kg):</label>
                <input
                  type="number"
                  min="2000"
                  max="100000"
                  step="500"
                  value={hargaJualRpKg}
                  onChange={(e) => setHargaJualRpKg(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] text-stone-600 mb-1">Luas Panen (Ha):</label>
                <input
                  type="number"
                  min="50"
                  max="5000"
                  step="50"
                  value={luasLahanHa}
                  onChange={(e) => setLuasLahanHa(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-stone-700 mb-1">
                <span>Tambahan Produktivitas Riil:</span>
                <span className="font-bold font-mono">+{tambahanProdTonHa} Ton/Ha</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="1.5"
                step="0.05"
                value={tambahanProdTonHa}
                onChange={(e) => setTambahanProdTonHa(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>
          </div>

          {/* Right Column: Calculated Results Grounded in Section D Formulas */}
          <div className="bg-emerald-50/50 border border-emerald-200 rounded-lg p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-900 border-b border-emerald-200 pb-2">
                Hasil Perhitungan Manfaat Ekonomi Terverifikasi
              </div>

              {/* Komponen 1: Hasil Terselamatkan */}
              <div className="bg-white p-3.5 rounded-lg border border-emerald-100 shadow-2xs">
                <div className="flex justify-between text-xs font-semibold text-stone-800">
                  <span>A. Hasil Terselamatkan (Post-Harvest Loss)</span>
                  <span className="font-mono text-emerald-700">{hasilTerselamatkanTon.toFixed(1)} Ton ({hasilTerselamatkanKg.toLocaleString('id-ID')} Kg)</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  Rumus: {totalTonaseMusim} Ton × ({susutAwalPersen}% - {susutSetelahPersen}%)
                </div>
                <div className="mt-2 text-sm font-bold font-mono text-emerald-900">
                  Nilai Manfaat: {formatRupiah(nilaiHasilTerselamatkanRp)}
                </div>
              </div>

              {/* Komponen 2: Tambahan Produksi */}
              <div className="bg-white p-3.5 rounded-lg border border-emerald-100 shadow-2xs">
                <div className="flex justify-between text-xs font-semibold text-stone-800">
                  <span>B. Peningkatan Produktivitas</span>
                  <span className="font-mono text-emerald-700">{tambahanProduksiTon.toFixed(1)} Ton ({tambahanProduksiKg.toLocaleString('id-ID')} Kg)</span>
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  Rumus: {tambahanProdTonHa} Ton/Ha × {luasLahanHa} Ha × 1.000 × {formatRupiah(hargaJualRpKg)}
                </div>
                <div className="mt-2 text-sm font-bold font-mono text-emerald-900">
                  Nilai Manfaat: {formatRupiah(nilaiTambahanProduksiRp)}
                </div>
              </div>
            </div>

            {/* Total Indikatif */}
            <div className="mt-4 pt-4 border-t border-emerald-300 bg-emerald-800 text-white p-4 rounded-lg">
              <div className="text-xs uppercase tracking-wider text-emerald-200 font-semibold">
                Total Nilai Indikatif Sebelum Biaya (A + B)
              </div>
              <div className="text-2xl font-extrabold font-mono text-amber-300 mt-1">
                {formatRupiah(totalIndikatifRp)}
              </div>
              <p className="text-[10px] text-emerald-100 mt-1">
                *Sesuai simulasi hipotetis hal 5-6 dokumen awal. Nilai aktual divalidasi berkala oleh PPL & Dinas Pertanian.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ganti PIN Pimpinan */}
      {isChangePinModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-sm w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-stone-900 text-sm">Ganti PIN Akses Pimpinan</h3>
              </div>
              <button
                onClick={() => {
                  setIsChangePinModalOpen(false);
                  setChangePinError('');
                  setOldPin('');
                  setNewPin('');
                }}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleChangePinSubmit} className="space-y-3 mt-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">PIN Lama:</label>
                <input
                  type="password"
                  required
                  placeholder="PIN saat ini..."
                  value={oldPin}
                  onChange={(e) => setOldPin(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">PIN Baru (min. 4 karakter):</label>
                <input
                  type="password"
                  required
                  placeholder="PIN baru Anda..."
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg font-mono"
                />
              </div>

              {changePinError && (
                <p className="text-xs text-rose-600 font-medium">{changePinError}</p>
              )}

              {changePinSuccess && (
                <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PIN berhasil diperbarui!</span>
                </p>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePinModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Simpan PIN Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
