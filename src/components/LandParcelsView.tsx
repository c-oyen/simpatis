import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LandParcel, KecamatanBangka, CommodityId } from '../types';
import { COMMODITIES, KECAMATAN_LIST, DESA_PER_KECAMATAN } from '../data/bangkaData';
import { Plus, Search, Layers, X, Sprout, Pencil, CheckCircle2, RefreshCw, RotateCcw } from 'lucide-react';

export const LandParcelsView: React.FC = () => {
  const { 
    landParcels, 
    addLandParcel, 
    updateLandParcel,
    refreshFromSpreadsheet,
    isSyncingWithSheets,
    role, 
    selectedKecamatan, 
    setSelectedKecamatan,
    selectedCommodity,
    setSelectedCommodity 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingParcel, setEditingParcel] = useState<LandParcel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for new parcel
  const [newNamaPetani, setNewNamaPetani] = useState('');
  const [newNik, setNewNik] = useState('');
  const [newPoktan, setNewPoktan] = useState('');
  const [newKecamatan, setNewKecamatan] = useState<KecamatanBangka>('Mendo Barat');
  const [newDesa, setNewDesa] = useState(DESA_PER_KECAMATAN['Mendo Barat'][0]);
  const [newKomoditas, setNewKomoditas] = useState<CommodityId>('padi_sawah');
  const [newVarietas, setNewVarietas] = useState('Inpari 32 HDB');
  const [newLuasHa, setNewLuasHa] = useState<number>(1.5);
  const [newPhTanah, setNewPhTanah] = useState<number>(5.2);
  const [newSistemIrigasi, setNewSistemIrigasi] = useState<LandParcel['sistemIrigasi']>('Irigasi');
  const [newTahunTanam, setNewTahunTanam] = useState<number>(2026);

  // Edit Form State
  const [editNamaPetani, setEditNamaPetani] = useState('');
  const [editNik, setEditNik] = useState('');
  const [editPoktan, setEditPoktan] = useState('');
  const [editKecamatan, setEditKecamatan] = useState<KecamatanBangka>('Mendo Barat');
  const [editDesa, setEditDesa] = useState('');
  const [editKomoditas, setEditKomoditas] = useState<CommodityId>('padi_sawah');
  const [editVarietas, setEditVarietas] = useState('');
  const [editLuasHa, setEditLuasHa] = useState<number>(1.0);
  const [editPhTanah, setEditPhTanah] = useState<number>(5.0);
  const [editSistemIrigasi, setEditSistemIrigasi] = useState<LandParcel['sistemIrigasi']>('Irigasi');

  const filteredParcels = landParcels.filter(parcel => {
    const matchKecamatan = selectedKecamatan === 'Semua' || parcel.kecamatan === selectedKecamatan;
    const matchCommodity = selectedCommodity === 'semua' || parcel.komoditas === selectedCommodity;
    const searchLower = searchQuery.toLowerCase().trim();
    const matchSearch = searchLower === '' || 
      parcel.namaPetani.toLowerCase().includes(searchLower) ||
      parcel.poktan.toLowerCase().includes(searchLower) ||
      parcel.desa.toLowerCase().includes(searchLower) ||
      (parcel.lokasi && parcel.lokasi.toLowerCase().includes(searchLower));
    return matchKecamatan && matchCommodity && matchSearch;
  });

  const handleResetFilters = () => {
    setSelectedKecamatan('Semua');
    setSelectedCommodity('semua');
    setSearchQuery('');
  };

  const handleKecamatanChange = (kec: KecamatanBangka) => {
    setNewKecamatan(kec);
    const availableDesa = DESA_PER_KECAMATAN[kec];
    if (availableDesa && availableDesa.length > 0) {
      setNewDesa(availableDesa[0]);
    }
  };

  const handleEditKecamatanChange = (kec: KecamatanBangka) => {
    setEditKecamatan(kec);
    const availableDesa = DESA_PER_KECAMATAN[kec];
    if (availableDesa && availableDesa.length > 0) {
      setEditDesa(availableDesa[0]);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNamaPetani || !newPoktan) return;

    setIsSubmitting(true);
    const cleanDesa = newDesa ? newDesa.replace(/^(desa|kelurahan)\s+/i, '').trim() : '';
    const finalLokasi = cleanDesa ? `${cleanDesa}, Kec. ${newKecamatan}` : `Kec. ${newKecamatan}`;

    try {
      await addLandParcel({
        kodePetak: `PETAK-${Date.now().toString().slice(-4)}`,
        namaPetani: newNamaPetani.trim(),
        nik: newNik || '1901' + Math.floor(100000000000 + Math.random() * 900000000000),
        poktan: newPoktan.trim(),
        kecamatan: newKecamatan,
        desa: cleanDesa,
        lokasi: finalLokasi,
        komoditas: newKomoditas,
        varietas: newVarietas,
        luasHa: Number(newLuasHa),
        phTanah: Number(newPhTanah),
        koordinat: { 
          lat: -1.86 + (Math.random() - 0.5) * 0.4, 
          lng: 106.05 + (Math.random() - 0.5) * 0.4 
        },
        tahunTanam: Number(newTahunTanam),
        sistemIrigasi: newSistemIrigasi
      });

      setIsAddModalOpen(false);
      // Reset form
      setNewNamaPetani('');
      setNewPoktan('');
      setNewNik('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (parcel: LandParcel) => {
    setEditingParcel(parcel);
    setEditNamaPetani(parcel.namaPetani);
    setEditNik(parcel.nik);
    setEditPoktan(parcel.poktan);
    setEditKecamatan(parcel.kecamatan);
    setEditDesa(parcel.desa ? parcel.desa.replace(/^(desa|kelurahan)\s+/i, '').trim() : '');
    setEditKomoditas(parcel.komoditas);
    setEditVarietas(parcel.varietas);
    setEditLuasHa(parcel.luasHa);
    setEditPhTanah(parcel.phTanah);
    const mappedIrigasi = (parcel.sistemIrigasi === 'Irigasi Teknis' ? 'Irigasi' : parcel.sistemIrigasi) || 'Irigasi';
    setEditSistemIrigasi(mappedIrigasi);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParcel) return;

    const cleanEditDesa = editDesa ? editDesa.replace(/^(desa|kelurahan)\s+/i, '').trim() : '';
    const finalEditLokasi = cleanEditDesa ? `${cleanEditDesa}, Kec. ${editKecamatan}` : `Kec. ${editKecamatan}`;

    updateLandParcel(editingParcel.id, {
      namaPetani: editNamaPetani,
      nik: editNik,
      poktan: editPoktan,
      kecamatan: editKecamatan,
      desa: cleanEditDesa,
      lokasi: finalEditLokasi,
      komoditas: editKomoditas,
      varietas: editVarietas,
      luasHa: Number(editLuasHa),
      phTanah: Number(editPhTanah),
      sistemIrigasi: editSistemIrigasi
    });

    setEditingParcel(null);
  };

  return (
    <div className="space-y-6">
      {/* View Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="text-xl font-bold text-stone-900">
              Data Petani & Lahan
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
            <span>Terdaftar {filteredParcels.length} Petak Lahan</span>
            <span aria-hidden="true">·</span>
            <span>Luas Total {filteredParcels.reduce((a, b) => a + b.luasHa, 0).toFixed(1)} Ha</span>
            <span aria-hidden="true">·</span>
            <span>5 Komoditas Strategis Kab. Bangka</span>
          </div>
        </div>

        {/* Action Button: Tambah Petak Lahan */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Tambah Data Petak Lahan</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama petani, kelompok tani, kelurahan/desa..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-emerald-700 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Commodity filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Komoditas:</span>
            <select
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value as any)}
              className="py-1.5 px-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 text-xs font-medium focus:outline-emerald-700 cursor-pointer"
            >
              <option value="semua">Semua (5 Komoditas)</option>
              {COMMODITIES.map(c => (
                <option key={c.id} value={c.id}>{c.nama}</option>
              ))}
            </select>
          </div>

          {/* Subdistrict filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-500 font-medium">Kecamatan:</span>
            <select
              value={selectedKecamatan}
              onChange={(e) => setSelectedKecamatan(e.target.value as any)}
              className="py-1.5 px-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 text-xs font-medium focus:outline-emerald-700 cursor-pointer"
            >
              <option value="Semua">Semua Kecamatan (8 Wilayah)</option>
              {KECAMATAN_LIST.map(k => (
                <option key={k.nama} value={k.nama}>{k.nama}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table: Clean, units under column text, codes removed, edit/delete for operator */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-700 uppercase font-semibold border-b border-stone-200 text-[11px]">
              <tr>
                <th className="py-3 px-4">
                  <div>Nama Petani</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">petani terdaftar</span>
                </th>
                <th className="py-3 px-3">
                  <div>Kelompok Tani</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">poktan</span>
                </th>
                <th className="py-3 px-3">
                  <div>Lokasi</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">kelurahan/desa & kecamatan</span>
                </th>
                <th className="py-3 px-3">
                  <div>Komoditas</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">varietas unggul</span>
                </th>
                <th className="py-3 px-3 text-right">
                  <div>Luas Lahan</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">ha</span>
                </th>
                <th className="py-3 px-3 text-center">
                  <div>Kemasaman</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">ph tanah</span>
                </th>
                <th className="py-3 px-4">
                  <div>Sistem Pengairan</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">sumber air</span>
                </th>
                <th className="py-3 px-3 text-center">
                  <div>Aksi</div>
                  <span className="text-[10px] text-stone-400 font-normal lowercase block">edit</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredParcels.length > 0 ? (
                filteredParcels.map((parcel) => {
                  const comm = COMMODITIES.find(c => c.id === parcel.komoditas);
                  const cleanDesaName = (parcel.desa || '').replace(/^(desa|kelurahan)\s+/i, '').trim();
                  const cleanLokasiDisplay = parcel.lokasi 
                    ? parcel.lokasi.replace(/\b(desa|kelurahan)\s+/gi, '').trim()
                    : (cleanDesaName ? `${cleanDesaName}, Kec. ${parcel.kecamatan}` : `Kec. ${parcel.kecamatan}`);
                  return (
                    <tr key={parcel.id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-stone-900 text-[13px]">{parcel.namaPetani}</div>
                      </td>
                      <td className="py-3.5 px-3 text-stone-800 font-medium">
                        {parcel.poktan}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-semibold text-stone-900">
                          {cleanLokasiDisplay}
                        </div>
                        {parcel.lokasi && (cleanDesaName || parcel.kecamatan) && (
                          <div className="text-stone-500 text-[11px]">
                            {cleanDesaName ? `${cleanDesaName}, ` : ''}Kec. {parcel.kecamatan}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 font-semibold rounded text-[10px] border border-emerald-200">
                          {parcel.namaKomoditasRaw || comm?.nama || parcel.komoditas}
                        </span>
                        {parcel.varietas && parcel.varietas !== 'Unggul Standar' && (
                          <div className="text-stone-500 text-[11px] mt-1">{parcel.varietas}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono tabular-nums font-bold text-stone-900">
                        {parcel.luasHa.toFixed(1)} Ha
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {parcel.phTanah ? (
                          <span className={`font-mono tabular-nums font-semibold px-2 py-0.5 rounded text-[11px] ${
                            parcel.phTanah < 5.0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            pH {parcel.phTanah.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-stone-400 font-mono text-[11px]">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-stone-700">
                        <span className="font-medium text-stone-800">
                          {parcel.sistemIrigasi === 'Irigasi Teknis' ? 'Irigasi' : (parcel.sistemIrigasi || '-')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleOpenEdit(parcel)}
                            className="p-1.5 text-stone-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-stone-200 hover:border-emerald-300"
                            title="Edit Data Lahan"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <p className="text-stone-500 text-xs">
                        Tidak ada petak lahan yang sesuai dengan kriteria filter saat ini.
                      </p>
                      {(selectedKecamatan !== 'Semua' || selectedCommodity !== 'semua' || searchQuery !== '') ? (
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Tampilkan Semua Petak Lahan (Reset Filter)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => refreshFromSpreadsheet()}
                          disabled={isSyncingWithSheets}
                          className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingWithSheets ? 'animate-spin' : ''}`} />
                          <span>Muat Ulang dari Google Sheets</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Internal Operator Modal for Adding Parcel */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2 text-stone-900 font-bold">
                <Sprout className="w-5 h-5 text-emerald-700" />
                <span>Tambah Data Petak Lahan</span>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Nama Petani *</label>
                  <input
                    type="text"
                    required
                    value={newNamaPetani}
                    onChange={(e) => setNewNamaPetani(e.target.value)}
                    placeholder="Contoh: Zulkifli Mansur"
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Kelompok Tani (Poktan) *</label>
                  <input
                    type="text"
                    required
                    value={newPoktan}
                    onChange={(e) => setNewPoktan(e.target.value)}
                    placeholder="Contoh: Poktan Maju Bersama"
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Kecamatan *</label>
                  <select
                    value={newKecamatan}
                    onChange={(e) => handleKecamatanChange(e.target.value as KecamatanBangka)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
                  >
                    {KECAMATAN_LIST.map(k => (
                      <option key={k.nama} value={k.nama}>{k.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Kelurahan/Desa *
                  </label>
                  <select
                    value={newDesa}
                    onChange={(e) => setNewDesa(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer font-medium"
                  >
                    {DESA_PER_KECAMATAN[newKecamatan]?.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Komoditas *</label>
                  <select
                    value={newKomoditas}
                    onChange={(e) => setNewKomoditas(e.target.value as CommodityId)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
                  >
                    {COMMODITIES.map(c => (
                      <option key={c.id} value={c.id}>{c.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Varietas *</label>
                  <input
                    type="text"
                    required
                    value={newVarietas}
                    onChange={(e) => setNewVarietas(e.target.value)}
                    placeholder="Contoh: Inpari 32 HDB / Ori 212"
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Luas Lahan (Ha):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={newLuasHa}
                    onChange={(e) => setNewLuasHa(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">pH Tanah:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="3.5"
                    max="8.0"
                    value={newPhTanah}
                    onChange={(e) => setNewPhTanah(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Tahun Tanam:</label>
                  <input
                    type="number"
                    value={newTahunTanam}
                    onChange={(e) => setNewTahunTanam(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">Sistem Pengairan:</label>
                <select
                  value={newSistemIrigasi}
                  onChange={(e) => setNewSistemIrigasi(e.target.value as any)}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
                >
                  <option value="Irigasi">Irigasi</option>
                  <option value="Tadah Hujan">Tadah Hujan</option>
                  <option value="Embung / Sumur Bor">Embung / Sumur Bor</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isSubmitting ? 'Menyimpan ke Sheets...' : 'Simpan Petak Lahan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internal Operator Modal for EDITING Parcel */}
      {editingParcel && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2 text-stone-900 font-bold">
                <Pencil className="w-5 h-5 text-emerald-700" />
                <span>Edit Data Petak Lahan</span>
              </div>
              <button 
                onClick={() => setEditingParcel(null)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Nama Petani *</label>
                  <input
                    type="text"
                    required
                    value={editNamaPetani}
                    onChange={(e) => setEditNamaPetani(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Kelompok Tani (Poktan) *</label>
                  <input
                    type="text"
                    required
                    value={editPoktan}
                    onChange={(e) => setEditPoktan(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Kecamatan *</label>
                  <select
                    value={editKecamatan}
                    onChange={(e) => handleEditKecamatanChange(e.target.value as KecamatanBangka)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
                  >
                    {KECAMATAN_LIST.map(k => (
                      <option key={k.nama} value={k.nama}>{k.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Kelurahan/Desa *
                  </label>
                  <select
                    value={editDesa}
                    onChange={(e) => setEditDesa(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer font-medium"
                  >
                    {DESA_PER_KECAMATAN[editKecamatan]?.map(d => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Komoditas *</label>
                  <select
                    value={editKomoditas}
                    onChange={(e) => setEditKomoditas(e.target.value as CommodityId)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
                  >
                    {COMMODITIES.map(c => (
                      <option key={c.id} value={c.id}>{c.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Varietas *</label>
                  <input
                    type="text"
                    required
                    value={editVarietas}
                    onChange={(e) => setEditVarietas(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Luas Lahan (Ha):</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={editLuasHa}
                    onChange={(e) => setEditLuasHa(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">pH Tanah:</label>
                  <input
                    type="number"
                    step="0.1"
                    min="3.5"
                    max="8.0"
                    value={editPhTanah}
                    onChange={(e) => setEditPhTanah(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Sistem Pengairan:</label>
                  <select
                    value={editSistemIrigasi}
                    onChange={(e) => setEditSistemIrigasi(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-700 focus:bg-white cursor-pointer"
                  >
                    <option value="Irigasi">Irigasi</option>
                    <option value="Tadah Hujan">Tadah Hujan</option>
                    <option value="Embung / Sumur Bor">Embung / Sumur Bor</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingParcel(null)}
                  className="px-3.5 py-1.5 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  Perbarui Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
