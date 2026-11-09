import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KECAMATAN_LIST, COMMODITIES } from '../data/bangkaData';
import { KecamatanBangka } from '../types';
import { MapPin, Users, Phone, Building, Layers, Sparkles } from 'lucide-react';

export const BangkaMapInteractive: React.FC = () => {
  const { 
    selectedKecamatan, 
    setSelectedKecamatan, 
    landParcels, 
    harvestRecords 
  } = useApp();

  const [hoveredKecamatan, setHoveredKecamatan] = useState<KecamatanBangka | null>(null);

  // SVG coordinates layout for the 8 subdistricts representing geographic layout of Bangka Regency
  // Belinyu (North), Riau Silip (North-central), Pemali (East-central), Sungailiat (East Coast),
  // Bakam (West-central), Puding Besar (Central), Merawang (South-East), Mendo Barat (South-West)
  const DISTRICT_GEOMETRY: Record<KecamatanBangka, { path: string; labelX: number; labelY: number }> = {
    'Belinyu': {
      path: 'M 180,20 L 260,25 L 290,75 L 260,110 L 200,105 L 160,70 Z',
      labelX: 225,
      labelY: 65
    },
    'Riau Silip': {
      path: 'M 160,70 L 200,105 L 260,110 L 250,165 L 180,175 L 140,120 Z',
      labelX: 200,
      labelY: 135
    },
    'Bakam': {
      path: 'M 140,120 L 180,175 L 170,230 L 110,235 L 90,170 Z',
      labelX: 135,
      labelY: 185
    },
    'Pemali': {
      path: 'M 250,110 L 310,115 L 305,175 L 250,165 Z',
      labelX: 278,
      labelY: 145
    },
    'Sungailiat': {
      path: 'M 310,115 L 375,130 L 360,210 L 305,175 Z',
      labelX: 335,
      labelY: 165
    },
    'Puding Besar': {
      path: 'M 180,175 L 250,165 L 240,240 L 170,230 Z',
      labelX: 210,
      labelY: 205
    },
    'Merawang': {
      path: 'M 240,170 L 305,175 L 360,210 L 320,280 L 250,265 L 240,240 Z',
      labelX: 290,
      labelY: 230
    },
    'Mendo Barat': {
      path: 'M 170,230 L 250,265 L 240,340 L 140,330 L 120,270 Z',
      labelX: 195,
      labelY: 285
    }
  };

  const activeKec = selectedKecamatan !== 'Semua' 
    ? KECAMATAN_LIST.find(k => k.nama === selectedKecamatan)
    : (hoveredKecamatan ? KECAMATAN_LIST.find(k => k.nama === hoveredKecamatan) : null);

  const totalRegisteredPlots = selectedKecamatan === 'Semua' 
    ? landParcels.length 
    : landParcels.filter(p => p.kecamatan === selectedKecamatan).length;

  const totalRegisteredHa = selectedKecamatan === 'Semua'
    ? landParcels.reduce((acc, p) => acc + p.luasHa, 0)
    : landParcels.filter(p => p.kecamatan === selectedKecamatan).reduce((acc, p) => acc + p.luasHa, 0);

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-stone-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <Layers className="w-4 h-4" />
            <span>Peta Spasial Geografis Pertanian Kab. Bangka</span>
          </div>
          <h2 className="text-lg font-bold text-stone-900 mt-1">
            Sebaran 8 Kecamatan & Sentra Komoditas Utama
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Klik wilayah kecamatan untuk menyaring data petak lahan, kalender tanam, dan penyaluran pupuk secara terintegrasi.
          </p>
        </div>

        {/* Subdistrict quick-pill filter (Functional buttons) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedKecamatan('Semua')}
            className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              selectedKecamatan === 'Semua'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Semua Kecamatan
          </button>
          {KECAMATAN_LIST.map((kec) => (
            <button
              key={kec.nama}
              onClick={() => setSelectedKecamatan(kec.nama)}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                selectedKecamatan === kec.nama
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {kec.nama}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Interactive Map + Context Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* SVG Interactive Map (7 cols) */}
        <div className="lg:col-span-7 bg-stone-50 rounded-xl p-4 border border-stone-200 flex flex-col items-center relative overflow-hidden">
          <div className="w-full flex justify-between items-center text-xs text-stone-500 mb-2">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block"></span>
              Sentra Aktif SIMPATIS
            </span>
            <span className="text-[11px] font-mono text-stone-400">Koordinat: 1.86° S, 106.12° E</span>
          </div>

          <svg 
            viewBox="60 10 340 350" 
            className="w-full h-80 sm:h-96 drop-shadow-xs select-none"
          >
            {/* Coastline / Island backdrop */}
            <path 
              d="M 140,25 Q 260,10 330,60 Q 390,140 370,230 Q 340,310 240,360 Q 140,350 100,280 Q 70,200 120,80 Z" 
              fill="#E7ECE9" 
              stroke="#CBD5E1" 
              strokeWidth="1.5" 
              strokeDasharray="3 3"
            />

            {/* Subdistricts Polygons */}
            {(Object.keys(DISTRICT_GEOMETRY) as KecamatanBangka[]).map((kecName) => {
              const geom = DISTRICT_GEOMETRY[kecName];
              const isSelected = selectedKecamatan === kecName;
              const isHovered = hoveredKecamatan === kecName;
              const hasData = landParcels.some(p => p.kecamatan === kecName);

              return (
                <g 
                  key={kecName}
                  onClick={() => setSelectedKecamatan(selectedKecamatan === kecName ? 'Semua' : kecName)}
                  onMouseEnter={() => setHoveredKecamatan(kecName)}
                  onMouseLeave={() => setHoveredKecamatan(null)}
                  className="cursor-pointer transition-all duration-200 group"
                >
                  <path
                    d={geom.path}
                    className={`transition-colors duration-150 ${
                      isSelected
                        ? 'fill-emerald-800 stroke-amber-300 stroke-2 filter drop-shadow-md'
                        : isHovered
                        ? 'fill-emerald-600 stroke-white stroke-2'
                        : hasData
                        ? 'fill-emerald-100 hover:fill-emerald-200 stroke-emerald-700/60 stroke-1'
                        : 'fill-stone-200 hover:fill-stone-300 stroke-stone-300 stroke-1'
                    }`}
                  />
                  <text
                    x={geom.labelX}
                    y={geom.labelY}
                    textAnchor="middle"
                    className={`text-[10px] font-semibold pointer-events-none transition-colors ${
                      isSelected || isHovered
                        ? 'fill-white font-bold'
                        : 'fill-stone-800'
                    }`}
                  >
                    {kecName}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="w-full text-center text-[11px] text-stone-500 mt-2">
            Klik nama kecamatan untuk memfilter dashboard atau batalkan pilihan dengan mengklik lagi.
          </div>
        </div>

        {/* Subdistrict Detail Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {activeKec ? (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                    Profil Balai Penyuluhan Pertanian
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mt-0.5">
                    Kecamatan {activeKec.nama}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{activeKec.pusatBpp}</span>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs bg-emerald-100 text-emerald-900 font-medium px-2 py-0.5 rounded-md">
                    {activeKec.jumlahPoktan} Kelompok Tani
                  </span>
                </div>
              </div>

              {/* Leading Commodities */}
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1.5">
                  Komoditas Unggulan Wilayah:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {activeKec.komoditasUnggulan.map((cId) => {
                    const cInfo = COMMODITIES.find(c => c.id === cId);
                    return (
                      <span 
                        key={cId}
                        className="px-2.5 py-1 bg-white border border-stone-200 text-stone-800 text-xs font-medium rounded-md shadow-2xs"
                      >
                        {cInfo?.nama.split('(')[0].trim()}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Data Summary Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-200 text-xs">
                <div className="bg-white p-3 rounded-lg border border-stone-200">
                  <span className="text-stone-500 block">Total Luas Lahan Tani:</span>
                  <span className="text-base font-bold font-mono tabular-nums text-stone-900">
                    {activeKec.totalLahanTaniHa.toLocaleString('id-ID')} <span className="text-xs font-normal">Ha</span>
                  </span>
                </div>
                <div className="bg-white p-3 rounded-lg border border-stone-200">
                  <span className="text-stone-500 block">Petak Terdaftar di Petik:</span>
                  <span className="text-base font-bold font-mono tabular-nums text-emerald-800">
                    {landParcels.filter(p => p.kecamatan === activeKec.nama).length} <span className="text-xs font-normal">Petak</span>
                  </span>
                </div>
              </div>

              {/* PPL Coordinator Contact */}
              <div className="bg-white p-3.5 rounded-lg border border-stone-200 text-xs space-y-1">
                <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>Koordinator Penyuluh: {activeKec.koordinatorPpl}</span>
                </div>
                <div className="text-stone-600 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-stone-400" />
                  <span className="font-mono">{activeKec.kontakPpl}</span>
                </div>
              </div>

              {/* Quick filter action */}
              <button
                onClick={() => setSelectedKecamatan(activeKec.nama)}
                className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
              >
                Tampilkan Hanya Data Petak {activeKec.nama}
              </button>
            </div>
          ) : (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-6 text-center space-y-3">
              <MapPin className="w-8 h-8 text-stone-400 mx-auto" />
              <div>
                <h4 className="text-sm font-semibold text-stone-900">Kabupaten Bangka (8 Kecamatan)</h4>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Arahkan kursor atau klik wilayah pada peta di samping untuk melihat data spesifik Balai Penyuluhan Pertanian (BPP) dan komoditas binaan.
                </p>
              </div>
              <div className="pt-3 border-t border-stone-200 grid grid-cols-2 gap-2 text-left text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                  <span className="text-stone-500 block text-[11px]">Total Lahan Tani Bangka:</span>
                  <span className="font-bold font-mono tabular-nums text-stone-900">101.520 Ha</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                  <span className="text-stone-500 block text-[11px]">Total Kelompok Tani:</span>
                  <span className="font-bold font-mono tabular-nums text-stone-900">578 Poktan</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Metrics Strip */}
          <div className="bg-emerald-900 text-white rounded-xl p-4 text-xs space-y-2 shadow-xs">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Indikator Kesuburan Tanah Bangka</span>
            </div>
            <p className="text-emerald-100 text-[11px] leading-relaxed">
              Tanah Bangka didominasi ordo Ultisol (Podsolik Merah Kuning) masam dengan rata-rata <strong>pH 4.8 – 5.4</strong>. SIMPATIS mewajibkan rekomendasi aplikasi kapur Dolomit Bangka (1-1.5 ton/ha) sebelum pemupukan berimbang.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
