/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - SIMPATIS BANGKA TWO-WAY REAL-TIME SYNC
 * ============================================================================
 * 
 * Skrip ini menghubungkan Google Sheets dengan aplikasi web SIMPATIS BANGKA.
 * Mendukung pembacaan (GET) dan penambahan (POST/GET) data secara instan
 * tanpa kendala CORS dan bebas pergeseran kolom.
 * 
 * 7 KOLOM RESMI:
 * [A] NAMA PETANI
 * [B] KELOMPOK TANI
 * [C] LOKASI
 * [D] KOMODITAS
 * [E] LUAS LAHAN
 * [F] KEMASAMAN
 * [G] SISTEM IRIGASI
 * 
 * CARA MEMASANG DI GOOGLE SHEETS:
 * 1. Buka file Google Sheets Anda.
 * 2. Klik menu "Ekstensi" > "Apps Script".
 * 3. Hapus seluruh kode yang ada di editor, lalu tempelkan seluruh kode ini.
 * 4. Klik ikon Simpan (Disket).
 * 5. Klik tombol biru "Terapkan" (Deploy) di pojok kanan atas > "Deployment baru".
 * 6. Klik ikon Gerigi (Pilih jenis) > pilih "Aplikasi Web" (Web app).
 * 7. Isi konfigurasi:
 *    - Deskripsi: SIMPATIS Bangka Realtime Sync
 *    - Jalankan sebagai: Saya (email Anda)
 *    - Siapa yang memiliki akses: Siapa saja (Anyone) -> PENTING!
 * 8. Klik "Terapkan" (Deploy), berikan izin Google jika diminta.
 * 9. Salin "URL Aplikasi Web" (berakhiran /exec) dan simpan ke aplikasi SIMPATIS!
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

    // Pastikan baris judul ada di baris 1
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
    return createJsonResponse({
      success: false,
      error: error.toString()
    });
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

  var newRow = [
    namaPetani,
    poktan,
    lokasi,
    komoditas,
    luasLahan,
    kemasaman,
    sistemIrigasi
  ];

  sheet.appendRow(newRow);

  return createJsonResponse({
    success: true,
    message: 'Data petani ' + namaPetani + ' berhasil ditambahkan ke Google Sheets',
    row: newRow,
    totalRows: sheet.getLastRow() - 1
  });
}

function updateRowData(sheet, data) {
  var searchKey = (data.searchKey || data.nama_petani || data.id || '').toString().trim().toLowerCase();
  var values = sheet.getDataRange().getValues();

  for (var i = 1; i < values.length; i++) {
    var rowName = (values[i][0] || '').toString().trim().toLowerCase();
    if (rowName === searchKey) {
      var rowNum = i + 1;
      if (data.nama_petani) sheet.getRange(rowNum, 1).setValue(data.nama_petani);
      if (data.kelompok_tani) sheet.getRange(rowNum, 2).setValue(data.kelompok_tani);
      if (data.lokasi) sheet.getRange(rowNum, 3).setValue(data.lokasi);
      if (data.komoditas) sheet.getRange(rowNum, 4).setValue(data.komoditas);
      if (data.luas_lahan) sheet.getRange(rowNum, 5).setValue(data.luas_lahan);
      if (data.kemasaman) sheet.getRange(rowNum, 6).setValue(data.kemasaman);
      if (data.sistem_irigasi) sheet.getRange(rowNum, 7).setValue(data.sistem_irigasi);

      return createJsonResponse({
        success: true,
        message: 'Data ' + searchKey + ' berhasil diperbarui di Google Sheets',
        rowNumber: rowNum
      });
    }
  }

  return appendRowData(sheet, data);
}

function deleteRowData(sheet, data) {
  var searchKey = (data.searchKey || data.nama_petani || data.id || '').toString().trim().toLowerCase();
  var values = sheet.getDataRange().getValues();

  for (var i = 1; i < values.length; i++) {
    var rowName = (values[i][0] || '').toString().trim().toLowerCase();
    if (rowName === searchKey) {
      sheet.deleteRow(i + 1);
      return createJsonResponse({
        success: true,
        message: 'Data ' + searchKey + ' berhasil dihapus dari Google Sheets'
      });
    }
  }

  return createJsonResponse({
    success: false,
    message: 'Data dengan kunci ' + searchKey + ' tidak ditemukan'
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
      if (snakeKey) {
        obj[snakeKey] = cellVal;
      }
    }

    // Fallback posisi 7 kolom jika header beda nama
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
  var output = JSON.stringify(data);
  return ContentService.createTextOutput(output)
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
}
