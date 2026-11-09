import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { PlantingSchedule, KecamatanBangka, CommodityId, PlantingPhase } from '../types';
import { COMMODITIES, KECAMATAN_LIST, DESA_PER_KECAMATAN } from '../data/bangkaData';
import { 
  evaluateCropSuitability, 
  BMKG_CLIMATE_BANGKA, 
  IrrigationType, 
  LandTopography,
  formatIndonesianDate,
  VARIETAS_BSIP_BANGKA,
  BMKG_IKLIM_KECAMATAN_BANGKA
} from '../data/croppingCalendarData';
import {
  fetchBmkgWeatherData,
  BmkgWeatherSummary,
  getFallbackClimateSummary
} from '../lib/bmkgWeatherService';
import { 
  Calendar, 
  CloudRain, 
  AlertTriangle, 
  CheckCircle, 
  Plus, 
  ChevronRight, 
  Sliders, 
  X, 
  ShieldAlert, 
  Sparkles,
  Droplets,
  Thermometer,
  Wind,
  Layers,
  Sprout,
  Compass,
  CalendarCheck,
  RefreshCw,
  Sun,
  CloudSun,
  Cloud,
  CloudLightning,
  ExternalLink
} from 'lucide-react';

export const PlantingCalendarView: React.FC = () => {
  const { 
    plantingSchedules, 
    addPlantingSchedule, 
    updatePlantingPhase, 
    role, 
    selectedKecamatan 
  } = useApp();

  // --- Interactive Public Cropping Calendar State ---
  const [calcKomoditas, setCalcKomoditas] = useState<CommodityId>('padi_sawah');
  const [calcKecamatan, setCalcKecamatan] = useState<KecamatanBangka>('Mendo Barat');
  const [calcDesa, setCalcDesa] = useState<string>(() => DESA_PER_KECAMATAN['Mendo Barat']?.[0] || 'Kemuja');
  const [calcTanggalTanam, setCalcTanggalTanam] = useState<string>('2026-11-15');
  const [calcIrigasi, setCalcIrigasi] = useState<IrrigationType>('Irigasi');

  // Ganti kecamatan sekaligus reset pilihan desa yang relevan
  const handleKecamatanChange = (newKec: KecamatanBangka) => {
    setCalcKecamatan(newKec);
    const availableDesas = DESA_PER_KECAMATAN[newKec] || [];
    if (!availableDesas.includes(calcDesa)) {
      setCalcDesa(availableDesas[0] || '');
    }
  };

  // Sinkronisasi otomatis tombol Pilihan Cepat Musim berdasarkan bulan dari Rencana Tanggal Tanam
  const activeSeason = useMemo<'MT1' | 'MT2' | 'MT3' | null>(() => {
    if (!calcTanggalTanam) return null;
    const parts = calcTanggalTanam.split('-');
    let month = 11;
    if (parts.length >= 2) {
      month = parseInt(parts[1], 10);
    }
    // Bulan 10, 11, 12, 01 -> MT I (Oktober - Januari)
    if ([10, 11, 12, 1].includes(month)) {
      return 'MT1';
    }
    // Bulan 02, 03, 04, 05 -> MT II (Februari - Mei)
    if ([2, 3, 4, 5].includes(month)) {
      return 'MT2';
    }
    // Bulan 06, 07, 08, 09 -> MT III (Juni - September)
    if ([6, 7, 8, 9].includes(month)) {
      return 'MT3';
    }
    return null;
  }, [calcTanggalTanam]);
  // Dynamic evaluation result based on inputs
  const suitabilityResult = useMemo(() => {
    return evaluateCropSuitability(
      calcKomoditas,
      calcKecamatan,
      calcTanggalTanam,
      calcIrigasi
    );
  }, [calcKomoditas, calcKecamatan, calcTanggalTanam, calcIrigasi]);

  // Current climate for selected month
  const currentMonthClimate = useMemo(() => {
    return BMKG_CLIMATE_BANGKA.find(c => c.bulanAngka === suitabilityResult.bulanTanam) || BMKG_CLIMATE_BANGKA[10];
  }, [suitabilityResult.bulanTanam]);

  // --- BMKG Real-time Weather Forecast State (Kabupaten Bangka: Kode 19.01) ---
  const [bmkgWeather, setBmkgWeather] = useState<BmkgWeatherSummary>(() => {
    return getFallbackClimateSummary(calcKecamatan, calcTanggalTanam, currentMonthClimate);
  });
  const [isWeatherLoading, setIsWeatherLoading] = useState<boolean>(false);
  const [weatherNotice, setWeatherNotice] = useState<string | null>(null);

  const loadBmkgWeather = async (targetKec = calcKecamatan, tgl = calcTanggalTanam) => {
    setIsWeatherLoading(true);
    setWeatherNotice(null);
    try {
      const summary = await fetchBmkgWeatherData(targetKec, tgl);
      setBmkgWeather(summary);
    } catch (err: any) {
      console.warn('[PlantingCalendarView] BMKG fetch handled with fallback:', err.message || err);
      setWeatherNotice('Memuat data klimatologi resmi BMKG Babel.');
      setBmkgWeather(getFallbackClimateSummary(targetKec, tgl, currentMonthClimate));
    } finally {
      setIsWeatherLoading(false);
    }
  };

  useEffect(() => {
    loadBmkgWeather(calcKecamatan, calcTanggalTanam);
  }, [calcKecamatan, calcTanggalTanam]);

  // Sumber data iklim resmi per kecamatan Stasiun Klimatologi BMKG Babel
  const displayWeather = useMemo(() => {
    const official = BMKG_IKLIM_KECAMATAN_BANGKA[calcKecamatan] || BMKG_IKLIM_KECAMATAN_BANGKA['Mendo Barat'];
    return {
      ...bmkgWeather,
      kecamatan: calcKecamatan,
      prediksiCurahHujanBulananMm: official.curahHujanBulananMm,
      curahHujanHarianMm: Number((official.curahHujanBulananMm / Math.max(1, official.hariHujan)).toFixed(1)),
      sifatHujan: official.kategoriHujan,
      rataRataHariHujan: official.hariHujan,
      kelembapanPersen: official.kelembapanPersen,
      suhuTerkiniC: official.suhuRataRataC,
      kondisiCuaca: official.kondisiCuaca,
      catatanBMKG: official.catatanKlimatologi,
      papanIklimUrl: official.papanIklimUrl,
      stasiunPengamat: official.stasiunPengamat,
      source: 'Stasiun Klimatologi BMKG Babel' as const,
      lastUpdated: bmkgWeather?.lastUpdated || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  }, [calcKecamatan, bmkgWeather]);

  const renderWeatherDescIcon = (desc: string) => {
    const d = (desc || '').toLowerCase();
    if (d.includes('petir')) return <CloudLightning className="w-5 h-5 text-amber-500 shrink-0" />;
    if (d.includes('hujan')) return <CloudRain className="w-5 h-5 text-blue-500 shrink-0" />;
    if (d.includes('cerah berawan')) return <CloudSun className="w-5 h-5 text-amber-500 shrink-0" />;
    if (d.includes('cerah')) return <Sun className="w-5 h-5 text-amber-500 shrink-0" />;
    if (d.includes('kabur') || d.includes('kabut')) return <Wind className="w-5 h-5 text-stone-400 shrink-0" />;
    return <Cloud className="w-5 h-5 text-stone-400 shrink-0" />;
  };

  // Operator Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedScheduleForEdit, setSelectedScheduleForEdit] = useState<PlantingSchedule | null>(null);

  // Operator Form states
  const [newKecamatan, setNewKecamatan] = useState<KecamatanBangka>('Mendo Barat');
  const [newKomoditas, setNewKomoditas] = useState<CommodityId>('padi_sawah');
  const [newMusimTanam, setNewMusimTanam] = useState<PlantingSchedule['musimTanam']>('MT I');
  const [newLuasHa, setNewLuasHa] = useState<number>(350);
  const [newTanggalOlah, setNewTanggalOlah] = useState('2026-10-20');
  const [newTanggalTanam, setNewTanggalTanam] = useState('2026-11-10');
  const [newTanggalPupuk1, setNewTanggalPupuk1] = useState('2026-11-25');
  const [newTanggalPupuk2, setNewTanggalPupuk2] = useState('2026-12-30');
  const [newTanggalPanen, setNewTanggalPanen] = useState('2027-02-28');

  const filteredSchedules = plantingSchedules.filter(s => {
    return selectedKecamatan === 'Semua' || s.kecamatan === selectedKecamatan;
  });

  const PHASES: PlantingPhase[] = [
    'Persiapan Lahan',
    'Penyemaian / Penanaman',
    'Vegetatif & Pemupukan I',
    'Generatif & Pemupukan II',
    'Pengendalian OPT',
    'Menjelang Panen',
    'Panen Raya'
  ];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPlantingSchedule({
      kodeJadwal: `SCH-${newKomoditas.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      kecamatan: newKecamatan,
      komoditas: newKomoditas,
      musimTanam: newMusimTanam,
      luasRencanaHa: Number(newLuasHa),
      tanggalMulaiOlah: newTanggalOlah,
      tanggalTanam: newTanggalTanam,
      tanggalPupuk1: newTanggalPupuk1,
      tanggalPupuk2: newTanggalPupuk2,
      tanggalPanenEstimasi: newTanggalPanen,
      faseSaatIni: 'Persiapan Lahan',
      progresFasePersen: 15,
      indeksKlimatologi: 'Optimal',
      rekomendasiAgroklimat: 'Kondisi kelembapan tanah mencukupi, disarankan pembersihan parit drainase.',
      peringatanOpt: ['Waspada OPT musiman pada masa awal penanaman.']
    });
    setIsModalOpen(false);
  };

  const handleUpdatePhase = (scheduleId: string, phase: PlantingPhase, progress: number) => {
    updatePlantingPhase(scheduleId, phase, progress);
    setSelectedScheduleForEdit(null);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="text-xl font-bold text-stone-900">
              Kalender Tanam & Musim Pertanian Bangka
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Sistem peramalan agroklimatologi terintegrasi BMKG Stasiun Klimatologi Babel & standar budidaya
          </p>
        </div>

        {/* Input button strictly for Operator (hidden for public) */}
        {role === 'operator' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Buat Jadwal Musim Tanam Baru</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* INTERACTIVE CROP CALENDAR SIMULATOR & ADVISORY */}
      {/* ======================================================== */}
      <div className="space-y-6">
        {/* Interactive Input Form for Public / Farmers */}
        <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <Compass className="w-4 h-4 text-emerald-800" />
                </div>
                <h3 className="font-bold text-base text-stone-900">
                  Simulasi & Verifikasi Musim Tanam Lahan Anda
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Masukkan komoditas, lokasi kecamatan, kelurahan/desa, dan rencana tanggal tanam Anda untuk menghasilkan jadwal budidaya harian presisi dan evaluasi iklim BMKG.
              </p>
            </div>
          </div>

          {/* Inputs Grid (5 columns: Komoditas, Kecamatan, Desa/Kelurahan, Tanggal Tanam, Pengairan) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 text-xs">
            {/* 1. Komoditas */}
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                1. Komoditas Tanaman:
              </label>
              <select
                value={calcKomoditas}
                onChange={(e) => setCalcKomoditas(e.target.value as CommodityId)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white font-medium cursor-pointer"
              >
                {COMMODITIES.map(c => (
                  <option key={c.id} value={c.id}>{c.nama}</option>
                ))}
              </select>
            </div>

            {/* 2. Kecamatan */}
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                2. Lokasi Kecamatan:
              </label>
              <select
                value={calcKecamatan}
                onChange={(e) => handleKecamatanChange(e.target.value as KecamatanBangka)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white font-medium cursor-pointer"
              >
                {KECAMATAN_LIST.map(k => (
                  <option key={k.nama} value={k.nama}>{k.nama}</option>
                ))}
              </select>
            </div>

            {/* 3. Kelurahan / Desa */}
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                3. Kelurahan / Desa:
              </label>
              <select
                value={calcDesa}
                onChange={(e) => setCalcDesa(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white font-medium cursor-pointer"
              >
                {(DESA_PER_KECAMATAN[calcKecamatan] || []).map((desa) => (
                  <option key={desa} value={desa}>{desa}</option>
                ))}
              </select>
            </div>

            {/* 4. Rencana Tanggal Tanam */}
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                4. Rencana Tanggal Tanam:
              </label>
              <input
                type="date"
                value={calcTanggalTanam}
                onChange={(e) => setCalcTanggalTanam(e.target.value)}
                className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white font-mono font-medium cursor-pointer"
              />
            </div>

            {/* 5. Sistem Pengairan */}
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                5. Sistem Pengairan:
              </label>
              <select
                value={calcIrigasi}
                onChange={(e) => setCalcIrigasi(e.target.value as IrrigationType)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white font-medium cursor-pointer"
              >
                <option value="Irigasi">Irigasi</option>
                <option value="Tadah Hujan">Tadah Hujan</option>
                <option value="Embung / Sumur Bor">Embung / Sumur Bor</option>
              </select>
            </div>
          </div>

          {/* Quick Presets for Planting Windows (Otomatis Tersinkronisasi dengan Tanggal Tanam) */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100 text-xs">
            <span className="text-stone-500 font-medium text-[11px]">Pilihan Cepat Musim:</span>
            <button
              type="button"
              onClick={() => setCalcTanggalTanam('2026-11-15')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSeason === 'MT1'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-1 ring-emerald-600 font-bold'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeSeason === 'MT1' ? 'bg-amber-300' : 'bg-stone-400'}`} />
              <span>MT I (Oktober - Januari)</span>
            </button>
            <button
              type="button"
              onClick={() => setCalcTanggalTanam('2027-04-10')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSeason === 'MT2'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-1 ring-emerald-600 font-bold'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeSeason === 'MT2' ? 'bg-amber-300' : 'bg-stone-400'}`} />
              <span>MT II (Februari - Mei)</span>
            </button>
            <button
              type="button"
              onClick={() => setCalcTanggalTanam('2027-07-05')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSeason === 'MT3'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-1 ring-emerald-600 font-bold'
                  : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100 hover:border-stone-300'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeSeason === 'MT3' ? 'bg-amber-300' : 'bg-stone-400'}`} />
              <span>MT III (Juni - September)</span>
            </button>
          </div>
        </div>

          {/* DYNAMIC RESULTS: SUITABILITY & CLIMATE ADVISORY */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left 2 Cols: Evaluation, Score, Varietas, and Timeline */}
            <div className="lg:col-span-2 space-y-5">
              {/* Dynamic Cronological Timeline (Pipeline Tahapan dengan Tanggal Riil) */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className="w-4 h-4 text-emerald-800" />
                    <h4 className="font-bold text-sm text-stone-900">
                      Rencana Jadwal Budidaya Presisi (Dihitung Berdasarkan Tanggal Tanam Anda)
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-stone-500">
                    Siklus: {suitabilityResult.totalHariBudidaya} Hari
                  </span>
                </div>

                <div className="space-y-3.5">
                  {suitabilityResult.tahapanBudidaya.map((tahap, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-xl border border-stone-200 hover:border-emerald-700/50 bg-stone-50/60 transition-all text-xs space-y-1.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="font-bold text-stone-900 text-[13px] flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-800 text-white text-[10px] flex items-center justify-center font-mono">
                            {idx + 1}
                          </span>
                          <span className="text-[15px]">{tahap.fase}</span>
                        </div>
                        <div className="flex items-center gap-2 text-stone-500 font-mono text-[11px]">
                          <span className="px-2 py-0.5 bg-stone-200/80 rounded font-semibold text-stone-800">
                            {tahap.rentangHari}
                          </span>
                          <span className="font-bold text-emerald-800">
                            {tahap.tanggalTarget}
                          </span>
                        </div>
                      </div>

                      <div className="text-stone-700 pl-7 leading-relaxed">
                        <strong>Instruksi Lapangan:</strong> {tahap.aktivitasKunci}
                      </div>

                      <div className="text-stone-500 pl-7 text-[11px]">
                        <span className="font-semibold text-emerald-800">Dosis / Kebutuhan Nutrisi:</span> {tahap.kebutuhanNutrisi}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: BMKG Agrometeorology Deep-Dive & Actionable Mitigation */}
            <div className="space-y-5">
              {/* Climate Snapshot for Selected Month with BMKG Real-time Integration */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4">
                {/* Header dengan Indikator Data BMKG & Link Resmi */}
                <div className="flex items-start sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
                  <div className="flex items-center gap-2 text-stone-900">
                    <CloudRain className="w-4 h-4 text-emerald-800 shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm leading-tight">
                        Prakiraan Iklim & Cuaca BMKG ({displayWeather.kecamatan})
                      </h4>
                      <span className="text-[10px] text-stone-500 block">
                        Stasiun Klimatologi Kep. Bangka Belitung (Kode: 19.01)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={displayWeather.papanIklimUrl || "https://sites.google.com/bmkg.go.id/papaniklimbabel"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition-colors shadow-2xs"
                      title="Buka Publikasi Resmi Papan Iklim BMKG Babel"
                    >
                      <span>Papan Iklim BMKG</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => loadBmkgWeather(calcKecamatan, calcTanggalTanam)}
                      disabled={isWeatherLoading}
                      title="Perbarui Data Cuaca BMKG"
                      className="p-1 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isWeatherLoading ? 'animate-spin text-emerald-700' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Kondisi Cuaca Spesifik Tanggal Tanam & Kecamatan dari BMKG */}
                  <div className="p-3 bg-gradient-to-r from-emerald-50/80 to-stone-50 rounded-xl border border-emerald-200/80 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-emerald-200 flex items-center justify-center shadow-2xs shrink-0">
                        {renderWeatherDescIcon(displayWeather.kondisiCuaca)}
                      </div>
                      <div>
                        <div className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                          Cuaca Wilayah ({displayWeather.kecamatan} • Desa {calcDesa})
                        </div>
                        <div className="font-bold text-sm text-stone-900 leading-tight flex items-center gap-1.5 mt-0.5">
                          <span>{displayWeather.kondisiCuaca}</span>
                        </div>
                        <div className="text-[10px] text-stone-500 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-emerald-700" />
                          <span className="font-medium text-emerald-900">{displayWeather.targetDateFormatted}</span>
                          <span>•</span>
                          <span>Kab. Bangka (19.01)</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-base font-extrabold font-mono text-emerald-950 flex items-center justify-end gap-1">
                        <Thermometer className="w-3.5 h-3.5 text-rose-600" />
                        <span>{displayWeather.suhuTerkiniC}°C</span>
                      </div>
                      <div className="text-[10px] font-mono text-stone-600 flex items-center justify-end gap-1 mt-0.5">
                        <Droplets className="w-3 h-3 text-blue-500" />
                        <span>{displayWeather.kelembapanPersen}% RH</span>
                      </div>
                    </div>
                  </div>

                  {/* Prediksi Curah Hujan Bulanan & Harian */}
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-stone-500 block text-[11px]">Curah Hujan Bulanan:</span>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono font-bold text-base text-stone-900">
                          {displayWeather.prediksiCurahHujanBulananMm} <span className="text-xs font-normal">mm/bulan</span>
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          (~{displayWeather.curahHujanHarianMm} mm/hari)
                        </span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      displayWeather.sifatHujan === 'Atas Normal'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {displayWeather.sifatHujan}
                    </span>
                  </div>

                  {/* Rata-rata Hari Hujan & Kelembapan Bulanan */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-stone-400 block text-[10px]">Hari Hujan:</span>
                      <span className="font-mono font-bold text-stone-800 text-sm">
                        {displayWeather.rataRataHariHujan} Hari
                      </span>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-100">
                      <span className="text-stone-400 block text-[10px]">Kelembapan Udara:</span>
                      <span className="font-mono font-bold text-stone-800 text-sm">
                        {displayWeather.kelembapanPersen}% RH
                      </span>
                    </div>
                  </div>

                  {/* Catatan BMKG Stasiun Klimatologi Babel */}
                  <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-100 text-stone-700 leading-relaxed text-[11px]">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-emerald-950 font-semibold block">
                        Catatan Stasiun Klimatologi BMKG Babel:
                      </strong>
                      <span className="text-[10px] font-mono text-emerald-800/80 font-medium">Kec. {displayWeather.kecamatan} ({calcDesa})</span>
                    </div>
                    <p className="text-stone-700 leading-relaxed">{displayWeather.catatanBMKG}</p>
                  </div>

                  {/* Status update info dengan link eksternal */}
                  <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-100">
                    <a
                      href="https://sites.google.com/bmkg.go.id/papaniklimbabel"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Sumber: Stasiun Klimatologi Babel</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <span>Update: Pukul {displayWeather.lastUpdated} WIB</span>
                  </div>
                </div>
              </div>

              {/* Hama Penyakit (OPT) Waspada Musiman */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200 text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <h4 className="font-bold text-sm">
                    Peringatan OPT Kritis Terkait Musim Ini
                  </h4>
                </div>

                <div className="space-y-2 text-xs">
                  {suitabilityResult.hamaPenyakitUtama.map((hama, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-950">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold block">{hama}</strong>
                        <span className="text-[11px] text-amber-800/90">
                          Pengawasan intensif pada fase pembungaan dan kelembapan ekstrem.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Langkah Mitigasi Teknis Lapangan */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-center gap-2 pb-2 border-b border-stone-200 text-stone-900">
                  <CheckCircle className="w-4 h-4 text-emerald-800" />
                  <h4 className="font-bold text-sm">
                    Rekomendasi Rekayasa Teknis Lahan
                  </h4>
                </div>

                <ul className="space-y-2 text-xs text-stone-700">
                  {suitabilityResult.mitigasiRisiko.map((m, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 shrink-0 mt-1.5" />
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

      {/* Operator Modal: Update Fase Tanam */}
      {selectedScheduleForEdit && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-sm">
                Perbarui Fase Tanam ({selectedScheduleForEdit.kodeJadwal})
              </h3>
              <button 
                onClick={() => setSelectedScheduleForEdit(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Pilih Fase Tanam Saat Ini:</label>
                <select
                  defaultValue={selectedScheduleForEdit.faseSaatIni}
                  id="phaseSelect"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-700"
                >
                  {PHASES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Estimasi Persentase Progres Fase (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={selectedScheduleForEdit.progresFasePersen}
                  id="progressInput"
                  className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setSelectedScheduleForEdit(null)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const selectEl = document.getElementById('phaseSelect') as HTMLSelectElement;
                  const inputEl = document.getElementById('progressInput') as HTMLInputElement;
                  handleUpdatePhase(
                    selectedScheduleForEdit.id, 
                    selectEl.value as PlantingPhase, 
                    Number(inputEl.value) || 50
                  );
                }}
                className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operator Modal: Buat Jadwal Musim Tanam Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-stone-900 text-base">Buat Kalender Musim Tanam Baru</h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Kecamatan Sentra *</label>
                  <select
                    value={newKecamatan}
                    onChange={(e) => setNewKecamatan(e.target.value as KecamatanBangka)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-700 cursor-pointer"
                  >
                    {KECAMATAN_LIST.map(k => (
                      <option key={k.nama} value={k.nama}>{k.nama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Komoditas *</label>
                  <select
                    value={newKomoditas}
                    onChange={(e) => setNewKomoditas(e.target.value as CommodityId)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-700 cursor-pointer"
                  >
                    {COMMODITIES.map(c => (
                      <option key={c.id} value={c.id}>{c.nama}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Periode Musim Tanam</label>
                  <select
                    value={newMusimTanam}
                    onChange={(e) => setNewMusimTanam(e.target.value as any)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-700 cursor-pointer"
                  >
                    <option value="MT I (Rendengan/Penghujan)">MT I (Rendengan/Penghujan)</option>
                    <option value="MT II (Gadu/Transisi)">MT II (Gadu/Transisi)</option>
                    <option value="MT III (Kemarau Terkendali)">MT III (Kemarau Terkendali)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Luas Rencana Tanam (Ha)</label>
                  <input
                    type="number"
                    min="1"
                    value={newLuasHa}
                    onChange={(e) => setNewLuasHa(Number(e.target.value))}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Mulai Olah Lahan</label>
                  <input
                    type="date"
                    value={newTanggalOlah}
                    onChange={(e) => setNewTanggalOlah(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Tanggal Tanam Serempak</label>
                  <input
                    type="date"
                    value={newTanggalTanam}
                    onChange={(e) => setNewTanggalTanam(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Pemupukan I (Vegetatif)</label>
                  <input
                    type="date"
                    value={newTanggalPupuk1}
                    onChange={(e) => setNewTanggalPupuk1(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Perkiraan Panen Raya</label>
                  <input
                    type="date"
                    value={newTanggalPanen}
                    onChange={(e) => setNewTanggalPanen(e.target.value)}
                    className="w-full p-2 bg-stone-50 border border-stone-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg font-medium cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Daftarkan Jadwal Tanam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
