
  //untuk fungsi select dropdown
  $('#laporanBaru').select2({
  width: '100%',
  placeholder: "Pilih Laporan",
  dropdownAutoWidth: true,
  dropdownParent: $('#tambahModal') // 👈 Ini penting supaya dropdown z-index ikut modal
  });


  //untuk batch indicator status
  function badgeClass(status) {
  if (!status) return 'bg-secondary';
  status = status.toLowerCase();
  if (status === 'hijau') return 'badge-success';
  if (status === 'kuning') return 'badge-warning';
  if (status === 'merah') return 'badge-danger';
  return 'bg-secondary';
}

//dropdown laporanBaru
function populateLaporanDropdown() {
  const tahunSemasa = new Date().getFullYear();

  fetch("https://enazir.moe.gov.my/APIcall.php/tknamapemeriksaan")
    .then(response => response.json())
    .then(data => {
      const laporanInput = document.getElementById("laporanBaru");
      laporanInput.innerHTML = `<option value="">Pilih Laporan</option>`;
      const filtered = data.filter(item => {
        const tahun = parseInt(item.Tahun);
        return tahun >= 2024 && tahun <= tahunSemasa;
      });

      const namaSet = new Set();

      const sortedList = filtered
        .map(item => item.NamaPemeriksaan)
        .filter(nama => {
          if (!namaSet.has(nama)) {
            namaSet.add(nama);
            return true;
          }
          return false;
        })
        .sort((a, b) => a.localeCompare(b));

      sortedList.forEach(nama => {
        laporanInput.innerHTML += `<option value="${nama}">${nama}</option>`;
      });
    })
    .catch(err => console.error("Gagal fetch laporan:", err));
}

function populateBahagianDropdown(...ids) {
  google.script.run
    .withSuccessHandler(function (data) {
      ids.forEach((id) => {
        const dropdown = document.getElementById(id);
        dropdown.innerHTML = `<option value="">Pilih Bahagian</option>`;
        data.forEach((item) => {
          dropdown.innerHTML += `<option value="${item}">${item}</option>`;
        });
      });
    })
    .getSenaraiBahagian();
}

function populateNegeriDropdown(...ids) {
  google.script.run
    .withSuccessHandler(function (data) {
      ids.forEach((id) => {
        const dropdown = document.getElementById(id);
        dropdown.innerHTML = `<option value="">Pilih Negeri</option>`;
        data.forEach((item) => {
          dropdown.innerHTML += `<option value="${item}">${item}</option>`;
        });
      });
    })
    .getSenaraiNegeri();
}

function populateSektorDropdown(...ids) {
  google.script.run
    .withSuccessHandler(function (data) {
      ids.forEach((id) => {
        const dropdown = document.getElementById(id);
        dropdown.innerHTML = `<option value="">Pilih Sektor</option>`;
        data.forEach((item) => {
          dropdown.innerHTML += `<option value="${item}">${item}</option>`;
        });
      });
    })
    .getSenaraiSektor();
}

function prefillSektorIfPeneraju() {
  google.script.run.withSuccessHandler(function (roleData) {
    const isPeneraju = roleData.isPeneraju;
    const sektor = roleData.sektor;

    if (isPeneraju && sektor) {
      const sektorDropdown = document.getElementById("sektorBaru");

      // Autoselect value jika wujud
      const optionToSelect = Array.from(sektorDropdown.options).find(opt => opt.text === sektor || opt.value === sektor);
      if (optionToSelect) {
        optionToSelect.selected = true;
      } else {
        // Kalau option tak wujud, tambah terus
        const newOption = new Option(sektor, sektor);
        sektorDropdown.appendChild(newOption);
        newOption.selected = true;
      }
    }
  }).getUserCheck2();
}

function simpanSyorBaru() {
  // Sync Quill value
  document.getElementById("syorBaru").value = quillSyorBaru.root.innerHTML;
  
  const btn = document.querySelector('#tambahModal .btn-primary');
  btn.disabled = true;
  const originalText = btn.innerHTML;
  btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Simpan...`;

  const data = {
    Laporan: document.getElementById("laporanBaru").value,
    Syor: document.getElementById("syorBaru").value,
    BahagianJpn: document.getElementById("bahagianBaru").value,
    Negeri: document.getElementById("negeriBaru").value,
    Sektor: document.getElementById("sektorBaru").value,
    Indicator: document.getElementById("indicatorBaru").value,
    TarikhKemaskini: document.getElementById("tarikhBaru").value,
    Catatan: document.getElementById("catatanBaru").value,
  };

  google.script.run.withSuccessHandler(() => {
    bootstrap.Modal.getInstance(document.getElementById("tambahModal")).hide();
    loadDataTab2();
    btn.disabled = false;
    btn.innerHTML = originalText;
  }).withFailureHandler((err) => {
    alert(err.message);
    btn.disabled = false;
    btn.innerHTML = originalText;
  }).insertNewSyor(data);
}


// Inisialisasi DataTable selepas table dimuat
function initDataTableDesign(tableId) {
  const table = document.getElementById(tableId);
  if (!$.fn.DataTable.isDataTable(table)) {
    $(table).DataTable({
      responsive: true,
      language: {
        search: "Carian:",
        lengthMenu: "Papar _MENU_ rekod",
        info: "Menunjukkan _START_ hingga _END_ dari _TOTAL_ rekod",
        paginate: {
          first: "Pertama",
          last: "Terakhir",
          next: ">",
          previous: "<"
        }
      }
    });
  }
}


  let skorData = [];  
  let dataTab1 = [];
  let dataTab2 = [];

  function circleClass(status) {
  if (status === "Hijau") return "bg-hijau";
  if (status === "Kuning") return "bg-kuning";
  if (status === "Merah") return "bg-merah";
  return "bg-secondary";
  }

  function hideTabsExcept(allowedIds) {
  const allTabIds = ["tab1", "tab2", "tab3", "tab4", "tab5", "tab1-tab", "tab2-tab", "tab3-tab", "tab4-tab", "tab5-tab"];
  allTabIds.forEach(tabId => {
    const tab = document.getElementById(tabId);
    if (tab) {
      tab.style.display = allowedIds.includes(tabId) ? "" : "none";
    }
  });
}

  function checkUserRoleAndInit() {
  google.script.run.withSuccessHandler(function(roleData) {
    if (!roleData) {
      console.error("❌ roleData is undefined!");
      document.getElementById("loadingSpinner").style.display = "none";
      return;
    }

    const isAdmin = roleData.isAdmin;
    const isPeneraju = roleData.isPeneraju;

    const tabContainer = document.getElementById("PaparanTab");

    if (isAdmin) {
      tabContainer.innerHTML = `
      <ul class="nav nav-tabs custom-nav-tab mt-4" id="myTab" role="tablist">        
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab2-tab" data-bs-toggle="tab" data-bs-target="#tab2" type="button" role="tab">
            Akses Admin
          </button>
        </li>        
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab4-tab" data-bs-toggle="tab" data-bs-target="#tab4" type="button" role="tab">
            Daftar Pengguna
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab3-tab" data-bs-toggle="tab" data-bs-target="#tab3" type="button" role="tab">
            Dashboard
          </button>
        </li>
      </ul>`;
      document.getElementById("tab2-tab").click();
      loadDataTab2();
    } else if (isPeneraju) {
      tabContainer.innerHTML = `
      <ul class="nav nav-tabs custom-nav-tab mt-4" id="myTab" role="tablist"> 
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab5-tab" data-bs-toggle="tab" data-bs-target="#tab5" type="button" role="tab">
            Akses Peneraju
          </button>
        </li>
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab3-tab" data-bs-toggle="tab" data-bs-target="#tab3" type="button" role="tab">
            Dashboard
          </button>
        </li>
      </ul>`;
      document.getElementById("tab5-tab").click();
      loadDataTab3();
    } else {
      tabContainer.innerHTML = `
      <ul class="nav nav-tabs custom-nav-tab mt-4" id="myTab" role="tablist">
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab1-tab" data-bs-toggle="tab" data-bs-target="#tab1" type="button" role="tab">
            Akses Bahagian/JPN
          </button>
        </li>       
        <li class="nav-item" role="presentation">
          <button class="nav-link" id="tab3-tab" data-bs-toggle="tab" data-bs-target="#tab3" type="button" role="tab">
            Dashboard
          </button>
        </li>
      </ul>`;
      document.getElementById("tab1-tab").click();
      loadDataTab1();
    }

    // Selepas semua ok, tunjukkan tab dan sembunyi spinner
    document.getElementById("loadingSpinner").style.display = "none";
    tabContainer.style.display = "block";
  }).getUserCheck(); // Pastikan backend return isAdmin dan isPeneraju
}

  function showUserDetails() {
    google.script.run.withSuccessHandler(function(user) {
      document.getElementById("Info").innerHTML = `
        Nama Pengguna: <strong>${user.nama}</strong><br>
        Agensi: <span class="text-primary">${user.peranan}</span><br>
        Lokasi: ${user.lokasi ? "" + user.lokasi : ""}<br>
        E-mel: <small class="text-muted">${user.email}</small>
      `;
    }).getUsers();
  }



  document.getElementById("tab1-tab").addEventListener("click", loadDataTab1);
  document.getElementById("tab2-tab").addEventListener("click", loadDataTab2);
  document.getElementById("tab5-tab").addEventListener("click", loadDataTab3);
  document.getElementById("tab3-tab").addEventListener("click", () => {loadTab3Dashboard();});
  



  function loadDataTab1() {
    google.script.run.withSuccessHandler(function(data) {
      // google.script.run.withSuccessHandler(function(email) {
      //   document.getElementById("email1").textContent = email;
      // }).getCurrentEmail();

      if (!data || data.length === 0) {
        document.getElementById("dataBody1").innerHTML = `<tr><td colspan='11' class='text-center text-danger fw-bold'>Akses tidak dibenarkan</td></tr>`;
        return;
      }
      dataTab1 = JSON.parse(JSON.stringify(data));
      renderTableTab1(dataTab1);
      initDataTableDesign("dataTableDesign1");
    }).getAssignedSyorLimited();
  }

  function loadDataTab2() {
    google.script.run.withSuccessHandler(function(data) {
      
      if (!data || data.length === 0) {
        document.getElementById("dataBody2").innerHTML = `<tr><td colspan='9' class='text-center text-danger fw-bold'>Akses tidak dibenarkan</td></tr>`;
        return;
      }
      dataTab2 = JSON.parse(JSON.stringify(data));
      renderTableTab2(dataTab2);
      initDataTableDesign("dataTableDesign2");
    }).getAssignedSyor();
  }

  function loadDataTab3() {
  google.script.run.withSuccessHandler(function(data) {
    if (!data || data.length === 0) {
      document.getElementById("dataBody3").innerHTML = `<tr><td colspan='11' class='text-center text-danger fw-bold'>Akses tidak dibenarkan</td></tr>`;
      return;
    }

    // ✅ Parse sini sebab backend return string
    dataTab3 = JSON.parse(JSON.stringify(data)); 
    renderTableTab3(dataTab3);
    initDataTableDesign("dataTableDesign3");
  }).getAssignedSyorPeneraju();
}



  function renderTableTab3(data) {
    const body = document.getElementById("dataBody3");
    body.innerHTML = "";
    data.forEach((item, idx) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${idx + 1}</td>
        <td>${item.Laporan}</td>
        <td>${item.Syor || ""}</td>
        <td>${item.Sektor || ""}</td>
        <td>${item.BahagianJpn || ""}</td>
        <td>${item.Negeri || ""}</td>
        <td>${
          item.FileLink 
            ? `<a href="${item.FileLink}" target="_blank">Klik Sini</a>` 
            : `<span class="text-muted fst-italic">Tiada</span>`
        }</td>
        <td><div class="text-center"><span class="status-circle ${circleClass(item.Indicator)}" title="${item.Indicator}"></span></div></td>
        <td>${formatDate(item.TarikhKemaskini)}</td>
        <td>${item.Catatan || ""}</td>
        <td><button class="btn btn-primary btn-sm" onclick='bukaModalTab2(${JSON.stringify(item)})'>Kemaskini</button></td>
      `;
      body.appendChild(row);
    });
  }

  function renderTableTab1(data) {
    const body = document.getElementById("dataBody1");
    body.innerHTML = "";
    data.forEach((item, idx) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${idx + 1}</td>
        <td>${item.Laporan}</td>
        <td>${item.Syor || ""}</td>
        <td>${item.BahagianJpn || ""}</td>
        <td>${item.Negeri || ""}</td>
        <td>${item.Respon || ""}</td>
        <td>${item.TempohMasa || ""}</td>
        <td>${
          item.FileLink 
            ? `<a href="${item.FileLink}" target="_blank">Klik Sini</a>` 
            : `<span class="text-muted fst-italic">Tiada</span>`
        }</td>

        <td>${formatDate(item.TarikhKemaskini)}</td>
        <td><div class="text-center"><span class="status-circle ${circleClass(item.Indicator)}" title="${item.Indicator}"></span></div></td>
        <td><button class="btn btn-primary btn-sm" onclick='bukaModalTab1(${JSON.stringify(item)})'>Respon</button></td>
      `;
      body.appendChild(row);
    });
  }

  function bukaModalTab1(item) {
    document.getElementById("rowNum1").value = item.RowNum;
    document.getElementById("PemeriksaanInfo2").value = item.Laporan || "";
    document.getElementById("SyorInfo2").innerHTML = item.Syor || "";
    document.getElementById("responInput").value = item.Respon || "";

    quillResponInput.root.innerHTML = item.Respon || "";

    const tarikh = item.TarikhKemaskini 
      ? new Date(item.TarikhKemaskini).toISOString().split("T")[0] 
      : "";
    document.getElementById("tarikhInput1").value = tarikh;
    document.getElementById("tempohMasaInput").value = item.TempohMasa || "";
    const modal = new bootstrap.Modal(document.getElementById("kemaskiniModal1"));
    modal.show();
  }

  function simpanKemaskiniTab1() {

  document.getElementById("responInput").value = quillResponInput.root.innerHTML;

  const row = document.getElementById("rowNum1").value;
  const respon = document.getElementById("responInput").value;
  const tarikh = document.getElementById("tarikhInput1").value;
  const tempohMasa = document.getElementById("tempohMasaInput").value;
  const laporan = document.getElementById("PemeriksaanInfo2").value;
  const syor = document.getElementById("SyorInfo2").value;

  const data = { row, respon, tarikh, tempohMasa, Laporan: laporan, Syor: syor };

  const fileInput = document.getElementById("pdfUpload");
  const file = fileInput.files[0];

  if (file) {
    const fr = new FileReader();
    fr.onload = function (e) {
      const base64 = e.target.result.split(",")[1];
      const namaFail = `${laporan}_${syor}_${tarikh}.pdf`;

      google.script.run
        .withSuccessHandler((link) => {
          alert("Fail PDF berjaya dimuat naik.");
          console.log("Link PDF:", link);
          // Baru update respon selepas upload selesai
          google.script.run.withSuccessHandler(() => {
            bootstrap.Modal.getInstance(document.getElementById("kemaskiniModal1")).hide();
            loadDataTab1();
          }).updateRespon(row, respon, tarikh, tempohMasa);
        })
        .withFailureHandler(err => {
          alert("Ralat upload PDF: " + err.message);
        })
        .uploadPDFtoDrive(base64, namaFail, data.Laporan, data.Syor, data.TarikhKemaskini);
    };
    fr.readAsDataURL(file);
  } else {
    // No PDF uploaded, just update the form data
    google.script.run.withSuccessHandler(() => {
      bootstrap.Modal.getInstance(document.getElementById("kemaskiniModal1")).hide();
      loadDataTab1();
    }).updateRespon(row, respon, tarikh, tempohMasa);
  }
}

  function renderTableTab2(data) {
    const body = document.getElementById("dataBody2");
    body.innerHTML = "";
    data.forEach((item, idx) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${idx + 1}</td>
        <td>${item.Laporan}</td>
        <td>${item.Syor || ""}</td>
        <td>${item.BahagianJpn || ""}</td>
        <td>${item.Negeri || ""}</td>
        <td>${
          item.FileLink 
            ? `<a href="${item.FileLink}" target="_blank">Klik Sini</a>` 
            : `<span class="text-muted fst-italic">Tiada</span>`
        }</td>
        <td><div class="text-center"><span class="status-circle ${circleClass(item.Indicator)}" title="${item.Indicator}"></span></div></td>
        <td>${formatDate(item.TarikhKemaskini)}</td>
        <td>${item.Catatan || ""}</td>
        <td><button class="btn btn-primary btn-sm" onclick='bukaModalTab2(${JSON.stringify(item)})'>Kemaskini</button></td>
      `;
      body.appendChild(row);
    });
  }

  function bukaModalTab2(item) {
    document.getElementById("rowNum2").value = item.RowNum;
    document.getElementById("PemeriksaanInfo").value = item.Laporan || "";
    document.getElementById("SyorInfo").value = item.Syor || "";
    document.getElementById("ResponInfo").innerHTML = item.Respon || "";
    document.getElementById("statusInput").value = item.Indicator || "";

    quillSyorInfo.root.innerHTML = item.Syor || "";

    const tarikh = item.TarikhKemaskini 
      ? new Date(item.TarikhKemaskini).toISOString().split("T")[0] 
      : "";
    document.getElementById("tarikhInput2").value = tarikh;

    document.getElementById("tempohMasaInput2").value = item.TempohMasa || "";
    document.getElementById("catatanInput").value = item.Catatan || "";
    const modal = new bootstrap.Modal(document.getElementById("kemaskiniModal2"));
    modal.show();
  }

  function simpanKemaskiniTab2() {
    document.getElementById("SyorInfo").value = quillSyorInfo.root.innerHTML;

    const row = document.getElementById("rowNum2").value;
    const syor = document.getElementById("SyorInfo").value;
    const status = document.getElementById("statusInput").value;
    const tarikh = document.getElementById("tarikhInput2").value;
    const catatan = document.getElementById("catatanInput").value;
    google.script.run
    .withSuccessHandler(() => {
      bootstrap.Modal.getInstance(document.getElementById("kemaskiniModal2")).hide();
      loadDataTab2();
    })
    .withFailureHandler(err => {
      alert("Ralat semasa menghantar data atau emel: " + err.message);
    })
    .updateSyor(row, syor, status, tarikh, catatan);
  }
  
  function simpanKemaskiniTab3() {
    document.getElementById("SyorInfo").value = quillSyorInfo.root.innerHTML;

    const row = document.getElementById("rowNum2").value;
    const syor = document.getElementById("SyorInfo").value;
    const status = document.getElementById("statusInput").value;
    const tarikh = document.getElementById("tarikhInput2").value;
    const catatan = document.getElementById("catatanInput").value;
    google.script.run
    .withSuccessHandler(() => {
      bootstrap.Modal.getInstance(document.getElementById("kemaskiniModal3")).hide();
      loadDataTab3();
    })
    .withFailureHandler(err => {
      alert("Ralat semasa menghantar data atau emel: " + err.message);
    })
    .updateSyor(row, syor, status, tarikh, catatan);
  }

 function loadTab3Dashboard() {
  google.script.run.withSuccessHandler(function (user) {
    const isAdmin = user.peranan === "Admin";
    let getDataFn = "";

    if (user.peranan === "Admin") {
      getDataFn = "getAssignedSyor";
    } else if (user.peranan === "Peneraju") {
      getDataFn = "getAssignedSyorPeneraju";
    } else {
      getDataFn = "getAssignedSyorLimited";
    }

    // KPI Card (Hijau/Kuning/Merah)
    google.script.run.withSuccessHandler(function (data) {
      const statusCount = { Selesai: 0, "Dalam Tindakan": 0, "Belum Selesai": 0 };

      document.getElementById("totalSyor").textContent = data.length;

      data.forEach(item => {
        const status = item.Indicator?.toLowerCase();
        if (status === "hijau") statusCount.Selesai++;
        else if (status === "kuning") statusCount["Dalam Tindakan"]++;
        else if (status === "merah") statusCount["Belum Selesai"]++;
      });

      document.getElementById("totalSelesai").textContent = statusCount.Selesai;
      document.getElementById("totalTindakan").textContent = statusCount["Dalam Tindakan"];
      document.getElementById("totalBelum").textContent = statusCount["Belum Selesai"];
      renderStatusBarChart(statusCount);
    })[getDataFn]();

    // Pie chart
    google.script.run.withSuccessHandler(function (data) {
      const countByBahagian = {};
      data.forEach(item => {
        const bahagian = item.BahagianJpn || "Lain-lain";
        countByBahagian[bahagian] = (countByBahagian[bahagian] || 0) + 1;
      });
      renderBahagianPieChart(countByBahagian);
    })[getDataFn]();

    // Top 5 syor
    google.script.run.withSuccessHandler(function (data) {
      const sorted = data.sort((a, b) => a.SkorWajaran - b.SkorWajaran).slice(0, 5);
      const body = document.getElementById("top5SyorBody");
      body.innerHTML = "";
      sorted.forEach((item, idx) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${idx + 1}</td>
          <td>${item.Laporan}</td>
          <td>${item.Syor}</td>
          <td>${item.BahagianJpn}</td>
          <td><span class="fw-bold">${item.SkorWajaran}</span></td>
        `;
        body.appendChild(row);
      });
    }).getSkorWajaranByUser();

  }).getUsers(); // Get role first
}


   function renderStatusBarChart(data) {
      const ctx = document.getElementById("statusBarChart").getContext("2d");
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(data),
          datasets: [{
            label: 'Jumlah Syor',
            data: Object.values(data),
            backgroundColor: ['#28a745', '#ffc107', '#dc3545']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }

    function renderBahagianPieChart(data) {
      const ctx = document.getElementById("bahagianPieChart").getContext("2d");
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(data),
          datasets: [{
            data: Object.values(data),
            backgroundColor: Object.keys(data).map(() =>
              `hsl(${Math.random() * 360}, 60%, 60%)`)
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }



  function badgeClass(status) {
    if (status === "Hijau") return "badge-success";
    if (status === "Kuning") return "badge-warning";
    if (status === "Merah") return "badge-danger";
    return "bg-secondary";
  }

  function formatDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function formatDateForInput(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split(/[-\/]/);
    if (parts.length === 3) {
      const [d, m, y] = parts;
      if (y.length === 4) return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; // dd/mm/yyyy
      if (d.length === 4) return `${d}-${m.padStart(2, '0')}-${y.padStart(2, '0')}`; // yyyy-mm-dd
    }
    return "";
  }

  document.getElementById("searchInput1").addEventListener("input", function() {
    const val = this.value.toLowerCase();
    const filtered = dataTab1.filter(item =>
      (item.Laporan || '').toLowerCase().includes(val) ||
      (item.Syor || '').toLowerCase().includes(val) ||
      (item.Indicator || '').toLowerCase().includes(val) ||
      (item.TempohMasa || '').toLowerCase().includes(val) ||
      (item.Respon || '').toLowerCase().includes(val)
    );
    renderTableTab1(filtered);
  });

  document.getElementById("searchInput2").addEventListener("input", function() {
    const val = this.value.toLowerCase();
    const filtered = dataTab2.filter(item =>
      (item.Laporan || '').toLowerCase().includes(val) ||
      (item.Syor || '').toLowerCase().includes(val) ||
      (item.Indicator || '').toLowerCase().includes(val) ||
      (item.BahagianJpn || '').toLowerCase().includes(val) ||
      (item.Negeri || '').toLowerCase().includes(val) ||
      (item.TarikhKemaskini || '').toLowerCase().includes(val) ||
      (item.Catatan || '').toLowerCase().includes(val)
    );
    renderTableTab2(filtered);
  });

  function loadDataUsers() {
    google.script.run.withSuccessHandler(function(data) {
      
      if (!data || data.length === 0) {
        document.getElementById("dataBodyUsers").innerHTML = `<tr><td colspan='9' class='text-center text-danger fw-bold'>Akses tidak dibenarkan</td></tr>`;
        return;
      }
      dataTab3 = JSON.parse(JSON.stringify(data));
      renderTableUsers(dataTab3);
      initDataTableDesign("dataTableUsers");
    }).getAllUsers();
  }
  
  let users = [];
  function renderTableUsers(data) {
    const body = document.getElementById("dataBodyUsers");
    body.innerHTML = "";
    data.forEach((item, i) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${item.nama}</td>
        <td>${item.email}</td>
        <td>${item.peranan}</td>
        <td>${item.bahagian || "-"}</td>
        <td>${item.negeri || "-"}</td>
        <td>${item.sektor || "-"}</td>
        <td class="text-center">
          <div class="d-flex justify-content-center gap-1">
            <button class="btn btn-warning btn-sm btn-kemaskini"
              data-index="${i}"
              data-nama="${item.nama}"
              data-email="${item.email}"
              data-peranan="${item.peranan}"
              data-bahagian="${item.bahagian || ''}"
              data-negeri="${item.negeri || ''}"
              data-sektor="${item.sektor || ''}">
              <i class="bi bi-pencil-square"></i>
            </button>
            <button class="btn btn-danger btn-sm btn-delete"
              data-index2="${i}"
              data-email="${item.email}">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      `;
      body.appendChild(row);
    });
  }

// Event delegation utk butang Kemaskini
document.addEventListener("click", function (e) {
  if (e.target.closest(".btn-kemaskini")) {
    const btn = e.target.closest(".btn-kemaskini");
    const item = {
      nama: btn.getAttribute('data-nama'),
      email: btn.getAttribute('data-email'),
      peranan: btn.getAttribute('data-peranan'),
      bahagian: btn.getAttribute('data-bahagian'),
      negeri: btn.getAttribute('data-negeri'),
      sektor: btn.getAttribute('data-sektor')
    };
    const index = parseInt(btn.getAttribute('data-index'));
    bukaModalKemaskiniPengguna(item, index);
  }
});

// Event delegation utk butang Delete
document.addEventListener("click", function (e) {
  if (e.target.closest(".btn-delete")) {
    const btn = e.target.closest(".btn-delete");
    const row = parseInt(btn.getAttribute('data-index2')) + 2;
    const email = btn.getAttribute('data-email');
    if (confirm(`Padam pengguna ini?\n\nE-mel: ${email}`)) {
      google.script.run.withSuccessHandler(() => {
        loadDataUsers();
      }).deleteUser(row);
    }
  }
});


  function bukaModalDaftarPengguna() {
    document.getElementById("formDaftarPengguna").reset();
    const modal = new bootstrap.Modal(document.getElementById("daftarPenggunaModal"));
    modal.show();
  }

  function bukaModalKemaskiniPengguna(item, rowIndex) {
  document.getElementById("rowNumKemaskini").value = rowIndex + 2;
  document.getElementById("namaKemaskini").value = item.nama;
  document.getElementById("emelKemaskini").value = item.email;
  document.getElementById("perananKemaskini").value = item.peranan;
  document.getElementById("bahagianUserKemaskini").value = item.bahagian || "";
  document.getElementById("negeriUserKemaskini").value = item.negeri || "";
  document.getElementById("sektorUserKemaskini").value = item.sektor || "";

  const modal = new bootstrap.Modal(document.getElementById("kemaskiniPenggunaModal"));
  modal.show();
}


  // Auto-run ikut peranan
  window.onload = function () {       
    checkUserRoleAndInit();
    showUserDetails();
    loadTab3Dashboard();
    populateLaporanDropdown();
    populateBahagianDropdown("bahagianBaru", "bahagianUserBaru","bahagianUserKemaskini");
    populateNegeriDropdown("negeriBaru", "negeriUserBaru","negeriUserKemaskini");
    populateSektorDropdown("sektorBaru","sektorUserBaru","sektorUserKemaskini")
 

    const hariList = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
      const bulanList = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
      const today = new Date();
      const hari = hariList[today.getDay()];
      const tarikh = today.getDate();
      const bulan = bulanList[today.getMonth()];
      const tahun = today.getFullYear();

      document.getElementById("liveDate").innerText = `${hari}, ${tarikh} ${bulan} ${tahun}`;
      document.getElementById("tab4-tab").addEventListener("click", loadDataUsers);
    
    document.getElementById("formKemaskiniPengguna").addEventListener("submit", function(e) {
    e.preventDefault();

    const emailInput = document.getElementById("emelKemaskini").value.trim();
    const regex = /^[a-zA-Z0-9._%+-]+@moe\.gov\.my$/;
    if (!regex.test(emailInput)) {
      alert("Sila masukkan e-mel sah seperti: nama@moe.gov.my");
      return;
    }

    const data = {
      row: document.getElementById("rowNumKemaskini").value,
      nama: document.getElementById("namaKemaskini").value,
      email: document.getElementById("emelKemaskini").value,
      peranan: document.getElementById("perananKemaskini").value,
      bahagian: document.getElementById("bahagianUserKemaskini").value,
      negeri: document.getElementById("negeriUserKemaskini").value,
      sektor: document.getElementById("sektorUserKemaskini").value,
    };

    google.script.run.withSuccessHandler(() => {
        bootstrap.Modal.getInstance(document.getElementById("kemaskiniPenggunaModal")).hide();
        loadDataUsers();
      }).updateUser(data);
    });

    document.getElementById("formDaftarPengguna").addEventListener("submit", function(e) {
      e.preventDefault();
      const emailInput = document.getElementById("emelBaru").value.trim();
      const regex = /^[a-zA-Z0-9._%+-]+@moe\.gov\.my$/;

      if (!regex.test(emailInput)) {
        alert("Sila masukkan e-mel sah seperti: nama@moe.gov.my");
        return;
      }
      const data = {
        nama: document.getElementById("namaBaru").value,
        email: document.getElementById("emelBaru").value,
        peranan: document.getElementById("perananBaru").value,
        bahagian: document.getElementById("bahagianUserBaru").value,
        negeri: document.getElementById("negeriUserBaru").value,
        sektor: document.getElementById("sektorUserBaru").value,
      };
      google.script.run.withSuccessHandler(() => {
        bootstrap.Modal.getInstance(document.getElementById("daftarPenggunaModal")).hide();
        loadDataUsers();
      }).insertUser(data);
    });
  };


  const quillSyorBaru = new Quill('#editorSyorBaru', {
    theme: 'snow',
    placeholder: 'Masukkan kandungan syor di sini...',
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean']
      ]
    }
  });

  const quillResponInput = new Quill('#editorResponInput', {
    theme: 'snow',
    placeholder: 'Masukkan respon di sini...',
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean']
      ]
    }
  });

  const quillSyorInfo = new Quill('#editorSyorInfo', {
    theme: 'snow',
    placeholder: 'Masukkan kandungan syor di sini...',
    modules: {
      toolbar: [
        [{ header: [1, 2, false] }],
        ['bold', 'italic', 'underline'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['clean']
      ]
    }
  });

  // Sync hidden input sebelum submit
  document.getElementById("formTambahSyor").addEventListener("submit", function (e) {
    document.getElementById("syorBaru").value = quillSyorBaru.root.innerHTML;
  });

  document.getElementById("kemaskiniForm1").addEventListener("submit", function (e) {
    document.getElementById("responInput").value = quillResponInput.root.innerHTML;
  });

  document.getElementById("kemaskiniForm2").addEventListener("submit", function (e) {
    document.getElementById("syorInfo").value = quillSyorInfo.root.innerHTML;
  });




