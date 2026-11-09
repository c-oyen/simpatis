import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Copy, 
  FileSpreadsheet, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Code2, 
  KeyRound,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { 
  getCustomAppsScriptUrl, 
  setCustomAppsScriptUrl, 
  APPS_SCRIPT_URL 
} from '../lib/googleSheetsService';
import { useApp } from '../context/AppContext';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({ isOpen, onClose }) => {
  const { 
    refreshFromSpreadsheet, 
    isSyncingWithSheets, 
    sheetsSyncStatus, 
    lastSheetsSyncTime, 
    sheetsRowCount 
  } = useApp();

  const [scriptUrlInput, setScriptUrlInput] = useState<string>(() => getCustomAppsScriptUrl());
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [saveUrlSuccess, setSaveUrlSuccess] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'status' | 'code' | 'panduan'>('status');

  if (!isOpen) return null;

  const APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT - SIMPATIS BANGKA TWO-WAY REAL-TIME SYNC
 * Tempelkan kode ini di menu: Ekstensi > Apps Script di Google Sheets Anda
 */
var HEADERS = [
  "NAMA PETANI",
  "KELOMPOK TANI",
  "LOKASI",
  "KOMODITAS",
  "LUAS LAHAN",
  "KEMASAMAN",
  "SISTEM IRIGASI"
];

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  try {
    e = e || { parameter: {} };
    var params = e.parameter || {};
    var postData = {};

    if (e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (err) {
        postData = parseQueryString(e.postData.contents);
      }
    }

    var data = Object.assign({}, params, postData);
    var action = (data.action || 'read').toLowerCase();

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = data.sheetName || 'Data Petani & Lahan';
    var sheet = ss.getSheetByName(sheetName) || ss.getActiveSheet();

    initSheetHeaders(sheet);

    if (action === 'create' || action === 'add' || action === 'append') {
      return appendRowData(sheet, data);
    } else if (action === 'update') {
      return updateRowData(sheet, data);
    } else if (action === 'delete') {
      return deleteRowData(sheet, data);
    } else {
      return readAllRows(sheet);
    }
  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() });
  }
}

function initSheetHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#d9ead3");
  }
}

function appendRowData(sheet, data) {
  var namaPetani = (data.nama_petani || data['NAMA PETANI'] || data.namaPetani || '').toString().trim();
  var poktan = (data.kelompok_tani || data['KELOMPOK TANI'] || data.poktan || '').toString().trim();
  var lokasi = (data.lokasi || data['LOKASI'] || '').toString().trim();
  var komoditas = (data.komoditas || data['KOMODITAS'] || '').toString().trim();
  var luasLahan = (data.luas_lahan || data['LUAS LAHAN'] || data.luasHa || '').toString().trim();
  var kemasaman = (data.kemasaman || data['KEMASAMAN'] || data.phTanah || '').toString().trim();
  var sistemIrigasi = (data.sistem_irigasi || data['SISTEM IRIGASI'] || data.sistemIrigasi || '').toString().trim();

  if (luasLahan && !isNaN(Number(luasLahan))) {
    luasLahan = luasLahan + ' ha';
  }

  var newRow = [namaPetani, poktan, lokasi, komoditas, luasLahan, kemasaman, sistemIrigasi];
  sheet.appendRow(newRow);

  return createJsonResponse({
    success: true,
    message: 'Data ' + namaPetani + ' berhasil ditambahkan ke Google Sheets',
    row: newRow,
    totalRows: sheet.getLastRow() - 1
  });
}

function readAllRows(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = Math.max(sheet.getLastColumn(), HEADERS.length);

  if (lastRow <= 1) {
    return createJsonResponse([]);
  }

  var range = sheet.getRange(1, 1, lastRow, lastCol);
  var values = range.getValues();
  var headers = values[0];
  var result = [];

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var isBlank = row.every(function(cell) { return cell === '' || cell === null || cell === undefined; });
    if (isBlank) continue;

    var obj = {};
    for (var c = 0; c < headers.length; c++) {
      var headerName = (headers[c] || '').toString().trim();
      var cellVal = row[c] !== undefined ? row[c] : '';
      obj[headerName] = cellVal;
      var snakeKey = headerName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
      if (snakeKey) obj[snakeKey] = cellVal;
    }

    if (!obj['nama_petani']) obj['nama_petani'] = row[0] || '';
    if (!obj['kelompok_tani']) obj['kelompok_tani'] = row[1] || '';
    if (!obj['lokasi']) obj['lokasi'] = row[2] || '';
    if (!obj['komoditas']) obj['komoditas'] = row[3] || '';
    if (!obj['luas_lahan']) obj['luas_lahan'] = row[4] || '';
    if (!obj['kemasaman']) obj['kemasaman'] = row[5] || '';
    if (!obj['sistem_irigasi']) obj['sistem_irigasi'] = row[6] || '';

    result.push(obj);
  }

  return createJsonResponse(result);
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function parseQueryString(str) {
  var params = {};
  var pairs = str.split('&');
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=');
    params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
  }
  return params;
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomAppsScriptUrl(scriptUrlInput);
    setSaveUrlSuccess(true);
    setTimeout(() => setSaveUrlSuccess(false), 3000);
    refreshFromSpreadsheet();
  };

  const handleResetUrl = () => {
    setScriptUrlInput(APPS_SCRIPT_URL);
    setCustomAppsScriptUrl(APPS_SCRIPT_URL);
    setSaveUrlSuccess(true);
    setTimeout(() => setSaveUrlSuccess(false), 3000);
    refreshFromSpreadsheet();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const activeUrl = scriptUrlInput.trim() || APPS_SCRIPT_URL;
      const res = await fetch(`/api/sheets/data?sheetName=Data%20Petani%20%26%20Lahan&scriptUrl=${encodeURIComponent(activeUrl)}`);
      if (res.ok) {
        const data = await res.json();
        setTestResult({
          success: true,
          message: `Berhasil terhubung! Terbaca ${data.count || 0} baris data dari Google Sheets.`,
          count: data.count || 0
        });
        await refreshFromSpreadsheet();
      } else {
        setTestResult({
          success: false,
          message: `Server merespon dengan status ${res.status}. Pastikan URL Apps Script diatur dengan akses "Siapa saja (Anyone)".`
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Koneksi gagal: ${err.message || 'Periksa koneksi internet atau izin URL Apps Script.'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 my-8 space-y-5 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center border border-emerald-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                Sinkronisasi Dua Arah Google Sheets
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Real-Time
                </span>
              </h3>
              <p className="text-xs text-stone-500">
                Terhubung langsung ke Google Spreadsheet SIMPATIS BANGKA (Columns A s/d G)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('status')}
            className={`pb-2.5 px-4 cursor-pointer transition-colors border-b-2 ${
              activeTab === 'status' 
                ? 'border-emerald-700 text-emerald-800' 
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Status Koneksi & URL
          </button>
          <button
            onClick={() => setActiveTab('panduan')}
            className={`pb-2.5 px-4 cursor-pointer transition-colors border-b-2 ${
              activeTab === 'panduan' 
                ? 'border-emerald-700 text-emerald-800' 
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Panduan Pemasangan
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 px-4 cursor-pointer transition-colors border-b-2 ${
              activeTab === 'code' 
                ? 'border-emerald-700 text-emerald-800' 
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            Kode Apps Script
          </button>
        </div>

        {/* TAB 1: STATUS & URL */}
        {activeTab === 'status' && (
          <div className="space-y-4 text-xs">
            {/* Live Indicator Card */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-700">Status Sinkronisasi Real-Time</span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>{sheetsSyncStatus === 'syncing' ? 'Sedang Memperbarui...' : 'Terhubung Aktif'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-200 text-stone-600">
                <div>
                  <span className="text-[11px] text-stone-400 block">Total Data Terbaca dari Sheet:</span>
                  <span className="font-bold text-stone-900 text-sm">{sheetsRowCount} Baris Petani</span>
                </div>
                <div>
                  <span className="text-[11px] text-stone-400 block">Waktu Pembaruan Terakhir:</span>
                  <span className="font-bold text-stone-900 text-sm">{lastSheetsSyncTime || 'Baru Saja'}</span>
                </div>
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting || isSyncingWithSheets}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isTesting || isSyncingWithSheets ? 'animate-spin' : ''}`} />
                <span>{isTesting ? 'Menguji Koneksi...' : 'Uji Koneksi & Sinkronkan Sekarang'}</span>
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${
                testResult.success 
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            {/* URL Web App Configuration */}
            <form onSubmit={handleSaveUrl} className="space-y-3 pt-3 border-t border-stone-200">
              <div>
                <label className="font-bold text-stone-800 block mb-1">
                  URL Google Apps Script Web App (/exec)
                </label>
                <p className="text-[11px] text-stone-500 mb-2">
                  Dihasilkan dari Google Sheets melalui menu <em>Terapkan (Deploy) &gt; Deployment Baru &gt; Aplikasi Web</em>.
                </p>
                <input
                  type="url"
                  value={scriptUrlInput}
                  onChange={(e) => setScriptUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  required
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-mono focus:outline-emerald-700 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleResetUrl}
                  className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
                >
                  Kembalikan ke URL Default Sistem
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-lg shadow-xs cursor-pointer transition-colors"
                >
                  Simpan URL Web App
                </button>
              </div>

              {saveUrlSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-medium">
                  ✓ URL Google Apps Script berhasil diperbarui dan disimpan!
                </div>
              )}
            </form>
          </div>
        )}

        {/* TAB 2: PANDUAN LANGKAH PEMASANGAN */}
        {activeTab === 'panduan' && (
          <div className="space-y-4 text-xs">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-900">
              <strong className="block font-bold">Struktur 7 Kolom Google Sheets SIMPATIS:</strong>
              <div className="mt-1 flex flex-wrap gap-1 font-mono text-[10px]">
                <span className="bg-white px-2 py-0.5 rounded border border-amber-300">A: NAMA PETANI</span>
                <span className="bg-white px-2 py-0.5 rounded border border-amber-300">B: KELOMPOK TANI</span>
                <span className="bg-white px-2 py-0.5 rounded border border-amber-300">C: LOKASI</span>
                <span className="bg-white px-2 py-0.5 rounded border border-amber-300">D: KOMODITAS</span>
                <span className="bg-white px-2 py-0.5 rounded border border-amber-300">E: LUAS LAHAN</span>
                <span className="bg-white px-2 py-0.5 rounded border border-amber-300">F: KEMASAMAN</span>
                <span className="bg-white px-2 py-0.5 rounded border border-amber-300">G: SISTEM IRIGASI</span>
              </div>
            </div>

            <ol className="space-y-3 text-stone-700">
              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <strong className="text-stone-900">Buka Spreadsheet & Menu Apps Script:</strong>
                  <p className="text-stone-500 mt-0.5">
                    Buka file Google Sheets Anda, lalu klik menu <strong>Ekstensi &gt; Apps Script</strong>.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <strong className="text-stone-900">Tempelkan Kode Apps Script:</strong>
                  <p className="text-stone-500 mt-0.5">
                    Hapus semua baris kode lama di editor (misalnya <code className="bg-stone-100 px-1 rounded">myFunction</code>), lalu salin kode dari tab <strong>"Kode Apps Script"</strong> di atas dan tempelkan. Klik ikon <strong>Simpan (Disket)</strong>.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <strong className="text-stone-900">Buat Deployment Baru (Aplikasi Web):</strong>
                  <p className="text-stone-500 mt-0.5">
                    Klik tombol biru <strong>Terapkan (Deploy)</strong> di pojok kanan atas &gt; pilih <strong>Deployment baru</strong>. Klik ikon gerigi jenis, pilih <strong>Aplikasi Web</strong>.
                  </p>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  4
                </span>
                <div>
                  <strong className="text-stone-900">Konfigurasi Hak Akses (PENTING):</strong>
                  <div className="mt-1 space-y-1 bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-stone-600">
                    <div>• <strong>Jalankan sebagai:</strong> Saya (email Google Anda)</div>
                    <div>• <strong>Siapa yang memiliki akses:</strong> <span className="text-emerald-700 font-bold">Siapa saja (Anyone)</span></div>
                  </div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                  5
                </span>
                <div>
                  <strong className="text-stone-900">Salin URL & Simpan ke Aplikasi:</strong>
                  <p className="text-stone-500 mt-0.5">
                    Klik <strong>Terapkan</strong>, berikan izin akses jika diminta. Salin <strong>URL Aplikasi Web</strong> yang berakhiran <code className="bg-stone-100 px-1 rounded">/exec</code> dan tempelkan di tab <strong>Status Koneksi & URL</strong>.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* TAB 3: KODE APPS SCRIPT */}
        {activeTab === 'code' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-600 font-medium">
                Salin seluruh kode JavaScript ini ke Google Apps Script:
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs font-semibold transition-colors"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-amber-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
            </div>

            <div className="relative">
              <pre className="bg-stone-950 text-emerald-400 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72 border border-stone-800 leading-relaxed">
                {APPS_SCRIPT_CODE}
              </pre>
            </div>

            <p className="text-[11px] text-stone-400">
              Kode ini juga telah disimpan di file lokal sistem: <code className="text-stone-600">/public/google-apps-script-code.js</code>.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t border-stone-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
