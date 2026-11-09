import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Menu, 
  X, 
  Home,
  Sprout, 
  Calendar, 
  Store, 
  Percent, 
  KeyRound, 
  LogOut, 
  ShieldCheck, 
  ChevronRight
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { 
    role, 
    isOperatorUnlocked,
    unlockOperator,
    lockOperator
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [operatorPinInput, setOperatorPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Clean Modules with Beranda (Koordinasi removed per user request)
  const navModules = [
    { 
      id: 'beranda', 
      label: 'Beranda Utama', 
      desc: 'Pusat informasi resmi, statistik kunci, & sambutan Dinas',
      icon: Home
    },
    { 
      id: 'lahan', 
      label: 'Data Petani & Lahan', 
      desc: 'Basis data petani, kelompok tani, desa/kelurahan, luas lahan, & irigasi',
      icon: Sprout
    },
    { 
      id: 'kalender', 
      label: 'Kalendar Tanam & Musim', 
      desc: 'Simulasi agroklimat BMKG Babel & jadwal budidaya harian',
      icon: Calendar
    },
    { 
      id: 'pupuk', 
      label: 'Kebutuhan Pupuk', 
      desc: 'Kebutuhan pupuk bersubsidi poktan & kios resmi KPL',
      icon: Store
    },
    { 
      id: 'susut', 
      label: 'Pengendalian Kehilangan Hasil', 
      desc: 'Evaluasi susut hasil pasca panen & intervensi mekanisasi',
      icon: Percent
    }
  ];

  const handleOperatorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockOperator(operatorPinInput);
    if (success) {
      setPinError(false);
      setOperatorPinInput('');
      setIsLoginModalOpen(false);
    } else {
      setPinError(true);
    }
  };

  const handleSelectModule = (id: string) => {
    setActiveTab(id);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 h-16">
            {/* Left Zone: Sidebar Menu Button + Logo */}
            <div className="flex items-center gap-3">
              {/* Trigger Button: Menu pop up */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg flex items-center gap-2 shadow-xs transition-colors cursor-pointer group"
                title="Buka Menu Navigasi"
              >
                <Menu className="w-5 h-5 text-amber-300 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-bold tracking-wide">Menu</span>
              </button>

              <div className="h-6 w-px bg-stone-200 hidden sm:block"></div>

              {/* Logo & Title (Click to return to Beranda) */}
              <button
                type="button"
                onClick={() => setActiveTab('beranda')}
                className="flex items-center text-left cursor-pointer group"
                title="Kembali ke Beranda Utama"
              >
                <div>
                  <div className="text-sm sm:text-base font-bold tracking-tight text-stone-900 group-hover:text-emerald-800 transition-colors">
                    SIMPATIS BANGKA
                  </div>
                  <div className="text-[10px] text-stone-500 hidden sm:block">
                    Dinas Pangan dan Pertanian Kab. Bangka
                  </div>
                </div>
              </button>
            </div>

            {/* Clean Right Zone: Minimal Government Agency Tag */}
            <div className="text-[11px] text-stone-400 font-medium hidden sm:flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              <span>Pemerintah Kab. Bangka</span>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* LEFT POP-UP SIDEBAR DRAWER */}
      {/* ========================================================= */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
          />

          {/* Drawer Panel */}
          <div className="relative w-80 sm:w-96 bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-stone-100">SIMPATIS BANGKA</h3>
                <p className="text-[11px] text-stone-400">Menu Navigasi</p>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
                title="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of Menu Items */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
              <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                Pilih Modul Aplikasi
              </div>
              {navModules.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectModule(item.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-start gap-3 border ${
                      isActive 
                        ? 'bg-emerald-800 text-white border-emerald-700 shadow-sm' 
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isActive 
                        ? 'bg-white/20 text-amber-300' 
                        : 'bg-stone-100 text-emerald-800'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`font-bold text-xs sm:text-sm truncate ${isActive ? 'text-white' : 'text-stone-900'}`}>
                          {item.label}
                        </span>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                        )}
                      </div>
                      <p className={`text-[11px] mt-0.5 line-clamp-2 leading-relaxed ${isActive ? 'text-emerald-100' : 'text-stone-500'}`}>
                        {item.desc}
                      </p>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 mt-2 ${isActive ? 'text-white/70' : 'text-stone-400'}`} />
                  </button>
                );
              })}

              {/* Dedicated Admin / Operator Section in Sidebar */}
              <div className="pt-3 pb-1 border-t border-stone-200 mt-3">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-stone-400">
                  Akses Pengelola Sistem
                </div>
              </div>

              {role === 'operator' ? (
                <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm text-emerald-950">
                          Admin / Operator Aktif
                        </div>
                        <div className="text-[11px] text-emerald-700">
                          Mode Kelola Data Terbuka
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      lockOperator();
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar dari Admin / Operator</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsLoginModalOpen(true);
                  }}
                  className="w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-stone-200 group-hover:bg-emerald-100 group-hover:text-emerald-800 text-stone-600 flex items-center justify-center shrink-0 transition-colors">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs sm:text-sm text-stone-800 group-hover:text-emerald-900 transition-colors">
                      Login Admin/Operator
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">
                      Akses kelola & edit data dinas
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-stone-500">Status Akses:</span>
                <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                  role === 'operator' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-stone-200 text-stone-700'
                }`}>
                  {role === 'operator' ? 'Operator Internal' : 'Mode Publik'}
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="w-full py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold rounded-lg transition-colors cursor-pointer text-center text-xs"
              >
                Tutup Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operator Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
                <KeyRound className="w-4 h-4 text-emerald-700" />
                <span>Masuk Mode Operator Internal</span>
              </div>
              <button 
                onClick={() => { setIsLoginModalOpen(false); setPinError(false); setOperatorPinInput(''); }}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Khusus petugas Dinas Pertanian & Operator resmi untuk menginput, mengedit, dan menghapus data petak lahan dan alokasi pupuk.
            </p>

            <form onSubmit={handleOperatorLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Masukkan PIN Operator:
                </label>
                <input
                  type="password"
                  value={operatorPinInput}
                  onChange={(e) => { setOperatorPinInput(e.target.value); setPinError(false); }}
                  placeholder="Password"
                  autoFocus
                  required
                  className={`w-full px-3 py-2 text-sm font-mono tracking-widest bg-stone-50 border rounded-lg focus:outline-emerald-700 text-center ${
                    pinError ? 'border-rose-500 bg-rose-50 text-rose-900' : 'border-stone-300'
                  }`}
                />
                {pinError && (
                  <p className="text-[11px] text-rose-600 mt-1 font-medium text-center">
                    PIN tidak valid.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => { setIsLoginModalOpen(false); setPinError(false); setOperatorPinInput(''); }}
                  className="px-3.5 py-1.5 text-xs text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg cursor-pointer"
                >
                  Verifikasi PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
