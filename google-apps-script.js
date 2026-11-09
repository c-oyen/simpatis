/**
 * ==============================================================================
 * KODE BACKEND GOOGLE APPS SCRIPT - SIMPATIS BANGKA (MULTI-SHEET)
 * ==============================================================================
 * 
 * Sistem Informasi Meningkatkan Efisiensi dan Produksi Komoditas Strategis
 * Dinas Pangan dan Pertanian Pemerintah Kabupaten Bangka
 * 
 * PANDUAN PEMBARUAN DI GOOGLE SPREADSHEET:
 * 1. Buka Google Spreadsheet SIMPATIS BANGKA Anda di Google Drive.
 * 2. Klik menu "Ekstensi" (Extensions) -> "Apps Script".
 * 3. Hapus seluruh isi kode lama di editor, lalu paste seluruh isi kode file ini.
 * 4. Simpan (Ctrl+S / Cmd+S).
 * 5. Klik "Terapkan" (Deploy) di sudut kanan atas -> "Kelola Penerapan" (Manage Deployments).
 * 6. Klik ikon Pensil (Edit), pilih Versi: "Versi Baru" (New Version).
 * 7. Pastikan Akses: "Siapa saja" (Anyone).
 * 8. Klik "Terapkan" (Deploy).
 * ==============================================================================
 */

// Konfigurasi Header Standar untuk Inisialisasi Sheet Baru
var DEFAULT_SHEET_CONFIGS = {
  "Data Petani & Lahan": [
    "Nama Petani",
    "Kelompok Tani",
    "Lokasi",
    "Komoditas",
    "Luas Lahan",
    "Kemasaman (pH)",
    "Sistem Irigasi"
  ],
  "Kebutuhan Pupuk": [
    "Kelompok Tani",
    "Lokasi",
    "Komoditas",
    "Luas Lahan (Ha)",
    "Kios Penyalur Resmi",
    "Kebutuhan Urea (Kg)",
    "Kebutuhan NPK (Kg)",
    "Kebutuhan Organik (Kg)",
    "Musim Tanam",
    "Keterangan"
  ],
  "Monitoring Produksi": [
    "Kode Panen",
    "Nama Petani",
    "Kelompok Tani",
    "Kecamatan",
    "Komoditas",
    "Luas Panen (Ha)",
    "Estimasi Produksi (Ton)",
    "Realisasi Produksi (Ton)",
    "Produktivitas (Ton/Ha)",
    "Deviasi (%)",
    "Tanggal Panen"
  ],
  "Pengendalian Kehilangan Hasil": [
    "Komoditas",
    "Kecamatan",
    "Kelompok Tani",
    "Tahap Kehilangan",
    "Persentase Susut (%)",
    "Bobot Susut (Kg)",
    "Harga Satuan (Rp/Kg)",
    "Total Nilai Kerugian (Rp)",
    "Penyebab Utama",
    "Intervensi Mekanisasi"
  ]
};

function normalizeKey(str) {
  return str
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[()/%.-]/g, "")
    .replace(/_+$/, "");
}

function getNormalizedSheetName(rawName) {
  var name = (rawName || "Data Petani & Lahan").toString();
  var lower = name.toLowerCase();
  if (lower.indexOf("petani") !== -1 || lower.indexOf("lahan") !== -1) {
    return "Data Petani & Lahan";
  } else if (lower.indexOf("pupuk") !== -1) {
    return "Kebutuhan Pupuk";
  } else if (lower.indexOf("produksi") !== -1 || lower.indexOf("panen") !== -1) {
    return "Monitoring Produksi";
  } else if (lower.indexOf("kehilangan") !== -1 || lower.indexOf("susut") !== -1 || lower.indexOf("loss") !== -1) {
    return "Pengendalian Kehilangan Hasil";
  }
  return name;
}

function getOrCreateSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var defaultHeaders = DEFAULT_SHEET_CONFIGS[sheetName];
    if (defaultHeaders) {
      sheet.appendRow(defaultHeaders);
      var headerRange = sheet.getRange(1, 1, 1, defaultHeaders.length);
      headerRange.setBackground("#047857");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
  } else if (sheet.getLastRow() === 0) {
    var defaultHeaders = DEFAULT_SHEET_CONFIGS[sheetName];
    if (defaultHeaders) {
      sheet.appendRow(defaultHeaders);
      var headerRange = sheet.getRange(1, 1, 1, defaultHeaders.length);
      headerRange.setBackground("#047857");
      headerRange.setFontColor("#FFFFFF");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
  }

  return sheet;
}

/**
 * Memetakan nilai data secara dinamis ke susunan kolom sheet yang sebenarnya,
 * sehingga posisi field selalu pas dengan judul kolom di baris 1.
 */
function mapDataToSheetHeaders(headers, data, timestamp) {
  var rowValues = [];
  for (var c = 0; c < headers.length; c++) {
    var header = String(headers[c] || "").trim().toLowerCase();
    var val = "";

    if (header.indexOf("timestamp") !== -1 || header.indexOf("waktu") !== -1) {
      val = timestamp;
    } else if (header.indexOf("nama") !== -1 && (header.indexOf("petani") !== -1 || header.indexOf("nama_petani") !== -1)) {
      val = data.nama_petani || data.namaPetani || "";
    } else if (header.indexOf("kelompok") !== -1 || header.indexOf("poktan") !== -1) {
      val = data.kelompok_tani || data.poktan || "";
    } else if (header.indexOf("lokasi") !== -1 || header.indexOf("desa") !== -1) {
      val = data.lokasi || ("Desa " + (data.desa || "") + ", Kec. " + (data.kecamatan || ""));
    } else if (header.indexOf("kecamatan") !== -1) {
      val = data.kecamatan || (data.lokasi ? data.lokasi.replace(/.*kec\.\s*/i, "") : "");
    } else if (header.indexOf("komoditas") !== -1) {
      val = data.komoditas || "";
    } else if (header.indexOf("luas") !== -1) {
      val = data.luas_lahan || data.luas_panen_ha || (data.luasHa ? data.luasHa + " Ha" : (data.luasLahanHa ? data.luasLahanHa + " Ha" : ""));
    } else if (header.indexOf("kemasaman") !== -1 || header.indexOf("ph") !== -1) {
      val = data.kemasaman || (data.phTanah ? "pH " + data.phTanah : "");
    } else if (header.indexOf("irigasi") !== -1) {
      val = data.sistem_irigasi || data.sistemIrigasi || "Irigasi Teknis";
    } else if (header.indexOf("kios") !== -1) {
      val = data.kios_penyalur || data.kiosPenyalur || "";
    } else if (header.indexOf("urea") !== -1) {
      val = data.urea_kg || data.kebutuhanUreaKg || 0;
    } else if (header.indexOf("npk") !== -1) {
      val = data.npk_kg || data.kebutuhanNpkKg || 0;
    } else if (header.indexOf("organik") !== -1) {
      val = data.organik_kg || data.kebutuhanOrganikKg || 0;
    } else if (header.indexOf("musim") !== -1) {
      val = data.musim_tanam || data.musimTanam || "";
    } else if (header.indexOf("keterangan") !== -1) {
      val = data.keterangan || "";
    } else if (header.indexOf("kode") !== -1 && header.indexOf("panen") !== -1) {
      val = data.kode_panen || data.kodePanen || "";
    } else if (header.indexOf("estimasi") !== -1) {
      val = data.estimasi_ton || data.estimasiProduksiTon || 0;
    } else if (header.indexOf("realisasi") !== -1) {
      val = data.realisasi_ton || data.realisasiProduksiTon || 0;
    } else if (header.indexOf("produktivitas") !== -1) {
      val = data.produktivitas || data.produktivitasTonPerHa || 0;
    } else if (header.indexOf("deviasi") !== -1) {
      val = data.deviasi_persen || data.deviasiPersen || 0;
    } else if (header.indexOf("tanggal") !== -1) {
      val = data.tanggal_panen || data.tanggalPanen || "";
    } else if (header.indexOf("tahap") !== -1) {
      val = data.tahap_kehilangan || data.tahapKehilangan || "";
    } else if (header.indexOf("susut") !== -1 && header.indexOf("%") !== -1) {
      val = data.persentase_susut || data.persentaseSusut || 0;
    } else if (header.indexOf("bobot") !== -1) {
      val = data.bobot_susut_kg || data.bobotSusutKg || 0;
    } else if (header.indexOf("harga") !== -1) {
      val = data.harga_satuan_rp || data.hargaSatuanRp || 0;
    } else if (header.indexOf("kerugian") !== -1 || header.indexOf("nilai") !== -1) {
      val = data.total_kerugian_rp || data.totalKerugianRp || 0;
    } else if (header.indexOf("penyebab") !== -1) {
      val = data.penyebab_utama || data.penyebabUtama || "";
    } else if (header.indexOf("intervensi") !== -1 || header.indexOf("mekanisasi") !== -1) {
      val = data.intervensi_mekanisasi || data.intervensiMekanisasi || "";
    } else if (header.indexOf("id") !== -1) {
      val = data.id || "";
    } else {
      var normKey = normalizeKey(headers[c]);
      val = data[normKey] || data[headers[c]] || "";
    }

    rowValues.push(val);
  }
  return rowValues;
}

/**
 * Logika Eksekusi Penghapusan Baris (Delete)
 */
function executeDelete(sheet, searchId, searchKey) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1) {
    return { deleted: false, count: 0 };
  }

  var dataRange = sheet.getRange(2, 1, lastRow - 1, lastCol);
  var values = dataRange.getValues();
  var deletedCount = 0;

  var idQuery = (searchId || "").toString().toLowerCase().trim();
  var keyQuery = (searchKey || "").toString().toLowerCase().trim();

  // Loop dari baris paling bawah ke atas agar indeks baris sheet tidak bergeser
  for (var r = values.length - 1; r >= 0; r--) {
    var rowArr = values[r];
    var rowText = rowArr.join(" ").toLowerCase();
    var isMatch = false;

    if (idQuery && idQuery.length > 1 && rowText.indexOf(idQuery) !== -1) {
      isMatch = true;
    } else if (keyQuery && keyQuery.length > 1 && rowText.indexOf(keyQuery) !== -1) {
      isMatch = true;
    }

    // Bersihkan juga baris kosong / baris rusak yang hanya berisi string timestamp
    var compactText = rowArr.join("").trim();
    if (!compactText || /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}(?:Desa\s*,\s*Kec\.\s*)?(?:Irigasi Teknis)?$/i.test(compactText)) {
      isMatch = true;
    }

    if (isMatch) {
      sheet.deleteRow(r + 2);
      deletedCount++;
    }
  }

  return { deleted: deletedCount > 0, count: deletedCount };
}

/**
 * Handler GET Request (Membaca Data Sheet ATAU Eksekusi Hapus via GET Fallback)
 */
function doGet(e) {
  try {
    var rawSheetName = (e && e.parameter && e.parameter.sheetName) ? e.parameter.sheetName : "Data Petani & Lahan";
    var sheetName = getNormalizedSheetName(rawSheetName);
    var sheet = getOrCreateSheet(sheetName);

    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action.toString().toLowerCase() : "";

    // --------------------------------------------------------------------------
    // GET Fallback untuk Aksi DELETE
    // --------------------------------------------------------------------------
    if (action === "delete") {
      var searchId = (e.parameter.id || "").toString().trim();
      var searchKey = (e.parameter.searchKey || e.parameter.namaPetani || e.parameter.nama_petani || e.parameter.poktan || searchId).toString().trim();

      var deleteResult = executeDelete(sheet, searchId, searchKey);
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        action: "delete",
        foundAndDeleted: deleteResult.deleted,
        deletedCount: deleteResult.count,
        message: deleteResult.deleted 
          ? "Berhasil menghapus " + deleteResult.count + " baris dari Google Spreadsheet (" + sheetName + ")"
          : "Baris data tidak ditemukan (" + sheetName + ")",
        sheetName: sheetName,
        timestamp: Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss")
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // Operasi GET Standar: Membaca Baris Data
    // --------------------------------------------------------------------------
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();

    if (lastRow <= 1 || lastCol === 0) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var dataRange = sheet.getRange(1, 1, lastRow, lastCol);
    var values = dataRange.getValues();
    var rawHeaders = values[0];
    var rows = [];

    for (var r = 1; r < values.length; r++) {
      var rowObj = {};
      var hasMeaningfulData = false;

      for (var c = 0; c < rawHeaders.length; c++) {
        var headerName = String(rawHeaders[c]).trim();
        var normalizedKey = normalizeKey(headerName);
        var val = values[r][c];

        if (val instanceof Date) {
          val = Utilities.formatDate(val, "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
        }

        rowObj[normalizedKey] = val;
        rowObj[headerName] = val;

        if (val && String(val).trim().length > 0 && !/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(String(val).trim())) {
          hasMeaningfulData = true;
        }
      }

      // Hindari mengembalikan baris rusak/kosong ke frontend
      if (hasMeaningfulData) {
        rows.push(rowObj);
      }
    }

    return ContentService.createTextOutput(JSON.stringify(rows))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      message: "Gagal memproses permintaan GET"
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handler POST Request (Create, Update, Delete, SyncSheet)
 */
function doPost(e) {
  try {
    var postData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (jsonErr) {
        postData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    var rawSheetName = (e && e.parameter && e.parameter.sheetName) || postData.sheetName || "Data Petani & Lahan";
    var sheetName = getNormalizedSheetName(rawSheetName);
    var sheet = getOrCreateSheet(sheetName);

    var timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
    var action = ((e && e.parameter && e.parameter.action) || postData.action || "create").toString().toLowerCase().trim();

    // --------------------------------------------------------------------------
    // ACTION 1: DELETE (Hapus Baris Permanen)
    // --------------------------------------------------------------------------
    if (action === "delete") {
      var searchId = ((e && e.parameter && e.parameter.id) || postData.id || "").toString().trim();
      var searchKey = ((e && e.parameter && e.parameter.searchKey) || postData.searchKey || postData.nama_petani || postData.namaPetani || postData.kode_panen || postData.kodePanen || postData.kelompok_tani || postData.poktan || searchId).toString().trim();

      var deleteResult = executeDelete(sheet, searchId, searchKey);

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        action: "delete",
        foundAndDeleted: deleteResult.deleted,
        deletedCount: deleteResult.count,
        message: deleteResult.deleted 
          ? "Baris data berhasil dihapus dari Google Spreadsheet (" + sheetName + ")"
          : "Baris data tidak ditemukan atau sheet sudah bersih (" + sheetName + ")",
        sheetName: sheetName,
        timestamp: timestamp
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // ACTION 2: SYNCSHEET (Sinkronisasi Seluruh Baris / Overwrite Data Rows)
    // --------------------------------------------------------------------------
    if (action === "syncsheet" || action === "syncall" || action === "sync") {
      var rowsToSync = postData.rows || [];
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }

      var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      var insertedRows = [];

      if (Array.isArray(rowsToSync) && rowsToSync.length > 0) {
        for (var i = 0; i < rowsToSync.length; i++) {
          var item = rowsToSync[i];
          var itemTimestamp = item.timestamp || timestamp;
          var rowValues = mapDataToSheetHeaders(headers, item, itemTimestamp);
          sheet.appendRow(rowValues);
          insertedRows.push(rowValues);
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        action: "syncSheet",
        message: "Berhasil menyinkronkan " + insertedRows.length + " baris ke sheet: " + sheetName,
        sheetName: sheetName,
        count: insertedRows.length,
        timestamp: timestamp
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Ambil header baris 1 aktual
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

    // --------------------------------------------------------------------------
    // ACTION 3: UPDATE (Perbarui Baris Berdasarkan Identitas)
    // --------------------------------------------------------------------------
    if (action === "update") {
      var searchKey = (postData.searchKey || postData.originalNama || postData.nama_petani || postData.namaPetani || postData.kode_panen || postData.kodePanen || postData.kelompok_tani || postData.poktan || postData.id || "").toString().toLowerCase().trim();
      var updated = false;
      var lastRow = sheet.getLastRow();
      var newRowValues = mapDataToSheetHeaders(headers, postData, timestamp);

      if (lastRow > 1 && searchKey) {
        var dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
        var values = dataRange.getValues();

        for (var r = 0; r < values.length; r++) {
          var rowText = values[r].join(" ").toLowerCase();
          if (rowText.indexOf(searchKey) !== -1) {
            sheet.getRange(r + 2, 1, 1, newRowValues.length).setValues([newRowValues]);
            updated = true;
            break;
          }
        }
      }

      if (!updated) {
        sheet.appendRow(newRowValues);
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        action: "update",
        updatedExisting: updated,
        message: updated 
          ? "Baris data berhasil diperbarui di Google Spreadsheet (" + sheetName + ")"
          : "Baris baru berhasil ditambahkan ke Google Spreadsheet (" + sheetName + ")",
        sheetName: sheetName,
        row: newRowValues,
        timestamp: timestamp
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // --------------------------------------------------------------------------
    // ACTION 4: CREATE (Tambah Baris Baru)
    // --------------------------------------------------------------------------
    var newRowValues = mapDataToSheetHeaders(headers, postData, timestamp);
    sheet.appendRow(newRowValues);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      action: "create",
      message: "Data berhasil ditambahkan ke sheet: " + sheetName,
      sheetName: sheetName,
      insertedRow: newRowValues,
      timestamp: timestamp
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      message: "Gagal memproses data ke Google Spreadsheet"
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
