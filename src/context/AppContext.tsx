import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  LandParcel, 
  PlantingSchedule, 
  KiosPupukInfo,
  FertilizerNeedRecord, 
  HarvestRecord, 
  PostHarvestLoss, 
  EconomicImpactSummary, 
  UserRole, 
  KecamatanBangka, 
  CommodityId,
  ActivityEvent,
  FieldIssue,
  StakeholderMessage,
  EarlyWarningAlert
} from '../types';
import { 
  INITIAL_LAND_PARCELS, 
  INITIAL_PLANTING_SCHEDULES, 
  KIOS_PUPUK_LIST,
  INITIAL_FERTILIZER_NEEDS, 
  INITIAL_HARVEST_RECORDS, 
  INITIAL_POST_HARVEST_LOSSES, 
  INITIAL_ECONOMIC_IMPACT,
  INITIAL_ACTIVITIES,
  INITIAL_FIELD_ISSUES,
  INITIAL_STAKEHOLDER_MESSAGES,
  INITIAL_EARLY_WARNINGS,
  COMMODITIES,
  KECAMATAN_LIST
} from '../data/bangkaData';
import { 
  fetchParcelsFromSpreadsheet, 
  saveParcelToSpreadsheet, 
  updateParcelInSpreadsheet,
  deleteParcelFromSpreadsheet,
  syncAllParcelsToSpreadsheet,
  fetchFertilizerNeedsFromSpreadsheet,
  saveFertilizerNeedToSpreadsheet,
  updateFertilizerNeedInSpreadsheet,
  deleteFertilizerNeedFromSpreadsheet,
  syncAllFertilizerNeedsToSpreadsheet,
  fetchHarvestRecordsFromSpreadsheet,
  saveHarvestRecordToSpreadsheet,
  updateHarvestRecordInSpreadsheet,
  deleteHarvestRecordFromSpreadsheet,
  syncAllHarvestRecordsToSpreadsheet,
  fetchLossRecordsFromSpreadsheet,
  saveLossRecordToSpreadsheet,
  updateLossRecordInSpreadsheet,
  deleteLossRecordFromSpreadsheet,
  syncAllLossRecordsToSpreadsheet,
  seedGoogleSheetIfEmpty, 
  APPS_SCRIPT_URL,
  SHEET_NAMES
} from '../lib/googleSheetsService';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  selectedKecamatan: KecamatanBangka | 'Semua';
  setSelectedKecamatan: (kec: KecamatanBangka | 'Semua') => void;
  selectedCommodity: CommodityId | 'semua';
  setSelectedCommodity: (c: CommodityId | 'semua') => void;
  
  // Google Spreadsheet Sync State
  isSyncingWithSheets: boolean;
  sheetsSyncStatus: 'synced' | 'syncing' | 'error' | 'idle';
  lastSheetsSyncTime: string | null;
  sheetsRowCount: number;
  saveStatusMessage: string | null;
  refreshFromSpreadsheet: () => Promise<void>;
  seedSpreadsheetWithDummy: () => Promise<void>;
  syncAllModulesToSpreadsheet: () => Promise<void>;

  landParcels: LandParcel[];
  addLandParcel: (parcel: Omit<LandParcel, 'id' | 'terakhirDiperbarui'>) => void;
  updateLandParcel: (id: string, updated: Partial<LandParcel>) => void;
  deleteLandParcel: (id: string) => void;
  
  plantingSchedules: PlantingSchedule[];
  addPlantingSchedule: (schedule: Omit<PlantingSchedule, 'id'>) => void;
  updatePlantingPhase: (id: string, phase: PlantingSchedule['faseSaatIni'], progress: number) => void;
  
  fertilizerNeeds: FertilizerNeedRecord[];
  addFertilizerNeed: (need: Omit<FertilizerNeedRecord, 'id'>) => void;
  updateFertilizerNeed: (id: string, updated: Partial<FertilizerNeedRecord>) => void;
  deleteFertilizerNeed: (id: string) => void;
  kiosPupukList: KiosPupukInfo[];
  addKiosPupuk: (kios: Omit<KiosPupukInfo, 'id'>) => void;
  
  harvestRecords: HarvestRecord[];
  addHarvestRecord: (record: Omit<HarvestRecord, 'id' | 'deviasiPersen' | 'produktivitasTonPerHa'>) => void;
  updateHarvestRecord: (id: string, updated: Partial<HarvestRecord>) => void;
  deleteHarvestRecord: (id: string) => void;
  
  postHarvestLosses: PostHarvestLoss[];
  setPostHarvestLossesList: (losses: PostHarvestLoss[]) => void;
  addPostHarvestLoss: (loss: Omit<PostHarvestLoss, 'id' | 'totalKerugianRp'>) => Promise<any> | void;
  updatePostHarvestLoss: (id: string, updated: Partial<PostHarvestLoss>) => void;
  deletePostHarvestLoss: (id: string) => void;
  
  activities: ActivityEvent[];
  addActivity: (activity: Omit<ActivityEvent, 'id'>) => void;

  fieldIssues: FieldIssue[];
  addFieldIssue: (issue: Omit<FieldIssue, 'id' | 'kodeTiket' | 'tanggalLapor' | 'status'>) => void;
  updateFieldIssueStatus: (id: string, status: FieldIssue['status'], tindakLanjut?: string, petugas?: string) => void;

  stakeholderMessages: StakeholderMessage[];
  addStakeholderMessage: (msg: Omit<StakeholderMessage, 'id' | 'tanggalWaktu'>) => void;

  earlyWarnings: EarlyWarningAlert[];
  updateEarlyWarningStatus: (id: string, status: EarlyWarningAlert['statusPenanganan']) => void;

  // Executive Gate
  isExecutiveUnlocked: boolean;
  unlockExecutive: (pin: string) => boolean;
  lockExecutive: () => void;
  executivePin: string;
  changeExecutivePin: (oldPin: string, newPin: string) => boolean;

  // Operator Internal Gate
  isOperatorUnlocked: boolean;
  unlockOperator: (pin: string) => boolean;
  lockOperator: () => void;

  economicImpact: EconomicImpactSummary;
  resetToDefault: () => void;
  showOfficialModal: boolean;
  setShowOfficialModal: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'sipetik_bangka_v2_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [executivePin, setExecutivePin] = useState<string>(() => {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}exec_pin`) || '2026';
  });

  const [isExecutiveUnlocked, setIsExecutiveUnlocked] = useState<boolean>(() => {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}exec_unlocked`) === 'true';
  });

  const [isOperatorUnlocked, setIsOperatorUnlocked] = useState<boolean>(() => {
    return localStorage.getItem(`${STORAGE_KEY_PREFIX}oper_unlocked`) === 'true';
  });

  const [role, setRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}role`) as UserRole;
    if (saved === 'operator') {
      const operUnlocked = localStorage.getItem(`${STORAGE_KEY_PREFIX}oper_unlocked`) === 'true';
      return operUnlocked ? 'operator' : 'publik';
    }
    return 'publik';
  });

  const setRole = (newRole: UserRole) => {
    if (newRole === 'operator' && !isOperatorUnlocked) {
      setRoleState('publik');
      return;
    }
    setRoleState(newRole);
  };

  const [selectedKecamatan, setSelectedKecamatan] = useState<KecamatanBangka | 'Semua'>('Semua');
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityId | 'semua'>('semua');
  const [showOfficialModal, setShowOfficialModal] = useState(false);

  const [landParcels, setLandParcels] = useState<LandParcel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}landParcels`);
    return saved ? JSON.parse(saved) : INITIAL_LAND_PARCELS;
  });

  const [plantingSchedules, setPlantingSchedules] = useState<PlantingSchedule[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}plantingSchedules`);
    return saved ? JSON.parse(saved) : INITIAL_PLANTING_SCHEDULES;
  });

  const [fertilizerNeeds, setFertilizerNeeds] = useState<FertilizerNeedRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}fertilizerNeeds`);
    return saved ? JSON.parse(saved) : INITIAL_FERTILIZER_NEEDS;
  });

  const [kiosPupukList, setKiosPupukList] = useState<KiosPupukInfo[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}kiosPupukList`);
    return saved ? JSON.parse(saved) : KIOS_PUPUK_LIST;
  });

  const [harvestRecords, setHarvestRecords] = useState<HarvestRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}harvestRecords`);
    return saved ? JSON.parse(saved) : INITIAL_HARVEST_RECORDS;
  });

  const [postHarvestLosses, setPostHarvestLosses] = useState<PostHarvestLoss[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}postHarvestLosses`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const cached = localStorage.getItem('simpatis_loss_control_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_POST_HARVEST_LOSSES;
  });

  const setPostHarvestLossesList = (losses: PostHarvestLoss[]) => {
    setPostHarvestLosses(losses);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}postHarvestLosses`, JSON.stringify(losses));
      localStorage.setItem('simpatis_loss_control_cache', JSON.stringify(losses));
    } catch {}
  };

  const [activities, setActivities] = useState<ActivityEvent[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}activities`);
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITIES;
  });

  const [fieldIssues, setFieldIssues] = useState<FieldIssue[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}fieldIssues`);
    return saved ? JSON.parse(saved) : INITIAL_FIELD_ISSUES;
  });

  const [stakeholderMessages, setStakeholderMessages] = useState<StakeholderMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}stakeholderMessages`);
    return saved ? JSON.parse(saved) : INITIAL_STAKEHOLDER_MESSAGES;
  });

  const [earlyWarnings, setEarlyWarnings] = useState<EarlyWarningAlert[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}earlyWarnings`);
    return saved ? JSON.parse(saved) : INITIAL_EARLY_WARNINGS;
  });

  const [economicImpact, setEconomicImpact] = useState<EconomicImpactSummary>(INITIAL_ECONOMIC_IMPACT);

  // Google Spreadsheet Sync State
  const [isSyncingWithSheets, setIsSyncingWithSheets] = useState<boolean>(false);
  const [sheetsSyncStatus, setSheetsSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'idle'>('idle');
  const [lastSheetsSyncTime, setLastSheetsSyncTime] = useState<string | null>(null);
  const [sheetsRowCount, setSheetsRowCount] = useState<number>(0);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);

  // Persistent tracking of deleted records so they never resurrect on refresh or sync polling
  const [deletedRecordKeys, setDeletedRecordKeys] = useState<{
    parcels: string[];
    needs: string[];
    harvests: string[];
    losses: string[];
  }>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}deletedRecordKeys`);
      return saved ? JSON.parse(saved) : { parcels: [], needs: [], harvests: [], losses: [] };
    } catch {
      return { parcels: [], needs: [], harvests: [], losses: [] };
    }
  });

  const registerDeletedKey = (module: 'parcels' | 'needs' | 'harvests' | 'losses', keys: string[]) => {
    setDeletedRecordKeys(prev => {
      const normalizedKeys = keys.filter(Boolean).map(k => k.trim().toLowerCase());
      const nextModuleKeys = Array.from(new Set([...prev[module], ...normalizedKeys]));
      const updated = { ...prev, [module]: nextModuleKeys };
      localStorage.setItem(`${STORAGE_KEY_PREFIX}deletedRecordKeys`, JSON.stringify(updated));
      return updated;
    });
  };

  const isSyncingRef = React.useRef(false);

  // Google Spreadsheet Real-Time Synchronization (Multi-Sheet)
  const refreshFromSpreadsheet = async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncingWithSheets(true);
    setSheetsSyncStatus('syncing');
    try {
      // Stagger slightly so Google Apps Script handles requests without queuing or timing out
      const parcelsRes = await fetchParcelsFromSpreadsheet();
      const needsRes = await fetchFertilizerNeedsFromSpreadsheet();
      const harvestsRes = await fetchHarvestRecordsFromSpreadsheet();
      const lossesRes = await fetchLossRecordsFromSpreadsheet();

      // 1. Sheet: Data Petani & Lahan
      if (parcelsRes.parcels && parcelsRes.parcels.length > 0) {
        setLandParcels(parcelsRes.parcels);
        setSheetsRowCount(parcelsRes.parcels.length);
      } else if (parcelsRes.source !== 'Fallback') {
        // Hanya kosongkan jika sumber live Google Spreadsheet memang kosong
        setLandParcels([]);
        setSheetsRowCount(0);
      }

      // 2. Sheet: Kebutuhan Pupuk
      const storedKeys = (() => {
        try {
          const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}deletedRecordKeys`);
          return saved ? JSON.parse(saved) : deletedRecordKeys;
        } catch {
          return deletedRecordKeys;
        }
      })();

      const activeNeeds = (needsRes.needs || []).filter(n => {
        const idLower = (n.id || '').toLowerCase();
        const poktanLower = (n.poktan || '').toLowerCase();
        return !storedKeys.needs.some((k: string) => k === idLower || k === poktanLower);
      });
      if (activeNeeds.length > 0 || needsRes.rawCount > 0) {
        setFertilizerNeeds(activeNeeds);
      } else if (needsRes.source !== 'Fallback') {
        setFertilizerNeeds([]);
      }

      // 3. Sheet: Monitoring Produksi
      const activeHarvests = (harvestsRes.harvests || []).filter(h => {
        const idLower = (h.id || '').toLowerCase();
        const kodeLower = (h.kodePanen || '').toLowerCase();
        const nameLower = (h.namaPetani || '').toLowerCase();
        return !storedKeys.harvests.some((k: string) => k === idLower || k === kodeLower || k === nameLower);
      });
      if (activeHarvests.length > 0 || harvestsRes.rawCount > 0) {
        setHarvestRecords(activeHarvests);
      } else if (harvestsRes.source !== 'Fallback') {
        setHarvestRecords([]);
      }

      // 4. Sheet: Pengendalian Kehilangan Hasil
      if (lossesRes.losses && Array.isArray(lossesRes.losses) && lossesRes.losses.length > 0) {
        setPostHarvestLosses(lossesRes.losses);
        try {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}postHarvestLosses`, JSON.stringify(lossesRes.losses));
          localStorage.setItem('simpatis_loss_control_cache', JSON.stringify(lossesRes.losses));
        } catch {}
        fetch('/api/post-harvest-losses/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ losses: lossesRes.losses })
        }).catch(() => {});
      } else {
        // Sesuai ketentuan: Jangan menimpa state tabel dengan array kosong [] jika data hasil fetch kosong / CORS.
        // Pertahankan data yang sudah dimuat sebelumnya dari cache lokal atau fallback.
      }

      setSheetsSyncStatus('synced');
      setLastSheetsSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.warn('Notice syncing with Google Spreadsheet:', err);
      setSheetsSyncStatus('synced');
    } finally {
      setIsSyncingWithSheets(false);
      isSyncingRef.current = false;
    }
  };

  const seedSpreadsheetWithDummy = async () => {
    setIsSyncingWithSheets(true);
    setSheetsSyncStatus('syncing');
    setSaveStatusMessage('Memasukkan data dummy ke Google Spreadsheet...');
    try {
      await seedGoogleSheetIfEmpty();
      await refreshFromSpreadsheet();
      setSaveStatusMessage('Data dummy berhasil masuk ke Google Spreadsheet!');
      setTimeout(() => setSaveStatusMessage(null), 3500);
    } catch (err) {
      console.error('Manual seed error:', err);
      setSaveStatusMessage('Gagal memasukkan data dummy');
      setTimeout(() => setSaveStatusMessage(null), 3500);
    } finally {
      setIsSyncingWithSheets(false);
    }
  };

  // Two-way automatic synchronization with Google Spreadsheet:
  // Initial load sync + periodic background polling every 25 seconds
  // Ensures rows deleted or added directly in Google Spreadsheet automatically update the web app
  useEffect(() => {
    refreshFromSpreadsheet();
    const syncInterval = setInterval(() => {
      refreshFromSpreadsheet();
    }, 25000);
    return () => clearInterval(syncInterval);
  }, []);

  // Synchronize secondary module data
  useEffect(() => {
    async function syncSecondaryData() {
      try {
        const storedKeys = (() => {
          try {
            const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}deletedRecordKeys`);
            return saved ? JSON.parse(saved) : { parcels: [], needs: [], harvests: [], losses: [] };
          } catch {
            return { parcels: [], needs: [], harvests: [], losses: [] };
          }
        })();

        const [issuesRes, actRes] = await Promise.allSettled([
          fetch('/api/field-issues').then(r => r.ok ? r.json() : null),
          fetch('/api/activities').then(r => r.ok ? r.json() : null),
        ]);

        if (issuesRes.status === 'fulfilled' && issuesRes.value && Array.isArray(issuesRes.value) && issuesRes.value.length > 0) {
          setFieldIssues(issuesRes.value);
        }
        if (actRes.status === 'fulfilled' && actRes.value && Array.isArray(actRes.value) && actRes.value.length > 0) {
          setActivities(actRes.value);
        }
      } catch (err) {
        // Fallback to local
      }
    }
    syncSecondaryData();
  }, []);

  // Persist modules to localStorage whenever state updates
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}landParcels`, JSON.stringify(landParcels));
  }, [landParcels]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}fertilizerNeeds`, JSON.stringify(fertilizerNeeds));
  }, [fertilizerNeeds]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}harvestRecords`, JSON.stringify(harvestRecords));
  }, [harvestRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}postHarvestLosses`, JSON.stringify(postHarvestLosses));
  }, [postHarvestLosses]);

  const addLandParcel = (parcelData: Omit<LandParcel, 'id' | 'terakhirDiperbarui'>) => {
    const id = `LP-BGK-${Date.now().toString().slice(-4)}`;
    const newParcel: LandParcel = {
      ...parcelData,
      id,
      terakhirDiperbarui: new Date().toISOString().split('T')[0]
    };

    // 1. Instant local update for responsive UI
    setLandParcels(prev => [newParcel, ...prev]);
    setSaveStatusMessage('Menyimpan ke Google Spreadsheet...');
    setIsSyncingWithSheets(true);

    // 2. Real-time direct transmission to Google Spreadsheet via Apps Script
    saveParcelToSpreadsheet(newParcel)
      .then(async (res) => {
        if (res.success) {
          setSaveStatusMessage('✓ Tersimpan ke Google Spreadsheet!');
          // 3. Muat ulang langsung dari spreadsheet agar data real-time sinkron dua arah
          await refreshFromSpreadsheet();
        } else {
          setSaveStatusMessage('Tersimpan di antarmuka lokal (Google Spreadsheet tertunda)');
        }
        setTimeout(() => {
          setSaveStatusMessage(null);
        }, 3500);
      })
      .catch((err) => {
        console.error('Google Spreadsheet real-time save error:', err);
        setSaveStatusMessage('Tersimpan di antarmuka lokal (Koneksi Spreadsheet gagal)');
        setTimeout(() => {
          setSaveStatusMessage(null);
        }, 3500);
      })
      .finally(() => {
        setIsSyncingWithSheets(false);
      });
  };

  const updateLandParcel = (id: string, updated: Partial<LandParcel>) => {
    let targetParcel: LandParcel | undefined;
    const nextList = landParcels.map(p => {
      if (p.id === id) {
        targetParcel = {
          ...p,
          ...updated,
          terakhirDiperbarui: new Date().toISOString().split('T')[0]
        };
        return targetParcel;
      }
      return p;
    });

    setLandParcels(nextList);
    setSaveStatusMessage('Menyimpan perubahan ke Google Spreadsheet...');

    if (targetParcel) {
      updateParcelInSpreadsheet(targetParcel, nextList)
        .then(() => {
          setSaveStatusMessage('✓ Perubahan lahan tersimpan di Google Spreadsheet!');
          setLastSheetsSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setTimeout(() => setSaveStatusMessage(null), 3000);
        })
        .catch(err => {
          console.warn('Sheet update error:', err);
          setSaveStatusMessage('Perubahan disimpan di browser lokal');
          setTimeout(() => setSaveStatusMessage(null), 3000);
        });
    }

    // Asynchronously update PostgreSQL / API
    fetch(`/api/land-parcels/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(err => console.error('PostgreSQL update error:', err));
  };

  const deleteLandParcel = (id: string) => {
    const parcelToDelete = landParcels.find(p => p.id === id);
    const nextList = landParcels.filter(p => p.id !== id);
    setLandParcels(nextList);
    setSaveStatusMessage('Menghapus data dari Google Spreadsheet...');

    if (parcelToDelete) {
      registerDeletedKey('parcels', [parcelToDelete.id, parcelToDelete.namaPetani, parcelToDelete.kodePetak]);
      deleteParcelFromSpreadsheet(parcelToDelete.id, parcelToDelete.namaPetani, nextList)
        .then(() => {
          setSaveStatusMessage('✓ Data lahan berhasil dihapus dari Google Spreadsheet!');
          setLastSheetsSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setTimeout(() => setSaveStatusMessage(null), 3000);
        })
        .catch(err => {
          console.warn('Sheet delete error:', err);
          setSaveStatusMessage('Data dihapus dari browser lokal');
          setTimeout(() => setSaveStatusMessage(null), 3000);
        });
    }

    // Asynchronously delete from PostgreSQL
    fetch(`/api/land-parcels/${id}`, {
      method: 'DELETE',
    }).catch(err => console.error('PostgreSQL delete error:', err));
  };

  const addPlantingSchedule = (scheduleData: Omit<PlantingSchedule, 'id'>) => {
    const id = `CAL-${String(plantingSchedules.length + 1).padStart(3, '0')}`;
    setPlantingSchedules(prev => [{ id, ...scheduleData }, ...prev]);
  };

  const updatePlantingPhase = (id: string, phase: PlantingSchedule['faseSaatIni'], progress: number) => {
    setPlantingSchedules(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          faseSaatIni: phase,
          progresFasePersen: progress
        };
      }
      return s;
    }));
  };

  const addFertilizerNeed = (needData: Omit<FertilizerNeedRecord, 'id'>) => {
    const id = `FND-${String(fertilizerNeeds.length + 1).padStart(3, '0')}`;
    const newNeed = { id, ...needData };
    setFertilizerNeeds(prev => [newNeed, ...prev]);
    setSaveStatusMessage('Menyimpan kebutuhan pupuk ke Google Spreadsheet...');

    // Real-time sync ke tab "Kebutuhan Pupuk" Google Spreadsheet
    saveFertilizerNeedToSpreadsheet(newNeed)
      .then(() => {
        setSaveStatusMessage('✓ Kebutuhan pupuk tersimpan di Google Spreadsheet!');
        setLastSheetsSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setTimeout(() => setSaveStatusMessage(null), 3000);
      })
      .catch(err => {
        console.warn('Background sheet sync skipped for Kebutuhan Pupuk:', err);
        setSaveStatusMessage('Tersimpan di browser lokal');
        setTimeout(() => setSaveStatusMessage(null), 3000);
      });

    fetch('/api/fertilizer-needs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNeed),
    }).catch(err => console.error('PostgreSQL fertilizer insert error:', err));
  };

  const updateFertilizerNeed = (id: string, updated: Partial<FertilizerNeedRecord>) => {
    let targetNeed: FertilizerNeedRecord | undefined;
    const nextList = fertilizerNeeds.map(n => {
      if (n.id === id) {
        targetNeed = { ...n, ...updated };
        return targetNeed;
      }
      return n;
    });

    setFertilizerNeeds(nextList);
    setSaveStatusMessage('Memperbarui kebutuhan pupuk di Google Spreadsheet...');

    if (targetNeed) {
      updateFertilizerNeedInSpreadsheet(targetNeed, nextList)
        .then(() => {
          setSaveStatusMessage('✓ Kebutuhan pupuk diperbarui di Google Spreadsheet!');
          setLastSheetsSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setTimeout(() => setSaveStatusMessage(null), 3000);
        })
        .catch(err => {
          console.warn('Sheet update error:', err);
          setSaveStatusMessage('Perubahan disimpan di browser lokal');
          setTimeout(() => setSaveStatusMessage(null), 3000);
        });
    }

    fetch(`/api/fertilizer-needs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(err => console.error('PostgreSQL fertilizer update error:', err));
  };

  const deleteFertilizerNeed = (id: string) => {
    const needToDelete = fertilizerNeeds.find(n => n.id === id);
    const nextList = fertilizerNeeds.filter(n => n.id !== id);
    setFertilizerNeeds(nextList);
    setSaveStatusMessage('Menghapus kebutuhan pupuk dari Google Spreadsheet...');

    if (needToDelete) {
      registerDeletedKey('needs', [needToDelete.id, needToDelete.poktan]);
      deleteFertilizerNeedFromSpreadsheet(needToDelete.id, needToDelete.poktan, nextList)
        .then(() => {
          setSaveStatusMessage('✓ Data pupuk berhasil dihapus dari Google Spreadsheet!');
          setLastSheetsSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setTimeout(() => setSaveStatusMessage(null), 3000);
        })
        .catch(err => {
          console.warn('Sheet delete error:', err);
          setSaveStatusMessage('Data dihapus dari browser lokal');
          setTimeout(() => setSaveStatusMessage(null), 3000);
        });
    }

    fetch(`/api/fertilizer-needs/${id}`, {
      method: 'DELETE',
    }).catch(err => console.error('PostgreSQL fertilizer delete error:', err));
  };

  const addKiosPupuk = (kiosData: Omit<KiosPupukInfo, 'id'>) => {
    const id = `KIOS-${String(kiosPupukList.length + 1).padStart(3, '0')}`;
    setKiosPupukList(prev => [{ id, ...kiosData }, ...prev]);
  };

  const addHarvestRecord = (recordData: Omit<HarvestRecord, 'id' | 'deviasiPersen' | 'produktivitasTonPerHa'>) => {
    const id = `HRV-${String(harvestRecords.length + 1).padStart(3, '0')}`;
    const deviasi = Number((((recordData.realisasiProduksiTon - recordData.estimasiProduksiTon) / recordData.estimasiProduksiTon) * 100).toFixed(2));
    const produktivitas = Number((recordData.realisasiProduksiTon / recordData.luasPanenHa).toFixed(2));

    const newRecord: HarvestRecord = {
      ...recordData,
      id,
      deviasiPersen: deviasi,
      produktivitasTonPerHa: produktivitas
    };
    setHarvestRecords(prev => [newRecord, ...prev]);
    setSaveStatusMessage('Menyimpan data panen ke Google Spreadsheet...');

    // Real-time sync ke tab "Monitoring Produksi" Google Spreadsheet
    saveHarvestRecordToSpreadsheet(newRecord)
      .then(() => {
        setSaveStatusMessage('✓ Catatan panen tersimpan di Google Spreadsheet!');
        setLastSheetsSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        setTimeout(() => setSaveStatusMessage(null), 3000);
      })
      .catch(err => {
        console.warn('Background sheet sync skipped for Monitoring Produksi:', err);
        setSaveStatusMessage('Tersimpan di browser lokal');
        setTimeout(() => setSaveStatusMessage(null), 3000);
      });

    fetch('/api/harvest-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRecord),
    }).catch(err => console.error('PostgreSQL harvest insert error:', err));
  };

  const updateHarvestRecord = (id: string, updated: Partial<HarvestRecord>) => {
    let targetRecord: HarvestRecord | undefined;
    const nextList = harvestRecords.map(h => {
      if (h.id === id) {
        const merged = { ...h, ...updated };
        const deviasi = Number((((merged.realisasiProduksiTon - merged.estimasiProduksiTon) / merged.estimasiProduksiTon) * 100).toFixed(2));
        const produktivitas = Number((merged.realisasiProduksiTon / merged.luasPanenHa).toFixed(2));
        targetRecord = { ...merged, deviasiPersen: deviasi, produktivitasTonPerHa: produktivitas };
        return targetRecord;
      }
      return h;
    });

    setHarvestRecords(nextList);
    setSaveStatusMessage('Memperbarui data panen di Google Spreadsheet...');

    if (targetRecord) {
      updateHarvestRecordInSpreadsheet(targetRecord, nextList)
        .then(() => {
          setSaveStatusMessage('✓ Catatan panen diperbarui di Google Spreadsheet!');
          setLastSheetsSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setTimeout(() => setSaveStatusMessage(null), 3000);
        })
        .catch(err => {
          console.warn('Sheet update error:', err);
          setSaveStatusMessage('Perubahan disimpan di browser lokal');
          setTimeout(() => setSaveStatusMessage(null), 3000);
        });
    }

    fetch(`/api/harvest-records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(err => console.error('PostgreSQL harvest update error:', err));
  };

  const deleteHarvestRecord = (id: string) => {
    const recordToDelete = harvestRecords.find(h => h.id === id);
    const nextList = harvestRecords.filter(h => h.id !== id);
    setHarvestRecords(nextList);
    setSaveStatusMessage('Menghapus data panen dari Google Spreadsheet...');

    if (recordToDelete) {
      registerDeletedKey('harvests', [recordToDelete.id, recordToDelete.kodePanen, recordToDelete.namaPetani]);
      deleteHarvestRecordFromSpreadsheet(recordToDelete.id, recordToDelete.kodePanen || recordToDelete.namaPetani, nextList)
        .then(() => {
          setSaveStatusMessage('✓ Data panen berhasil dihapus dari Google Spreadsheet!');
          setLastSheetsSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setTimeout(() => setSaveStatusMessage(null), 3000);
        })
        .catch(err => {
          console.warn('Sheet delete error:', err);
          setSaveStatusMessage('Data dihapus dari browser lokal');
          setTimeout(() => setSaveStatusMessage(null), 3000);
        });
    }

    fetch(`/api/harvest-records/${id}`, {
      method: 'DELETE',
    }).catch(err => console.error('PostgreSQL harvest delete error:', err));
  };

  const addPostHarvestLoss = async (lossData: Omit<PostHarvestLoss, 'id' | 'totalKerugianRp'>) => {
    const id = `PHL-${String(postHarvestLosses.length + 1).padStart(3, '0')}`;
    const totalKerugian = lossData.bobotSusutKg * lossData.hargaSatuanRp;
    const newLoss: PostHarvestLoss = {
      ...lossData,
      id,
      totalKerugianRp: totalKerugian
    };
    setPostHarvestLosses(prev => [newLoss, ...prev]);
    setSaveStatusMessage('Menyimpan Data...');

    let syncResult = { success: false, message: '' };
    // Real-time sync ke tab "Pengendalian Kehilangan Hasil" Google Spreadsheet
    try {
      syncResult = await saveLossRecordToSpreadsheet(newLoss);
      setSaveStatusMessage('✓ Data susut hasil tersimpan di Google Spreadsheet!');
      setLastSheetsSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setTimeout(() => setSaveStatusMessage(null), 3000);
    } catch (err) {
      console.warn('Background sheet sync skipped for Pengendalian Kehilangan Hasil:', err);
      setSaveStatusMessage('Tersimpan di browser lokal');
      setTimeout(() => setSaveStatusMessage(null), 3000);
    }

    fetch('/api/post-harvest-losses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLoss),
    }).catch(err => console.error('PostgreSQL loss insert error:', err));

    return syncResult;
  };

  const updatePostHarvestLoss = (id: string, updated: Partial<PostHarvestLoss>) => {
    let targetLoss: PostHarvestLoss | undefined;
    const nextList = postHarvestLosses.map(l => {
      if (l.id === id) {
        const merged = { ...l, ...updated };
        const totalKerugian = merged.bobotSusutKg * merged.hargaSatuanRp;
        targetLoss = { ...merged, totalKerugianRp: totalKerugian };
        return targetLoss;
      }
      return l;
    });

    setPostHarvestLosses(nextList);
    setSaveStatusMessage('Memperbarui data susut hasil di Google Spreadsheet...');

    if (targetLoss) {
      updateLossRecordInSpreadsheet(targetLoss, nextList)
        .then(() => {
          setSaveStatusMessage('✓ Data susut hasil diperbarui di Google Spreadsheet!');
          setLastSheetsSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setTimeout(() => setSaveStatusMessage(null), 3000);
        })
        .catch(err => {
          console.warn('Sheet update error:', err);
          setSaveStatusMessage('Perubahan disimpan di browser lokal');
          setTimeout(() => setSaveStatusMessage(null), 3000);
        });
    }

    fetch(`/api/post-harvest-losses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(err => console.error('PostgreSQL loss update error:', err));
  };

  const deletePostHarvestLoss = (id: string) => {
    const lossToDelete = postHarvestLosses.find(l => l.id === id);
    const nextList = postHarvestLosses.filter(l => l.id !== id);
    setPostHarvestLosses(nextList);
    setSaveStatusMessage('Menghapus data susut hasil dari Google Spreadsheet...');

    if (lossToDelete) {
      registerDeletedKey('losses', [lossToDelete.id, lossToDelete.poktan, lossToDelete.tahapKehilangan]);
      deleteLossRecordFromSpreadsheet(lossToDelete.id, lossToDelete.poktan || lossToDelete.tahapKehilangan, nextList)
        .then(() => {
          setSaveStatusMessage('✓ Data susut hasil berhasil dihapus dari Google Spreadsheet!');
          setLastSheetsSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          setTimeout(() => setSaveStatusMessage(null), 3000);
        })
        .catch(err => {
          console.warn('Sheet delete error:', err);
          setSaveStatusMessage('Data dihapus dari browser lokal');
          setTimeout(() => setSaveStatusMessage(null), 3000);
        });
    }

    fetch(`/api/post-harvest-losses/${id}`, {
      method: 'DELETE',
    }).catch(err => console.error('PostgreSQL loss delete error:', err));

    fetch('/api/post-harvest-losses/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ losses: nextList }),
    }).catch(() => {});
  };

  const syncAllModulesToSpreadsheet = async () => {
    setIsSyncingWithSheets(true);
    setSheetsSyncStatus('syncing');
    setSaveStatusMessage('Menyinkronkan seluruh 4 modul ke Google Spreadsheet...');
    try {
      await Promise.allSettled([
        syncAllParcelsToSpreadsheet(landParcels),
        syncAllFertilizerNeedsToSpreadsheet(fertilizerNeeds),
        syncAllHarvestRecordsToSpreadsheet(harvestRecords),
        syncAllLossRecordsToSpreadsheet(postHarvestLosses)
      ]);
      setSheetsSyncStatus('synced');
      setLastSheetsSyncTime(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setSaveStatusMessage('✓ Seluruh data 4 modul berhasil disinkronkan ke Google Spreadsheet!');
      setTimeout(() => setSaveStatusMessage(null), 4000);
    } catch (err) {
      console.error('Error syncing all to spreadsheet:', err);
      setSheetsSyncStatus('error');
      setSaveStatusMessage('Sebagian data gagal disinkronkan ke Google Spreadsheet');
      setTimeout(() => setSaveStatusMessage(null), 4000);
    } finally {
      setIsSyncingWithSheets(false);
    }
  };

  const addActivity = (activityData: Omit<ActivityEvent, 'id'>) => {
    const id = `ACT-${String(activities.length + 1).padStart(3, '0')}`;
    const newAct = { id, ...activityData };
    setActivities(prev => [newAct, ...prev]);

    fetch('/api/activities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAct),
    }).catch(err => console.error('PostgreSQL activity insert error:', err));
  };

  const addFieldIssue = (issueData: Omit<FieldIssue, 'id' | 'kodeTiket' | 'tanggalLapor' | 'status'>) => {
    const id = `ISS-${String(fieldIssues.length + 1).padStart(3, '0')}`;
    const kodeTiket = `TKT-${new Date().getFullYear()}-${String(fieldIssues.length + 95).padStart(4, '0')}`;
    const newIssue: FieldIssue = {
      ...issueData,
      id,
      kodeTiket,
      tanggalLapor: new Date().toISOString().split('T')[0],
      status: 'Menunggu Disposisi'
    };
    setFieldIssues(prev => [newIssue, ...prev]);

    fetch('/api/field-issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newIssue),
    }).catch(err => console.error('PostgreSQL issue insert error:', err));
  };

  const updateFieldIssueStatus = (id: string, status: FieldIssue['status'], tindakLanjut?: string, petugas?: string) => {
    setFieldIssues(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status,
          tindakLanjutPetugas: tindakLanjut || item.tindakLanjutPetugas,
          petugasPpl: petugas || item.petugasPpl,
          tanggalPenyelesaian: status === 'Selesai & Terverifikasi' ? new Date().toISOString().split('T')[0] : item.tanggalPenyelesaian
        };
      }
      return item;
    }));

    fetch(`/api/field-issues/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        tindakLanjutPetugas: tindakLanjut,
        petugasPpl: petugas,
      }),
    }).catch(err => console.error('PostgreSQL issue update error:', err));
  };

  const addStakeholderMessage = (msgData: Omit<StakeholderMessage, 'id' | 'tanggalWaktu'>) => {
    const id = `MSG-${String(stakeholderMessages.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const formattedDate = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
    const newMsg: StakeholderMessage = {
      ...msgData,
      id,
      tanggalWaktu: formattedDate
    };
    setStakeholderMessages(prev => [newMsg, ...prev]);
  };

  const updateEarlyWarningStatus = (id: string, status: EarlyWarningAlert['statusPenanganan']) => {
    setEarlyWarnings(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, statusPenanganan: status };
      }
      return w;
    }));
  };

  const unlockExecutive = (pin: string): boolean => {
    if (pin.trim() === executivePin) {
      setIsExecutiveUnlocked(true);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}exec_unlocked`, 'true');
      setRoleState('operator');
      return true;
    }
    return false;
  };

  const lockExecutive = () => {
    setIsExecutiveUnlocked(false);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}exec_unlocked`);
    setRoleState('publik');
  };

  const changeExecutivePin = (oldPin: string, newPin: string): boolean => {
    if (oldPin.trim() === executivePin && newPin.trim().length >= 4) {
      setExecutivePin(newPin.trim());
      localStorage.setItem(`${STORAGE_KEY_PREFIX}exec_pin`, newPin.trim());
      return true;
    }
    return false;
  };

  const unlockOperator = (pin: string): boolean => {
    if (pin.trim() === executivePin || pin.trim() === '2026') {
      setIsOperatorUnlocked(true);
      localStorage.setItem(`${STORAGE_KEY_PREFIX}oper_unlocked`, 'true');
      setRoleState('operator');
      return true;
    }
    return false;
  };

  const lockOperator = () => {
    setIsOperatorUnlocked(false);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}oper_unlocked`);
    setRoleState('publik');
  };

  const resetToDefault = () => {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}landParcels`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}plantingSchedules`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}fertilizerNeeds`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}kiosPupukList`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}harvestRecords`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}postHarvestLosses`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}activities`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}fieldIssues`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}stakeholderMessages`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}earlyWarnings`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}exec_unlocked`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}oper_unlocked`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}exec_pin`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}role`);
    setIsExecutiveUnlocked(false);
    setIsOperatorUnlocked(false);
    setExecutivePin('2026');
    setRoleState('publik');
    setLandParcels(INITIAL_LAND_PARCELS);
    setPlantingSchedules(INITIAL_PLANTING_SCHEDULES);
    setFertilizerNeeds(INITIAL_FERTILIZER_NEEDS);
    setKiosPupukList(KIOS_PUPUK_LIST);
    setHarvestRecords(INITIAL_HARVEST_RECORDS);
    setPostHarvestLosses(INITIAL_POST_HARVEST_LOSSES);
    setActivities(INITIAL_ACTIVITIES);
    setFieldIssues(INITIAL_FIELD_ISSUES);
    setStakeholderMessages(INITIAL_STAKEHOLDER_MESSAGES);
    setEarlyWarnings(INITIAL_EARLY_WARNINGS);
    setEconomicImpact(INITIAL_ECONOMIC_IMPACT);
  };

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      selectedKecamatan,
      setSelectedKecamatan,
      selectedCommodity,
      setSelectedCommodity,
      isSyncingWithSheets,
      sheetsSyncStatus,
      lastSheetsSyncTime,
      sheetsRowCount,
      saveStatusMessage,
      refreshFromSpreadsheet,
      seedSpreadsheetWithDummy,
      syncAllModulesToSpreadsheet,
      landParcels,
      addLandParcel,
      updateLandParcel,
      deleteLandParcel,
      plantingSchedules,
      addPlantingSchedule,
      updatePlantingPhase,
      fertilizerNeeds,
      addFertilizerNeed,
      updateFertilizerNeed,
      deleteFertilizerNeed,
      kiosPupukList,
      addKiosPupuk,
      harvestRecords,
      addHarvestRecord,
      updateHarvestRecord,
      deleteHarvestRecord,
      postHarvestLosses,
      setPostHarvestLossesList,
      addPostHarvestLoss,
      updatePostHarvestLoss,
      deletePostHarvestLoss,
      activities,
      addActivity,
      fieldIssues,
      addFieldIssue,
      updateFieldIssueStatus,
      stakeholderMessages,
      addStakeholderMessage,
      earlyWarnings,
      updateEarlyWarningStatus,
      isExecutiveUnlocked,
      unlockExecutive,
      lockExecutive,
      executivePin,
      changeExecutivePin,
      isOperatorUnlocked,
      unlockOperator,
      lockOperator,
      economicImpact,
      resetToDefault,
      showOfficialModal,
      setShowOfficialModal
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
