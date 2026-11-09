import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KECAMATAN_LIST, DESA_PER_KECAMATAN, formatDesaKelurahan, getDesaFieldLabel } from '../data/bangkaData';
import { ActivityEvent, FieldIssue, StakeholderMessage, UserRole, KecamatanBangka } from '../types';
import { 
  Bell, 
  MessageSquare, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Send, 
  Clock, 
  MapPin, 
  Users, 
  Shield, 
  UserCheck, 
  Sprout, 
  Store, 
  X, 
  Info,
  CheckCheck,
  Filter
} from 'lucide-react';

export const CoordinationAndNotificationsView: React.FC = () => {
  const { 
    activities, 
    addActivity, 
    fieldIssues, 
    addFieldIssue, 
    updateFieldIssueStatus, 
    stakeholderMessages, 
    addStakeholderMessage, 
    earlyWarnings,
    role,
    selectedKecamatan
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'kegiatan' | 'masalah' | 'komunikasi' | 'notifikasi'>('kegiatan');

  // Modal State for New Activity
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [actJudul, setActJudul] = useState('');
  const [actTanggal, setActTanggal] = useState('2026-10-25');
  const [actWaktu, setActWaktu] = useState('09:00 - 12:00 WIB');
  const [actLokasi, setActLokasi] = useState('Balai Penyuluhan Pertanian (BPP)');
  const [actKecamatan, setActKecamatan] = useState<KecamatanBangka | 'Seluruh Kabupaten'>('Mendo Barat');
  const [actPenyelenggara, setActPenyelenggara] = useState('Dinas Pangan & Pertanian Kab. Bangka');
  const [actKategori, setActKategori] = useState<ActivityEvent['kategori']>('Sosialisasi & Pelatihan');
  const [actPeserta, setActPeserta] = useState('Kelompok Tani Binaan & PPL');
  const [actDeskripsi, setActDeskripsi] = useState('');

  // Modal State for New Field Issue
  const [isAddIssueOpen, setIsAddIssueOpen] = useState(false);
  const [issuePelapor, setIssuePelapor] = useState('');
  const [issuePoktan, setIssuePoktan] = useState('');
  const [issueKecamatan, setIssueKecamatan] = useState<KecamatanBangka>('Mendo Barat');
  const [issueDesa, setIssueDesa] = useState(DESA_PER_KECAMATAN['Mendo Barat'][0] || '');
  const [issueKategori, setIssueKategori] = useState<FieldIssue['kategoriMasalah']>('Pupuk Langka / Distribusi Terhambat');
  const [issuePrioritas, setIssuePrioritas] = useState<FieldIssue['prioritas']>('Tinggi (Darurat)');
  const [issueDeskripsi, setIssueDeskripsi] = useState('');

  // Stakeholder Message State
  const [msgTopik, setMsgTopik] = useState('');
  const [msgIsi, setMsgIsi] = useState('');
  const [msgTarget, setMsgTarget] = useState('Semua Koordinator BPP & PPL Wilbin');

  // Issue Resolution State
  const [resolvingIssue, setResolvingIssue] = useState<FieldIssue | null>(null);
  const [tindakLanjutInput, setTindakLanjutInput] = useState('');
  const [petugasPplInput, setPetugasPplInput] = useState('');

  const filteredIssues = fieldIssues.filter(i => {
    return selectedKecamatan === 'Semua' || i.kecamatan === selectedKecamatan;
  });

  const handleAddActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actJudul) return;
    addActivity({
      judul: actJudul,
      tanggal: actTanggal,
      waktu: actWaktu,
      lokasi: actLokasi,
      kecamatan: actKecamatan,
      penyelenggara: actPenyelenggara,
      kategori: actKategori,
      targetPeserta: actPeserta,
      status: 'Akan Datang',
      deskripsi: actDeskripsi
    });
    setIsAddActivityOpen(false);
    setActJudul('');
    setActDeskripsi('');
  };

  const handleAddIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issuePelapor || !issueDeskripsi) return;
    addFieldIssue({
      pelaporNama: issuePelapor,
      pelaporPeran: role,
      poktan: issuePoktan || 'Kelompok Tani Wilayah',
      kecamatan: issueKecamatan,
      desa: issueDesa || 'Desa Setempat',
      kategoriMasalah: issueKategori,
      prioritas: issuePrioritas,
      deskripsi: issueDeskripsi
    });
    setIsAddIssueOpen(false);
    setIssuePelapor('');
    setIssueDeskripsi('');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTopik || !msgIsi) return;

    const senderNames: Record<UserRole, string> = {
      operator: 'Operator Internal Dinas Pertanian Bangka',
      publik: 'Masyarakat / Pengguna Publik'
    };

    const instansiNames: Record<UserRole, string> = {
      operator: 'Pusat Data Pertanian Pemkab Bangka',
      publik: 'Masyarakat Umum / Poktan'
    };

    addStakeholderMessage({
      pengirim: senderNames[role],
      rolePengirim: role,
      instansi: instansiNames[role],
      topik: msgTopik,
      pesan: msgIsi,
      targetPemangku: msgTarget
    });

    setMsgTopik('');
    setMsgIsi('');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIssue) return;
    updateFieldIssueStatus(
      resolvingIssue.id, 
      'Selesai & Terverifikasi', 
      tindakLanjutInput || 'Telah ditinjau dan ditangani sesuai SOP intervensi lapangan.',
      petugasPplInput || 'Petugas PPL Wilbin'
    );
    setResolvingIssue(null);
    setTindakLanjutInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <h2 className="text-xl font-bold text-stone-900">
              Koordinasi & Notifikasi Multi-Pemangku Kepentingan
            </h2>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Fungsi Utama: Informasi kegiatan, tindak lanjut masalah, dan komunikasi pemangku kepentingan (Bab E Hal. 7).
          </p>
        </div>

        {/* Operational Real-Time Tagline Callout */}
        <div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
          <span>Data terverifikasi petugas lapangan tanpa jeda administrasi</span>
        </div>
      </div>

      {/* Real-time Definition Banner from Document Page 7 */}
      <div className="bg-stone-100 border border-stone-300 rounded-xl p-4 text-xs text-stone-700 flex items-start gap-3">
        <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-stone-900">Definisi Operasional Real-Time (Hal. 7 Dokumen):</span>{' '}
          Data diperbarui segera setelah pencatatan dan validasi oleh petugas. Hal ini menjamin akurasi dan mencegah klaim data fiktif, menghubungkan petani, penyuluh (PPL), pengelola pupuk, dan pimpinan daerah secara konsisten.
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-stone-200 gap-2">
        <button
          onClick={() => setActiveSubTab('kegiatan')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'kegiatan'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Informasi Kegiatan ({activities.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('masalah')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'masalah'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Tindak Lanjut Masalah ({fieldIssues.filter(i => i.status !== 'Selesai & Terverifikasi').length} Aktif)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('komunikasi')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'komunikasi'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Komunikasi Pemangku Kepentingan ({stakeholderMessages.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('notifikasi')}
          className={`pb-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'notifikasi'
              ? 'border-emerald-700 text-emerald-800'
              : 'border-transparent text-stone-500 hover:text-stone-800'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Peringatan & Log Terkini ({earlyWarnings.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: INFORMASI KEGIATAN */}
      {activeSubTab === 'kegiatan' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-stone-500">
              Agenda resmi sosialisasi, rembug tani, penyaluran pupuk, dan ubinan lapangan se-Kabupaten Bangka.
            </div>
            {role === 'operator' && (
              <button
                onClick={() => setIsAddActivityOpen(true)}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>Buat Agenda Kegiatan Baru</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((act) => (
              <div key={act.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {act.kategori}
                    </span>
                    <h3 className="font-bold text-sm text-stone-900 mt-1">
                      {act.judul}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                    act.status === 'Berlangsung' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                    act.status === 'Akan Datang' ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {act.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{act.tanggal} ({act.waktu})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{act.lokasi}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{act.targetPeserta}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="truncate">{act.penyelenggara}</span>
                  </div>
                </div>

                <p className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-200/60 leading-relaxed">
                  {act.deskripsi}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: TINDAK LANJUT MASALAH (HELPDESK & DISPOSISI) */}
      {activeSubTab === 'masalah' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-stone-500">
              Kanal eskalasi masalah riil petani (hama OPT, pupuk langka, irigasi rusak) dengan alur penanganan cepat PPL & Dinas.
            </div>
            {role === 'operator' && (
              <button
                onClick={() => setIsAddIssueOpen(true)}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>Laporkan Kendala / Masalah Lapangan</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filteredIssues.map((issue) => {
              const isResolved = issue.status === 'Selesai & Terverifikasi';
              const isInProgress = issue.status === 'Dalam Penanganan Petugas';
              return (
                <div key={issue.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                        {issue.kodeTiket}
                      </span>
                      <span className="text-xs font-semibold text-stone-700">· {issue.kategoriMasalah}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        issue.prioritas.includes('Tinggi') ? 'bg-rose-100 text-rose-800' :
                        issue.prioritas.includes('Sedang') ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {issue.prioritas}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                        isResolved ? 'bg-emerald-100 text-emerald-800' :
                        isInProgress ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isResolved ? <CheckCheck className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        <span>{issue.status}</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-stone-500 flex flex-wrap items-center gap-4">
                    <span>Pelapor: <strong className="text-stone-800">{issue.pelaporNama}</strong> ({issue.poktan})</span>
                    <span>Wilayah: <strong className="text-stone-800">{formatDesaKelurahan(issue.kecamatan, issue.desa)}, Kec. {issue.kecamatan}</strong></span>
                    <span>Tanggal: <strong className="text-stone-800">{issue.tanggalLapor}</strong></span>
                  </div>

                  <p className="text-xs text-stone-800 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-200">
                    {issue.deskripsi}
                  </p>

                  {/* Tindak Lanjut Section */}
                  {issue.tindakLanjutPetugas && (
                    <div className="bg-emerald-50/60 border border-emerald-200 p-3 rounded-lg text-xs space-y-1">
                      <div className="font-bold text-emerald-950 flex items-center justify-between">
                        <span>Tindak Lanjut Lapangan oleh Petugas:</span>
                        <span className="text-[11px] font-normal text-emerald-800 font-mono">
                          {issue.tanggalPenyelesaian ? `Selesai: ${issue.tanggalPenyelesaian}` : 'Sedang Ditangani'}
                        </span>
                      </div>
                      <p className="text-emerald-900 leading-relaxed">
                        {issue.tindakLanjutPetugas}
                      </p>
                      {issue.petugasPpl && (
                        <div className="text-[11px] text-emerald-700 pt-1">
                          Penanggung Jawab: {issue.petugasPpl}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action buttons for Operator */}
                  {!isResolved && role === 'operator' && (
                    <div className="pt-2 flex items-center justify-end gap-3">
                      {isInProgress ? (
                        <button
                          onClick={() => {
                            setResolvingIssue(issue);
                            setPetugasPplInput(issue.petugasPpl || 'Ir. Hendra Kusuma (PPL BPP)');
                          }}
                          className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Selesaikan & Verifikasi Laporan
                        </button>
                      ) : (
                        <button
                          onClick={() => updateFieldIssueStatus(issue.id, 'Dalam Penanganan Petugas', 'Petugas telah ditugaskan melakukan verifikasi lapangan.', 'Petugas Lapangan')}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
                        >
                          Ambil Tindakan / Disposisikan ke Petugas
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: KOMUNIKASI PEMANGKU KEPENTINGAN */}
      {activeSubTab === 'komunikasi' && (
        <div className="space-y-6">
          <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h3 className="font-bold text-stone-900 text-sm">
              Kirim Pesan / Pengumuman Resmi Pemangku Kepentingan
            </h3>
            <form onSubmit={handleSendMessage} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Topik / Perihal:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Percepatan Tebus Pupuk NPK / Rencana Ubinan Padi"
                    value={msgTopik}
                    onChange={(e) => setMsgTopik(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Target Pemangku:</label>
                  <select
                    value={msgTarget}
                    onChange={(e) => setMsgTarget(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value="Semua Koordinator BPP & PPL Wilbin">Semua Koordinator BPP & PPL Wilbin</option>
                    <option value="Seluruh Kelompok Tani (Poktan/Gapoktan)">Seluruh Kelompok Tani (Poktan/Gapoktan)</option>
                    <option value="Pengelola Kios Pupuk Lengkap (KPL)">Pengelola Kios Pupuk Lengkap (KPL)</option>
                    <option value="Pimpinan Daerah & Tim Transformasi Kepemimpinan">Pimpinan Daerah & Tim Transformasi Kepemimpinan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-600 mb-1">Isi Pesan Koordinasi:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan instruksi atau informasi penting..."
                  value={msgIsi}
                  onChange={(e) => setMsgIsi(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-stone-500">
                  Mengirim sebagai: <strong className="text-stone-800 capitalize">{role}</strong>
                </span>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>Kirim Pesan Koordinasi</span>
                </button>
              </div>
            </form>
          </div>

          {/* Messages Feed */}
          <div className="space-y-4">
            <h3 className="font-bold text-stone-900 text-sm">
              Log Koordinasi Resmi Lintas Sektor
            </h3>

            {stakeholderMessages.map((msg) => (
              <div key={msg.id} className="bg-white border border-stone-200 rounded-xl p-5 shadow-2xs space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {msg.rolePengirim === 'dinas' ? 'D' : msg.rolePengirim === 'ppl' ? 'P' : msg.rolePengirim === 'kios' ? 'K' : 'T'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-stone-900">{msg.pengirim}</div>
                      <div className="text-[10px] text-stone-500">{msg.instansi}</div>
                    </div>
                  </div>
                  <span className="text-[10px] text-stone-400 shrink-0">{msg.tanggalWaktu}</span>
                </div>

                <div className="pt-2 border-t border-stone-100">
                  <h4 className="text-xs font-bold text-emerald-900 mb-1">{msg.topik}</h4>
                  <p className="text-xs text-stone-700 leading-relaxed bg-stone-50/80 p-3 rounded-lg border border-stone-200/50">
                    {msg.pesan}
                  </p>
                </div>

                <div className="text-[10px] text-stone-400 text-right">
                  Ditujukan kepada: <span className="font-medium text-stone-600">{msg.targetPemangku}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: NOTIFIKASI & PERINGATAN LOG */}
      {activeSubTab === 'notifikasi' && (
        <div className="space-y-4">
          <div className="text-xs text-stone-500">
            Log notifikasi otomatis dari sensor data kalender tanam, ketersediaan pupuk, dan status iklim BMKG Bangka.
          </div>

          <div className="space-y-3">
            {earlyWarnings.map((warn) => (
              <div key={warn.id} className="bg-white border border-stone-200 rounded-xl p-4 shadow-2xs flex items-start gap-3">
                <div className={`p-2 rounded-lg shrink-0 ${
                  warn.tingkat.includes('Kritis') ? 'bg-rose-100 text-rose-700' :
                  warn.tingkat.includes('Waspada') ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900">{warn.judul}</span>
                    <span className="text-[10px] text-stone-400">{warn.tanggal}</span>
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {warn.deskripsi}
                  </p>
                  <div className="text-[11px] text-emerald-800 font-medium pt-1">
                    Wilayah: {warn.kecamatan} · Status: {warn.statusPenanganan}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: BUAT KEGIATAN BARU */}
      {isAddActivityOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-base">Tambah Agenda Kegiatan Pertanian</h3>
              <button onClick={() => setIsAddActivityOpen(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddActivitySubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Judul Kegiatan:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bimtek Pasca Panen Lada Putih"
                  value={actJudul}
                  onChange={(e) => setActJudul(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tanggal:</label>
                  <input
                    type="date"
                    required
                    value={actTanggal}
                    onChange={(e) => setActTanggal(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Waktu:</label>
                  <input
                    type="text"
                    required
                    placeholder="08:30 - 12:00 WIB"
                    value={actWaktu}
                    onChange={(e) => setActWaktu(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kecamatan:</label>
                  <select
                    value={actKecamatan}
                    onChange={(e) => setActKecamatan(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value="Seluruh Kabupaten">Seluruh Kabupaten</option>
                    {KECAMATAN_LIST.map(k => (
                      <option key={k.nama} value={k.nama}>{k.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori:</label>
                  <select
                    value={actKategori}
                    onChange={(e) => setActKategori(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value="Sosialisasi & Pelatihan">Sosialisasi & Pelatihan</option>
                    <option value="Rembug Tani">Rembug Tani</option>
                    <option value="Penyaluran Pupuk">Penyaluran Pupuk</option>
                    <option value="Uji Coba Ubinan">Uji Coba Ubinan</option>
                    <option value="Monitoring Lapangan">Monitoring Lapangan</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Lokasi:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BPP Mendo Barat / Hamparan Sawah Desa Kemuja"
                  value={actLokasi}
                  onChange={(e) => setActLokasi(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Deskripsi & Agenda:</label>
                <textarea
                  rows={2}
                  required
                  value={actDeskripsi}
                  onChange={(e) => setActDeskripsi(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddActivityOpen(false)} className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer">Batal</button>
                <button type="submit" className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg cursor-pointer">Simpan Agenda</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LAPORKAN MASALAH LAPANGAN */}
      {isAddIssueOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-base">Laporkan Kendala / Masalah Lapangan</h3>
              <button onClick={() => setIsAddIssueOpen(false)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddIssueSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Pelapor:</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap"
                    value={issuePelapor}
                    onChange={(e) => setIssuePelapor(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kelompok Tani (Poktan):</label>
                  <input
                    type="text"
                    placeholder="Nama Poktan"
                    value={issuePoktan}
                    onChange={(e) => setIssuePoktan(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kecamatan:</label>
                  <select
                    value={issueKecamatan}
                    onChange={(e) => {
                      const newKec = e.target.value as KecamatanBangka;
                      setIssueKecamatan(newKec);
                      const list = DESA_PER_KECAMATAN[newKec] || [];
                      setIssueDesa(list[0] || '');
                    }}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    {KECAMATAN_LIST.map(k => (
                      <option key={k.nama} value={k.nama}>{k.nama}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">{getDesaFieldLabel(issueKecamatan)}:</label>
                  <select
                    value={issueDesa}
                    onChange={(e) => setIssueDesa(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    {(DESA_PER_KECAMATAN[issueKecamatan] || []).map(desa => (
                      <option key={desa} value={desa}>{formatDesaKelurahan(issueKecamatan, desa)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori Masalah:</label>
                  <select
                    value={issueKategori}
                    onChange={(e) => setIssueKategori(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value="Pupuk Langka / Distribusi Terhambat">Pupuk Langka / Terhambat</option>
                    <option value="Serangan Hama / Penyakit (OPT)">Serangan Hama / Penyakit (OPT)</option>
                    <option value="Irigasi / Saluran Air Rusak">Irigasi / Air Rusak</option>
                    <option value="Kerusakan Pasca Panen">Kerusakan Pasca Panen</option>
                    <option value="Validasi Data Lahan & Petani">Validasi Data Lahan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tingkat Prioritas:</label>
                  <select
                    value={issuePrioritas}
                    onChange={(e) => setIssuePrioritas(e.target.value as any)}
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value="Tinggi (Darurat)">Tinggi (Darurat)</option>
                    <option value="Sedang">Sedang</option>
                    <option value="Rendah (Rutin)">Rendah (Rutin)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Deskripsi Kejadian Lapangan:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Jelaskan kondisi di lapangan secara jelas..."
                  value={issueDeskripsi}
                  onChange={(e) => setIssueDeskripsi(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
              </div>
              <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
                <button type="button" onClick={() => setIsAddIssueOpen(false)} className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer">Batal</button>
                <button type="submit" className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg cursor-pointer">Kirim Laporan Tiket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VERIFIKASI PENYELESAIAN MASALAH */}
      {resolvingIssue && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-base">Verifikasi Penanganan Masalah</h3>
              <button onClick={() => setResolvingIssue(null)} className="text-stone-400 hover:text-stone-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleResolveSubmit} className="space-y-4 mt-4">
              <div className="text-xs bg-stone-50 p-2.5 rounded border border-stone-200">
                <div className="font-bold text-stone-800">{resolvingIssue.kodeTiket} · {resolvingIssue.kategoriMasalah}</div>
                <div className="text-stone-600 mt-1">{resolvingIssue.deskripsi}</div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tindakan / Solusi yang Diterapkan:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Uraikan langkah penyelesaian oleh PPL atau Dinas..."
                  value={tindakLanjutInput}
                  onChange={(e) => setTindakLanjutInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Petugas Penanggung Jawab:</label>
                <input
                  type="text"
                  required
                  value={petugasPplInput}
                  onChange={(e) => setPetugasPplInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-stone-300 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
                <button type="button" onClick={() => setResolvingIssue(null)} className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer">Batal</button>
                <button type="submit" className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg cursor-pointer">Sahkan Masalah Teratasi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
