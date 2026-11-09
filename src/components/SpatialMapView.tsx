import React from 'react';
import { useApp } from '../context/AppContext';
import { BangkaMapInteractive } from './BangkaMapInteractive';
import { KECAMATAN_LIST, COMMODITIES } from '../data/bangkaData';
import { Map, MapPin, Users, Phone, Building, Layers, Sprout } from 'lucide-react';

interface SpatialMapViewProps {
  onNavigateTab?: (tab: string) => void;
}

export const SpatialMapView: React.FC<SpatialMapViewProps> = ({ onNavigateTab }) => {
  const { 
    landParcels, 
    selectedKecamatan, 
    setSelectedKecamatan,
    selectedCommodity,
    setSelectedCommodity 
  } = useApp();

  const totalLuasHa = landParcels.reduce((sum, p) => sum + p.luasHa, 0);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="text-xl font-bold text-stone-900">
              Peta Digital & Sebaran Lahan
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Visualisasi spasial GIS 8 kecamatan sentra pertanian dan sebaran petak lahan komoditas strategis Kabupaten Bangka.
          </p>
        </div>

        {onNavigateTab && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('lahan')}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Sprout className="w-4 h-4 text-amber-300" />
              <span>Buka Database Petak Lahan</span>
            </button>
          </div>
        )}
      </div>

      {/* 4 Summary Metric Cards with Units below title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-stone-500 font-medium">Total Luas Lahan Terdata</div>
          <div className="mt-1 text-2xl font-bold font-mono text-stone-900">
            {totalLuasHa.toFixed(1)} <span className="text-sm font-normal text-stone-500">Ha</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Petak terverifikasi di 8 kecamatan</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-stone-500 font-medium">Petak Lahan Terdaftar</div>
          <div className="mt-1 text-2xl font-bold font-mono text-emerald-800">
            {landParcels.length} <span className="text-sm font-normal text-stone-500">Petak</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Kelompok tani aktif</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-stone-500 font-medium">Wilayah Kecamatan</div>
          <div className="mt-1 text-2xl font-bold font-mono text-stone-800">
            8 <span className="text-sm font-normal text-stone-500">Kecamatan</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Sentra pertanian Kab. Bangka</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs">
          <div className="text-xs text-stone-500 font-medium">Komoditas Unggulan</div>
          <div className="mt-1 text-2xl font-bold font-mono text-amber-700">
            5 <span className="text-sm font-normal text-stone-500">Komoditas</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Padi sawah, ladang, & 3 cabai</p>
        </div>
      </div>

      {/* Interactive GIS SVG Map Component */}
      <BangkaMapInteractive />

      {/* Directory of 8 Subdistricts with BPP Information */}
      <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-sm text-stone-900">
              Direktori 8 Wilayah Binaan BPP & Koordinator Penyuluh Pertanian (PPL)
            </h3>
          </div>
          <span className="text-xs text-stone-500 font-medium">Kabupaten Bangka</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {KECAMATAN_LIST.map((kec) => {
            const parcelsInKec = landParcels.filter(p => p.kecamatan === kec.nama);
            const luasInKec = parcelsInKec.reduce((sum, p) => sum + p.luasHa, 0);

            return (
              <div 
                key={kec.nama}
                className="p-3.5 rounded-xl border border-stone-200 hover:border-emerald-700/50 bg-stone-50/60 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-sm">Kec. {kec.nama}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                    {parcelsInKec.length} Petak
                  </span>
                </div>

                <div className="text-[11px] text-stone-600 space-y-1">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Kantor BPP:</span>
                    <span className="text-stone-800 font-medium">{kec.pusatBpp}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Koordinator PPL:</span>
                    <span className="text-stone-800 font-medium">{kec.koordinatorPpl}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                    <span className="text-stone-400 text-[10px]">Luas Terdata:</span>
                    <span className="font-mono font-bold text-emerald-900">{luasInKec.toFixed(1)} Ha</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
