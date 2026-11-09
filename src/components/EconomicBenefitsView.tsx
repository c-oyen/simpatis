import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BANGKA_IMAGES } from '../assets/images';
import { TrendingUp, Award, DollarSign, ArrowUpRight, BarChart3, Sliders, CheckCircle2 } from 'lucide-react';

export const EconomicBenefitsView: React.FC = () => {
  const { economicImpact, landParcels, harvestRecords, postHarvestLosses, setShowOfficialModal } = useApp();

  // What-If Simulator States
  const [adopsiPersen, setAdopsiPersen] = useState<number>(65); // 65% petani Bangka mengadopsi SIMPATIS
  const [targetPenekananSusut, setTargetPenekananSusut] = useState<number>(5.0); // 5% pengurangan susut
  const [efisiensiBiayaPupuk, setEfisiensiBiayaPupuk] = useState<number>(15); // 15% hemat saprodi

  // Kabupaten Bangka agricultural land base ~25,000 Ha priority commodities
  const totalLahanBangkaHa = 25000;
  const lahanTerdampakHa = Math.round((totalLahanBangkaHa * adopsiPersen) / 100);

  // Per hectare baseline economics
  const baselineRevenuePerHa = 42000000; // Rp 42jt/ha rata-rata gabungan lada, sawit, padi, ubi
  const revenueGainFromYield = (baselineRevenuePerHa * (economicImpact.peningkatanHasilPersen / 100));
  const savingFromLoss = (baselineRevenuePerHa * (targetPenekananSusut / 100));
  const savingFromFertilizer = 4800000 * (efisiensiBiayaPupuk / 100);
  const netGainPerHa = Math.round(revenueGainFromYield + savingFromLoss + savingFromFertilizer);

  const projectedTotalKabupatenRp = Math.round(netGainPerHa * lahanTerdampakHa);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Pengukuran Manfaat Ekonomi Terverifikasi Kabupaten Bangka
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Penghitungan nilai tambah ekonomi riil berdasarkan efisiensi tanam, presisi pemupukan, dan penyelamatan susut hasil panen.
          </p>
        </div>

        <button
          onClick={() => setShowOfficialModal(true)}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Award className="w-4 h-4 text-amber-300" />
          <span>Lihat Berita Acara Rekapitulasi</span>
        </button>
      </div>

      {/* Hero Impact Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Peningkatan Hasil Produksi</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-800">
            +{economicImpact.peningkatanHasilPersen}%
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Rata-rata tonase per Ha panen dengan kalender agroklimat
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Penurunan Kehilangan Hasil</span>
            <TrendingUp className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-800">
            -{economicImpact.penurunanSusutHasilPersen}%
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Susut panen berhasil ditekan dari 8.5% ke 3.9%
          </p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Efisiensi Biaya Pupuk</span>
            <DollarSign className="w-4 h-4 text-emerald-800" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-800">
            {economicImpact.penghematanBiayaPupukPersen}%
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            Penetrasi kapur Dolomit Bangka menghentikan boros urea/NPK
          </p>
        </div>

        <div className="bg-emerald-900 text-white rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-emerald-200">
            <span>Total Nilai Ekonomi Daerah</span>
            <Award className="w-4 h-4 text-amber-300" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono tabular-nums text-amber-300">
            Rp {(economicImpact.totalNilaiEkonomiKabupatenRp / 1000000000).toFixed(2)} M
          </div>
          <p className="text-[11px] text-emerald-200 mt-1">
            Manfaat terverifikasi bagi {economicImpact.jumlahPetaniBerdampak.toLocaleString('id-ID')} petani Bangka
          </p>
        </div>
      </div>

      {/* Authentic Visual Spotlight & Proof of Transformation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Photo Card 1: Pepper Plantation */}
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs flex flex-col">
          <div className="h-56 relative overflow-hidden bg-stone-100">
            <img 
              src={BANGKA_IMAGES.pepperPlantation} 
              alt="Perkebunan Lada Putih Muntok di Bangka"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex items-end p-4">
              <span className="text-white text-xs font-semibold bg-emerald-800/90 px-2.5 py-1 rounded-md backdrop-blur-xs">
                Muntok White Pepper · Belinyu & Pemali
              </span>
            </div>
          </div>
          <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-stone-900 text-base">
                Transformasi Penanganan Pasca Panen Lada Putih
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed mt-1">
                Melalui penerapan <em>Solar Dryer Dome UV</em> dan tangki perendaman sirkulasi air mengalir, kehilangan hasil lada putih berkurang 4.2%, sementara mutu biji lada mencapai Standar SNI Ekspor Grade A dengan harga jual Rp 98.000/kg.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">Nilai Penyelamatan per Ha:</span>
              <span className="font-mono font-bold text-emerald-800">+Rp 14.200.000 / Panen</span>
            </div>
          </div>
        </div>

        {/* Photo Card 2: Paddy Harvest */}
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs flex flex-col">
          <div className="h-56 relative overflow-hidden bg-stone-100">
            <img 
              src={BANGKA_IMAGES.paddyLandscape} 
              alt="Persawahan Terpadu Mendo Barat Bangka"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent flex items-end p-4">
              <span className="text-white text-xs font-semibold bg-emerald-800/90 px-2.5 py-1 rounded-md backdrop-blur-xs">
                Sentra Padi Sawah · Mendo Barat & Riau Silip
              </span>
            </div>
          </div>
          <div className="p-5 space-y-2 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-stone-900 text-base">
                Efisiensi Mekanisasi Panen & Kemandirian Pangan
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed mt-1">
                Peralihan dari perontokan padi manual ke mini <em>combine harvester</em> dan terpal HDPE berhasil memangkas ceceran gabah sebesar 3.8% (setara 600 kg GKP per hamparan 2 Ha), mempercepat waktu panen dari 7 hari menjadi 1 hari kerja.
              </p>
            </div>
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
              <span className="text-stone-500">Nilai Penyelamatan Gabah:</span>
              <span className="font-mono font-bold text-emerald-800">+Rp 4.140.000 / Petak</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive What-If Simulation Simulator */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-2xs">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-800" />
            <div>
              <h3 className="font-bold text-stone-900 text-base">
                Simulator Proyeksi Manfaat Ekonomi Pertanian Kabupaten Bangka (2026/2027)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Simulasikan dampak kenaikan tingkat adopsi petani dan penurunan susut hasil terhadap PDRB Agrikultur Bangka.
              </p>
            </div>
          </div>
          <span className="text-xs bg-stone-100 text-stone-700 font-mono px-2.5 py-1 rounded-md">
            Model Ekonometrik Pertanian
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
          {/* Sliders (6 cols) */}
          <div className="lg:col-span-6 space-y-5 text-xs bg-stone-50 p-5 rounded-xl border border-stone-200">
            <div>
              <div className="flex justify-between items-center mb-1.5 font-semibold text-stone-800">
                <span>Tingkat Adopsi SIMPATIS di Kalangan Petani Bangka:</span>
                <span className="font-mono tabular-nums text-emerald-800 text-sm">{adopsiPersen}% ({lahanTerdampakHa.toLocaleString('id-ID')} Ha)</span>
              </div>
              <input
                type="range"
                min="20"
                max="95"
                step="5"
                value={adopsiPersen}
                onChange={(e) => setAdopsiPersen(Number(e.target.value))}
                className="w-full accent-emerald-800"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>Rintisan (20%)</span>
                <span>Moderat (60%)</span>
                <span>Masif (95%)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 font-semibold text-stone-800">
                <span>Target Penekanan Kehilangan Hasil Panen (Losses):</span>
                <span className="font-mono tabular-nums text-emerald-800 text-sm">-{targetPenekananSusut}%</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="8.0"
                step="0.5"
                value={targetPenekananSusut}
                onChange={(e) => setTargetPenekananSusut(Number(e.target.value))}
                className="w-full accent-emerald-800"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>2.0%</span>
                <span>5.0% (Standar)</span>
                <span>8.0% (Maksimal)</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5 font-semibold text-stone-800">
                <span>Efisiensi Pengeluaran Pupuk Melalui Dosis Berimbang:</span>
                <span className="font-mono tabular-nums text-emerald-800 text-sm">{efisiensiBiayaPupuk}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="25"
                step="1"
                value={efisiensiBiayaPupuk}
                onChange={(e) => setEfisiensiBiayaPupuk(Number(e.target.value))}
                className="w-full accent-emerald-800"
              />
              <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                <span>5%</span>
                <span>15%</span>
                <span>25%</span>
              </div>
            </div>
          </div>

          {/* Projected Outcomes (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-emerald-950 text-white p-6 rounded-xl space-y-4 shadow-sm border border-emerald-900">
              <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold block">
                Hasil Simulasi Nilai Tambah Bersih (Net Added Value)
              </span>

              <div className="space-y-1">
                <span className="text-xs text-emerald-200">Proyeksi Total Nilai Tambah Ekonomi Kab. Bangka:</span>
                <div className="text-3xl sm:text-4xl font-bold font-mono tabular-nums text-amber-300">
                  Rp {(projectedTotalKabupatenRp / 1000000000).toFixed(2)} Miliar
                </div>
                <span className="text-[11px] text-emerald-300 block">
                  Perkiraan akumulasi per tahun musim tanam 2026/2027
                </span>
              </div>

              <div className="pt-3 border-t border-emerald-800 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-emerald-300 block text-[11px]">Tambahan Pendapatan per Ha:</span>
                  <span className="font-mono font-bold text-white text-base">
                    +Rp {netGainPerHa.toLocaleString('id-ID')}
                  </span>
                </div>
                <div>
                  <span className="text-emerald-300 block text-[11px]">Cakupan Petani Terbantu:</span>
                  <span className="font-mono font-bold text-white text-base">
                    {Math.round((lahanTerdampakHa / 1.8)).toLocaleString('id-ID')} Petani
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-600 space-y-1">
              <span className="font-semibold text-stone-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                Dampak terhadap Target RPJMD Kabupaten Bangka:
              </span>
              <p className="text-[11px] leading-relaxed">
                Peningkatan ini berkontribusi langsung pada pencapaian indikator kinerja utama (IKU) Pemerintah Daerah: Peningkatan Indeks Ketahanan Pangan (IKP) dan Nilai Tukar Petani (NTP) perkebunan lada & sawit rakyat.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
