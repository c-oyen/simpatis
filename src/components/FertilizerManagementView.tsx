import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { COMMODITIES, KECAMATAN_LIST } from '../data/bangkaData';
import { CommodityId } from '../types';
import { Store, MapPin, Calculator } from 'lucide-react';

export const FertilizerManagementView: React.FC = () => {
  const { 
    kiosPupukList, 
    selectedKecamatan,
    setSelectedKecamatan
  } = useApp();

  // Interactive Calculator State
  const [calcKomoditas, setCalcKomoditas] = useState<CommodityId>('padi_sawah');
  const [calcLuasHa, setCalcLuasHa] = useState<number>(1.0);
  const [calcPhTanah, setCalcPhTanah] = useState<number>(5.2);

  const filteredKios = kiosPupukList.filter(k => {
    return selectedKecamatan === 'Semua' || k.kecamatan === selectedKecamatan;
  });

  // Dynamic calculations for fertilizer & lime recommendations
  const selectedCommInfo = COMMODITIES.find(c => c.id === calcKomoditas) || COMMODITIES[0];
  const safeLuas = Math.max(0.01, Number(calcLuasHa) || 0);
  const safePh = Math.max(3.0, Math.min(8.5, Number(calcPhTanah) || 5.0));
  // Dynamic Dolomite calculation based on soil pH (Ultisol Bangka)
  const dolomitMultiplier = safePh < 4.8 ? 1.5 : safePh < 5.5 ? 1.25 : safePh <= 6.2 ? 1.0 : 0.5;

  const recUreaKg = Math.round(selectedCommInfo.dosisPupukPerHa.ureaKg * safeLuas);
  const recNpkKg = Math.round(selectedCommInfo.dosisPupukPerHa.npkKg * safeLuas);
  const recSp36Kg = Math.round(selectedCommInfo.dosisPupukPerHa.sp36Kg * safeLuas);
  const recDolomitKg = Math.round(selectedCommInfo.dosisPupukPerHa.dolomitKg * dolomitMultiplier * safeLuas);
  const recOrganikKg = Math.round(selectedCommInfo.dosisPupukPerHa.organikKg * safeLuas);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="text-xl font-bold text-stone-900">
              Kebutuhan Pupuk
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Penghitungan pupuk otomatis dan informasi kios penyalur pupuk resmi (KPL) Kabupaten Bangka.
          </p>
        </div>
      </div>

      {/* KALKULATOR REKOMENDASI PUPUK BERIMBANG & KAPUR PERTANIAN */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
                <Calculator className="w-4 h-4" />
              </span>
              <h3 className="font-bold text-stone-900 text-base">
                Kalkulator Rekomendasi Pupuk Berimbang & Kapur Pertanian
              </h3>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Hitung otomatis takaran pupuk berimbang dan penetral keasaman tanah.
            </p>
          </div>
        </div>

        {/* Input Form Interaktif 3 Kolom */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200/80">
          {/* 1. Pilih Komoditas */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              1. Pilih Komoditas Tanaman:
            </label>
            <select
              value={calcKomoditas}
              onChange={(e) => setCalcKomoditas(e.target.value as CommodityId)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg font-medium text-stone-900 focus:outline-emerald-700 shadow-2xs cursor-pointer"
            >
              {COMMODITIES.map(c => (
                <option key={c.id} value={c.id}>{c.nama} ({c.kategori})</option>
              ))}
            </select>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Siklus budidaya: {selectedCommInfo.siklusTanamHari} hari
            </span>
          </div>

          {/* 2. Luas Lahan (Ha) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              2. Luas Hamparan / Petak (Ha):
            </label>
            <input
              type="number"
              step="0.1"
              min="0.05"
              max="500"
              value={calcLuasHa}
              onChange={(e) => setCalcLuasHa(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg font-mono font-bold text-stone-900 focus:outline-emerald-700 shadow-2xs"
              placeholder="Contoh: 1.0"
            />
            <span className="text-[10px] text-stone-400 mt-1 block">
              = {(safeLuas * 10000).toLocaleString('id-ID')} m²
            </span>
          </div>

          {/* 3. pH Tanah */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              3. Derajat Keasaman Tanah (pH):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.1"
                min="3.0"
                max="8.5"
                value={calcPhTanah}
                onChange={(e) => setCalcPhTanah(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg font-mono font-bold text-stone-900 focus:outline-emerald-700 shadow-2xs"
              />
              <span className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border shrink-0 ${
                safePh < 4.8 
                  ? 'bg-rose-50 text-rose-800 border-rose-200' 
                  : safePh <= 5.8 
                  ? 'bg-amber-50 text-amber-800 border-amber-200' 
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200'
              }`}>
                {safePh < 4.8 ? 'Sangat Masam' : safePh <= 5.8 ? 'Masam' : 'Optimal'}
              </span>
            </div>
            <span className="text-[10px] text-stone-400 mt-1 block">
              Faktor koreksi dolomit: {dolomitMultiplier}x
            </span>
          </div>
        </div>

        {/* Hasil Rekomendasi Takaran Pupuk */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-stone-800">
            <span>Hasil Rekomendasi Kebutuhan Pupuk & Kapur Pertanian:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Urea */}
            <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-semibold text-emerald-950">Pupuk Urea (46% N)</div>
              <div className="text-xl font-bold font-mono text-emerald-900">
                {recUreaKg.toLocaleString('id-ID')} <span className="text-xs font-normal text-emerald-700">Kg</span>
              </div>
              <p className="text-[10px] text-emerald-800 leading-tight">
                Pertumbuhan vegetatif & pembentukan klorofil daun
              </p>
            </div>

            {/* NPK Phonska */}
            <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-semibold text-emerald-950">NPK Phonska (15-15-15)</div>
              <div className="text-xl font-bold font-mono text-emerald-900">
                {recNpkKg.toLocaleString('id-ID')} <span className="text-xs font-normal text-emerald-700">Kg</span>
              </div>
              <p className="text-[10px] text-emerald-800 leading-tight">
                Nutrisi makro berimbang daun, batang & kekuatan akar
              </p>
            </div>

            {/* SP-36 */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-semibold text-stone-800">SP-36 (Fosfat)</div>
              <div className="text-xl font-bold font-mono text-stone-900">
                {recSp36Kg.toLocaleString('id-ID')} <span className="text-xs font-normal text-stone-500">Kg</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-tight">
                Merangsang perakaran awal & pembungaan serempak
              </p>
            </div>

            {/* Kapur Pertanian / Dolomit */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1">
              <div className="text-[11px] font-semibold text-amber-950">Kapur Dolomit (Mg+Ca)</div>
              <div className="text-xl font-bold font-mono text-amber-900">
                {recDolomitKg.toLocaleString('id-ID')} <span className="text-xs font-normal text-amber-700">Kg</span>
              </div>
              <p className="text-[10px] text-amber-800 leading-tight">
                {safePh < 5.0 ? 'Kritis: Netralkan racun Al & Fe' : 'Menjaga kestabilan pH Ultisol Bangka'}
              </p>
            </div>

            {/* Pupuk Organik */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-1 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold text-stone-800">Pupuk Organik / Kompos</div>
              <div className="text-xl font-bold font-mono text-stone-900">
                {recOrganikKg.toLocaleString('id-ID')} <span className="text-xs font-normal text-stone-500">Kg</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-tight">
                Meningkatkan C-Organik & kapasitas tukar kation tanah
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* INFORMASI KIOS PENYALUR RESMI (KPL) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Store className="w-4 h-4 text-emerald-800" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-sm">
                Informasi Kios Penyalur Resmi (KPL) Kabupaten Bangka
              </h3>
              <p className="text-[11px] text-stone-500">
                Direktori kios resmi berizin penyaluran pupuk bersubsidi terdaftar Dinas Pertanian Kab. Bangka
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-stone-600 shrink-0">Filter Kecamatan:</label>
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value as any)}
              className="px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-800 font-medium cursor-pointer focus:outline-emerald-700"
            >
              <option value="Semua">Semua Kecamatan (8 Wilayah)</option>
              {KECAMATAN_LIST.map(k => (
                <option key={k.nama} value={k.nama}>{k.nama}</option>
              ))}
            </select>
            <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1.5 rounded-lg shrink-0">
              {filteredKios.length} Kios
            </span>
          </div>
        </div>

        {/* Grid Card Kios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredKios.map((kios) => (
            <div 
              key={kios.id}
              className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs hover:border-emerald-700/40 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-stone-100">
                <div>
                  <h4 className="font-bold text-sm text-stone-900">{kios.namaKios}</h4>
                  <div className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-700" />
                    <span>{(kios.desa || '').replace(/^(desa|kelurahan)\s+/i, '')}, Kec. {kios.kecamatan}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                  {kios.statusOperasional}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-stone-600">
                <div>
                  <span className="text-stone-400 block text-[10px]">Alamat:</span>
                  <span className="text-stone-800">{kios.alamat}</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Penanggung Jawab:</span>
                    <span className="font-medium text-stone-800">{kios.penanggungJawab}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Kontak:</span>
                    <span className="font-mono text-emerald-800 font-semibold">{kios.kontak}</span>
                  </div>
                </div>
              </div>

              {/* Stock in Kiosk */}
              <div className="pt-2 border-t border-stone-100 bg-stone-50 -mx-5 -mb-5 p-3 rounded-b-xl">
                <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider mb-1.5">
                  Ketersediaan Stok di Kios:
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-white p-1.5 rounded border border-stone-200">
                    <div className="text-[10px] text-stone-400">Urea</div>
                    <div className="font-bold text-stone-900">{kios.stokTersedia.ureaTon} T</div>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-stone-200">
                    <div className="text-[10px] text-stone-400">NPK</div>
                    <div className="font-bold text-emerald-800">{kios.stokTersedia.npkTon} T</div>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-stone-200">
                    <div className="text-[10px] text-stone-400">Organik</div>
                    <div className="font-bold text-amber-700">{kios.stokTersedia.organikTon} T</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
