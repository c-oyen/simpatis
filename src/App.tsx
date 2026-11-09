/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { LandParcelsView } from './components/LandParcelsView';
import { PlantingCalendarView } from './components/PlantingCalendarView';
import { FertilizerManagementView } from './components/FertilizerManagementView';
import { LossControlView } from './components/LossControlView';
import { OfficialDocumentModal } from './components/OfficialDocumentModal';
import { RoleActionBanner } from './components/RoleActionBanner';
import { HomeLandingView } from './components/HomeLandingView';
import { ArrowLeft } from 'lucide-react';

const MainDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('beranda');
  const { setShowOfficialModal } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
      {/* Official Top Bar with Pop-up Sidebar Menu Trigger */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Role Perspective Banner: Operator vs Publik */}
        <RoleActionBanner onNavigateTab={(tab) => setActiveTab(tab)} />

        {/* Back to Home Breadcrumb when inside sub-modules */}
        {activeTab !== 'beranda' && (
          <div className="flex items-center justify-between pb-1 border-b border-stone-200">
            <button
              onClick={() => setActiveTab('beranda')}
              className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-900 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100/80 px-3.5 py-1.5 rounded-lg border border-emerald-300 transition-all cursor-pointer shadow-2xs group"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-700 group-hover:-translate-x-1 transition-transform" />
              <span>Kembali ke Beranda Utama</span>
            </button>
            <div className="text-[11px] text-stone-400 hidden sm:block">
              SIMPATIS BANGKA 
            </div>
          </div>
        )}

        {/* 1. Halaman Depan: Beranda / Landing Page */}
        {activeTab === 'beranda' && (
          <HomeLandingView onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {/* 2. Data Petani dan Lahan: Identitas kelompok tani, lokasi desa, luas lahan, dan irigasi */}
        {activeTab === 'lahan' && (
          <LandParcelsView />
        )}

        {/* 3. Kalender Tanam: Jadwal tanam, fase pertumbuhan, agroklimat BMKG, dan estimasi panen */}
        {activeTab === 'kalender' && (
          <PlantingCalendarView />
        )}

        {/* 4. Kebutuhan Pupuk: Kebutuhan per poktan dan informasi direktori kios penyalur resmi */}
        {activeTab === 'pupuk' && (
          <FertilizerManagementView />
        )}

        {/* 5. Pengendalian Kehilangan Hasil: Pencatatan kuantitas kehilangan dan evaluasi mekanisasi */}
        {activeTab === 'susut' && (
          <LossControlView />
        )}
      </main>

      {/* Official Document & Print Modal */}
      <OfficialDocumentModal />

      {/* Quiet Government Footer */}
      <footer className="no-print bg-white border-t border-stone-200 py-6 text-xs text-stone-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-800">SIMPATIS BANGKA</span>
              <span aria-hidden="true">·</span>
              <span>Dinas Pangan dan Pertanian Pemerintah Kabupaten Bangka</span>
              <span aria-hidden="true">·</span>
              <span>Tahun Anggaran 2026</span>
            </div>

            <div className="flex items-center gap-4 text-[11px] text-stone-400">
              <span>Standar Agroklimat BMKG Babel</span>
              <span>Standar Pupuk & Varietas BSIP Babel</span>
              <button
                onClick={() => setShowOfficialModal(true)}
                className="text-emerald-700 hover:underline cursor-pointer"
              >
                Landasan Kebijakan Perbup
              </button>
            </div>
          </div>
          <div className="text-[11px] text-stone-400 border-t border-stone-100 pt-3 flex flex-wrap items-center justify-between gap-2">
            <span>Jl. Diponegoro No.10, Parit Padang, Sungailiat, Kab. Bangka 33215</span>
            <div className="flex items-center gap-4">
              <span>Telp: +62 717 92300</span>
              <span>Email: dinpanpertan@bangka.go.id</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainDashboard />
    </AppProvider>
  );
}

export default App;
