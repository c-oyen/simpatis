import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { COMMODITIES, KECAMATAN_LIST, DESA_PER_KECAMATAN, INITIAL_POST_HARVEST_LOSSES } from '../data/bangkaData';
import { PostHarvestLoss, CommodityId, KecamatanBangka } from '../types';
import { fetchLossRecordsFromSpreadsheet } from '../lib/googleSheetsService';
import { 
  Plus, 
  X, 
  Pencil, 
  ShieldAlert, 
  Calculator, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  RefreshCw, 
  Coins, 
  ArrowRight, 
  TrendingDown 
} from 'lucide-react';

export const HARGA_PATEN_RP = 6500;

export type LossFactorType = 'pemupukan' | 'opt' | 'pasca_panen';

export interface LossDropdownOption {
  id: string;
  label: string;
  kategori: string;
  persen: number;
  penyebab: string;
  rekomendasi: string;
}

export interface LossCategoryGroup {
  id: LossFactorType;
  title: string;
  shortLabel: string;
  description: string;
  options: LossDropdownOption[];
}

// Data Acuan Dropdown Bertingkat Sesuai Spesifikasi Excel
export const LOSS_CATEGORIES: LossCategoryGroup[] = [
  {
    id: 'pemupukan',
    title: 'Pemupukan',
    shortLabel: 'Pemupukan',
    description: 'Kehilangan hasil akibat dosis, aplikasi, atau ketiadaan pemupukan',
    options: [
      {
        id: 'none',
        label: '-- Kosong / Tidak Ada (0%) --',
        kategori: 'Tidak Ada Susut',
        persen: 0.0,
        penyebab: 'Tidak ada kehilangan hasil dari faktor pemupukan',
        rekomendasi: 'Pertahankan pemupukan berimbang NPK & pupuk organik.'
      },
      {
        id: 'rekomendasi',
        label: 'Sesuai Rekomendasi (5%)',
        kategori: 'Sesuai Rekomendasi',
        persen: 5.0,
        penyebab: 'Pemupukan Sesuai Rekomendasi (susut 5%)',
        rekomendasi: 'Pertahankan dosis pemupukan berimbang NPK & pupuk organik.'
      },
      {
        id: 'baik',
        label: 'Baik (7,5%)',
        kategori: 'Baik',
        persen: 7.5,
        penyebab: 'Pemupukan Tingkat Baik (susut 7,5%)',
        rekomendasi: 'Optimalkan ketepatan waktu aplikasi pupuk fase vegetatif & generatif.'
      },
      {
        id: 'sedang',
        label: 'Sedang (27,5%)',
        kategori: 'Sedang',
        persen: 27.5,
        penyebab: 'Pemupukan Tingkat Sedang (susut 27,5%)',
        rekomendasi: 'Koreksi defisiensi hara makro (N, P, K) dan perbaiki pH tanah dengan dolomit.'
      },
      {
        id: 'sangat_kurang',
        label: 'Sangat Kurang (42,5%)',
        kategori: 'Sangat Kurang',
        persen: 42.5,
        penyebab: 'Pemupukan Sangat Kurang (susut 42,5%)',
        rekomendasi: 'Intervensi darurat pupuk subsidi/organik dan pendampingan intensif PPL.'
      },
      {
        id: 'tidak_dipupuk',
        label: 'Tidak Dipupuk (50%)',
        kategori: 'Tidak Dipupuk',
        persen: 50.0,
        penyebab: 'Lahan Tidak Dipupuk (susut 50%)',
        rekomendasi: 'Pemulihan kesuburan tanah mutlak, program bantuan pupuk stimulan APBD.'
      }
    ]
  },
  {
    id: 'opt',
    title: 'OPT (Hama/Penyakit)',
    shortLabel: 'OPT',
    description: 'Kehilangan hasil akibat serangan hama, wereng, penggerek, tikus, atau penyakit',
    options: [
      {
        id: 'none',
        label: '-- Kosong / Tidak Ada (0%) --',
        kategori: 'Tidak Ada Susut',
        persen: 0.0,
        penyebab: 'Tidak ada serangan OPT',
        rekomendasi: 'Monitoring berkala, sanitasi pematang, dan konservasi musuh alami.'
      },
      {
        id: 'ringan',
        label: 'Ringan (10%)',
        kategori: 'Ringan',
        persen: 10.0,
        penyebab: 'Serangan OPT Tingkat Ringan (susut 10%)',
        rekomendasi: 'Monitoring berkala, sanitasi pematang, dan konservasi musuh alami.'
      },
      {
        id: 'sedang',
        label: 'Sedang (25%)',
        kategori: 'Sedang',
        persen: 25.0,
        penyebab: 'Serangan OPT Tingkat Sedang (susut 25%)',
        rekomendasi: 'Pengendalian hayati dengan agen APH (Trichoderma/Beauveria) & pestisida nabati.'
      },
      {
        id: 'berat',
        label: 'Berat (50%)',
        kategori: 'Berat',
        persen: 50.0,
        penyebab: 'Serangan OPT Tingkat Berat (susut 50%)',
        rekomendasi: 'Penyemprotan terarah serentak satu hamparan dengan pengawalan petugas POPT.'
      },
      {
        id: 'puso',
        label: 'Puso (100%)',
        kategori: 'Puso',
        persen: 100.0,
        penyebab: 'Serangan OPT Gagal Total / Puso (susut 100%)',
        rekomendasi: 'Klaim Asuransi Usaha Tani Padi (AUTP) dan persiapan tanam ulang berjadwal.'
      }
    ]
  },
  {
    id: 'pasca_panen',
    title: 'Penanganan Pasca Panen',
    shortLabel: 'Pasca Panen',
    description: 'Kehilangan hasil gabah tercecer berdasarkan teknologi/alat perontokan panen',
    options: [
      {
        id: 'none',
        label: '-- Kosong / Tidak Ada (0%) --',
        kategori: 'Tidak Ada Susut',
        persen: 0.0,
        penyebab: 'Penanganan pasca panen standar tanpa susut tercecer',
        rekomendasi: 'Pertahankan penanganan pasca panen yang rapi dan terukur.'
      },
      {
        id: 'combine_harvester',
        label: 'Combine Harvester (1,2%)',
        kategori: 'Combine Harvester',
        persen: 1.2,
        penyebab: 'Penanganan Pasca Panen Metode Combine Harvester (susut 1,2%)',
        rekomendasi: 'Mekanisasi modern efisien, susut terendah (1,2%). Tingkatkan jam terbang operator.'
      },
      {
        id: 'power_thresher',
        label: 'Power Thresher (3%)',
        kategori: 'Power Thresher',
        persen: 3.0,
        penyebab: 'Penanganan Pasca Panen Metode Power Thresher (susut 3%)',
        rekomendasi: 'Gunakan terpal alas luas di sekeliling mesin perontok thresher agar gabah tidak tercecer.'
      },
      {
        id: 'manual',
        label: 'Manual (4,8%)',
        kategori: 'Manual',
        persen: 4.8,
        penyebab: 'Penanganan Pasca Panen Metode Manual (susut 4,8%)',
        rekomendasi: 'Beralih ke mesin perontok mekanis/Combine Harvester dari Dinas Pertanian.'
      }
    ]
  }
];

export const LossControlView: React.FC = () => {
  const { 
    postHarvestLosses, 
    setPostHarvestLossesList,
    addPostHarvestLoss, 
    updatePostHarvestLoss,
    deletePostHarvestLoss,
    refreshFromSpreadsheet,
    isSyncingWithSheets,
    sheetsSyncStatus,
    lastSheetsSyncTime,
    selectedKecamatan,
    setSelectedKecamatan,
    selectedCommodity,
    setSelectedCommodity
  } = useApp();

  // Strategi fetching aman dari pembatasan sesi (error handling + retry + local cache fallback)
  const [isLoading, setIsLoading] = useState<boolean>(postHarvestLosses.length === 0);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<string>('Google Sheets');

  const retryTimerRef = useRef<any>(null);

  const fetchData = async (attempt = 0, isManual = false) => {
    if (attempt === 0) {
      if (postHarvestLosses.length === 0) setIsLoading(true);
    } else {
      setIsRetrying(true);
    }
    setRetryCount(attempt);

    try {
      // 1. Fetch dengan timeout dan retry aman terhadap pembatasan iframe preview editor
      const res = await fetchLossRecordsFromSpreadsheet({ retries: 2, timeoutMs: 7000 });
      // HANYA perbarui state jika hasil fetch API mengembalikan data valid (sesuai instruksi user)
      if (res.losses && Array.isArray(res.losses) && res.losses.length > 0) {
        setPostHarvestLossesList(res.losses);
        setIsUsingFallback(Boolean(res.isFallback));
        setDataSource(res.source.includes('Spreadsheet') ? 'Google Spreadsheet' : (res.source.includes('Cache') ? 'Cache Lokal' : 'Data Terstandar'));
        setFetchError(res.isFallback && res.error ? res.error : null);
        setIsLoading(false);
        setIsRetrying(false);
        return;
      }
      // Jangan menimpa state tabel dengan array kosong [] jika data hasil fetch dari Google Apps Script mengembalikan data kosong atau mengalami kendala CORS di environment preview.
      console.info('[LossControlView] Hasil fetch kosong atau tertunda, mempertahankan data yang sudah ada.');
      setIsUsingFallback(true);
      setDataSource('Data Tersimpan');
    } catch (err: any) {
      console.warn(`[LossControlView] Fetch attempt ${attempt + 1} tertunda:`, err.message || err);

      // Auto-retry otomatis (hingga 2 kali pemulihan bertahap)
      if (attempt < 2) {
        setIsRetrying(true);
        if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
        retryTimerRef.current = setTimeout(() => {
          fetchData(attempt + 1, isManual);
        }, 1200 * (attempt + 1));
        return;
      }

      // Jika data berhasil dimuat dari cache lokal atau fallback saat loading, pertahankan data tersebut (jangan di-reset ke kosong).
      if (postHarvestLosses.length === 0) {
        try {
          const cachedStr = localStorage.getItem('simpatis_loss_control_cache') || localStorage.getItem('sipetik_bangka_v2_postHarvestLosses');
          if (cachedStr) {
            const parsed = JSON.parse(cachedStr);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setPostHarvestLossesList(parsed);
              setIsUsingFallback(true);
              setDataSource('Cache Lokal (Offline)');
              setFetchError('Koneksi Google Sheets dibatasi sesi editor. Menampilkan data dari cache lokal.');
              return;
            }
          }
        } catch {}

        setPostHarvestLossesList(INITIAL_POST_HARVEST_LOSSES);
      }
      setIsUsingFallback(true);
      setDataSource('Data Tersimpan');
      setFetchError('Koneksi dibatasi sesi preview editor. Mempertahankan data tersimpan.');
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  };

  // Pastikan fungsi fetchData() dipanggil ulang secara otomatis ketika komponen pertama kali di-mount tanpa tertahan oleh sesi WebSocket editor
  useEffect(() => {
    fetchData(0);
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, []);

  const [isAddLossOpen, setIsAddLossOpen] = useState(false);
  const [editingLoss, setEditingLoss] = useState<PostHarvestLoss | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  // Edit Loss Form State
  const [editKomoditas, setEditKomoditas] = useState<CommodityId>('padi_sawah');
  const [editKecamatan, setEditKecamatan] = useState<KecamatanBangka>('Mendo Barat');
  const [editDesa, setEditDesa] = useState<string>('');
  const [editNamaPetani, setEditNamaPetani] = useState('');
  const [editPoktan, setEditPoktan] = useState('');
  const [editTahap, setEditTahap] = useState<string>('Pemanenan & Sortasi Batang');
  const [editBobotKg, setEditBobotKg] = useState<number>(200);
  const [editPenyebab, setEditPenyebab] = useState('');
  const [editIntervensi, setEditIntervensi] = useState('');

  // 1. Pilihan Komoditas: Padi Sawah (6.000 kg/Ha) atau Padi Ladang (4.000 kg/Ha)
  const [calcKomoditas, setCalcKomoditas] = useState<'padi_sawah' | 'padi_ladang'>('padi_sawah');

  // 2. Dropdown Pilihan 3 Kategori Sekaligus (Layout Grid Sejajar)
  const [selectedPemupukanId, setSelectedPemupukanId] = useState<string>('none');
  const [selectedOptId, setSelectedOptId] = useState<string>('none');
  const [selectedPascaId, setSelectedPascaId] = useState<string>('none');

  // 3. Form Input Minimalis (Luas Lahan desimal bebas, Nama Petani, Kecamatan, Kelurahan/Desa)
  const [calcLuasLahanStr, setCalcLuasLahanStr] = useState<string>('1');
  const [calcNamaPetani, setCalcNamaPetani] = useState('Zulkifli Mansur');
  const [calcKecamatan, setCalcKecamatan] = useState<KecamatanBangka>('Mendo Barat');
  const [calcDesa, setCalcDesa] = useState<string>(() => DESA_PER_KECAMATAN['Mendo Barat']?.[0] || 'Kemuja');

  const handleCalcKecamatanChange = (kec: KecamatanBangka) => {
    setCalcKecamatan(kec);
    const desas = DESA_PER_KECAMATAN[kec];
    if (desas && desas.length > 0) {
      setCalcDesa(desas[0]);
    }
  };

  // Referensi Opsi Kategori Terpilih
  const catPemupukan = LOSS_CATEGORIES[0];
  const catOpt = LOSS_CATEGORIES[1];
  const catPasca = LOSS_CATEGORIES[2];

  const optPemupukan = catPemupukan.options.find(o => o.id === selectedPemupukanId) || catPemupukan.options[0];
  const optOpt = catOpt.options.find(o => o.id === selectedOptId) || catOpt.options[0];
  const optPasca = catPasca.options.find(o => o.id === selectedPascaId) || catPasca.options[0];

  // Otomatisasi Perhitungan oleh Sistem (Real-Time)
  const potensiBasisKg = calcKomoditas === 'padi_ladang' ? 4000 : 6000;
  const parsedLuas = parseFloat(calcLuasLahanStr.replace(',', '.')) || 0;
  const luasLahanNum = parsedLuas > 0 ? parsedLuas : 0;
  const potensiTotalKg = Math.round(potensiBasisKg * (luasLahanNum > 0 ? luasLahanNum : 1));

  // Susut per Kategori
  const susutPemupukanKg = Math.round((optPemupukan.persen / 100) * potensiBasisKg * luasLahanNum);
  const nilaiPemupukanRp = susutPemupukanKg * HARGA_PATEN_RP;

  const susutOptKg = Math.round((optOpt.persen / 100) * potensiBasisKg * luasLahanNum);
  const nilaiOptRp = susutOptKg * HARGA_PATEN_RP;

  const susutPascaKg = Math.round((optPasca.persen / 100) * potensiBasisKg * luasLahanNum);
  const nilaiPascaRp = susutPascaKg * HARGA_PATEN_RP;

  // Akumulasi 3 Faktor (Form Real-Time)
  const calcTotalPersen = Number((optPemupukan.persen + optOpt.persen + optPasca.persen).toFixed(1));
  const calcTotalBobotSusutKg = susutPemupukanKg + susutOptKg + susutPascaKg;
  const calcTotalNilaiKehilanganRp = calcTotalBobotSusutKg * HARGA_PATEN_RP;

  // Format Helper
  const formatPersen = (val: number) => {
    return val.toString().replace('.', ',') + '%';
  };

  const formulaBreakdown = `${formatPersen(optPemupukan.persen)} + ${formatPersen(optOpt.persen)} + ${formatPersen(optPasca.persen)} = ${formatPersen(calcTotalPersen)} × ${potensiTotalKg.toLocaleString('id-ID')} Kg`;

  // Rekomendasi Terakumulasi
  const activeRecs: string[] = [];
  if (optPemupukan.persen > 0) activeRecs.push(`${catPemupukan.shortLabel}: ${optPemupukan.rekomendasi}`);
  if (optOpt.persen > 0) activeRecs.push(`${catOpt.shortLabel}: ${optOpt.rekomendasi}`);
  if (optPasca.persen > 0) activeRecs.push(`${catPasca.shortLabel}: ${optPasca.rekomendasi}`);

  const rekomendasiTeks = activeRecs.length > 0 
    ? activeRecs.join(' • ')
    : 'Pilih minimal satu kategori kehilangan hasil.';

  const getOptionBadgeColor = (persen: number) => {
    if (persen <= 5) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (persen <= 15) return 'bg-lime-100 text-lime-800 border-lime-300';
    if (persen <= 30) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (persen <= 50) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  // Mempertahankan data yang sudah ada sebelumnya dari cache lokal atau fallback agar tabel tidak pernah kosong akibat isu koneksi
  const activeLossData = postHarvestLosses.length > 0 
    ? postHarvestLosses 
    : (() => {
        try {
          const cached = localStorage.getItem('simpatis_loss_control_cache') || localStorage.getItem('sipetik_bangka_v2_postHarvestLosses');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
          }
        } catch {}
        return INITIAL_POST_HARVEST_LOSSES;
      })();

  // Filter list
  const filteredLosses = activeLossData.filter(l => {
    const matchKec = selectedKecamatan === 'Semua' || l.kecamatan === selectedKecamatan;
    const matchCom = selectedCommodity === 'semua' || l.komoditas === selectedCommodity;
    return matchKec && matchCom;
  });

  const totalKerugianRp = filteredLosses.reduce((a, b) => a + b.totalKerugianRp, 0);
  const totalBobotSusutKg = filteredLosses.reduce((a, b) => a + b.bobotSusutKg, 0);
  const avgSusutPersen = filteredLosses.length > 0 
    ? (filteredLosses.reduce((a, b) => a + b.persentaseSusut, 0) / filteredLosses.length).toFixed(1)
    : '0.0';

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // 3. Integrasi & Sinkronisasi Dua Arah: Simpan Catatan Susut
  const handleSaveCatatanSusut = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (calcTotalBobotSusutKg <= 0) return;

    setIsSubmitting(true);
    setSubmitSuccessMsg(null);

    const activeItems: { groupTitle: string; option: LossDropdownOption; bobotKg: number }[] = [];
    if (selectedPemupukanId !== 'none' && optPemupukan.persen > 0) {
      activeItems.push({ groupTitle: catPemupukan.title, option: optPemupukan, bobotKg: susutPemupukanKg });
    }
    if (selectedOptId !== 'none' && optOpt.persen > 0) {
      activeItems.push({ groupTitle: catOpt.title, option: optOpt, bobotKg: susutOptKg });
    }
    if (selectedPascaId !== 'none' && optPasca.persen > 0) {
      activeItems.push({ groupTitle: catPasca.title, option: optPasca, bobotKg: susutPascaKg });
    }

    if (activeItems.length === 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      for (const item of activeItems) {
        await addPostHarvestLoss({
          harvestRecordId: `HRV-REF-${Date.now().toString().slice(-4)}`,
          namaPetani: calcNamaPetani.trim() || 'Zulkifli Mansur',
          desa: calcDesa,
          komoditas: calcKomoditas,
          kecamatan: calcKecamatan,
          poktan: calcNamaPetani.trim() || 'Poktan Maju Bersama',
          tahapKehilangan: `${item.groupTitle} (${item.option.kategori})`,
          faktorKehilangan: item.groupTitle,
          kategoriKeparahan: item.option.kategori,
          potensiHasilKg: potensiTotalKg,
          persentaseSusut: item.option.persen,
          bobotSusutKg: item.bobotKg,
          hargaSatuanRp: HARGA_PATEN_RP,
          penyebabUtama: `${item.groupTitle} - ${item.option.label}`,
          intervensiMekanisasi: item.option.rekomendasi
        });
      }

      setSubmitSuccessMsg(
        `✓ Catatan susut (${activeItems.length} kategori, Total ${calcTotalBobotSusutKg.toLocaleString('id-ID')} Kg - Rp ${calcTotalNilaiKehilanganRp.toLocaleString('id-ID')}) berhasil disimpan dan disinkronkan ke Google Sheets!`
      );
      setIsAddLossOpen(false);

      setTimeout(() => {
        setSubmitSuccessMsg(null);
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (loss: PostHarvestLoss) => {
    setEditingLoss(loss);
    setEditKomoditas(loss.komoditas);
    setEditKecamatan(loss.kecamatan);
    setEditDesa(loss.desa || DESA_PER_KECAMATAN[loss.kecamatan]?.[0] || '');
    setEditNamaPetani(loss.namaPetani || loss.poktan || '');
    setEditPoktan(loss.poktan || loss.namaPetani || '');
    setEditTahap(loss.tahapKehilangan);
    setEditBobotKg(loss.bobotSusutKg);
    setEditPenyebab(loss.penyebabUtama);
    setEditIntervensi(loss.intervensiMekanisasi);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLoss) return;

    const pot = editingLoss.potensiHasilKg || (editKomoditas === 'padi_ladang' ? 4000 : 6000);
    const newPersen = pot > 0 ? (editBobotKg / pot) * 100 : editingLoss.persentaseSusut;

    updatePostHarvestLoss(editingLoss.id, {
      namaPetani: editNamaPetani.trim() || 'Zulkifli Mansur',
      desa: editDesa,
      komoditas: editKomoditas,
      kecamatan: editKecamatan,
      poktan: editNamaPetani.trim() || editPoktan || 'Poktan Mandiri Bangka',
      tahapKehilangan: editTahap,
      persentaseSusut: parseFloat(newPersen.toFixed(1)),
      bobotSusutKg: Number(editBobotKg),
      hargaSatuanRp: HARGA_PATEN_RP,
      penyebabUtama: editPenyebab,
      intervensiMekanisasi: editIntervensi
    });

    setEditingLoss(null);
  };

  const handleScrollToForm = () => {
    const el = document.getElementById('formulir-kehilangan-hasil');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-2', 'ring-emerald-600', 'ring-offset-2');
      setTimeout(() => {
        el.classList.remove('ring-2', 'ring-emerald-600', 'ring-offset-2');
      }, 1800);
    } else {
      setIsAddLossOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="text-xl font-bold text-stone-900">
              Pengendalian Kehilangan Hasil (Loss Control)
            </h2>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleScrollToForm}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Input Catatan Susut</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-stone-500 font-medium">Rata-rata Tingkat Susut</div>
          <div className="mt-1 text-2xl font-bold font-mono text-stone-900">
            {avgSusutPersen} <span className="text-sm font-normal text-stone-500">%</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Berdasarkan data tersimpan</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-stone-500 font-medium">Total Bobot Susut</div>
          <div className="mt-1 text-2xl font-bold font-mono text-stone-800">
            {(totalBobotSusutKg / 1000).toFixed(2)} <span className="text-sm font-normal text-stone-500">Ton</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">{totalBobotSusutKg.toLocaleString('id-ID')} Kg komoditas tercatat</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-stone-500 font-medium">Estimasi Nilai Kehilangan</div>
          <div className="mt-1 text-xl font-bold font-mono text-rose-800">
            {formatRupiah(totalKerugianRp)}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Harga paten: Rp {HARGA_PATEN_RP.toLocaleString('id-ID')}/Kg</p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-emerald-900 font-semibold">Terselamatkan Lewat Intervensi</div>
          <div className="mt-1 text-xl font-bold font-mono text-emerald-900">
            {formatRupiah(Math.round(totalKerugianRp * 0.68))}
          </div>
          <p className="text-[11px] text-emerald-800 mt-1">Potensi 68% susut ditekan</p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {submitSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 font-medium flex items-center justify-between shadow-2xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{submitSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setSubmitSuccessMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FORMULIR INTERAKTIF PENGENDALIAN KEHILANGAN HASIL */}
      {/* ========================================================================= */}
      <div id="formulir-kehilangan-hasil" className="bg-white border border-emerald-600/30 rounded-2xl p-5 sm:p-6 shadow-sm">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 text-white rounded-lg shadow-xs">
              <Calculator className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-stone-900">
                Formulir Interaktif Pengendalian Kehilangan Hasil
              </h3>
            </div>
          </div>
          <div className="text-right text-xs text-stone-500">
            <span className="inline-block px-3 py-1.5 bg-stone-50 rounded-lg border border-stone-200 font-mono font-medium text-stone-700">
              Harga Paten: <strong className="text-stone-900 font-bold">Rp {HARGA_PATEN_RP.toLocaleString('id-ID')}/Kg</strong>
            </span>
          </div>
        </div>

        <form onSubmit={handleSaveCatatanSusut} className="mt-5 space-y-5">
          {/* 1. Jenis Komoditi Padi */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-stone-900">
                1. Jenis Komoditi Padi
              </label>
              <span className="text-[11px] text-stone-400 font-normal">
                Menentukan dasar potensi hasil
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCalcKomoditas('padi_sawah')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  calcKomoditas === 'padi_sawah'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600/30 text-stone-900 shadow-2xs'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div>
                  <div className="font-bold text-xs flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                    <span>Padi Sawah</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Potensi Hasil: <strong className="font-mono text-emerald-800 font-bold">6.000 Kg / Ha</strong>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-emerald-800 shadow-2xs">
                  6.000 Kg
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCalcKomoditas('padi_ladang')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                  calcKomoditas === 'padi_ladang'
                    ? 'border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600/30 text-stone-900 shadow-2xs'
                    : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                }`}
              >
                <div>
                  <div className="font-bold text-xs flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span>
                    <span>Padi Ladang (Gogo)</span>
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1">
                    Potensi Hasil: <strong className="font-mono text-emerald-800 font-bold">4.000 Kg / Ha</strong>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-emerald-800 shadow-2xs">
                  4.000 Kg
                </span>
              </button>
            </div>
          </div>

          {/* 2. Layout Grid Sejajar: 3 Kategori Faktor Kehilangan Hasil */}
          <div className="border border-emerald-300/60 rounded-2xl p-4 bg-emerald-50/15">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
              <label className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <span>2. Pilih Tingkat Kehilangan pada Ketiga Kategori Sekaligus</span>
                <span className="text-rose-600 font-bold">*</span>
              </label>
              <span className="text-[11px] text-stone-400 font-normal">
                Cukup isi 1 kali, sistem langsung mengakumulasi ketiganya
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Kolom A: Pemupukan */}
              <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                  <TrendingDown className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pemupukan</span>
                </div>

                <div>
                  <select
                    value={selectedPemupukanId}
                    onChange={(e) => setSelectedPemupukanId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:outline-emerald-700 focus:ring-1 focus:ring-emerald-700 cursor-pointer shadow-2xs"
                  >
                    {catPemupukan.options.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-lg px-3 py-2 text-xs flex items-center justify-between">
                  <span className="text-stone-700 font-medium">Susut:</span>
                  <span className="font-mono text-stone-900">
                    <strong className="font-bold">{susutPemupukanKg.toLocaleString('id-ID')} Kg</strong>{' '}
                    <span className="text-stone-500 font-normal text-[11px]">(Rp {nilaiPemupukanRp.toLocaleString('id-ID')})</span>
                  </span>
                </div>
              </div>

              {/* Kolom B: OPT (Hama/Penyakit) */}
              <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>OPT (Hama/Penyakit)</span>
                </div>

                <div>
                  <select
                    value={selectedOptId}
                    onChange={(e) => setSelectedOptId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:outline-emerald-700 focus:ring-1 focus:ring-emerald-700 cursor-pointer shadow-2xs"
                  >
                    {catOpt.options.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-lg px-3 py-2 text-xs flex items-center justify-between">
                  <span className="text-stone-700 font-medium">Susut:</span>
                  <span className="font-mono text-stone-900">
                    <strong className="font-bold">{susutOptKg.toLocaleString('id-ID')} Kg</strong>{' '}
                    <span className="text-stone-500 font-normal text-[11px]">(Rp {nilaiOptRp.toLocaleString('id-ID')})</span>
                  </span>
                </div>
              </div>

              {/* Kolom C: Penanganan Pasca Panen */}
              <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-2xs flex flex-col justify-between space-y-3">
                <div className="flex items-center gap-2 text-stone-900 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Penanganan Pasca Panen</span>
                </div>

                <div>
                  <select
                    value={selectedPascaId}
                    onChange={(e) => setSelectedPascaId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs font-medium text-stone-900 focus:outline-emerald-700 focus:ring-1 focus:ring-emerald-700 cursor-pointer shadow-2xs"
                  >
                    {catPasca.options.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-lg px-3 py-2 text-xs flex items-center justify-between">
                  <span className="text-stone-700 font-medium">Susut:</span>
                  <span className="font-mono text-stone-900">
                    <strong className="font-bold">{susutPascaKg.toLocaleString('id-ID')} Kg</strong>{' '}
                    <span className="text-stone-500 font-normal text-[11px]">(Rp {nilaiPascaRp.toLocaleString('id-ID')})</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Form Input Minimalis (1 baris horizontal grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Luas Lahan (Ha) */}
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Luas Lahan (Ha) *:
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={calcLuasLahanStr}
                onChange={(e) => setCalcLuasLahanStr(e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white font-mono font-bold text-stone-900"
              />
              <span className="text-[11px] text-stone-400 mt-1 block">
                Potensi: {potensiTotalKg.toLocaleString('id-ID')} Kg ({calcLuasLahanStr || '1'} Ha)
              </span>
            </div>

            {/* Nama Petani */}
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Nama Petani *:
              </label>
              <input
                type="text"
                required
                value={calcNamaPetani}
                onChange={(e) => setCalcNamaPetani(e.target.value)}
                placeholder="Contoh: Zulkifli Mansur"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white"
              />
            </div>

            {/* Kecamatan */}
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Kecamatan (Kab. Bangka):
              </label>
              <select
                value={calcKecamatan}
                onChange={(e) => handleCalcKecamatanChange(e.target.value as KecamatanBangka)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
              >
                {KECAMATAN_LIST.map(k => (
                  <option key={k.nama} value={k.nama}>{k.nama}</option>
                ))}
              </select>
            </div>

            {/* Kelurahan/Desa */}
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Kelurahan/Desa:
              </label>
              <select
                value={calcDesa}
                onChange={(e) => setCalcDesa(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
              >
                {(DESA_PER_KECAMATAN[calcKecamatan] || []).map(desa => (
                  <option key={desa} value={desa}>{desa}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 4. Card Rekapitulasi Real-Time (Card Berwarna Hijau Gelap) */}
          <div className="bg-[#0c392c] text-white rounded-2xl p-5 shadow-md border border-[#082a20]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-800/80 gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  HASIL PERHITUNGAN TOTAL AKUMULASI 3 FAKTOR (REAL-TIME)
                </span>
              </div>
              <div className="text-xs font-mono text-stone-300 tracking-wide">
                {formulaBreakdown}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
              {/* Parameter 1: Total % Kehilangan */}
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
                <div className="text-[11px] text-stone-300 font-medium">Total % Kehilangan</div>
                <div className="mt-1 text-2xl font-black font-mono text-amber-400">
                  {formatPersen(calcTotalPersen)}
                </div>
                <div className="text-[10px] text-stone-300 mt-1">
                  Gabungan 3 kategori
                </div>
              </div>

              {/* Parameter 2: Potensi Hasil */}
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
                <div className="text-[11px] text-stone-300 font-medium">
                  Potensi Hasil ({calcLuasLahanStr || '1'} Ha)
                </div>
                <div className="mt-1 text-2xl font-black font-mono text-white">
                  {potensiTotalKg.toLocaleString('id-ID')} <span className="text-sm font-normal text-stone-300">Kg</span>
                </div>
                <div className="text-[10px] text-stone-300 mt-1">
                  {calcKomoditas === 'padi_sawah' ? 'Padi Sawah' : 'Padi Ladang'} ({potensiBasisKg.toLocaleString('id-ID')} Kg/Ha)
                </div>
              </div>

              {/* Parameter 3: Total Bobot Susut */}
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
                <div className="text-[11px] text-stone-300 font-medium">Total Bobot Susut</div>
                <div className="mt-1 text-2xl font-black font-mono text-yellow-300">
                  {calcTotalBobotSusutKg.toLocaleString('id-ID')} <span className="text-sm font-normal text-stone-300">Kg</span>
                </div>
                <div className="text-[10px] text-stone-300 mt-1">
                  Akumulasi 3 faktor
                </div>
              </div>

              {/* Parameter 4: Total Nilai Kehilangan */}
              <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10">
                <div className="text-[11px] text-stone-300 font-medium flex items-center justify-between">
                  <span>Total Nilai Kehilangan</span>
                  <Coins className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <div className="mt-1 text-xl sm:text-2xl font-bold font-mono text-emerald-400">
                  {formatRupiah(calcTotalNilaiKehilanganRp)}
                </div>
                <div className="text-[10px] text-stone-300 mt-1 font-mono">
                  {calcTotalBobotSusutKg.toLocaleString('id-ID')} Kg × Rp {HARGA_PATEN_RP.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Rekomendasi & Tombol Simpan */}
            <div className="mt-4 pt-3 border-t border-emerald-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2 text-stone-200">
                <span className="font-bold text-amber-300 shrink-0">Rekomendasi Tindakan:</span>
                <span className="leading-relaxed">{rekomendasiTeks}</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || calcTotalBobotSusutKg <= 0}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shrink-0"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
                    <span>Menyimpan ke Sheets...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Simpan Catatan Susut</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* FILTER & RIWAYAT CATATAN SUSUT HASIL */}
      {/* ========================================================================= */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] text-stone-500 mb-1">Kecamatan:</label>
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-medium cursor-pointer"
            >
              <option value="Semua">Semua Kecamatan (8 Wilayah)</option>
              {KECAMATAN_LIST.map(k => (
                <option key={k.nama} value={k.nama}>{k.nama}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-stone-500 mb-1">Komoditas:</label>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-medium cursor-pointer"
            >
              <option value="semua">Semua Komoditas (5 Pilihan)</option>
              {COMMODITIES.map(c => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs text-stone-500">
          Menampilkan <strong className="text-stone-900">{filteredLosses.length}</strong> catatan susut hasil
        </div>
      </div>

      {/* Banner Informasi Mode Aman / Cache Saat Sesi Preview Dibatasi */}
      {isUsingFallback && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-xl text-xs text-amber-900 shadow-2xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-bold text-amber-950">Mode Aman (Data Tersimpan): </span>
              <span className="text-amber-800">{fetchError || 'Koneksi ke Google Sheets sedang dialihkan ke cache lokal.'}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchData(0, true)}
            disabled={isRetrying || isLoading}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-amber-100 text-amber-900 font-semibold border border-amber-300 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50 text-[11px]"
            title="Muat ulang dan sinkronkan dengan Google Spreadsheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin text-amber-700' : 'text-amber-800'}`} />
            <span>{isRetrying ? 'Sinkronisasi...' : 'Sinkronkan Ulang'}</span>
          </button>
        </div>
      )}

      {/* Tabel Data Kehilangan Hasil */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">
                  <div>Lokasi Wilayah</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">desa & kecamatan</span>
                </th>
                <th className="py-3 px-4">
                  <div>Komoditas & Petani</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">nama petani</span>
                </th>
                <th className="py-3 px-4">
                  <div>Faktor & Kategori</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">tingkat keparahan</span>
                </th>
                <th className="py-3 px-4 text-center">
                  <div>Tingkat Susut</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">% kehilangan</span>
                </th>
                <th className="py-3 px-4 text-right">
                  <div>Bobot Susut</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">kg</span>
                </th>
                <th className="py-3 px-4 text-right">
                  <div>Nilai Kehilangan</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">rupiah (rp 6.500/kg)</span>
                </th>
                <th className="py-3 px-4">
                  <div>Penyebab & Solusi</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">intervensi mekanisasi</span>
                </th>
                <th className="py-3 px-3 text-center">
                  <div>Aksi</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading || isRetrying ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-9 h-9 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                      <div className="font-semibold text-stone-800 text-xs">
                        {isRetrying
                          ? `Menghubungkan ulang ke Google Sheets (Percobaan ${retryCount + 1}/3)...`
                          : 'Memuat data pengendalian kehilangan hasil...'}
                      </div>
                      <p className="text-[11px] text-stone-500">
                        Sinkronisasi dua arah dengan Google Spreadsheet...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredLosses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="font-bold text-stone-800 text-sm">
                        Data Pengendalian Kehilangan Hasil Kosong
                      </div>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        Belum ada catatan kehilangan hasil untuk filter yang dipilih atau data pada Google Spreadsheet telah dikosongkan.
                      </p>
                      <div className="flex items-center justify-center pt-1">
                        <button
                          onClick={handleScrollToForm}
                          className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-300" />
                          <span>Input Catatan Baru</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLosses.map((loss) => {
                  const com = COMMODITIES.find(c => c.id === loss.komoditas);
                  const comName = com?.nama || (loss.komoditas === 'padi_ladang' ? 'Padi Ladang' : 'Padi Sawah');
                  return (
                    <tr key={loss.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-stone-900">
                        <div>{loss.desa ? `${loss.desa}, ` : ''}Kec. {loss.kecamatan}</div>
                        <div className="text-[10px] text-stone-400 font-normal">Kab. Bangka</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 font-semibold rounded text-[10px] border border-emerald-200">
                          {comName}
                        </span>
                        <div className="text-[11px] text-stone-700 mt-1 font-medium">{loss.namaPetani || loss.poktan}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900">
                          {loss.kategoriKeparahan || (loss.persentaseSusut <= 10 ? 'Ringan' : loss.persentaseSusut <= 25 ? 'Sedang' : loss.persentaseSusut <= 50 ? 'Berat' : 'Puso')}
                        </div>
                        <div className="text-[10px] text-stone-500 mt-0.5">{loss.tahapKehilangan}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex px-2 py-0.5 bg-rose-100 text-rose-800 font-mono font-bold rounded text-[11px]">
                          {loss.persentaseSusut}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-800">
                        {loss.bobotSusutKg.toLocaleString('id-ID')} <span className="text-[10px] font-normal text-stone-500">Kg</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-700">
                        {formatRupiah(loss.totalKerugianRp)}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="text-stone-900 font-medium leading-snug">{loss.penyebabUtama}</div>
                        <div className="text-stone-500 text-[11px] mt-1 flex items-center gap-1 font-sans">
                          <span className="font-semibold text-emerald-800">Solusi:</span>
                          <span>{loss.intervensiMekanisasi}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleOpenEdit(loss)}
                            className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-stone-200 hover:border-emerald-300"
                            title="Edit Data Susut"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL INPUT CEPAT SUSUT HASIL */}
      {/* ========================================================================= */}
      {isAddLossOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2 text-stone-900 font-bold">
                <Calculator className="w-5 h-5 text-emerald-700" />
                <span>Input Pencatatan Susut Hasil</span>
              </div>
              <button 
                onClick={() => setIsAddLossOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCatatanSusut} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">1. Jenis Komoditi Padi *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcKomoditas('padi_sawah')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer ${
                      calcKomoditas === 'padi_sawah'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                        : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-white'
                    }`}
                  >
                    Padi Sawah (6.000 Kg/Ha)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcKomoditas('padi_ladang')}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold cursor-pointer ${
                      calcKomoditas === 'padi_ladang'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-2xs'
                        : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-white'
                    }`}
                  >
                    Padi Ladang (4.000 Kg/Ha)
                  </button>
                </div>
              </div>

              {/* 3 Kategori Sekaligus */}
              <div className="space-y-2.5">
                <label className="font-semibold text-stone-800 block">2. Tingkat Kehilangan pada 3 Kategori</label>
                <div className="space-y-2">
                  <div>
                    <span className="text-[11px] font-medium text-stone-600 block mb-0.5">A. Pemupukan:</span>
                    <select
                      value={selectedPemupukanId}
                      onChange={(e) => setSelectedPemupukanId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
                    >
                      {catPemupukan.options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-stone-600 block mb-0.5">B. OPT (Hama/Penyakit):</span>
                    <select
                      value={selectedOptId}
                      onChange={(e) => setSelectedOptId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
                    >
                      {catOpt.options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-[11px] font-medium text-stone-600 block mb-0.5">C. Penanganan Pasca Panen:</span>
                    <select
                      value={selectedPascaId}
                      onChange={(e) => setSelectedPascaId(e.target.value)}
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
                    >
                      {catPasca.options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Box Live Calculation Preview */}
              <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 space-y-2">
                <div className="flex items-center justify-between font-semibold text-stone-800">
                  <span>Hasil Perhitungan Otomatis:</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getOptionBadgeColor(calcTotalPersen)}`}>
                    Total Susut {calcTotalPersen}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-stone-500 block">Total %:</span>
                    <strong className="font-mono text-emerald-800">{calcTotalPersen}%</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Bobot Susut:</span>
                    <strong className="font-mono text-stone-900">{calcTotalBobotSusutKg.toLocaleString('id-ID')} Kg</strong>
                  </div>
                  <div>
                    <span className="text-stone-500 block">Nilai Kerugian:</span>
                    <strong className="font-mono text-rose-700">{formatRupiah(calcTotalNilaiKehilanganRp)}</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Luas Lahan (Ha) *:</label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={calcLuasLahanStr}
                      onChange={(e) => setCalcLuasLahanStr(e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white font-mono font-medium"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Nama Petani *:</label>
                    <input
                      type="text"
                      required
                      value={calcNamaPetani}
                      onChange={(e) => setCalcNamaPetani(e.target.value)}
                      placeholder="Contoh: Zulkifli Mansur"
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Kecamatan (Kab. Bangka):</label>
                    <select
                      value={calcKecamatan}
                      onChange={(e) => handleCalcKecamatanChange(e.target.value as KecamatanBangka)}
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
                    >
                      {KECAMATAN_LIST.map(k => (
                        <option key={k.nama} value={k.nama}>{k.nama}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Kelurahan/Desa:</label>
                    <select
                      value={calcDesa}
                      onChange={(e) => setCalcDesa(e.target.value)}
                      className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
                    >
                      {(DESA_PER_KECAMATAN[calcKecamatan] || []).map((desa) => (
                        <option key={desa} value={desa}>{desa}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddLossOpen(false)}
                  className="px-3.5 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || calcTotalBobotSusutKg <= 0}
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />}
                  <span>Simpan Catatan Susut</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT LOSS RECORD */}
      {/* ========================================================================= */}
      {editingLoss && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2 text-stone-900 font-bold">
                <Pencil className="w-5 h-5 text-emerald-700" />
                <span>Edit Catatan Kehilangan Hasil</span>
              </div>
              <button 
                onClick={() => setEditingLoss(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Nama Petani:</label>
                <input
                  type="text"
                  required
                  value={editNamaPetani}
                  onChange={(e) => setEditNamaPetani(e.target.value)}
                  placeholder="Contoh: Zulkifli Mansur"
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Kecamatan (Kab. Bangka):</label>
                  <select
                    value={editKecamatan}
                    onChange={(e) => {
                      const newKec = e.target.value as KecamatanBangka;
                      setEditKecamatan(newKec);
                      const desas = DESA_PER_KECAMATAN[newKec];
                      if (desas && desas.length > 0) {
                        setEditDesa(desas[0]);
                      }
                    }}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
                  >
                    {KECAMATAN_LIST.map(k => (
                      <option key={k.nama} value={k.nama}>{k.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Kelurahan/Desa:</label>
                  <select
                    value={editDesa}
                    onChange={(e) => setEditDesa(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
                  >
                    {(DESA_PER_KECAMATAN[editKecamatan] || []).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Komoditas:</label>
                <select
                  value={editKomoditas}
                  onChange={(e) => setEditKomoditas(e.target.value as CommodityId)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer font-medium"
                >
                  <option value="padi_sawah">Padi Sawah (6.000 Kg/Ha)</option>
                  <option value="padi_ladang">Padi Ladang (4.000 Kg/Ha)</option>
                  {COMMODITIES.filter(c => c.id !== 'padi_sawah' && c.id !== 'padi_ladang').map(c => (
                    <option key={c.id} value={c.id}>{c.nama}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Bobot Susut (Kg):</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editBobotKg}
                    onChange={(e) => setEditBobotKg(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Harga Paten (Rp/Kg):</label>
                  <div className="w-full px-3 py-1.5 bg-stone-100 border border-stone-200 rounded-lg font-mono text-stone-600">
                    Rp {HARGA_PATEN_RP.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Penyebab Utama Kehilangan:</label>
                <input
                  type="text"
                  required
                  value={editPenyebab}
                  onChange={(e) => setEditPenyebab(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Intervensi Mekanisasi / Solusi:</label>
                <input
                  type="text"
                  required
                  value={editIntervensi}
                  onChange={(e) => setEditIntervensi(e.target.value)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingLoss(null)}
                  className="px-3.5 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Perbarui Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
