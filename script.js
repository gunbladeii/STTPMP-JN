
  //untuk fungsi select dropdown tab admin
  $('#laporanBaru').select2({
    width: '100%',
    placeholder: "Pilih Laporan",
    dropdownAutoWidth: true,
    dropdownParent: $('#tambahModal') // 👈 Ini penting supaya dropdown z-index ikut modal
    });
  
    //untuk fungsi select dropdown tab
    $('#laporanBaru2').select2({
    width: '100%',
    placeholder: "Pilih Laporan",
    dropdownAutoWidth: true,
    dropdownParent: $('#tambahModal2') // 👈 Ini penting supaya dropdown z-index ikut modal
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
  function populateLaporanDropdown(...dropdownIds) {
    const tahunSemasa = new Date().getFullYear();
  
    fetch("https://enazir.moe.gov.my/APIcall.php/tknamapemeriksaan")
      .then(response => response.json())
      .then(data => {
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
  
        dropdownIds.forEach(dropdownId => {
          const dropdown = document.getElementById(dropdownId);
          if (!dropdown) {
            console.warn(`❌ Element with ID '${dropdownId}' not found`);
            return;
          }
          dropdown.innerHTML = `<option value="">Pilih Laporan</option>`;
          sortedList.forEach(nama => {
            dropdown.innerHTML += `<option value="${nama}">${nama}</option>`;
          });
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
  
  //Syor baharu peneraju
  function simpanSyorBaru2() {
    // Sync Quill value
    document.getElementById("syorBaru2").value = quillSyorBaru2.root.innerHTML;
    
    const btn = document.querySelector('#tambahModal2 .btn-primary');
    btn.disabled = true;
    const originalText = btn.innerHTML;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Simpan...`;
  
    const data = {
      Laporan: document.getElementById("laporanBaru2").value,
      Syor: document.getElementById("syorBaru2").value,
      BahagianJpn: document.getElementById("bahagianBaru2").value,
      Negeri: document.getElementById("negeriBaru2").value,
      Sektor: document.getElementById("sektorBaru2").value.trim(),
      Indicator: document.getElementById("indicatorBaru2").value,
      TarikhKemaskini: document.getElementById("tarikhBaru2").value,
      Catatan: document.getElementById("catatanBaru2").value,
    };
  
    google.script.run.withSuccessHandler(() => {
      bootstrap.Modal.getInstance(document.getElementById("tambahModal2")).hide();
      loadDataTab3();
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
  
    function bindTabClickListeners() {
      const tab1 = document.getElementById("tab1-tab");
      const tab2 = document.getElementById("tab2-tab");
      const tab3 = document.getElementById("tab3-tab");
      const tab4 = document.getElementById("tab4-tab");
      const tab5 = document.getElementById("tab5-tab");
  
      if (tab1) tab1.addEventListener("click", loadDataTab1);
      if (tab2) tab2.addEventListener("click", loadDataTab2);
      if (tab3) tab3.addEventListener("click", loadTab3Dashboard);
      if (tab4) tab4.addEventListener("click", loadDataUsers);
      if (tab5) tab5.addEventListener("click", loadDataTab3);
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
        document.getElementById("viewChart2").style.display = "none";
        document.getElementById("tab2-tab").click();
        bindTabClickListeners()
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
        document.getElementById("viewChart2").style.display = "none";
        document.getElementById("tab5-tab").click();
        bindTabClickListeners()
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
        
        ["viewChart1", "viewChart3"].forEach(id => {
          const elem = document.getElementById(id);
          if (elem) elem.style.display = "none";
        });
        document.getElementById("tab1-tab").click();
        bindTabClickListeners()
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
          <td><button class="btn btn-primary btn-sm" onclick='bukaModalTab3(${JSON.stringify(item)})'>Kemaskini</button></td>
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

    const btn = document.querySelector('#kemaskiniModal1 .btn-primary');
      btn.disabled = true;
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Kemaskini...`;
  
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
              btn.disabled = false;
              btn.innerHTML = originalText;
            }).updateRespon(row, respon, tarikh, tempohMasa);
          })
          .withFailureHandler(err => {
            alert("Ralat upload PDF: " + err.message);
            btn.disabled = false;
            btn.innerHTML = originalText;
          })
          .uploadPDFtoDrive(base64, namaFail, data.Laporan, data.Syor, data.TarikhKemaskini);
      };
      fr.readAsDataURL(file);
    } else {
      // No PDF uploaded, just update the form data
      google.script.run.withSuccessHandler(() => {
        bootstrap.Modal.getInstance(document.getElementById("kemaskiniModal1")).hide();
        loadDataTab1();
        btn.disabled = false;
        btn.innerHTML = originalText;
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
  
    function bukaModaTambahSyorBaharuPeneraju() {
      const sektorInput = document.getElementById("sektorBaru2");
      if (window.perananPengguna === "Peneraju" && sektorInput) {
        sektorInput.value = window.sektorPengguna || "";
        sektorInput.setAttribute("readonly", true);
      } else if (sektorInput) {
        sektorInput.removeAttribute("readonly");
        sektorInput.value = "";
      }
    
      // Paparkan modal
      const tambahModal2 = new bootstrap.Modal(document.getElementById("tambahModal2"));
      tambahModal2.show();
    }
    
  
    function bukaModalTab3(item) {
      document.getElementById("rowNum3").value = item.RowNum;
      document.getElementById("PemeriksaanInfo3").value = item.Laporan || "";
      document.getElementById("SyorInfo2").value = item.Syor || "";
      document.getElementById("ResponInfo2").innerHTML = item.Respon || "";
  
      quillSyorInfo2.root.innerHTML = item.Syor || "";
  
      const tarikh = item.TarikhKemaskini 
        ? new Date(item.TarikhKemaskini).toISOString().split("T")[0] 
        : "";
      document.getElementById("tarikhInput3").value = tarikh;
  
      document.getElementById("tempohMasaInput3").value = item.TempohMasa || "";
      document.getElementById("catatanInput2").value = item.Catatan || "";
      const modal = new bootstrap.Modal(document.getElementById("kemaskiniModal3"));
      modal.show();
    }
  
    function simpanKemaskiniTab2() {
      document.getElementById("SyorInfo").value = quillSyorInfo.root.innerHTML;

      const btn = document.querySelector('#kemaskiniModal2 .btn-primary');
      btn.disabled = true;
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Kemaskini...`;
  
      const row = document.getElementById("rowNum2").value;
      const syor = document.getElementById("SyorInfo").value;
      const status = document.getElementById("statusInput").value;
      const tarikh = document.getElementById("tarikhInput2").value;
      const catatan = document.getElementById("catatanInput").value;
      google.script.run
      .withSuccessHandler(() => {
        bootstrap.Modal.getInstance(document.getElementById("kemaskiniModal2")).hide();
        loadDataTab2();
        btn.disabled = false;
        btn.innerHTML = originalText;
      })
      .withFailureHandler(err => {
        alert("Ralat semasa menghantar data atau emel: " + err.message);
        btn.disabled = false;
        btn.innerHTML = originalText;
      })
      .updateSyor(row, syor, status, tarikh, catatan);
    }
    
    function simpanKemaskiniTab3() {
      document.getElementById("SyorInfo2").value = quillSyorInfo2.root.innerHTML;
  
      const btn = document.querySelector('#kemaskiniModal3 .btn-primary');
      btn.disabled = true;
      const originalText = btn.innerHTML;
      btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Kemaskini...`;
  
      const row = document.getElementById("rowNum3").value;
      const syor = document.getElementById("SyorInfo2").value;
      const tarikh = document.getElementById("tarikhInput3").value;
  
      google.script.run
        .withSuccessHandler(() => {
          bootstrap.Modal.getInstance(document.getElementById("kemaskiniModal3")).hide();
          loadDataTab3();
          btn.disabled = false;
          btn.innerHTML = originalText;
        })
        .withFailureHandler(err => {
          alert("Ralat semasa menghantar data atau emel: " + err.message);
          btn.disabled = false;
          btn.innerHTML = originalText;
        })
        .updateSyorPeneraju(row, syor, tarikh);
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
        renderBahagianBarStackedChart(data);        
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
      
    let chartBahagianStacked;
    let chartNegeriStacked;
    let chartPenerajuStacked;
  
     function renderStatusBarChart(data) {
        const ctx = document.getElementById("statusBarChart").getContext("2d");
        const ctx2 = document.getElementById("statusBarChart2").getContext("2d");
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

        //

        new Chart(ctx2, {
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
  
      function renderBahagianBarStackedChart(data) {
      const bahagianList = [...new Set(data.map(item => item.BahagianJpn || "Lain-lain"))];
      const negeriList = [...new Set(data.map(item => item.Negeri || "Lain-lain"))];
      const penerajuList = [...new Set(data.map(item => item.Sektor || "Lain-lain"))];
      const statusKategori = ["Hijau", "Kuning", "Merah"];
      const statusKategori2 = ["Hijau", "Kuning", "Merah"];
      const statusKategori3 = ["Hijau", "Kuning", "Merah"];

      const statusData = {
        Hijau: [],
        Kuning: [],
        Merah: []
      };

      const statusData2 = {
        Hijau: [],
        Kuning: [],
        Merah: []
      };

      const statusData3 = {
        Hijau: [],
        Kuning: [],
        Merah: []
      };

      bahagianList.forEach(bahagian => {
        const items = data.filter(item => (item.BahagianJpn || "Lain-lain") === bahagian);
        statusKategori.forEach(status => {
          const count = items.filter(item => (item.Indicator || "").toLowerCase() === status.toLowerCase()).length;
          statusData[status].push(count);
        });
      });

      negeriList.forEach(negeri => {
        const items = data.filter(item => (item.Negeri || "Lain-lain") === negeri);
        statusKategori2.forEach(status2 => {
          const count = items.filter(item => (item.Indicator || "").toLowerCase() === status2.toLowerCase()).length;
          statusData2[status2].push(count);
        });
      });
      
      penerajuList.forEach(sektor => {
        const items = data.filter(item => (item.Sektor || "Lain-lain") === sektor);
        statusKategori3.forEach(status3 => {
          const count = items.filter(item => (item.Indicator || "").toLowerCase() === status3.toLowerCase()).length;
          statusData3[status3].push(count);
        });
      });
      const ctxBahagian = document.getElementById("statusChartBahagian").getContext("2d");
      const ctxNegeri = document.getElementById("statusChartNegeri").getContext("2d");
      const ctxPeneraju = document.getElementById("statusChartPeneraju").getContext("2d");

      if (chartBahagianStacked) {
        chartBahagianStacked.destroy();
      }

      if (chartNegeriStacked) {
        chartNegeriStacked.destroy();
      }

      if (chartPenerajuStacked) {
        chartPenerajuStacked.destroy();
      }

      chartBahagianStacked = new Chart(ctxBahagian, {
        type: "bar",
        data: {
          labels: bahagianList,
          datasets: [
            {
              label: "Selesai",
              data: statusData.Hijau,
              backgroundColor: "#28a745",
              stack: 'Status'
            },
            {
              label: "Dalam Tindakan",
              data: statusData.Kuning,
              backgroundColor: "#ffc107",
              stack: 'Status'
            },
            {
              label: "Belum Selesai",
              data: statusData.Merah,
              backgroundColor: "#dc3545",
              stack: 'Status'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          },
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true }
          }
        }
      });

      chartPenerajuStacked = new Chart(ctxPeneraju, {
        type: "bar",
        data: {
          labels: penerajuList,
          datasets: [
            {
              label: "Selesai",
              data: statusData3.Hijau,
              backgroundColor: "#28a745",
              stack: 'Status'
            },
            {
              label: "Dalam Tindakan",
              data: statusData3.Kuning,
              backgroundColor: "#ffc107",
              stack: 'Status'
            },
            {
              label: "Belum Selesai",
              data: statusData3.Merah,
              backgroundColor: "#dc3545",
              stack: 'Status'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          },
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true }
          }
        }
      });

      chartNegeriStacked = new Chart(ctxNegeri, {
        type: "bar",
        data: {
          labels: negeriList,
          datasets: [
            {
              label: "Selesai",
              data: statusData2.Hijau,
              backgroundColor: "#28a745",
              stack: 'Status'
            },
            {
              label: "Dalam Tindakan",
              data: statusData2.Kuning,
              backgroundColor: "#ffc107",
              stack: 'Status'
            },
            {
              label: "Belum Selesai",
              data: statusData2.Merah,
              backgroundColor: "#dc3545",
              stack: 'Status'
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' }
          },
          scales: {
            x: { stacked: true },
            y: { stacked: true, beginAtZero: true }
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

  function initTahunDropdown() {
  const dropdown = document.getElementById("tahunFilter");
  dropdown.innerHTML = "";

  const startYear = 2024;
  const currentYear = new Date().getFullYear();

  for (let year = startYear; year <= currentYear; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    if (year === currentYear) option.selected = true;
    dropdown.appendChild(option);
  }

  renderDashboardByYear(currentYear); // Papar data ikut tahun terkini
}


  function renderDashboardByYear(tahun) {
    // Fungsi utama yang akan fetch semula semua data ikut tahun
    getDashboardData(tahun); // ganti atau wrap logik asal anda dalam fungsi ini
  }

  function getDashboardData(tahun) {
    google.script.run
      .withSuccessHandler(function (data) {
        // pastikan semua data render ikut tahun
        renderSummaryCards(data.summary);
        renderStatusCharts(data.statusByOverall);
        renderStatusByBahagian(data.statusByBahagian);
        renderStatusByNegeri(data.statusByNegeri);
        renderNegeriMap(data.statusByNegeri);
      })
      .getDashboardDataByYear(tahun); // <-- diubah
  }

  function processDashboardData(data) {
    // Split data ikut status
    const selesai = data.filter(row => row.Status === "Selesai");
    const tindakan = data.filter(row => row.Status === "Dalam Tindakan");
    const belum = data.filter(row => row.Status === "Belum Selesai");

    document.getElementById("totalSyor").textContent = data.length;
    document.getElementById("totalSelesai").textContent = selesai.length;
    document.getElementById("totalTindakan").textContent = tindakan.length;
    document.getElementById("totalBelum").textContent = belum.length;

    // Call chart rendering
    renderBarChartStatus(selesai.length, tindakan.length, belum.length);
    renderChartByBahagian(data);
    renderChartByNegeri(data);
    renderChartByPeneraju(data);
    renderTop5Syor(data);
  }
  
  
    // Auto-run ikut peranan
    window.onload = function () {       
      checkUserRoleAndInit();
      showUserDetails();
      loadTab3Dashboard();
      populateLaporanDropdown("laporanBaru", "laporanBaru2");
      populateBahagianDropdown("bahagianBaru","bahagianBaru2", "bahagianUserBaru","bahagianUserKemaskini");
      populateNegeriDropdown("negeriBaru","negeriBaru2", "negeriUserBaru","negeriUserKemaskini");
      populateSektorDropdown("sektorBaru","sektorBaru2","sektorUserBaru","sektorUserKemaskini")
   
  
      const hariList = ["Ahad", "Isnin", "Selasa", "Rabu", "Khamis", "Jumaat", "Sabtu"];
        const bulanList = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
        const today = new Date();
        const hari = hariList[today.getDay()];
        const tarikh = today.getDate();
        const bulan = bulanList[today.getMonth()];
        const tahun = today.getFullYear();
  
        document.getElementById("liveDate").innerText = `${hari}, ${tarikh} ${bulan} ${tahun}`;
      
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

      const btnKemaskiniUser = document.querySelector('#kemaskiniPenggunaModal .btn-success');
      btnKemaskiniUser.disabled = true;
      const originalTextUser = btnKemaskiniUser.innerHTML;
      btnKemaskiniUser.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Kemaskini...`;
      
  
      google.script.run.withSuccessHandler(() => {
          bootstrap.Modal.getInstance(document.getElementById("kemaskiniPenggunaModal")).hide();
          loadDataUsers();
          btnKemaskiniUser.disabled = false;
          btnKemaskiniUser.innerHTML = originalTextUser;
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
  
    document.addEventListener("DOMContentLoaded", function () {
      initTahunDropdown();
      document.getElementById("tahunFilter").addEventListener("change", function () {
        const selectedYear = this.value;
        renderDashboardByYear(parseInt(selectedYear));
      });
      google.script.run.withSuccessHandler(function(roleInfo) {
        window.perananPengguna = roleInfo.peranan;
        window.sektorPengguna = roleInfo.sektor;
    
        const tambahBtn = document.getElementById("tambahSyorBtn2");
        if (tambahBtn) {
          tambahBtn.addEventListener("click", function () {
            const sektorInput = document.getElementById("sektorBaru2");
            if (window.perananPengguna === "Peneraju" && sektorInput) {
              sektorInput.value = window.sektorPengguna || "";
              sektorInput.setAttribute("readonly", true);
            } else if (sektorInput) {
              sektorInput.removeAttribute("readonly");
              sektorInput.value = "";
            }
          });
        }
      }).getUserInfoSektor();
    });  
  
  
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
  
    const quillSyorBaru2 = new Quill('#editorSyorBaru2', {
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
  
    const quillSyorInfo2 = new Quill('#editorSyorInfo2', {
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
  
    document.getElementById("formTambahSyor2").addEventListener("submit", function (e) {
      document.getElementById("syorBaru2").value = quillSyorBaru2.root.innerHTML;
    });
  
    document.getElementById("kemaskiniForm1").addEventListener("submit", function (e) {
      document.getElementById("responInput").value = quillResponInput.root.innerHTML;
    });
  
    document.getElementById("kemaskiniForm2").addEventListener("submit", function (e) {
      document.getElementById("syorInfo").value = quillSyorInfo.root.innerHTML;
    });
    
    document.getElementById("kemaskiniForm3").addEventListener("submit", function (e) {
      document.getElementById("syorInfo2").value = quillSyorInfo2.root.innerHTML;
    });
  
  
  
  