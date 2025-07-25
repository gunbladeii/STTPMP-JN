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

function isUserPeneraju() {
  const userSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USER_SHEET_NAME);
  const data = userSheet.getDataRange().getValues();
  const email = Session.getActiveUser().getEmail().toLowerCase();

  for (let i = 1; i < data.length; i++) {
    const userEmail = data[i][0]?.toLowerCase();
    const role = data[i][2]; // Kolum C = Peranan
    if (userEmail === email && role === "Peneraju") {
      return true;
    }
  }
  return false;
}

function getUserCheck() {
  const email = Session.getActiveUser().getEmail().toLowerCase();
  const users = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Users").getDataRange().getValues();
  
  if (!users || users.length === 0) {
    console.log("❌ Tiada data dalam sheet Users");
    return { isAdmin: false, isPeneraju: false };
  }

  const headers = users[0];
  console.log("✅ Headers:", headers);

  const emailIdx = headers.indexOf("Email");
  const perananIdx = headers.indexOf("Peranan");

  if (emailIdx === -1 || perananIdx === -1) {
    console.log("❌ Column Email atau Peranan tak dijumpai!");
    return { isAdmin: false, isPeneraju: false };
  }

  let isAdmin = false;
  let isPeneraju = false;

  for (let i = 1; i < users.length; i++) {
    if ((users[i][emailIdx] || "").toLowerCase() === email) {
      const role = (users[i][perananIdx] || "").toLowerCase();
      isAdmin = role === "admin";
      isPeneraju = role === "peneraju";
      break;
    }
  }

  return { isAdmin, isPeneraju  };
}

function getUserRoleInfo() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Users");
  const email = Session.getActiveUser().getEmail().toLowerCase();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const emailIdx = headers.indexOf("Emel");
  const roleIdx = headers.indexOf("Peranan");
  const sektorIdx = headers.indexOf("Sektor");

  for (let i = 1; i < data.length; i++) {
    if ((data[i][emailIdx] || "").toLowerCase() === email) {
      return {
        peranan: data[i][roleIdx],
        sektor: data[i][sektorIdx]
      };
    }
  }
  return null;
}

function getUserInfoSektor() {
  const email = Session.getActiveUser().getEmail().toLowerCase();
  const usersSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Users");
  const data = usersSheet.getDataRange().getValues();

  const headers = data[0];
  const emailIdx = headers.indexOf("Email");
  const perananIdx = headers.indexOf("Peranan");
  const sektorIdx = headers.indexOf("Sektor");

  if (emailIdx === -1 || perananIdx === -1 || sektorIdx === -1) {
    console.log("❌ Column Email/Peranan/Sektor tak dijumpai!");
    return null;
  }

  for (let i = 1; i < data.length; i++) {
    if ((data[i][emailIdx] || "").toLowerCase() === email) {
      const peranan = data[i][perananIdx] || "";
      const sektor = data[i][sektorIdx] || "";
      return {
        peranan: peranan,
        sektor: sektor,
        isAdmin: peranan === "Admin",
        isPeneraju: peranan === "Peneraju"
      };
    }
  }

  return null;
}


function getUsers() {
  const userSheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USER_SHEET_NAME);
  const data = userSheet.getDataRange().getValues();
  const email = Session.getActiveUser().getEmail().toLowerCase();

  for (let i = 1; i < data.length; i++) {
    const userEmail = data[i][0]?.toLowerCase();
    const nama = data[i][1];
    const peranan = data[i][2];
    const bahagian = data[i][3];
    const negeri = data[i][4];
    const sektor = data[i][5];

    if (email === userEmail) {
      let lokasi = "";
      if (peranan === "JPN") {
        lokasi = negeri || "-";
      } else if (peranan === "Bahagian") {
        lokasi = bahagian || "-";
      } else if (peranan === "Peneraju") {
        lokasi = sektor || "-";
      }

      return { nama, peranan, lokasi, email };
    }
  }

  return { nama: "Tidak dikenalpasti", peranan: "Tiada", lokasi: "", email };
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
        negeri: row[4],
        sektor: row[5]
      };
    }
  }
  return null;
}
function getAllUsers() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Users");
  const user = getUserDetails();
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  return data.map((row, i) => {
    const obj = {};
    headers.forEach((h, j) => obj[h.toLowerCase()] = row[j]);
    if (
      (user.peranan === "Admin")
    ) {
      return obj;
    }
    return JSON.parse(JSON.stringify(obj));
  });
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

function getAssignedSyorPeneraju() {
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
      (user.peranan === "Peneraju" && row["Sektor"]?.toLowerCase().includes(user.sektor.toLowerCase()))
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

function updateSyorPeneraju(rowNum, syor, tarikh) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DB_SHEET_NAME);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const syorIdx = headers.indexOf("Syor") + 1;
  const tarikhIdx = headers.indexOf("TarikhKemaskini") + 1;

  sheet.getRange(rowNum, syorIdx).setValue(syor);
  sheet.getRange(rowNum, tarikhIdx).setValue(tarikh);

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
  const syorIdx = headers.indexOf("Syor");
  const bahagianIdx = headers.indexOf("BahagianJpn");
  const sektorIdx = headers.indexOf("Sektor");
  const negeriIdx = headers.indexOf("Negeri");
  const indicatorIdx = headers.indexOf("Indicator");

  const skorMap = { "Hijau": 1, "Kuning": 0.5, "Merah": 0 };
  const laporanMap = {};

  for (let i = 1; i < data.length; i++) {
    const laporan = data[i][laporanIdx];
    const syor = data[i][syorIdx];
    const bahagian = data[i][bahagianIdx]?.toLowerCase() || "";
    const sektor = data[i][sektorIdx]?.toLowerCase() || "";
    const negeri = data[i][negeriIdx]?.toLowerCase() || "";
    const status = data[i][indicatorIdx];

    const skor = skorMap[status] ?? 0;

    if (
      user.peranan === "Admin" ||
      (user.peranan === "Bahagian" && bahagian.includes(user.bahagian.toLowerCase())) ||
      (user.peranan === "Peneraju" && sektor.includes(user.sektor.toLowerCase())) ||
      (user.peranan === "JPN" && negeri.includes(user.negeri.toLowerCase()))
    ) {
      if (!laporanMap[laporan]) laporanMap[laporan] = [];

      laporanMap[laporan].push({
        Laporan: laporan,
        Syor: syor,
        BahagianJpn: data[i][bahagianIdx],
        Skor: skor
      });
    }
  }

  const result = [];
  for (const laporan in laporanMap) {
    const items = laporanMap[laporan];
    const total = items.reduce((sum, item) => sum + item.Skor, 0);
    const avg = items.length ? total / items.length : 0;

    let status = "Merah";
    if (avg === 1) status = "Hijau";
    else if (avg > 0 && avg < 1) status = "Kuning";

    result.push({
      Laporan: laporan,
      Syor: items[0].Syor || "-",
      BahagianJpn: items[0].BahagianJpn || "-",
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
  const htmlBody = `
      <div style="font-family:Arial,sans-serif;border:1px solid #0d6efd;border-radius:8px;padding:16px;background:#f8f9fa;">
        <h3 style="color:#0d6efd;margin-top:0;">📢 Notifikasi STTMP</h3>
        <p>Assalamualaikum dan salam sejahtera,</p>
        <p>Satu kemaskini telah dibuat oleh <strong>Admin</strong> bagi syor berikut:</p>

        <div style="border-left:4px solid #dc3545;padding-left:10px;margin:10px 0;">
          <p><strong>📌 Laporan:</strong> ${laporan}</p>
          <p><strong>📌 Syor:</strong> ${syor}</p>
          <hr>
          <p><strong>📌 Maklum balas Jemaah Nazir (Urus setia):</strong> ${catatan}</p>
        </div>

        <p>Sila semak sistem STTMP untuk tindakan selanjutnya.</p>
        <p style="font-size:12px;color:#888;">--<br>STTMP Notification</p>
      </div>
    `;

  MailApp.sendEmail({
    to: recipients.join(","),
    subject: subject,
    htmlBody: htmlBody // ✅ HTML!
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

function getSenaraiSektor() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Setting');
  const data = sheet.getRange('C2:C' + sheet.getLastRow()).getValues().flat();
  return data.filter(n => n).sort();
}

// ✅ Logging aktiviti pengguna ke sheet Log_Aktiviti
function logAktiviti(email, laporan, indicator, catatan) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Log_Aktiviti");
  sheet.appendRow([
    new Date(),
    email,
    getUserBahagian(email),
    getLastBilFromSTTMP_DB(laporan),
    laporan,
    indicator,
    catatan
  ]);
}

function getUserBahagian(email) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Users");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === email) {
      return data[i][4]; // Bahagian
    }
  }
  return "";
}

function getLastBilFromSTTMP_DB(laporan) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("STTMP_DB");
  const data = sheet.getDataRange().getValues();
  let bil = "";
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][1] === laporan) {
      bil = data[i][0];
      break;
    }
  }
  return bil;
}


function insertUser(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(USER_SHEET_NAME);
  sheet.appendRow([data.email, data.nama, data.peranan, data.bahagian, data.negeri, data.sektor]);
}

function updateUser(data) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(USER_SHEET_NAME);
  const row = Number(data.row);
  sheet.getRange(row, 1, 1, 6).setValues([[data.email, data.nama, data.peranan, data.bahagian, data.negeri, data.sektor]]);
}

function deleteUser(row) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("Users");
  sheet.deleteRow(parseInt(row));
}

function getDashboardDataNegeri() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(DB_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);

  const negeriStat = {};

  rows.forEach(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);

    const negeri = obj.Negeri || 'LAIN';
    const status = obj.Status || 'Lain';

    if (!negeriStat[negeri]) {
      negeriStat[negeri] = { Selesai: 0, DalamTindakan: 0, BelumSelesai: 0 };
    }

    if (status === "Selesai") negeriStat[negeri].Selesai++;
    else if (status === "Dalam Tindakan") negeriStat[negeri].DalamTindakan++;
    else negeriStat[negeri].BelumSelesai++;
  });

  return negeriStat;
}

function getDashboardDataByYear(tahun) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName("STTMP_DB");
  const data = sheet.getDataRange().getValues();
  const header = data[0];
  const rows = data.slice(1).filter(r => r[1] === tahun); // Tahun = Col B (index 1)

  return processDashboardData(rows); // kekalkan fungsi asal
}


