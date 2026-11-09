import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { Printer, Download, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { COMMODITIES } from '../data/bangkaData';

export const OfficialDocumentModal: React.FC = () => {
  const { 
    showOfficialModal, 
    setShowOfficialModal, 
    landParcels, 
    harvestRecords, 
    postHarvestLosses, 
    fertilizerNeeds,
    economicImpact 
  } = useApp();

  const [documentView, setDocumentView] = useState<'berita-acara' | 'naskah-transformasi'>('berita-acara');
  const printRef = useRef<HTMLDivElement>(null);

  if (!showOfficialModal) return null;

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    const rows = [
      ['KODE_PETAK', 'NAMA_PETANI', 'POKTAN', 'KECAMATAN', 'KOMODITAS', 'LUAS_HA', 'SISTEM_IRIGASI'],
      ...landParcels.map(p => [
        p.kodePetak,
        `"${p.namaPetani}"`,
        `"${p.poktan}"`,
        p.kecamatan,
        p.komoditas,
        p.luasHa.toString(),
        p.sistemIrigasi
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rekapitulasi_SIMPATIS_Bangka_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalLuasHa = landParcels.reduce((acc, p) => acc + p.luasHa, 0);
  const totalRealisasiTon = harvestRecords.reduce((acc, h) => acc + h.realisasiProduksiTon, 0);
  const totalKerugianSusutRp = postHarvestLosses.reduce((acc, l) => acc + l.totalKerugianRp, 0);
  const totalPupukKebutuhanKg = fertilizerNeeds.reduce((acc, f) => acc + f.kebutuhanUreaKg + f.kebutuhanNpkKg + f.kebutuhanOrganikKg, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Control Bar (Hidden when printed) */}
        <div className="no-print bg-stone-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDocumentView('berita-acara')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  documentView === 'berita-acara'
                    ? 'bg-emerald-800 text-white'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                1. Berita Acara Rekapitulasi
              </button>
              <button
                onClick={() => setDocumentView('naskah-transformasi')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  documentView === 'naskah-transformasi'
                    ? 'bg-emerald-800 text-white'
                    : 'text-stone-300 hover:text-white hover:bg-stone-800'
                }`}
              >
                2. Naskah Transformasi Kepemimpinan (12 Bab)
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Cetak PDF</span>
            </button>
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh CSV</span>
            </button>
            <button
              onClick={() => setShowOfficialModal(false)}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Body */}
        <div ref={printRef} className="p-6 sm:p-10 overflow-y-auto text-stone-900 bg-white space-y-6">
          {documentView === 'berita-acara' ? (
            <div className="space-y-6">
              {/* Official Letterhead */}
              <div className="border-b-4 border-double border-stone-900 pb-4 text-center">
                <h4 className="text-xs uppercase tracking-widest font-semibold text-stone-700">Pemerintah Kabupaten Bangka</h4>
                <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-stone-950 mt-1">Dinas Pangan dan Pertanian</h1>
                <p className="text-xs text-stone-600 mt-1">
                  Jl. Jenderal Sudirman No. 01 Sungailiat, Kabupaten Bangka, Kepulauan Bangka Belitung 33215
                </p>
                <p className="text-xs text-stone-500">
                  Pos-el: dinaspertanian@bangka.go.id · Laman: https://pertanian.bangka.go.id
                </p>
              </div>

              {/* Document Title & Number */}
              <div className="text-center pt-2">
                <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-stone-900 underline underline-offset-4">
                  Berita Acara Rekapitulasi Efisiensi Tanam & Produksi Pertanian
                </h2>
                <p className="text-xs text-stone-600 mt-1">
                  Nomor: 520 / 1482 / DINPANGAN-TAN / X / 2026
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  Lampiran Sistem Informasi SIMPATIS BANGKA Terverifikasi
                </p>
              </div>

              {/* Statement Prose */}
              <div className="text-xs sm:text-sm text-stone-800 leading-relaxed text-justify space-y-3">
                <p>
                  Pada hari ini, <strong>Rabu tanggal Empat Belas bulan Oktober tahun Dua Ribu Dua Puluh Enam</strong>, telah dilakukan rekapitulasi data digital dan verifikasi faktual lapangan terhadap pelaksanaan program peningkatan efisiensi tanam, penyaluran sarana produksi pupuk, serta pengukuran kehilangan hasil panen (<em>post-harvest loss</em>) di 8 (delapan) kecamatan se-Kabupaten Bangka.
                </p>
                <p>
                  Adapun ringkasan parameter kinerja agrikultur yang tercatat dan divalidasi melalui <strong>SIMPATIS BANGKA</strong> adalah sebagai berikut:
                </p>
              </div>

              {/* Executive Metrics Table */}
              <div className="border border-stone-300 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-100 text-stone-700 uppercase font-semibold border-b border-stone-300">
                    <tr>
                      <th className="py-2 px-3">Indikator Kinerja Pertanian</th>
                      <th className="py-2 px-3 text-right">Nilai Terverifikasi</th>
                      <th className="py-2 px-3">Metode & Sumber Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    <tr>
                      <td className="py-2 px-3 font-medium text-stone-900">Total Luas Lahan Terdata Sampel</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold">{totalLuasHa.toFixed(1)} Ha</td>
                      <td className="py-2 px-3 text-stone-600">Geotagging Petak Lahan SIMPATIS</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-stone-900">Total Realisasi Panen Sampel Terpantau</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold">{totalRealisasiTon.toFixed(2)} Ton</td>
                      <td className="py-2 px-3 text-stone-600">Ubinan & Timbangan PPL BPP Bangka</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-stone-900">Tingkat Penurunan Susut Panen (Losses)</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-emerald-800">
                        -{economicImpact.penurunanSusutHasilPersen}%
                      </td>
                      <td className="py-2 px-3 text-stone-600">Intervensi Dryer Lada & Combine Harvester</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-stone-900">Total Kebutuhan Pupuk Subsidi Terdata</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold">{totalPupukKebutuhanKg.toLocaleString('id-ID')} Kg</td>
                      <td className="py-2 px-3 text-stone-600">e-RDKK & Direktori 8 KPL Resmi Bangka</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-medium text-stone-900">Penghematan Biaya Saprodi Pupuk</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-emerald-800">
                        {economicImpact.penghematanBiayaPupukPersen}%
                      </td>
                      <td className="py-2 px-3 text-stone-600">Dosis Berimbang & Pembenah Tanah Dolomit</td>
                    </tr>
                    <tr className="bg-stone-50 font-bold">
                      <td className="py-2.5 px-3 text-stone-900">Total Nilai Manfaat Ekonomi Kab. Bangka</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-900">
                        Rp {economicImpact.totalNilaiEkonomiKabupatenRp.toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 text-emerald-900">Verifikasi Tim Evaluasi Ekonomi Pemkab</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Breakdown Per Komoditas */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase text-stone-800">
                  Ringkasan Realisasi Panen Komoditas Terpantau:
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMODITIES.map((c) => {
                    const totalKomoditas = harvestRecords
                      .filter(h => h.komoditas === c.id)
                      .reduce((acc, h) => acc + h.realisasiProduksiTon, 0);
                    return (
                      <div key={c.id} className="p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs">
                        <div className="font-semibold text-stone-900 truncate">{c.nama}</div>
                        <div className="text-stone-500 mt-1 flex justify-between">
                          <span>Produksi:</span>
                          <span className="font-mono tabular-nums font-medium text-stone-800">{totalKomoditas.toFixed(2)} Ton</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 grid grid-cols-2 gap-8 text-xs text-stone-900">
                <div className="text-center">
                  <p className="text-stone-600">Disahkan Lapangan oleh,</p>
                  <p className="font-medium mt-0.5">Koordinator Penyuluh Pertanian (PPL)</p>
                  <div className="h-16 flex items-center justify-center">
                    <div className="border border-emerald-600 bg-emerald-50 text-emerald-800 px-3 py-1 rounded text-[10px] font-mono">
                      TERVALIDASI DIGITAL BPP
                    </div>
                  </div>
                  <p className="font-bold underline">Ir. Hendra Kusuma, M.Si</p>
                  <p className="text-stone-500">NIP. 19740512 200003 1 004</p>
                </div>

                <div className="text-center">
                  <p className="text-stone-600">Sungailiat, 14 Oktober 2026</p>
                  <p className="font-medium mt-0.5">Kepala Dinas Pangan dan Pertanian</p>
                  <div className="h-16 flex items-center justify-center">
                    <div className="border border-emerald-700 bg-emerald-100 text-emerald-900 px-3 py-1 rounded text-[10px] font-bold">
                      SEALED & VERIFIED PEMKAB
                    </div>
                  </div>
                  <p className="font-bold underline">Dr. H. Syamsul Arifin, M.Agr</p>
                  <p className="text-stone-500">Pembina Utama Muda (IV/c)</p>
                </div>
              </div>
            </div>
          ) : (
            /* NASKAH LENGKAP RANCANGAN AKSI TRANSFORMASI KEPEMIMPINAN (12 BAB) */
            <div className="space-y-8 text-xs sm:text-sm text-stone-800 leading-relaxed">
              {/* Cover Header */}
              <div className="text-center border-b-2 border-stone-800 pb-6 space-y-2">
                <div className="text-xs uppercase font-bold tracking-widest text-emerald-800">
                  RANCANGAN AKSI TRANSFORMASI KEPEMIMPINAN
                </div>
                <div className="inline-block bg-emerald-900 text-amber-300 font-extrabold text-2xl sm:text-3xl px-6 py-2 rounded-lg tracking-wide my-2">
                  SIMPATIS BANGKA
                </div>
                <h2 className="text-sm sm:text-base font-bold text-stone-900 max-w-xl mx-auto">
                  Sistem Informasi Peningkatan Efisiensi Tanam dan Hasil Produksi Komoditas Utama di Kabupaten Bangka
                </h2>
                <div className="text-xs text-stone-500 pt-2">
                  Badan Kepegawaian dan Pengembangan Sumber Daya Manusia Daerah Kabupaten Bangka<br />
                  bekerjasama dengan BKPSMD Provinsi Kepulauan Bangka Belitung · Tahun 2026
                </div>
              </div>

              {/* Bab A: Judul Transformasi */}
              <section className="space-y-2">
                <h3 className="font-bold text-base text-stone-950 border-b border-stone-300 pb-1">
                  A. Judul Transformasi & Fokus
                </h3>
                <p>
                  <strong>SIMPATIS BANGKA</strong> — Sistem Informasi Peningkatan Efisiensi Tanam dan Hasil Produksi Komoditas Utama di Kabupaten Bangka merupakan inovasi tata kelola pertanian berbasis data digital yang mengintegrasikan informasi luas lahan, kalender dan jadwal tanam, kondisi tanaman, kebutuhan serta distribusi pupuk, perkiraan waktu panen, realisasi produksi, dan potensi kehilangan hasil panen (<em>post-harvest losses</em>).
                </p>
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <span className="font-semibold text-stone-900">Fokus Transformasi:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-stone-700">
                    <li>Digitalisasi dan integrasi data pertanian.</li>
                    <li>Ketepatan kalender tanam serta koordinasi kebutuhan pupuk.</li>
                    <li>Pemantauan produksi dan pengendalian kehilangan hasil panen.</li>
                    <li>Pengambilan keputusan berbasis data dan pengukuran manfaat ekonomi.</li>
                  </ul>
                </div>
              </section>

              {/* Bab B: Latar Belakang Masalah */}
              <section className="space-y-2">
                <h3 className="font-bold text-base text-stone-950 border-b border-stone-300 pb-1">
                  B. Latar Belakang Masalah
                </h3>
                <p>
                  Kabupaten Bangka memiliki potensi sektor pertanian yang besar (lada Muntok White Pepper, kelapa sawit, karet, padi, ubi kayu, jagung) untuk ketahanan pangan dan peningkatan kesejahteraan. Namun terdapat kendala: data pertanian belum terintegrasi, penjadwalan tanam belum sepenuhnya berbasis agroklimat, deviasi distribusi pupuk subsidi, koordinasi antarstakeholder belum optimal, dan tingginya kehilangan hasil pasca panen (<em>post-harvest losses</em>).
                </p>
                <div className="p-3 bg-emerald-50 text-emerald-950 rounded-lg border border-emerald-200 font-medium">
                  <strong>Rumusan Masalah Utama:</strong> Bagaimana meningkatkan efisiensi tata kelola pertanian Kabupaten Bangka melalui integrasi data digital, ketepatan jadwal tanam, perbaikan koordinasi distribusi pupuk, dan pengendalian kehilangan hasil panen agar produktivitas serta nilai ekonomi komoditas pertanian meningkat secara terukur?
                </div>
              </section>

              {/* Bab C: Tujuan SMART */}
              <section className="space-y-2">
                <h3 className="font-bold text-base text-stone-950 border-b border-stone-300 pb-1">
                  C. Tujuan Jangka Pendek, Menengah, dan Panjang (SMART)
                </h3>
                <div className="border border-stone-300 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-stone-100 font-semibold border-b border-stone-300">
                      <tr>
                        <th className="py-2 px-3">Periode</th>
                        <th className="py-2 px-3">Tujuan dan Kegiatan</th>
                        <th className="py-2 px-3">Indikator / Output</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      <tr>
                        <td className="py-2 px-3 font-bold text-stone-900">Jangka Pendek (0–1 bulan)</td>
                        <td className="py-2 px-3">Memetakan kondisi awal; menetapkan komoditas dan wilayah percontohan; prototipe; standar data & penanggung jawab; sosialisasi & pelatihan.</td>
                        <td className="py-2 px-3">Minimal 1 komoditas prioritas dan 1–2 wilayah pilot; prototipe tersedia; target awal 80% data petani dan lahan sasaran terdaftar.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-stone-900">Jangka Menengah (2–12 bulan)</td>
                        <td className="py-2 px-3">Mengoperasikan dashboard untuk jadwal tanam, perkembangan tanaman, kebutuhan pupuk, estimasi panen, dan realisasi produksi; evaluasi manfaat ekonomi.</td>
                        <td className="py-2 px-3">Kelengkapan dan ketepatan waktu data menuju ≥90%; target penurunan kehilangan hasil 3–5% secara relatif dari baseline.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-stone-900">Jangka Panjang (1–3 tahun)</td>
                        <td className="py-2 px-3">Memperluas implementasi; integrasi sistem relevan; melembagakan proses bisnis berbasis data & perkuat ekosistem pertanian.</td>
                        <td className="py-2 px-3">Cakupan layanan meningkat ke seluruh 8 kecamatan; proses kerja berbasis data; rencana pembiayaan berkelanjutan.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Bab D: Manfaat dan Valuasi Ekonomi */}
              <section className="space-y-2">
                <h3 className="font-bold text-base text-stone-950 border-b border-stone-300 pb-1">
                  D. Manfaat dan Metode Valuasi Ekonomi (Hal. 5–6)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
                    <span className="font-bold text-emerald-900">1. Penurunan Post-Harvest Losses:</span>
                    <p className="mt-1">Tambahan tonase (kg) = total hasil panen (kg) × (persentase kehilangan awal − persentase setelah intervensi).</p>
                    <p className="mt-1 font-semibold text-stone-900">Nilai manfaat kotor = tambahan tonase (kg) × harga jual (Rp/kg).</p>
                    <span className="text-[11px] text-stone-500 block mt-1">*Target 3–5% dihitung secara relatif (kehilangan awal 10% menjadi 9.5–9.7%, bukan 5–7%).</span>
                  </div>
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg">
                    <span className="font-bold text-emerald-900">2. Peningkatan Produktivitas:</span>
                    <p className="mt-1 font-semibold text-stone-900">Manfaat kotor = tambahan produktivitas (ton/ha) × luas panen (ha) × 1.000 × harga jual (Rp/kg).</p>
                    <p className="mt-1 text-stone-600">Untuk manfaat bersih, dikurangi biaya tambahan produksi, benih, dan tenaga kerja.</p>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs space-y-1">
                  <span className="font-bold text-emerald-900">Simulasi Valuasi Hipotetis Dokumen (Hal. 5–6):</span>
                  <p>Asumsi: 1.000 ton/musim, susut awal 10% menjadi 7% (30 ton terselamatkan × Rp8.000 = Rp240 Juta). Tambahan produktivitas 0,2 ton/ha × 500 ha = 100 ton (Rp800 Juta). Total indikatif sebelum biaya = <strong>Rp 1,04 Miliar</strong>.</p>
                </div>
              </section>

              {/* Bab E: Tabel Rancangan Fitur Minimum */}
              <section className="space-y-2">
                <h3 className="font-bold text-base text-stone-950 border-b border-stone-300 pb-1">
                  E. Rancangan Fitur Minimum SIMPATIS BANGKA (Hal. 6–7)
                </h3>
                <div className="border border-stone-300 rounded-lg overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-stone-100 font-semibold border-b border-stone-300">
                      <tr>
                        <th className="py-2 px-3 w-1/3">Modul</th>
                        <th className="py-2 px-3">Fungsi Utama Sesuai Dokumen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200">
                      <tr className="bg-emerald-50/30">
                        <td className="py-2 px-3 font-bold text-emerald-900">1. Data petani dan lahan</td>
                        <td className="py-2 px-3">Identitas kelompok tani, lokasi, luas lahan, dan komoditas.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-emerald-900">2. Kalender tanam</td>
                        <td className="py-2 px-3">Jadwal tanam, fase pertumbuhan, dan estimasi panen.</td>
                      </tr>
                      <tr className="bg-emerald-50/30">
                        <td className="py-2 px-3 font-bold text-emerald-900">3. Monitoring pupuk</td>
                        <td className="py-2 px-3">Kebutuhan, usulan, penyaluran, dan realisasi distribusi.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-emerald-900">4. Monitoring produksi</td>
                        <td className="py-2 px-3">Luas panen, estimasi dan realisasi tonase, serta produktivitas per hektare.</td>
                      </tr>
                      <tr className="bg-emerald-50/30">
                        <td className="py-2 px-3 font-bold text-emerald-900">5. Pengendalian kehilangan hasil</td>
                        <td className="py-2 px-3">Pencatatan kuantitas kehilangan dan tahapan terjadinya kehilangan.</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-bold text-emerald-900">6. Dashboard pimpinan</td>
                        <td className="py-2 px-3">Indikator kinerja, peta wilayah, peringatan, dan ringkasan manfaat ekonomi.</td>
                      </tr>
                      <tr className="bg-emerald-50/30">
                        <td className="py-2 px-3 font-bold text-emerald-900">7. Koordinasi dan notifikasi</td>
                        <td className="py-2 px-3">Informasi kegiatan, tindak lanjut masalah, dan komunikasi pemangku kepentingan.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Bab F: Milestone Tahapan Aksi */}
              <section className="space-y-2">
                <h3 className="font-bold text-base text-stone-950 border-b border-stone-300 pb-1">
                  F. Tahapan Aksi Transformasi (Milestone Hal. 7)
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
                    <span className="font-bold text-stone-900">Minggu 1</span>
                    <p className="text-stone-600 mt-1">Konsolidasi tim, pemetaan masalah & SK tim.</p>
                  </div>
                  <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
                    <span className="font-bold text-stone-900">Minggu 2</span>
                    <p className="text-stone-600 mt-1">Kebutuhan sistem, indikator, SOP & prototipe.</p>
                  </div>
                  <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
                    <span className="font-bold text-stone-900">Minggu 3</span>
                    <p className="text-stone-600 mt-1">Validasi data, uji fitur inti, pelatihan operator.</p>
                  </div>
                  <div className="p-2.5 bg-stone-50 border border-stone-200 rounded">
                    <span className="font-bold text-stone-900">Minggu 4–5</span>
                    <p className="text-stone-600 mt-1">Implementasi pilot & laporan monitoring bulanan.</p>
                  </div>
                </div>
              </section>

              {/* Bab G & H: Stakeholders & Branding */}
              <section className="space-y-2">
                <h3 className="font-bold text-base text-stone-950 border-b border-stone-300 pb-1">
                  G & H. Peta Pemangku Kepentingan & Strategi Marketing
                </h3>
                <p className="text-xs text-stone-700">
                  Kolaborasi lintas pihak: Pimpinan Daerah (Sponsor), Dinas Pertanian (Pemilik Proses Bisnis), Diskominfotik (Dukungan Teknis & Integrasi), PPL (Pendamping & Verifikator Data Lapangan), Petani/Poktan (Pemasok Data & Penerima Manfaat), Kios Pupuk KPL (Penyelarasan Jadwal Tebus), dan Perguruan Tinggi (Kajian & Evaluasi).
                </p>
              </section>

              {/* Bab I, J, K: Risiko, Monev 8 IKU, Keberlanjutan */}
              <section className="space-y-2">
                <h3 className="font-bold text-base text-stone-950 border-b border-stone-300 pb-1">
                  I, J & K. Pengelolaan Risiko, Monitoring & 5 Pilar Keberlanjutan
                </h3>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs space-y-2">
                  <div className="font-semibold text-stone-900">5 Pilar Keberlanjutan:</div>
                  <ol className="list-decimal list-inside space-y-1 text-stone-700">
                    <li><strong>Kebijakan dan Kelembagaan:</strong> Penetapan SK penanggung jawab & SOP validasi.</li>
                    <li><strong>Teknologi:</strong> Sistem mudah dipelihara, aman, terdokumentasi, dan offline sync ready.</li>
                    <li><strong>SDM:</strong> Pelatihan berkala operator, penyuluh pendamping, dan duta poktan.</li>
                    <li><strong>Manfaat Ekonomi:</strong> Manfaat nyata penekanan kehilangan hasil & efisiensi pupuk dirasakan petani.</li>
                    <li><strong>Pembiayaan & Replikasi:</strong> Alokasi APBD berulang dan perluasan ke 8 kecamatan.</li>
                  </ol>
                </div>

                <div className="p-4 bg-emerald-900 text-white rounded-lg text-center mt-4 space-y-1">
                  <div className="text-xs uppercase tracking-wider text-amber-300 font-bold">PENUTUP TRANSFORMASI</div>
                  <p className="text-xs sm:text-sm font-semibold">
                    DARI DATA YANG TERSEBAR MENUJU INFORMASI TERINTEGRASI<br />
                    DARI KEPUTUSAN REAKTIF MENUJU TINDAKAN BERBASIS DATA<br />
                    DARI POTENSI PERTANIAN MENUJU HASIL YANG LEBIH PRODUKTIF DAN BERNILAI EKONOMI
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* Footer note */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-400">
            <span>SIMPATIS BANGKA · Dokumen Resmi Verifikasi Otomatis Terintegrasi</span>
            <span className="font-mono">ID-DOC: SIMPATIS-BGK-2026-X14-V4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
