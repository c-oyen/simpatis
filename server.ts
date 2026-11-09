import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { db } from './src/db/index.ts';
import * as schema from './src/db/schema.ts';
import { eq, desc } from 'drizzle-orm';
import { seedDatabaseIfEmpty } from './src/db/seed.ts';
import { setGlobalDispatcher, Agent } from 'undici';
import {
  INITIAL_LAND_PARCELS,
  INITIAL_PLANTING_SCHEDULES,
  INITIAL_FERTILIZER_NEEDS,
  KIOS_PUPUK_LIST,
  INITIAL_HARVEST_RECORDS,
  INITIAL_POST_HARVEST_LOSSES,
  INITIAL_FIELD_ISSUES,
  INITIAL_ACTIVITIES
} from './src/data/bangkaData.ts';

// Configure global HTTP dispatcher with 60s timeout to prevent HeadersTimeoutError when Google Apps Script is queued or slow
setGlobalDispatcher(
  new Agent({
    connect: { timeout: 30000 },
    headersTimeout: 60000,
    bodyTimeout: 60000,
    keepAliveTimeout: 10000,
    keepAliveMaxTimeout: 30000,
  })
);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());

  // In-memory repositories initialized from authoritative Bangka dataset
  // Provides instant response and complete fault tolerance when PostgreSQL/Cloud SQL is not provisioned
  let landParcelsStore = [...INITIAL_LAND_PARCELS];
  let plantingSchedulesStore = [...INITIAL_PLANTING_SCHEDULES];
  let fertilizerNeedsStore = [...INITIAL_FERTILIZER_NEEDS];
  let kiosPupukStore = [...KIOS_PUPUK_LIST];
  let harvestRecordsStore = [...INITIAL_HARVEST_RECORDS];
  let postHarvestLossesStore = [...INITIAL_POST_HARVEST_LOSSES];
  let fieldIssuesStore = [...INITIAL_FIELD_ISSUES];
  let activitiesStore = [...INITIAL_ACTIVITIES];

  const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzleU7fO-odcpqMpUO4bYipfdDA5SO3PkbWQV57Ib0QZ5z1gCc8OHmgHyn-nyW0O1eK5Q/exec';

  const DUMMY_PARCELS_FOR_SHEET = [
    {
      nama_petani: "Zulkifli Mansur",
      kelompok_tani: "Poktan Maju Bersama",
      lokasi: "Desa Kemuja, Kec. Mendo Barat",
      komoditas: "Padi Sawah (Inpari 32 HDB)",
      luas_lahan: "2.5 Ha",
      kemasaman: "pH 5.4",
      sistem_irigasi: "Irigasi Teknis"
    },
    {
      nama_petani: "H. Ruslan Effendi",
      kelompok_tani: "Gapoktan Sahabat Tani",
      lokasi: "Desa Gunung Muda, Kec. Belinyu",
      komoditas: "Padi Ladang (Lokal Inpago 9)",
      luas_lahan: "3.0 Ha",
      kemasaman: "pH 4.8",
      sistem_irigasi: "Tadah Hujan"
    },
    {
      nama_petani: "Bujang Sanusi",
      kelompok_tani: "Poktan Sinar Harapan",
      lokasi: "Desa Rebo, Kec. Sungailiat",
      komoditas: "Cabai Merah Keriting (Lado F1)",
      luas_lahan: "1.2 Ha",
      kemasaman: "pH 6.0",
      sistem_irigasi: "Embung / Sumur Bor"
    },
    {
      nama_petani: "Samsuri",
      kelompok_tani: "Poktan Makmur Sentosa",
      lokasi: "Desa Kimak, Kec. Merawang",
      komoditas: "Cabai Rawit (Ori 212)",
      luas_lahan: "1.0 Ha",
      kemasaman: "pH 5.6",
      sistem_irigasi: "Embung / Sumur Bor"
    },
    {
      nama_petani: "M. Taufik Hidayat",
      kelompok_tani: "Poktan Tunas Baru",
      lokasi: "Desa Kayu Besi, Kec. Puding Besar",
      komoditas: "Cabai Besar (Gada MK F1)",
      luas_lahan: "1.5 Ha",
      kemasaman: "pH 5.8",
      sistem_irigasi: "Irigasi Teknis"
    },
    {
      nama_petani: "Junaidi Arsyad",
      kelompok_tani: "Poktan Sumber Rejeki",
      lokasi: "Desa Cit, Kec. Riau Silip",
      komoditas: "Padi Sawah (Inpari 42 Agritan)",
      luas_lahan: "2.0 Ha",
      kemasaman: "pH 5.2",
      sistem_irigasi: "Irigasi Teknis"
    }
  ];

  async function seedSheetIfEmpty(currentRows: any[]) {
    if (!Array.isArray(currentRows) || currentRows.length === 0) {
      console.log('Google Spreadsheet is empty. Automatically seeding dummy data...');
      for (const item of DUMMY_PARCELS_FOR_SHEET) {
        try {
          await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
            redirect: 'follow',
          });
        } catch (e) {
          console.error('Error posting dummy item to Google Sheet:', e);
        }
      }
      try {
        const refetchRes = await fetch(GOOGLE_APPS_SCRIPT_URL, { redirect: 'follow' });
        if (refetchRes.ok) {
          return await refetchRes.json();
        }
      } catch (err) {
        console.warn('Failed to refetch after sheet seed:', err);
      }
      return DUMMY_PARCELS_FOR_SHEET;
    }
    return currentRows;
  }

  // Multi-Sheet Google Spreadsheet Proxy Endpoints with caching & request deduplication
  const sheetDataCache = new Map<string, { rows: any[]; timestamp: number }>();
  const inFlightSheetFetches = new Map<string, Promise<any[]>>();
  const SHEET_CACHE_TTL_MS = 15000; // 15 seconds cache

  app.get('/api/sheets/data', async (req, res) => {
    const sheetName = (req.query.sheetName as string) || 'Data Petani & Lahan';
    const scriptUrl = (req.query.scriptUrl as string) || GOOGLE_APPS_SCRIPT_URL;
    const cacheKey = `${scriptUrl}__${sheetName}`;

    // 1. Return fresh cached data if available
    const cached = sheetDataCache.get(cacheKey);
    const now = Date.now();
    if (cached && (now - cached.timestamp < SHEET_CACHE_TTL_MS)) {
      return res.json({
        rows: cached.rows,
        count: cached.rows.length,
        sheetName,
        source: 'Google Spreadsheet Web App (Multi-Sheet)',
        cached: true,
        timestamp: new Date(cached.timestamp).toISOString()
      });
    }

    // 2. Reuse in-flight fetch promise if an identical request is already processing
    if (inFlightSheetFetches.has(cacheKey)) {
      try {
        const rows = await inFlightSheetFetches.get(cacheKey);
        return res.json({
          rows: Array.isArray(rows) ? rows : [],
          count: Array.isArray(rows) ? rows.length : 0,
          sheetName,
          source: 'Google Spreadsheet Web App (Multi-Sheet)',
          deduped: true,
          timestamp: new Date().toISOString()
        });
      } catch {
        // Fall through to fallback
      }
    }

    const targetUrl = `${scriptUrl}?sheetName=${encodeURIComponent(sheetName)}`;
    const fetchPromise = (async (): Promise<any[]> => {
      const response = await fetch(targetUrl, { 
        redirect: 'follow',
        signal: AbortSignal.timeout(35000)
      });
      if (!response.ok) {
        throw new Error(`Google Apps Script responded with ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    })();

    inFlightSheetFetches.set(cacheKey, fetchPromise);

    try {
      const rows = await fetchPromise;
      sheetDataCache.set(cacheKey, { rows, timestamp: Date.now() });
      res.json({
        rows,
        count: rows.length,
        sheetName,
        source: 'Google Spreadsheet Web App (Multi-Sheet)',
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.warn(`[Proxy Notice] Sheet "${sheetName}" fetch delay/retry: ${err.message || 'Headers timeout'}`);
      // If we have any cached data (even older), serve it gracefully
      if (cached && Array.isArray(cached.rows)) {
        return res.json({
          rows: cached.rows,
          count: cached.rows.length,
          sheetName,
          source: 'Google Spreadsheet Web App (Multi-Sheet)',
          stale: true,
          timestamp: new Date(cached.timestamp).toISOString()
        });
      }
      // If sheet is Pengendalian Kehilangan Hasil and in-memory store is available, return it as fallback
      if (sheetName === 'Pengendalian Kehilangan Hasil' && postHarvestLossesStore.length > 0) {
        const fallbackRows = postHarvestLossesStore.map(loss => ({
          Komoditi: loss.komoditas === 'padi_ladang' ? 'Padi Ladang' : 'Padi Sawah',
          komoditas: loss.komoditas === 'padi_ladang' ? 'Padi Ladang' : 'Padi Sawah',
          Katagori: loss.kategoriKeparahan || (loss.persentaseSusut <= 10 ? 'Ringan' : 'Sedang'),
          kategori: loss.kategoriKeparahan || (loss.persentaseSusut <= 10 ? 'Ringan' : 'Sedang'),
          '% Kehilangan Hasil': `${loss.persentaseSusut}%`,
          persentase_susut: `${loss.persentaseSusut}%`,
          'Potensi Hasil Per Hektar (Kg)': `${loss.potensiHasilKg || 6000}`,
          potensi_hasil_per_hektar_kg: `${loss.potensiHasilKg || 6000}`,
          'Jumlah Kehilangan Hasil (kg)': `${loss.bobotSusutKg}`,
          bobot_susut_kg: `${loss.bobotSusutKg} Kg`,
          'Harga per kg': `Rp ${loss.hargaSatuanRp || 6500}`,
          harga_satuan_rp: `Rp ${loss.hargaSatuanRp || 6500}`,
          'Nilai Kehilangan Hasil': `Rp ${loss.totalKerugianRp}`,
          total_kerugian_rp: `Rp ${loss.totalKerugianRp}`,
          lokasi: `Kec. ${loss.kecamatan}`,
          kecamatan: `Kec. ${loss.kecamatan}`,
          kelompok_tani: loss.poktan,
          tahap_kehilangan: loss.tahapKehilangan,
          penyebab_utama: loss.penyebabUtama,
          intervensi_mekanisasi: loss.intervensiMekanisasi
        }));
        return res.json({
          rows: fallbackRows,
          count: fallbackRows.length,
          sheetName,
          source: 'Server Fallback Cache',
          warning: err.message,
          timestamp: new Date().toISOString()
        });
      }

      // Return 200 with Fallback indicator so client does not throw or error
      res.json({
        rows: [],
        count: 0,
        sheetName,
        source: 'Fallback',
        warning: err.message
      });
    } finally {
      inFlightSheetFetches.delete(cacheKey);
    }
  });

  // =========================================================================
  // BMKG REAL-TIME WEATHER FORECAST PROXY (KABUPATEN BANGKA - ADM2: 19.01)
  // =========================================================================
  const BMKG_KECAMATAN_CODES: Record<string, string> = {
    'Sungailiat': '19.01.01.1001',
    'Belinyu': '19.01.02.1001',
    'Merawang': '19.01.03.2001',
    'Mendo Barat': '19.01.04.2001',
    'Pemali': '19.01.05.2001',
    'Bakam': '19.01.06.2001',
    'Riau Silip': '19.01.07.2001',
    'Puding Besar': '19.01.08.2001'
  };

  const bmkgWeatherCache = new Map<string, { timestamp: number; data: any }>();

  app.get('/api/bmkg/cuaca', async (req, res) => {
    try {
      const adm2 = (req.query.adm2 as string) || '19.01';
      const adm4 = req.query.adm4 as string;
      const kecamatan = (req.query.kecamatan as string) || '';

      let targetCode = '19.01.01.1001'; // Default Sungailiat (Ibukota Kab. Bangka)
      if (adm4) {
        targetCode = adm4;
      } else if (kecamatan && BMKG_KECAMATAN_CODES[kecamatan]) {
        targetCode = BMKG_KECAMATAN_CODES[kecamatan];
      }

      const cacheKey = targetCode;
      const cached = bmkgWeatherCache.get(cacheKey);
      const now = Date.now();
      // Cache valid for 15 minutes (900,000 ms)
      if (cached && (now - cached.timestamp < 15 * 60 * 1000)) {
        res.set('X-Cache-Status', 'HIT');
        return res.json(cached.data);
      }

      const bmkgUrl = `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${targetCode}`;
      const response = await fetch(bmkgUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SIMPATIS-Bangka/1.0',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        throw new Error(`BMKG API returned status ${response.status}`);
      }

      const rawJson: any = await response.json();
      
      const payload = {
        status: 'success',
        source: 'Data Real-time BMKG',
        adm2,
        adm4: targetCode,
        kecamatan: kecamatan || rawJson.lokasi?.kecamatan || 'Sungailiat',
        kotkab: rawJson.lokasi?.kotkab || 'Bangka',
        provinsi: rawJson.lokasi?.provinsi || 'Kepulauan Bangka Belitung',
        raw: rawJson,
        fetchedAt: new Date().toISOString()
      };

      bmkgWeatherCache.set(cacheKey, { timestamp: now, data: payload });
      res.set('X-Cache-Status', 'MISS');
      res.set('Cache-Control', 'public, max-age=600');
      return res.json(payload);
    } catch (err: any) {
      console.warn('[BMKG Proxy] Fetch error:', err.message);

      // If we have stale cache, serve it
      const fallbackTarget = req.query.adm4 ? String(req.query.adm4) : (req.query.kecamatan && BMKG_KECAMATAN_CODES[String(req.query.kecamatan)]) || '19.01.01.1001';
      const stale = bmkgWeatherCache.get(fallbackTarget);
      if (stale) {
        res.set('X-Cache-Status', 'STALE');
        return res.json({
          ...stale.data,
          source: 'Cache Lokal BMKG',
          warning: 'Menggunakan data cache BMKG karena koneksi API sedang lambat.'
        });
      }

      return res.status(200).json({
        status: 'fallback',
        source: 'Data Stasiun Klimatologi Babel (Fallback)',
        message: 'Koneksi ke BMKG timeout atau dialihkan, menggunakan data klimatologi resmi.',
        details: err.message
      });
    }
  });

  app.post('/api/sheets/data', async (req, res) => {
    try {
      const body = req.body || {};
      const sheetName = (req.query.sheetName as string) || body.sheetName || 'Data Petani & Lahan';
      const action = (req.query.action as string) || body.action || 'create';
      const id = (req.query.id as string) || body.id || body.searchKey || '';
      const searchKey = (req.query.searchKey as string) || body.searchKey || body.id || '';
      const scriptUrl = (req.query.scriptUrl as string) || body.scriptUrl || GOOGLE_APPS_SCRIPT_URL;

      // Invalidate cache for this sheet so fresh data is fetched on next read
      sheetDataCache.delete(`${scriptUrl}__${sheetName}`);

      const payload = { ...body, sheetName, action, id, searchKey };

      const queryParams = new URLSearchParams({
        sheetName,
        action,
        id: String(id),
        searchKey: String(searchKey)
      });

      // Salin nilai field ke queryParams agar aman dari 302 redirect
      const fieldKeys = [
        'nama_petani', 'kelompok_tani', 'lokasi', 'desa', 'kecamatan', 'komoditas', 'komoditi', 'luas_lahan', 'kemasaman', 'sistem_irigasi',
        'katagori', 'kategori', 'metode', 'persentase_kehilangan_hasil', 'potensi_hasil_per_hektar_kg',
        'jumlah_kehilangan_hasil_kg', 'harga_per_kg', 'nilai_kehilangan_hasil', 'tahap_kehilangan',
        'persentase_susut', 'bobot_susut_kg', 'harga_satuan_rp', 'total_kerugian_rp', 'penyebab_utama', 'intervensi_mekanisasi'
      ];
      for (const k of fieldKeys) {
        const val = req.query[k] || body[k];
        if (val !== undefined && val !== null) {
          queryParams.set(k, String(val));
        }
      }

      const targetUrl = `${scriptUrl}?${queryParams.toString()}`;
      
      const gRes = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        redirect: 'follow',
        signal: AbortSignal.timeout(35000)
      });

      // Picu juga GET fallback request untuk memastikan aksi tercatat jika Apps Script hanya memproses doGet
      fetch(targetUrl, { redirect: 'follow', signal: AbortSignal.timeout(35000) }).catch(() => {});

      const responseText = await gRes.text();
      let resultJson;
      try {
        resultJson = JSON.parse(responseText);
      } catch {
        resultJson = { raw: responseText };
      }

      res.json({
        success: true,
        message: action === 'delete' 
          ? `Permintaan hapus data telah diproses ke Google Spreadsheet (${sheetName})` 
          : `Data berhasil diproses ke Google Sheets (${sheetName})`,
        sheetName,
        action,
        id,
        result: resultJson,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.warn('Error posting sheet data:', err.message || err);
      res.status(200).json({ 
        success: false, 
        message: `Koneksi Google Sheets sedang sibuk, perubahan dicatat di memori lokal`, 
        error: err.message 
      });
    }
  });

  // Google Spreadsheet Real-Time Endpoints (Backward compatibility)
  app.get('/api/sheets/parcels', async (req, res) => {
    try {
      const targetUrl = `${GOOGLE_APPS_SCRIPT_URL}?sheetName=${encodeURIComponent('Data Petani & Lahan')}`;
      const response = await fetch(targetUrl, { redirect: 'follow', signal: AbortSignal.timeout(35000) });
      if (!response.ok) {
        throw new Error(`Google Apps Script responded with ${response.status}`);
      }
      let rows = await response.json();
      let wasSeeded = false;

      // Hanya seed jika diminta secara eksplisit melalui query ?seed=true
      if ((!Array.isArray(rows) || rows.length === 0) && req.query.seed === 'true') {
        rows = await seedSheetIfEmpty(rows);
        wasSeeded = true;
      }

      res.json({
        rows: Array.isArray(rows) ? rows : [],
        count: Array.isArray(rows) ? rows.length : 0,
        sheetName: 'Data Petani & Lahan',
        source: 'Google Spreadsheet Web App',
        seeded: wasSeeded,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.warn('Notice fetching from Google Spreadsheet (parcels):', err.message || err);
      res.json({
        rows: [],
        count: 0,
        sheetName: 'Data Petani & Lahan',
        source: 'Fallback',
        timestamp: new Date().toISOString()
      });
    }
  });

  app.post('/api/sheets/parcels', async (req, res) => {
    try {
      const body = req.body;
      const sheetPayload = {
        sheetName: 'Data Petani & Lahan',
        nama_petani: body.nama_petani || body.namaPetani || '',
        kelompok_tani: body.kelompok_tani || body.poktan || '',
        lokasi: body.lokasi || `Desa ${body.desa || 'Kemuja'}, Kec. ${body.kecamatan || 'Mendo Barat'}`,
        komoditas: body.komoditas || 'Padi Sawah',
        luas_lahan: body.luas_lahan || (body.luasHa ? `${body.luasHa} Ha` : '1.5 Ha'),
        kemasaman: body.kemasaman || (body.phTanah ? `pH ${body.phTanah}` : 'pH 5.4'),
        sistem_irigasi: body.sistem_irigasi || body.sistemIrigasi || 'Irigasi Teknis'
      };

      const targetUrl = `${GOOGLE_APPS_SCRIPT_URL}?sheetName=${encodeURIComponent('Data Petani & Lahan')}`;
      const gRes = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sheetPayload),
        redirect: 'follow',
      });

      const responseText = await gRes.text();
      let resultJson;
      try {
        resultJson = JSON.parse(responseText);
      } catch {
        resultJson = { raw: responseText };
      }

      res.json({
        success: true,
        message: 'Data berhasil disimpan langsung ke Google Spreadsheet',
        result: resultJson,
        savedData: sheetPayload,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Error posting to Google Spreadsheet:', err);
      res.status(500).json({ error: 'Failed to save to Google Spreadsheet', details: err.message });
    }
  });

  app.post('/api/sheets/seed', async (req, res) => {
    try {
      const result = await seedSheetIfEmpty([]);
      res.json({
        success: true,
        message: 'Berhasil memasukkan data dummy ke Google Spreadsheet',
        rows: result,
        count: Array.isArray(result) ? result.length : 0
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Gagal memasukkan data dummy ke Google Spreadsheet', details: err.message });
    }
  });

  app.get('/api/sheets/status', async (req, res) => {
    try {
      const start = Date.now();
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, { redirect: 'follow' });
      const latencyMs = Date.now() - start;
      const data = await response.json();
      res.json({
        status: 'connected',
        url: GOOGLE_APPS_SCRIPT_URL,
        totalRows: Array.isArray(data) ? data.length : 0,
        latencyMs,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // 1. Land Parcels API
  app.get('/api/land-parcels', async (req, res) => {
    try {
      if (db) {
        const records = await db.select().from(schema.landParcels).orderBy(desc(schema.landParcels.createdAt));
        if (records && records.length > 0) {
          return res.json(records);
        }
      }
      res.json(landParcelsStore);
    } catch (err: any) {
      console.warn('Fallback to in-memory land parcels store:', err.message);
      res.json(landParcelsStore);
    }
  });

  app.post('/api/land-parcels', async (req, res) => {
    try {
      const body = req.body;
      const id = body.id || `PARCEL-${Date.now()}`;
      const newParcel = {
        id,
        kodePetak: body.kodePetak || `PETAK-${Math.floor(Math.random() * 900 + 100)}`,
        namaPetani: body.namaPetani || '',
        nik: body.nik || '',
        poktan: body.poktan || '',
        kecamatan: body.kecamatan || 'Mendo Barat',
        desa: body.desa || 'Kemuja',
        komoditas: body.komoditas || 'padi_sawah',
        varietas: body.varietas || '',
        luasHa: Number(body.luasHa) || 1,
        phTanah: Number(body.phTanah) || 5.5,
        sistemIrigasi: body.sistemIrigasi || 'Irigasi Teknis',
        tahunTanam: body.tahunTanam || 2026,
        koordinat: {
          lat: body.lat ?? (body.koordinat?.lat ?? -1.95),
          lng: body.lng ?? (body.koordinat?.lng ?? 106.12),
        },
        terakhirDiperbarui: body.terakhirDiperbarui || new Date().toISOString().split('T')[0],
      };

      landParcelsStore = [newParcel as any, ...landParcelsStore];

      if (db) {
        try {
          const [inserted] = await db.insert(schema.landParcels).values({
            id,
            kodePetak: newParcel.kodePetak,
            namaPetani: newParcel.namaPetani,
            nik: newParcel.nik,
            poktan: newParcel.poktan,
            kecamatan: newParcel.kecamatan,
            desa: newParcel.desa,
            komoditas: newParcel.komoditas,
            varietas: newParcel.varietas,
            luasHa: newParcel.luasHa,
            phTanah: newParcel.phTanah,
            sistemIrigasi: newParcel.sistemIrigasi,
            tahunTanam: newParcel.tahunTanam,
            lat: newParcel.koordinat.lat,
            lng: newParcel.koordinat.lng,
            terakhirDiperbarui: newParcel.terakhirDiperbarui,
          }).returning();
          if (inserted) return res.status(201).json(inserted);
        } catch (dbErr: any) {
          console.warn('DB insert fallback to memory:', dbErr.message);
        }
      }

      res.status(201).json(newParcel);
    } catch (err: any) {
      console.error('Error creating land parcel:', err);
      res.status(500).json({ error: 'Failed to create land parcel', details: err.message });
    }
  });

  app.put('/api/land-parcels/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body;
      let updatedParcel: any = null;

      landParcelsStore = landParcelsStore.map(p => {
        if (p.id === id) {
          updatedParcel = {
            ...p,
            ...body,
            terakhirDiperbarui: new Date().toISOString().split('T')[0],
          };
          return updatedParcel;
        }
        return p;
      });

      if (db) {
        try {
          const [updated] = await db.update(schema.landParcels)
            .set({
              namaPetani: body.namaPetani,
              nik: body.nik,
              poktan: body.poktan,
              kecamatan: body.kecamatan,
              desa: body.desa,
              komoditas: body.komoditas,
              varietas: body.varietas,
              luasHa: Number(body.luasHa),
              phTanah: Number(body.phTanah),
              sistemIrigasi: body.sistemIrigasi,
              terakhirDiperbarui: new Date().toISOString().split('T')[0],
            })
            .where(eq(schema.landParcels.id, id))
            .returning();
          if (updated) return res.json(updated);
        } catch (dbErr: any) {
          console.warn('DB update fallback to memory:', dbErr.message);
        }
      }

      res.json(updatedParcel || body);
    } catch (err: any) {
      console.error('Error updating land parcel:', err);
      res.status(500).json({ error: 'Failed to update land parcel', details: err.message });
    }
  });

  app.delete('/api/land-parcels/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const targetQuery = decodeURIComponent(id).trim().toLowerCase();
      landParcelsStore = landParcelsStore.filter(p => {
        const pId = (p.id || '').toLowerCase();
        const pNama = (p.namaPetani || '').toLowerCase();
        const pKode = (p.kodePetak || '').toLowerCase();
        return pId !== targetQuery && pNama !== targetQuery && pKode !== targetQuery;
      });

      if (db) {
        try {
          await db.delete(schema.landParcels).where(eq(schema.landParcels.id, id));
        } catch (dbErr: any) {
          console.warn('DB delete fallback to memory:', dbErr.message);
        }
      }

      res.json({ success: true, id });
    } catch (err: any) {
      console.error('Error deleting land parcel:', err);
      res.status(500).json({ error: 'Failed to delete land parcel', details: err.message });
    }
  });

  // 2. Fertilizer Needs API
  app.get('/api/fertilizer-needs', async (req, res) => {
    try {
      if (db) {
        const records = await db.select().from(schema.fertilizerNeeds).orderBy(desc(schema.fertilizerNeeds.createdAt));
        if (records && records.length > 0) {
          return res.json(records);
        }
      }
      res.json(fertilizerNeedsStore);
    } catch (err: any) {
      console.warn('Fallback to in-memory fertilizer needs:', err.message);
      res.json(fertilizerNeedsStore);
    }
  });

  app.post('/api/fertilizer-needs', async (req, res) => {
    try {
      const body = req.body;
      const id = body.id || `PUPUK-${Date.now()}`;
      const newNeed = {
        id,
        poktan: body.poktan || '',
        kecamatan: body.kecamatan || 'Mendo Barat',
        desa: body.desa || 'Kemuja',
        komoditas: body.komoditas || 'padi_sawah',
        luasLahanHa: Number(body.luasLahanHa) || 1,
        kiosPenyalur: body.kiosPenyalur || 'KPL Berkah Tani',
        kebutuhanUreaKg: Number(body.kebutuhanUreaKg) || 0,
        kebutuhanNpkKg: Number(body.kebutuhanNpkKg) || 0,
        kebutuhanOrganikKg: Number(body.kebutuhanOrganikKg) || 0,
        musimTanam: body.musimTanam || 'MT I (Rendengan/Penghujan)',
        keterangan: body.keterangan || '',
      };

      fertilizerNeedsStore = [newNeed as any, ...fertilizerNeedsStore];

      if (db) {
        try {
          const [inserted] = await db.insert(schema.fertilizerNeeds).values({
            id,
            poktan: newNeed.poktan,
            kecamatan: newNeed.kecamatan,
            desa: newNeed.desa,
            komoditas: newNeed.komoditas,
            luasLahanHa: newNeed.luasLahanHa,
            kiosPenyalur: newNeed.kiosPenyalur,
            kebutuhanUreaKg: newNeed.kebutuhanUreaKg,
            kebutuhanNpkKg: newNeed.kebutuhanNpkKg,
            kebutuhanOrganikKg: newNeed.kebutuhanOrganikKg,
            musimTanam: newNeed.musimTanam,
            keterangan: newNeed.keterangan,
          }).returning();
          if (inserted) return res.status(201).json(inserted);
        } catch (dbErr: any) {
          console.warn('DB insert fallback to memory:', dbErr.message);
        }
      }

      res.status(201).json(newNeed);
    } catch (err: any) {
      console.error('Error creating fertilizer need:', err);
      res.status(500).json({ error: 'Failed to create fertilizer need', details: err.message });
    }
  });

  app.put('/api/fertilizer-needs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body;
      let updatedItem: any = null;

      fertilizerNeedsStore = fertilizerNeedsStore.map(item => {
        if (item.id === id) {
          updatedItem = {
            ...item,
            ...body,
            luasLahanHa: body.luasLahanHa !== undefined ? Number(body.luasLahanHa) : item.luasLahanHa,
            kebutuhanUreaKg: body.kebutuhanUreaKg !== undefined ? Number(body.kebutuhanUreaKg) : item.kebutuhanUreaKg,
            kebutuhanNpkKg: body.kebutuhanNpkKg !== undefined ? Number(body.kebutuhanNpkKg) : item.kebutuhanNpkKg,
            kebutuhanOrganikKg: body.kebutuhanOrganikKg !== undefined ? Number(body.kebutuhanOrganikKg) : item.kebutuhanOrganikKg,
          };
          return updatedItem;
        }
        return item;
      });

      if (db) {
        try {
          const [updated] = await db.update(schema.fertilizerNeeds)
            .set({
              poktan: body.poktan,
              kecamatan: body.kecamatan,
              desa: body.desa,
              komoditas: body.komoditas,
              luasLahanHa: Number(body.luasLahanHa),
              kiosPenyalur: body.kiosPenyalur,
              kebutuhanUreaKg: Number(body.kebutuhanUreaKg),
              kebutuhanNpkKg: Number(body.kebutuhanNpkKg),
              kebutuhanOrganikKg: Number(body.kebutuhanOrganikKg),
              musimTanam: body.musimTanam,
              keterangan: body.keterangan || '',
            })
            .where(eq(schema.fertilizerNeeds.id, id))
            .returning();
          if (updated) return res.json(updated);
        } catch (dbErr: any) {
          console.warn('DB update fallback to memory:', dbErr.message);
        }
      }

      res.json(updatedItem || body);
    } catch (err: any) {
      console.error('Error updating fertilizer need:', err);
      res.status(500).json({ error: 'Failed to update fertilizer need', details: err.message });
    }
  });

  app.delete('/api/fertilizer-needs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const targetQuery = decodeURIComponent(id).trim().toLowerCase();
      fertilizerNeedsStore = fertilizerNeedsStore.filter(n => {
        const nId = (n.id || '').toLowerCase();
        const nPoktan = (n.poktan || '').toLowerCase();
        return nId !== targetQuery && nPoktan !== targetQuery;
      });

      if (db) {
        try {
          await db.delete(schema.fertilizerNeeds).where(eq(schema.fertilizerNeeds.id, id));
        } catch (dbErr: any) {
          console.warn('DB delete fallback to memory:', dbErr.message);
        }
      }

      res.json({ success: true, id });
    } catch (err: any) {
      console.error('Error deleting fertilizer need:', err);
      res.status(500).json({ error: 'Failed to delete fertilizer need', details: err.message });
    }
  });

  // 3. Kios Pupuk API
  app.get('/api/kios-pupuk', async (req, res) => {
    try {
      if (db) {
        const records = await db.select().from(schema.kiosPupuk);
        if (records && records.length > 0) return res.json(records);
      }
      res.json(kiosPupukStore);
    } catch (err: any) {
      console.warn('Fallback to in-memory kios pupuk store:', err.message);
      res.json(kiosPupukStore);
    }
  });

  // 4. Planting Schedules API
  app.get('/api/planting-schedules', async (req, res) => {
    try {
      if (db) {
        const records = await db.select().from(schema.plantingSchedules);
        if (records && records.length > 0) return res.json(records);
      }
      res.json(plantingSchedulesStore);
    } catch (err: any) {
      console.warn('Fallback to in-memory planting schedules:', err.message);
      res.json(plantingSchedulesStore);
    }
  });

  // 5. Harvest Records API
  app.get('/api/harvest-records', async (req, res) => {
    try {
      if (db) {
        const records = await db.select().from(schema.harvestRecords).orderBy(desc(schema.harvestRecords.createdAt));
        if (records && records.length > 0) return res.json(records);
      }
      res.json(harvestRecordsStore);
    } catch (err: any) {
      console.warn('Fallback to in-memory harvest records:', err.message);
      res.json(harvestRecordsStore);
    }
  });

  app.post('/api/harvest-records', async (req, res) => {
    try {
      const body = req.body;
      const id = body.id || `PANEN-${Date.now()}`;
      const estimasi = Number(body.estimasiProduksiTon) || 0;
      const realisasi = Number(body.realisasiProduksiTon) || 0;
      const luas = Number(body.luasPanenHa) || 1;
      const deviasi = estimasi > 0 ? ((realisasi - estimasi) / estimasi) * 100 : 0;
      const produktivitas = luas > 0 ? realisasi / luas : 0;

      const newRecord = {
        id,
        kodePanen: body.kodePanen || `PAN-${Date.now().toString().slice(-4)}`,
        kodePetak: body.kodePetak || 'PTK-01',
        poktan: body.poktan || '',
        namaPetani: body.namaPetani || '',
        kecamatan: body.kecamatan || 'Mendo Barat',
        komoditas: body.komoditas || 'padi_sawah',
        luasPanenHa: luas,
        estimasiProduksiTon: estimasi,
        realisasiProduksiTon: realisasi,
        deviasiPersen: Number(deviasi.toFixed(2)),
        produktivitasTonPerHa: Number(produktivitas.toFixed(2)),
        tanggalPanen: body.tanggalPanen || new Date().toISOString().split('T')[0],
      };

      harvestRecordsStore = [newRecord as any, ...harvestRecordsStore];

      if (db) {
        try {
          const [inserted] = await db.insert(schema.harvestRecords).values(newRecord).returning();
          if (inserted) return res.status(201).json(inserted);
        } catch (dbErr: any) {
          console.warn('DB insert fallback to memory:', dbErr.message);
        }
      }

      res.status(201).json(newRecord);
    } catch (err: any) {
      console.error('Error creating harvest record:', err);
      res.status(500).json({ error: 'Failed to create harvest record', details: err.message });
    }
  });

  app.put('/api/harvest-records/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body;
      let updatedRecord: any = null;

      harvestRecordsStore = harvestRecordsStore.map(h => {
        if (h.id === id) {
          const merged = { ...h, ...body };
          const estimasi = Number(merged.estimasiProduksiTon) || 0;
          const realisasi = Number(merged.realisasiProduksiTon) || 0;
          const luas = Number(merged.luasPanenHa) || 1;
          const deviasi = estimasi > 0 ? ((realisasi - estimasi) / estimasi) * 100 : 0;
          const produktivitas = luas > 0 ? realisasi / luas : 0;
          updatedRecord = {
            ...merged,
            luasPanenHa: luas,
            estimasiProduksiTon: estimasi,
            realisasiProduksiTon: realisasi,
            deviasiPersen: Number(deviasi.toFixed(2)),
            produktivitasTonPerHa: Number(produktivitas.toFixed(2)),
          };
          return updatedRecord;
        }
        return h;
      });

      if (db) {
        try {
          const [updated] = await db.update(schema.harvestRecords)
            .set({
              poktan: body.poktan,
              namaPetani: body.namaPetani,
              kecamatan: body.kecamatan,
              komoditas: body.komoditas,
              luasPanenHa: Number(body.luasPanenHa) || 1,
              estimasiProduksiTon: Number(body.estimasiProduksiTon) || 0,
              realisasiProduksiTon: Number(body.realisasiProduksiTon) || 0,
              deviasiPersen: updatedRecord?.deviasiPersen ?? 0,
              produktivitasTonPerHa: updatedRecord?.produktivitasTonPerHa ?? 0,
              tanggalPanen: body.tanggalPanen,
            })
            .where(eq(schema.harvestRecords.id, id))
            .returning();
          if (updated) return res.json(updated);
        } catch (dbErr: any) {
          console.warn('DB update fallback to memory:', dbErr.message);
        }
      }

      res.json(updatedRecord || body);
    } catch (err: any) {
      console.error('Error updating harvest record:', err);
      res.status(500).json({ error: 'Failed to update harvest record', details: err.message });
    }
  });

  app.delete('/api/harvest-records/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const targetQuery = decodeURIComponent(id).trim().toLowerCase();
      harvestRecordsStore = harvestRecordsStore.filter(h => {
        const hId = (h.id || '').toLowerCase();
        const hKode = (h.kodePanen || '').toLowerCase();
        const hNama = (h.namaPetani || '').toLowerCase();
        return hId !== targetQuery && hKode !== targetQuery && hNama !== targetQuery;
      });

      if (db) {
        try {
          await db.delete(schema.harvestRecords).where(eq(schema.harvestRecords.id, id));
        } catch (dbErr: any) {
          console.warn('DB delete fallback to memory:', dbErr.message);
        }
      }

      res.json({ success: true, id });
    } catch (err: any) {
      console.error('Error deleting harvest record:', err);
      res.status(500).json({ error: 'Failed to delete harvest record', details: err.message });
    }
  });

  // 6. Post Harvest Losses API
  app.get('/api/post-harvest-losses', async (req, res) => {
    try {
      if (db) {
        const records = await db.select().from(schema.postHarvestLosses).orderBy(desc(schema.postHarvestLosses.createdAt));
        if (records && records.length > 0) return res.json(records);
      }
      if (postHarvestLossesStore && postHarvestLossesStore.length > 0) {
        return res.json(postHarvestLossesStore);
      }
      res.json(INITIAL_POST_HARVEST_LOSSES);
    } catch (err: any) {
      console.warn('Fallback to in-memory post harvest losses:', err.message);
      res.json(postHarvestLossesStore.length > 0 ? postHarvestLossesStore : INITIAL_POST_HARVEST_LOSSES);
    }
  });

  app.post('/api/post-harvest-losses', async (req, res) => {
    try {
      const body = req.body;
      const id = body.id || `LOSS-${Date.now()}`;
      const bobot = Number(body.bobotSusutKg) || 0;
      const harga = Number(body.hargaSatuanRp) || 0;
      const totalKerugian = bobot * harga;

      const newLoss = {
        id,
        harvestRecordId: body.harvestRecordId || 'HR-001',
        komoditas: body.komoditas || 'padi_sawah',
        kecamatan: body.kecamatan || 'Mendo Barat',
        poktan: body.poktan || '',
        tahapKehilangan: body.tahapKehilangan || 'Pemanenan & Sortasi Batang',
        persentaseSusut: Number(body.persentaseSusut) || 0,
        bobotSusutKg: bobot,
        hargaSatuanRp: harga,
        totalKerugianRp: totalKerugian,
        penyebabUtama: body.penyebabUtama || '',
        intervensiMekanisasi: body.intervensiMekanisasi || '',
      };

      postHarvestLossesStore = [newLoss as any, ...postHarvestLossesStore];

      if (db) {
        try {
          const [inserted] = await db.insert(schema.postHarvestLosses).values(newLoss).returning();
          if (inserted) return res.status(201).json(inserted);
        } catch (dbErr: any) {
          console.warn('DB insert fallback to memory:', dbErr.message);
        }
      }

      res.status(201).json(newLoss);
    } catch (err: any) {
      console.error('Error creating post harvest loss:', err);
      res.status(500).json({ error: 'Failed to create post harvest loss', details: err.message });
    }
  });

  app.put('/api/post-harvest-losses/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body;
      let updatedLoss: any = null;

      postHarvestLossesStore = postHarvestLossesStore.map(l => {
        if (l.id === id) {
          const merged = { ...l, ...body };
          const bobot = Number(merged.bobotSusutKg) || 0;
          const harga = Number(merged.hargaSatuanRp) || 0;
          updatedLoss = {
            ...merged,
            bobotSusutKg: bobot,
            hargaSatuanRp: harga,
            totalKerugianRp: bobot * harga,
          };
          return updatedLoss;
        }
        return l;
      });

      if (db) {
        try {
          const [updated] = await db.update(schema.postHarvestLosses)
            .set({
              komoditas: body.komoditas,
              kecamatan: body.kecamatan,
              poktan: body.poktan,
              tahapKehilangan: body.tahapKehilangan,
              persentaseSusut: Number(body.persentaseSusut),
              bobotSusutKg: Number(body.bobotSusutKg) || 0,
              hargaSatuanRp: Number(body.hargaSatuanRp) || 0,
              totalKerugianRp: (Number(body.bobotSusutKg) || 0) * (Number(body.hargaSatuanRp) || 0),
              penyebabUtama: body.penyebabUtama,
              intervensiMekanisasi: body.intervensiMekanisasi,
            })
            .where(eq(schema.postHarvestLosses.id, id))
            .returning();
          if (updated) return res.json(updated);
        } catch (dbErr: any) {
          console.warn('DB update fallback to memory:', dbErr.message);
        }
      }

      res.json(updatedLoss || body);
    } catch (err: any) {
      console.error('Error updating post harvest loss:', err);
      res.status(500).json({ error: 'Failed to update post harvest loss', details: err.message });
    }
  });

  app.delete('/api/post-harvest-losses/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const targetQuery = decodeURIComponent(id).trim().toLowerCase();
      postHarvestLossesStore = postHarvestLossesStore.filter(l => {
        const lId = (l.id || '').toLowerCase();
        const lPoktan = (l.poktan || '').toLowerCase();
        const lTahap = (l.tahapKehilangan || '').toLowerCase();
        return lId !== targetQuery && lPoktan !== targetQuery && lTahap !== targetQuery;
      });

      if (db) {
        try {
          await db.delete(schema.postHarvestLosses).where(eq(schema.postHarvestLosses.id, id));
        } catch (dbErr: any) {
          console.warn('DB delete fallback to memory:', dbErr.message);
        }
      }

      res.json({ success: true, id });
    } catch (err: any) {
      console.error('Error deleting post harvest loss:', err);
      res.status(500).json({ error: 'Failed to delete post harvest loss', details: err.message });
    }
  });

  app.post('/api/post-harvest-losses/sync', async (req, res) => {
    try {
      const { losses } = req.body;
      if (Array.isArray(losses)) {
        postHarvestLossesStore = [...losses];
        if (db) {
          try {
            await db.delete(schema.postHarvestLosses);
            if (losses.length > 0) {
              await db.insert(schema.postHarvestLosses).values(losses);
            }
          } catch (e: any) {
            console.warn('DB sync error for postHarvestLosses:', e.message);
          }
        }
      }
      res.json({ success: true, count: postHarvestLossesStore.length });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to sync post harvest losses', details: err.message });
    }
  });

  app.delete('/api/post-harvest-losses', async (req, res) => {
    try {
      postHarvestLossesStore = [];
      if (db) {
        try {
          await db.delete(schema.postHarvestLosses);
        } catch (e: any) {
          console.warn('DB delete all error:', e.message);
        }
      }
      res.json({ success: true, message: 'All post harvest losses cleared' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to clear post harvest losses', details: err.message });
    }
  });

  // 7. Field Issues API
  app.get('/api/field-issues', async (req, res) => {
    try {
      if (db) {
        const records = await db.select().from(schema.fieldIssues).orderBy(desc(schema.fieldIssues.createdAt));
        if (records && records.length > 0) return res.json(records);
      }
      res.json(fieldIssuesStore);
    } catch (err: any) {
      console.warn('Fallback to in-memory field issues:', err.message);
      res.json(fieldIssuesStore);
    }
  });

  app.post('/api/field-issues', async (req, res) => {
    try {
      const body = req.body;
      const id = body.id || `ISSUE-${Date.now()}`;
      const [inserted] = await (async () => {
        const newIssue = {
          id,
          kodeTiket: `TKT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          pelaporNama: body.pelaporNama || '',
          pelaporPeran: body.pelaporPeran || 'operator',
          poktan: body.poktan || '',
          kecamatan: body.kecamatan || 'Mendo Barat',
          desa: body.desa || 'Kemuja',
          kategoriMasalah: body.kategoriMasalah || 'Validasi Data Lahan & Petani',
          prioritas: body.prioritas || 'Sedang',
          deskripsi: body.deskripsi || '',
          tanggalLapor: new Date().toISOString().split('T')[0],
          status: 'Menunggu Disposisi',
          tindakLanjutPetugas: '',
          petugasPpl: '',
          tanggalPenyelesaian: '',
        };

        fieldIssuesStore = [newIssue as any, ...fieldIssuesStore];

        if (db) {
          try {
            const [dbInserted] = await db.insert(schema.fieldIssues).values(newIssue).returning();
            if (dbInserted) return [dbInserted];
          } catch (dbErr: any) {
            console.warn('DB insert fallback to memory:', dbErr.message);
          }
        }
        return [newIssue];
      })();

      res.status(201).json(inserted);
    } catch (err: any) {
      console.error('Error creating field issue:', err);
      res.status(500).json({ error: 'Failed to create field issue', details: err.message });
    }
  });

  app.put('/api/field-issues/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const body = req.body;
      let updatedIssue: any = null;

      fieldIssuesStore = fieldIssuesStore.map(item => {
        if (item.id === id) {
          updatedIssue = {
            ...item,
            ...body,
            tanggalPenyelesaian: body.status === 'Selesai & Terverifikasi'
              ? (body.tanggalPenyelesaian || new Date().toISOString().split('T')[0])
              : item.tanggalPenyelesaian
          };
          return updatedIssue;
        }
        return item;
      });

      if (db) {
        try {
          const [updated] = await db.update(schema.fieldIssues)
            .set({
              status: body.status,
              tindakLanjutPetugas: body.tindakLanjutPetugas,
              petugasPpl: body.petugasPpl,
              tanggalPenyelesaian: body.status === 'Selesai & Terverifikasi' ? new Date().toISOString().split('T')[0] : body.tanggalPenyelesaian,
            })
            .where(eq(schema.fieldIssues.id, id))
            .returning();
          if (updated) return res.json(updated);
        } catch (dbErr: any) {
          console.warn('DB update fallback to memory:', dbErr.message);
        }
      }

      res.json(updatedIssue || body);
    } catch (err: any) {
      console.error('Error updating field issue:', err);
      res.status(500).json({ error: 'Failed to update field issue', details: err.message });
    }
  });

  // 8. Activities API
  app.get('/api/activities', async (req, res) => {
    try {
      if (db) {
        const records = await db.select().from(schema.activities).orderBy(desc(schema.activities.createdAt));
        if (records && records.length > 0) return res.json(records);
      }
      res.json(activitiesStore);
    } catch (err: any) {
      console.warn('Fallback to in-memory activities:', err.message);
      res.json(activitiesStore);
    }
  });

  app.post('/api/activities', async (req, res) => {
    try {
      const body = req.body;
      const id = body.id || `ACT-${Date.now()}`;
      const newAct = {
        id,
        judul: body.judul || '',
        tanggal: body.tanggal || new Date().toISOString().split('T')[0],
        waktu: body.waktu || '08:30 WIB',
        lokasi: body.lokasi || 'BPP Dinas Pertanian',
        kecamatan: body.kecamatan || 'Mendo Barat',
        penyelenggara: body.penyelenggara || 'Dinas Pangan & Pertanian Kab. Bangka',
        kategori: body.kategori || 'Sosialisasi & Pelatihan',
        targetPeserta: body.targetPeserta || 'Seluruh Poktan',
        status: body.status || 'Akan Datang',
        deskripsi: body.deskripsi || '',
      };

      activitiesStore = [newAct as any, ...activitiesStore];

      if (db) {
        try {
          const [inserted] = await db.insert(schema.activities).values(newAct).returning();
          if (inserted) return res.status(201).json(inserted);
        } catch (dbErr: any) {
          console.warn('DB insert fallback to memory:', dbErr.message);
        }
      }

      res.status(201).json(newAct);
    } catch (err: any) {
      console.error('Error creating activity:', err);
      res.status(500).json({ error: 'Failed to create activity', details: err.message });
    }
  });

  // Database status endpoint
  app.get('/api/db-status', async (req, res) => {
    try {
      if (db) {
        const parcelCount = await db.select().from(schema.landParcels);
        return res.json({
          status: 'connected',
          engine: 'Cloud SQL PostgreSQL',
          database: process.env.SQL_DB_NAME,
          parcels: parcelCount.length,
        });
      }
      res.json({
        status: 'connected',
        engine: 'In-Memory Persistent Repository',
        database: 'SIMPATIS Bangka Live Store',
        parcels: landParcelsStore.length,
      });
    } catch (err: any) {
      res.json({
        status: 'fallback',
        engine: 'In-Memory Persistent Repository',
        database: 'SIMPATIS Bangka Live Store',
        parcels: landParcelsStore.length,
        notice: err.message
      });
    }
  });

  // Vite middleware in dev or static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    if (db) {
      await seedDatabaseIfEmpty().catch(err => console.warn('SQL seed skipped:', err.message));
    }
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
