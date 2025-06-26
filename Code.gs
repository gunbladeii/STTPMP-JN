// ✅ FINAL PATCH STTMP SYSTEM (UI + DATA LOGIC)

const SPREADSHEET_ID = "1_aj6PK1v8E1kCbqt_RvVlG1TdaYJ_K0Fn0bPrH4wJLI";
const DB_SHEET_NAME = "STTMP_DB";
const USER_SHEET_NAME = "Users";

function doGet() {
  return HtmlService.createHtmlOutputFromFile("respon.html")
    .setTitle("Sistem Respon STTMP")
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function triggerAuth() {
  MailApp.sendEmail(Session.getActiveUser().getEmail(), "Test", "Ujian emel");
}


function getCurrentEmail() {
  return Session.getActiveUser().getEmail();
}

function isUserAdmin() {
  const userSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USER_SHEET_NAME);
  const data = userSheet.getDataRange().getValues();
  const email = Session.getActiveUser().getEmail().toLowerCase();

  for (let i = 1; i < data.length; i++) {
    const userEmail = data[i][0]?.toLowerCase();
    const role = data[i][2]; // Kolum C = Peranan
    if (userEmail === email && role === "Admin") {
      return true;
    }
  }
  return false;
}

function getUsers() {
  const userSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USER_SHEET_NAME);
  const data = userSheet.getDataRange().getValues();
  const email = Session.getActiveUser().getEmail().toLowerCase();

  for (let i = 1; i < data.length; i++) {
    const userEmail = data[i][0]?.toLowerCase();
    const nama = data[i][1];
    const peranan = data[i][2];

    if (email === userEmail) {
      return { nama, peranan, email };
    }
  }
  return { nama: "Tidak dikenalpasti", peranan: "Tiada", email };
}

function getUserDetails() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USER_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const email = Session.getActiveUser().getEmail().toLowerCase();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if ((row[0] || '').toLowerCase() === email) {
      return {
        email: row[0],
        name: row[1],
        peranan: row[2],
        bahagian: row[3],
        negeri: row[4]
      };
    }
  }
  return null;
}

function getAssignedSyor() {
  const isAdmin = isUserAdmin();
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DB_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const email = Session.getActiveUser().getEmail().toLowerCase();
  const rowData = [];

  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((head, idx) => row[head] = data[i][idx]);
    row.RowNum = i + 1;

    if (
      isAdmin || 
      (row["BahagianJpn"] && email.includes(row["BahagianJpn"].toString().toLowerCase()))
    ) {
      rowData.push(row);
    }
  }
  return JSON.parse(JSON.stringify(rowData));
}

function getAssignedSyorLimited() {
  const user = getUserDetails();
  if (!user) return [];

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DB_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rowData = [];

  for (let i = 1; i < data.length; i++) {
    const row = {};
    headers.forEach((head, idx) => row[head] = data[i][idx]);
    row.RowNum = i + 1;

    if (
      (user.peranan === "Bahagian" && row["BahagianJpn"]?.toLowerCase().includes(user.bahagian.toLowerCase())) ||
      (user.peranan === "JPN" && row["Negeri"]?.toLowerCase().includes(user.negeri.toLowerCase()))
    ) {
      rowData.push(row);
    }
  }
  return JSON.parse(JSON.stringify(rowData));
}

function updateSyor(rowNum, syor, status, tarikh, catatan) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DB_SHEET_NAME);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const syorIdx = headers.indexOf("Syor") + 1;
  const statusIdx = headers.indexOf("Indicator") + 1;
  const tarikhIdx = headers.indexOf("TarikhKemaskini") + 1;
  const catatanIdx = headers.indexOf("Catatan") + 1;

  sheet.getRange(rowNum, syorIdx).setValue(syor);
  sheet.getRange(rowNum, statusIdx).setValue(status);
  sheet.getRange(rowNum, tarikhIdx).setValue(tarikh);
  sheet.getRange(rowNum, catatanIdx).setValue(catatan);

  const rowData = sheet.getRange(rowNum, 1, 1, sheet.getLastColumn()).getValues()[0];
  const laporan = rowData[headers.indexOf("Laporan")];
  const syorText = rowData[headers.indexOf("Syor")];
  const bahagian = rowData[headers.indexOf("BahagianJpn")];
  const negeri = rowData[headers.indexOf("Negeri")];

  // Trigger emel hanya jika catatan tidak kosong
  if (catatan && catatan.trim() !== "") {
    sendNotificationEmail(bahagian, negeri, laporan, syorText, catatan);
  }

}

function updateRespon(rowNum, respon, tarikh, tempohMasa) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DB_SHEET_NAME);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const responIdx = headers.indexOf("Respon") + 1;
  const tarikhIdx = headers.indexOf("TarikhKemaskini") + 1;
  const tempohMasaIdx = headers.indexOf("TempohMasa") + 1;

  sheet.getRange(rowNum, responIdx).setValue(respon);
  sheet.getRange(rowNum, tarikhIdx).setValue(tarikh);
  sheet.getRange(rowNum, tempohMasaIdx).setValue(tempohMasa);
}

function insertNewSyor(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DB_SHEET_NAME);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const lastRow = sheet.getLastRow() + 1;

  // Semakan duplikat
  const existing = sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).getValues();
  const isDuplicate = existing.some(row =>
    row[headers.indexOf("Laporan")]?.toString().trim().toLowerCase() === data.Laporan?.toString().trim().toLowerCase() &&
    row[headers.indexOf("Syor")]?.toString().trim().toLowerCase() === data.Syor?.toString().trim().toLowerCase() &&
    row[headers.indexOf("BahagianJpn")]?.toString().trim().toLowerCase() === data.BahagianJpn?.toString().trim().toLowerCase() &&
    row[headers.indexOf("Negeri")]?.toString().trim().toLowerCase() === data.Negeri?.toString().trim().toLowerCase()
  );

  if (isDuplicate) {
    throw new Error("Data bertindih telah dikesan dalam sistem. Sila semak semula data bagi Data Laporan, Perakuan Menteri (Syor), Bahagian dan JPN");
  }

  const newRow = headers.map(header => data[header] || "");
  sheet.appendRow(newRow);
}


function getSkorWajaranByUser() {
  const user = getUserDetails();
  if (!user) return [];

  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DB_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const laporanIdx = headers.indexOf("Laporan");
  const statusIdx = headers.indexOf("Indicator");
  const bahagianIdx = headers.indexOf("BahagianJpn");
  const negeriIdx = headers.indexOf("Negeri");

  const skorMap = { "Hijau": 1, "Kuning": 0.5, "Merah": 0 };
  const laporanMap = {};

  for (let i = 1; i < data.length; i++) {
    const laporan = data[i][laporanIdx];
    const status = data[i][statusIdx];
    const bahagian = data[i][bahagianIdx]?.toLowerCase() || "";
    const negeri = data[i][negeriIdx]?.toLowerCase() || "";

    if (
      user.peranan === "Admin" ||
      (user.peranan === "Bahagian" && bahagian.includes(user.bahagian.toLowerCase())) ||
      (user.peranan === "JPN" && negeri.includes(user.negeri.toLowerCase()))
    ) {
      const skor = skorMap[status] ?? 0;
      if (!laporanMap[laporan]) laporanMap[laporan] = [];
      laporanMap[laporan].push(skor);
    }
  }

  const result = [];
  for (const laporan in laporanMap) {
    const skorList = laporanMap[laporan];
    const total = skorList.reduce((a, b) => a + b, 0);
    const avg = skorList.length ? total / skorList.length : 0;

    let status = "Merah";
    if (avg === 1) status = "Hijau";
    else if (avg > 0 && avg < 1) status = "Kuning";

    result.push({
      Laporan: laporan,
      SkorWajaran: avg.toFixed(2),
      DominantStatus: status
    });
  }

  return result;
}

function getPieChartDataByUser() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DB_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const email = Session.getActiveUser().getEmail().toLowerCase();
  const role = getUserRole(email);
  const negeri = getUserNegeri(email);
  const bahagian = getUserBahagian(email);

  const idxLaporan = headers.indexOf("Laporan");
  const idxStatus = headers.indexOf("Indicator");
  const idxNegeri = headers.indexOf("Negeri");
  const idxBahagian = headers.indexOf("BahagianJpn");

  const statusCount = {};

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[idxStatus];
    const laporan = row[idxLaporan];
    const n = row[idxNegeri]?.toLowerCase() || "";
    const b = row[idxBahagian]?.toLowerCase() || "";

    let isMatch = false;
    if (role === "Admin") isMatch = true;
    else if (role === "Bahagian" && b && email.includes(b)) isMatch = true;
    else if (role === "JPN" && n && negeri && negeri.toLowerCase() === n) isMatch = true;

    if (isMatch) {
      if (!statusCount[status]) statusCount[status] = 0;
      statusCount[status]++;
    }
  }

  return statusCount;
}

function getUserRole(email) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USER_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  email = email.toLowerCase();
  for (let i = 1; i < data.length; i++) {
    if ((data[i][0] || '').toLowerCase() === email) return data[i][2];
  }
  return null;
}

function getUserBahagian(email) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USER_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  email = email.toLowerCase();
  for (let i = 1; i < data.length; i++) {
    if ((data[i][0] || '').toLowerCase() === email) return data[i][3];
  }
  return null;
}

function getUserNegeri(email) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USER_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  email = email.toLowerCase();
  for (let i = 1; i < data.length; i++) {
    if ((data[i][0] || '').toLowerCase() === email) return data[i][4];
  }
  return null;
}

function isDuplicateSyor(laporan, syor, bahagian, negeri) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USER_SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const laporanCell = data[i][1];  // Kolum B
    const syorCell = data[i][2];     // Kolum C
    const bahagianCell = data[i][4]; // Kolum E
    const negeriCell = data[i][5];   // Kolum F

    if (
      laporanCell && syorCell && bahagianCell && negeriCell &&
      laporanCell.trim().toLowerCase() === laporan.trim().toLowerCase() &&
      syorCell.trim().toLowerCase() === syor.trim().toLowerCase() &&
      bahagianCell.trim().toLowerCase() === bahagian.trim().toLowerCase() &&
      negeriCell.trim().toLowerCase() === negeri.trim().toLowerCase()
    ) {
      return true;
    }
  }
  return false;
}

function sendNotificationEmail(bahagian, negeri, laporan, syor, catatan) {
  const userSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Users");
  const users = userSheet.getDataRange().getValues();
  const headers = users[0];

  const emelIdx = headers.indexOf("Emel");
  const bahagianIdx = headers.indexOf("Bahagian");
  const negeriIdx = headers.indexOf("Negeri");

  const recipients = users
    .slice(1)
    .filter(row => {
      const rowBahagian = (row[bahagianIdx] || "").toLowerCase();
      const rowNegeri = (row[negeriIdx] || "").toLowerCase();
      return (
        rowBahagian === (bahagian || "").toLowerCase() ||
        rowNegeri === (negeri || "").toLowerCase()
      );
    })
    .map(row => row[emelIdx])
    .filter(email => email);

  if (recipients.length === 0) return;

  const subject = `📬 Notifikasi STTMP: Syor Menteri bagi ${laporan}`;
  const body = `Assalamualaikum dan salam sejahtera,\n\n` +
               `Satu kemaskini telah dibuat oleh Admin bagi syor berikut:\n\n` +
               `📌 Laporan: ${laporan}\n` +
               `📌 Syor: ${syor}\n` +
               `📌 Catatan Terkini: ${catatan}\n\n` +
               `Sila semak sistem STTMP untuk tindakan selanjutnya.\n\n` +
               `--\nSTTMP Notification`;

  MailApp.sendEmail({
    to: recipients.join(","),
    subject: subject,
    body: body
  });
}

function formatDate(dateObj) {
  if (!(dateObj instanceof Date)) return "";
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
  const yyyy = dateObj.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}


function uploadPDFtoDrive(base64, namaFail, laporan, syor, tarikh) {
  const folder = DriveApp.getFolderById("1SUJX6-MXVpT-kPEkl18yGXb1m4JGAZON");
  const blob = Utilities.newBlob(Utilities.base64Decode(base64), MimeType.PDF, namaFail);
  const file = folder.createFile(blob);

  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); // optional: buat public view

  const link = file.getUrl();

  // Cari row dalam sheet untuk kemaskini
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DB_SHEET_NAME);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (
      row[1]?.toString().trim() === laporan.trim() &&
      row[2]?.toString().trim() === syor.trim()
    ) {
      sheet.getRange(i + 1, 12).setValue(link); // Column L = index 12
      break;
    }
  }

  return link; // hantar balik ke frontend
}

function getSenaraiBahagian() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Setting');
  const data = sheet.getRange('A2:A' + sheet.getLastRow()).getValues().flat();
  return data.filter(n => n).sort();
}

function getSenaraiNegeri() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Setting');
  const data = sheet.getRange('B2:B' + sheet.getLastRow()).getValues().flat();
  return data.filter(n => n).sort();
}


