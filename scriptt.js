const API_URL =
  "https://script.google.com/macros/s/AKfycbyHb8BxmlKftQMcrDgz82IkDZ2qpoaxJFYmavKHJVhFt34PD0qrjITMp46zU8r1V3C2/exec";

function simpan() {
  const data = {
    tanggal: tanggal.value,
    nama: nama.value,
    bulan: bulan.value,
    tahun: tahun.value,
    status: status.value,
    kas_masuk: masuk.value || 0,
    kas_keluar: keluar.value || 0,
    keterangan: ket.value,
  };

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(data),
  }).then(() => {
    alert("Data tersimpan");
    loadSummary(); // refresh dashboard
  });
}

function loadBelumBayar() {
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      console.log("Data diterima:", data);
      const tbody = document.getElementById("tabel");
      tbody.innerHTML = "";

      data
        .filter((d) => d.Status === "Belum")
        .forEach((d) => {
          tbody.innerHTML += `
            <tr>
              <td>${d.Nama}</td>
              <td>${d.Bulan}</td>
              <td><span class="badge-belum">Belum</span></td>
            </tr>
          `;
        });
    });
}

function rupiah(angka) {
  return "Rp " + Number(angka).toLocaleString("id-ID");
}

function loadSummary() {
  const bulan = document.getElementById("filterBulan").value;
  const tahun = document.getElementById("filterTahun").value;

  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      let masuk = 0;
      let keluar = 0;

      data
        .filter((d) => d.Bulan == bulan && d.Tahun == tahun)
        .forEach((d) => {
          masuk += Number(d.Kas_Masuk || 0);
          keluar += Number(d.Kas_Keluar || 0);
        });

      document.getElementById("totalMasuk").innerText = rupiah(masuk);
      document.getElementById("totalKeluar").innerText = rupiah(keluar);
      document.getElementById("saldo").innerText = rupiah(masuk - keluar);
    });
}

// auto load saat buka halaman
//document.addEventListener("DOMContentLoaded", loadSummary);
//login
function login() {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "login",
      username: username.value,
      password: password.value,
    }),
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        localStorage.setItem("login", "true");
        localStorage.setItem("role", res.role);
        window.location.href = "index.html";
      } else {
        document.getElementById("error").innerText =
          "Username atau password salah";
      }
    });
}

let kasChartInstance = null;

function loadRekap() {
  const bulanNamaKeAngka = {
    Jan: "1",
    Feb: "2",
    Mar: "3",
    Apr: "4",
    Mei: "5",
    Jun: "6",
    Jul: "7",
    Agu: "8",
    Sep: "9",
    Okt: "10",
    Nov: "11",
    Des: "12",
  };

  const bulanFilter =
    bulanNamaKeAngka[document.getElementById("filterBulan").value] || "1";
  const tahunFilter = document.getElementById("filterTahun").value;

  fetch(
    "https://script.google.com/macros/s/AKfycbwrn79dIBFFhwJeFFlIxPFr_vHA-GCR4k7gCD9MZcB6sCKxsuZcpV42s5qll-FT1r1A/exec",
  )
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.getElementById("tabelRekap");
      tbody.innerHTML = "";

      let saldo = 0;
      let totalMasuk = 0;
      let totalKeluar = 0;

      const filteredData = data
        .filter((d) => d.Bulan === bulanFilter && d.Tahun === tahunFilter)
        .sort((a, b) => new Date(a.Tanggal) - new Date(b.Tanggal));

      filteredData.forEach((d) => {
        totalMasuk += Number(d.Kas_Masuk || 0);
        totalKeluar += Number(d.Kas_Keluar || 0);

        saldo += Number(d.Kas_Masuk || 0);
        saldo -= Number(d.Kas_Keluar || 0);

        tbody.innerHTML += `
          <tr>
            <td>${d.Tanggal}</td>
            <td>${d.Keterangan || "-"}</td>
            <td>${rupiah(d.Kas_Masuk)}</td>
            <td>${rupiah(d.Kas_Keluar)}</td>
            <td>${rupiah(saldo)}</td>
          </tr>
        `;
      });

      document.getElementById("totalMasuk").innerText = rupiah(totalMasuk);
      document.getElementById("totalKeluar").innerText = rupiah(totalKeluar);
    });
}
