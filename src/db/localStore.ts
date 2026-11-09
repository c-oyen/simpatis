import fs from 'fs';
import path from 'path';
import { 
  LandParcel, 
  PlantingSchedule, 
  KiosPupukInfo, 
  FertilizerNeedRecord, 
  HarvestRecord, 
  PostHarvestLoss, 
  FieldIssue, 
  ActivityEvent 
} from '../types/index.ts';
import { 
  INITIAL_LAND_PARCELS, 
  INITIAL_PLANTING_SCHEDULES, 
  INITIAL_FERTILIZER_NEEDS, 
  KIOS_PUPUK_LIST, 
  INITIAL_HARVEST_RECORDS, 
  INITIAL_POST_HARVEST_LOSSES, 
  INITIAL_FIELD_ISSUES, 
  INITIAL_ACTIVITIES 
} from '../data/bangkaData.ts';

interface DatabaseData {
  landParcels: LandParcel[];
  plantingSchedules: PlantingSchedule[];
  fertilizerNeeds: FertilizerNeedRecord[];
  kiosPupuk: KiosPupukInfo[];
  harvestRecords: HarvestRecord[];
  postHarvestLosses: PostHarvestLoss[];
  fieldIssues: FieldIssue[];
  activities: ActivityEvent[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'simpatis_database.json');

class LocalStore {
  private data: DatabaseData;
  private initialized = false;

  constructor() {
    this.data = this.getDefaultData();
    this.init();
  }

  private getDefaultData(): DatabaseData {
    return {
      landParcels: JSON.parse(JSON.stringify(INITIAL_LAND_PARCELS)),
      plantingSchedules: JSON.parse(JSON.stringify(INITIAL_PLANTING_SCHEDULES)),
      fertilizerNeeds: JSON.parse(JSON.stringify(INITIAL_FERTILIZER_NEEDS)),
      kiosPupuk: JSON.parse(JSON.stringify(KIOS_PUPUK_LIST)),
      harvestRecords: JSON.parse(JSON.stringify(INITIAL_HARVEST_RECORDS)),
      postHarvestLosses: JSON.parse(JSON.stringify(INITIAL_POST_HARVEST_LOSSES)),
      fieldIssues: JSON.parse(JSON.stringify(INITIAL_FIELD_ISSUES)),
      activities: JSON.parse(JSON.stringify(INITIAL_ACTIVITIES)),
    };
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        if (fileContent.trim()) {
          const parsed = JSON.parse(fileContent);
          this.data = {
            landParcels: parsed.landParcels?.length ? parsed.landParcels : this.data.landParcels,
            plantingSchedules: parsed.plantingSchedules?.length ? parsed.plantingSchedules : this.data.plantingSchedules,
            fertilizerNeeds: parsed.fertilizerNeeds?.length ? parsed.fertilizerNeeds : this.data.fertilizerNeeds,
            kiosPupuk: parsed.kiosPupuk?.length ? parsed.kiosPupuk : this.data.kiosPupuk,
            harvestRecords: parsed.harvestRecords?.length ? parsed.harvestRecords : this.data.harvestRecords,
            postHarvestLosses: parsed.postHarvestLosses?.length ? parsed.postHarvestLosses : this.data.postHarvestLosses,
            fieldIssues: parsed.fieldIssues?.length ? parsed.fieldIssues : this.data.fieldIssues,
            activities: parsed.activities?.length ? parsed.activities : this.data.activities,
          };
          this.initialized = true;
          return;
        }
      }

      this.saveToFile();
      this.initialized = true;
    } catch (err) {
      console.warn('Failed to load local database from file, using in-memory store:', err);
      this.initialized = true;
    }
  }

  private saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error persisting database to file:', err);
    }
  }

  // --- Land Parcels ---
  getLandParcels(): LandParcel[] {
    return [...this.data.landParcels];
  }

  createLandParcel(parcel: LandParcel): LandParcel {
    this.data.landParcels = [parcel, ...this.data.landParcels.filter(p => p.id !== parcel.id)];
    this.saveToFile();
    return parcel;
  }

  updateLandParcel(id: string, updated: Partial<LandParcel>): LandParcel | null {
    const idx = this.data.landParcels.findIndex(p => p.id === id);
    if (idx === -1) return null;
    this.data.landParcels[idx] = {
      ...this.data.landParcels[idx],
      ...updated,
      terakhirDiperbarui: new Date().toISOString().split('T')[0]
    };
    this.saveToFile();
    return this.data.landParcels[idx];
  }

  deleteLandParcel(id: string): boolean {
    const prevLen = this.data.landParcels.length;
    this.data.landParcels = this.data.landParcels.filter(p => p.id !== id);
    if (this.data.landParcels.length !== prevLen) {
      this.saveToFile();
      return true;
    }
    return false;
  }

  // --- Fertilizer Needs ---
  getFertilizerNeeds(): FertilizerNeedRecord[] {
    return [...this.data.fertilizerNeeds];
  }

  createFertilizerNeed(need: FertilizerNeedRecord): FertilizerNeedRecord {
    this.data.fertilizerNeeds = [need, ...this.data.fertilizerNeeds.filter(n => n.id !== need.id)];
    this.saveToFile();
    return need;
  }

  updateFertilizerNeed(id: string, updated: Partial<FertilizerNeedRecord>): FertilizerNeedRecord | null {
    const idx = this.data.fertilizerNeeds.findIndex(n => n.id === id);
    if (idx === -1) return null;
    this.data.fertilizerNeeds[idx] = { ...this.data.fertilizerNeeds[idx], ...updated };
    this.saveToFile();
    return this.data.fertilizerNeeds[idx];
  }

  deleteFertilizerNeed(id: string): boolean {
    const prevLen = this.data.fertilizerNeeds.length;
    this.data.fertilizerNeeds = this.data.fertilizerNeeds.filter(n => n.id !== id);
    if (this.data.fertilizerNeeds.length !== prevLen) {
      this.saveToFile();
      return true;
    }
    return false;
  }

  // --- Kios Pupuk ---
  getKiosPupuk(): KiosPupukInfo[] {
    return [...this.data.kiosPupuk];
  }

  // --- Planting Schedules ---
  getPlantingSchedules(): PlantingSchedule[] {
    return [...this.data.plantingSchedules];
  }

  // --- Harvest Records ---
  getHarvestRecords(): HarvestRecord[] {
    return [...this.data.harvestRecords];
  }

  createHarvestRecord(record: HarvestRecord): HarvestRecord {
    this.data.harvestRecords = [record, ...this.data.harvestRecords.filter(r => r.id !== record.id)];
    this.saveToFile();
    return record;
  }

  updateHarvestRecord(id: string, updated: Partial<HarvestRecord>): HarvestRecord | null {
    const idx = this.data.harvestRecords.findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data.harvestRecords[idx] = { ...this.data.harvestRecords[idx], ...updated };
    this.saveToFile();
    return this.data.harvestRecords[idx];
  }

  deleteHarvestRecord(id: string): boolean {
    const prevLen = this.data.harvestRecords.length;
    this.data.harvestRecords = this.data.harvestRecords.filter(r => r.id !== id);
    if (this.data.harvestRecords.length !== prevLen) {
      this.saveToFile();
      return true;
    }
    return false;
  }

  // --- Post Harvest Losses ---
  getPostHarvestLosses(): PostHarvestLoss[] {
    return [...this.data.postHarvestLosses];
  }

  createPostHarvestLoss(loss: PostHarvestLoss): PostHarvestLoss {
    this.data.postHarvestLosses = [loss, ...this.data.postHarvestLosses.filter(l => l.id !== loss.id)];
    this.saveToFile();
    return loss;
  }

  updatePostHarvestLoss(id: string, updated: Partial<PostHarvestLoss>): PostHarvestLoss | null {
    const idx = this.data.postHarvestLosses.findIndex(l => l.id === id);
    if (idx === -1) return null;
    this.data.postHarvestLosses[idx] = { ...this.data.postHarvestLosses[idx], ...updated };
    this.saveToFile();
    return this.data.postHarvestLosses[idx];
  }

  deletePostHarvestLoss(id: string): boolean {
    const prevLen = this.data.postHarvestLosses.length;
    this.data.postHarvestLosses = this.data.postHarvestLosses.filter(l => l.id !== id);
    if (this.data.postHarvestLosses.length !== prevLen) {
      this.saveToFile();
      return true;
    }
    return false;
  }

  // --- Field Issues ---
  getFieldIssues(): FieldIssue[] {
    return [...this.data.fieldIssues];
  }

  createFieldIssue(issue: FieldIssue): FieldIssue {
    this.data.fieldIssues = [issue, ...this.data.fieldIssues.filter(i => i.id !== issue.id)];
    this.saveToFile();
    return issue;
  }

  updateFieldIssue(id: string, updated: Partial<FieldIssue>): FieldIssue | null {
    const idx = this.data.fieldIssues.findIndex(i => i.id === id);
    if (idx === -1) return null;
    this.data.fieldIssues[idx] = { ...this.data.fieldIssues[idx], ...updated };
    this.saveToFile();
    return this.data.fieldIssues[idx];
  }

  // --- Activities ---
  getActivities(): ActivityEvent[] {
    return [...this.data.activities];
  }

  createActivity(activity: ActivityEvent): ActivityEvent {
    this.data.activities = [activity, ...this.data.activities.filter(a => a.id !== activity.id)];
    this.saveToFile();
    return activity;
  }
}

export const localStore = new LocalStore();
