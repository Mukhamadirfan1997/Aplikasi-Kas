const SHEET_NAME = "data_kas";

function doGet(e) {
  const type = e && e.parameter && e.parameter.type;

  // Jika request untuk daftar anggota
  if (type === "anggota") {
    const sheet = SpreadsheetApp.getActive().getSheetByName("master_anggota");
    const data = sheet.getDataRange().getValues();
    data.shift(); // buang header
    const names = data.map((row) => row[0]).filter((n) => n);
    return ContentService.createTextOutput(JSON.stringify(names)).setMimeType(
      ContentService.MimeType.JSON,
    );
  }

  // Default: data kas
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  const result = data.map((row) => {
    let obj = {};
    headers.forEach((h, i) => (obj[h] = row[i]));
    return obj;
  });

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

//login
function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  // LOGIN
  if (data.action === "login") {
    const sheet = SpreadsheetApp.getActive().getSheetByName("users");
    const rows = sheet.getDataRange().getValues();
    rows.shift();

    for (let r of rows) {
      if (r[0] == data.username && r[1] == data.password) {
        return ContentService.createTextOutput(
          JSON.stringify({
            success: true,
            role: r[2],
          }),
        ).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: false }),
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // SIMPAN KAS
  const sheet = SpreadsheetApp.getActive().getSheetByName("data_kas");
  sheet.appendRow([
    data.tanggal,
    data.nama,
    data.bulan,
    data.tahun,
    data.status,
    data.kas_masuk,
    data.kas_keluar,
    data.keterangan,
  ]);

  return ContentService.createTextOutput("success");
}
