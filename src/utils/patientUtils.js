/**
 * ==============================================================================
 * File: src/utils/patientUtils.js
 * Fungsi: Kumpulan Fungsi Pembantu (Helper Utilities) Pemrosesan Data Pasien
 * ==============================================================================
 * 
 * DESKRIPSI & KEGUNAAN MODUL:
 * File ini berisi fungsi-fungsi logika murni (pure functions) yang bertugas melakukan
 * pemfilteran data, pencocokan kriteria, dan ekstraksi nilai spesifik seperti tahun.
 * 
 * MENGAPA DIBUAT TERPISAH?
 * Menerapkan prinsip modularitas kode (Clean Code). Logika filter tidak ditulis
 * berulang-ulang di berbagai komponen, melainkan dipusatkan di file utilitas ini
 * agar mudah diuji, diperbaiki, dan digunakan bersama oleh Dashboard, Monitoring,
 * dan Ekspor-Impor.
 */

/**
 * Fungsi: getPatientYear
 * Mengekstrak 4-digit tahun pelaksanaan rehabilitasi secara andal dan fleksibel.
 * @param {object} patient - Objek data pasien
 * @returns {string} Tahun 4-digit (contoh: "2018", "2026")
 */
export function getPatientYear(patient) {
  if (!patient) return '2026';

  // 1. Cek properti tahunRehab langsung
  if (patient.tahunRehab) {
    const s = String(patient.tahunRehab).trim();
    const match = s.match(/\b(19\d\d|20\d\d)\b/);
    if (match) return match[1];
    if (/^\d{4}$/.test(s)) return s;
  }

  // 2. Jika tahunRehab kosong, ekstrak dari string tglKedatangan (misal: "Singaraja, 28 Nopember 2018")
  if (patient.tglKedatangan) {
    const s = String(patient.tglKedatangan).trim();
    const match = s.match(/\b(19\d\d|20\d\d)\b/);
    if (match) return match[1];
  }

  // Fallback default jika tidak terdeteksi
  return '2026';
}

/**
 * Fungsi: matchPatientYear
 * Memeriksa apakah tahun pasien sesuai dengan filter yang dipilih user.
 * @param {object} patient - Data pasien
 * @param {string} targetYear - Tahun target ('semua' | '2018' | '2026' dst)
 * @returns {boolean} true jika cocok, false jika tidak cocok
 */
export function matchPatientYear(patient, targetYear) {
  if (!targetYear || targetYear === 'semua' || targetYear === 'all') {
    return true; // Jika filter 'semua', loloskan semua data
  }
  const pYear = getPatientYear(patient);
  return pYear === String(targetYear).trim();
}

/**
 * Fungsi: matchPatientKecamatan
 * Memeriksa apakah kecamatan asal pasien sesuai dengan filter kecamatan.
 * @param {object} patient - Data pasien
 * @param {string} targetKecamatan - Nama kecamatan target ('semua' | 'buleleng' | 'sukasada' dst)
 * @returns {boolean} true jika cocok
 */
export function matchPatientKecamatan(patient, targetKecamatan) {
  if (!targetKecamatan || targetKecamatan === 'semua' || targetKecamatan === 'all') {
    return true;
  }
  const pKec = (patient.kecamatan || '').toLowerCase().trim();
  return pKec === targetKecamatan.toLowerCase().trim();
}

/**
 * Fungsi: matchPatientGender
 * Memeriksa apakah jenis kelamin pasien cocok dengan filter yang dipilih.
 * @param {object} patient - Data pasien
 * @param {string} targetGender - 'semua' | 'laki' | 'perempuan'
 * @returns {boolean} true jika cocok
 */
export function matchPatientGender(patient, targetGender) {
  if (!targetGender || targetGender === 'semua' || targetGender === 'all') {
    return true;
  }
  const g = (patient.gender || patient.jenisKelamin || 'laki').toLowerCase().trim();
  const isPerempuan = g.includes('perempuan') || g.startsWith('p');

  if (targetGender.toLowerCase() === 'perempuan') return isPerempuan;
  if (targetGender.toLowerCase() === 'laki') return !isPerempuan;
  return true;
}

/**
 * Fungsi: matchPatientRiwayat
 * Memeriksa riwayat rehabilitasi pasien (Klien Baru vs Relapse/Kambuh).
 * @param {object} patient - Data pasien
 * @param {string} targetRiwayat - 'semua' | 'ke1' (Klien Baru) | 'relapse' (Klien Kambuh)
 * @returns {boolean} true jika cocok
 */
export function matchPatientRiwayat(patient, targetRiwayat) {
  if (!targetRiwayat || targetRiwayat === 'semua' || targetRiwayat === 'all') {
    return true;
  }
  const rehabKe = String(patient.rehabKe || 'Ke-1').toLowerCase();
  const isKe1 = rehabKe.includes('1');

  if (targetRiwayat === 'ke1') return isKe1;
  if (targetRiwayat === 'relapse') return !isKe1;
  return true;
}

/**
 * Fungsi: matchPatientLayanan
 * Memeriksa jenis layanan rawatan pasien (Rawat Jalan vs Rawat Inap Rujukan).
 * @param {object} patient - Data pasien
 * @param {string} targetLayanan - 'all' | 'rawat_jalan' | 'rawat_inap'
 * @returns {boolean} true jika cocok
 */
export function matchPatientLayanan(patient, targetLayanan) {
  if (!targetLayanan || targetLayanan === 'semua' || targetLayanan === 'all') {
    return true;
  }
  const isRawatInap = (patient.statusRawat || '').toLowerCase().includes('inap') ||
                      (patient.layananTeks || '').toLowerCase().includes('inap');

  if (targetLayanan === 'rawat_inap') return isRawatInap;
  if (targetLayanan === 'rawat_jalan') return !isRawatInap;
  return true;
}

/**
 * Fungsi: matchPatientStatus
 * Memeriksa status progres klinis pasien (ON GOING, SELESAI/PULIH, DROP OUT).
 * @param {object} patient - Data pasien
 * @param {string} targetStatus - 'all' | 'ongoing' | 'selesai' | 'dropout' | 'rawat_jalan' | 'rawat_inap'
 * @returns {boolean} true jika cocok
 */
export function matchPatientStatus(patient, targetStatus) {
  if (!targetStatus || targetStatus === 'semua' || targetStatus === 'all') {
    return true;
  }
  const stProgres = String(patient.statusProgres || 'ON GOING').toUpperCase().trim();
  const isDO = stProgres.includes('DROP') || stProgres.includes('DO');
  const isSelesai = stProgres.includes('SELESAI') || stProgres.includes('PULIH');
  const isOngoing = !isDO && !isSelesai;
  const isRawatInap = (patient.statusRawat || '').toLowerCase().includes('inap');
  const isRawatJalan = !isRawatInap;

  if (targetStatus === 'ongoing') return isOngoing;
  if (targetStatus === 'selesai') return isSelesai;
  if (targetStatus === 'dropout') return isDO;
  if (targetStatus === 'rawat_jalan') return isOngoing && isRawatJalan;
  if (targetStatus === 'rawat_inap') return isOngoing && isRawatInap;

  return true;
}

/**
 * Opsi Standar Kelompok Usia Rekapitulasi BNNK Buleleng
 */
export const AGE_GROUP_OPTIONS = [
  { value: 'semua', label: 'Semua Kelompok Usia' },
  { value: '13-19', label: '13 - 19 Tahun (Remaja)' },
  { value: '20-25', label: '20 - 25 Tahun' },
  { value: '26-35', label: '26 - 35 Tahun' },
  { value: '36-45', label: '36 - 45 Tahun' },
  { value: '46+', label: '46 Tahun ke atas' },
];

/**
 * Fungsi: getPatientAge
 * Mengekstrak umur numerik pasien dari properti umur atau tanggal lahir.
 * @param {object} patient - Objek data pasien
 * @returns {number|null} Umur dalam angka, atau null jika tidak dapat ditentukan
 */
export function getPatientAge(patient) {
  if (!patient) return null;
  const rawUmur = patient.umur || '';
  const s = String(rawUmur).trim();

  // Ekstrak angka dari string umur (misal: "24 Tahun", "32 Th", "40")
  const match = s.match(/\b(\d{1,3})\b/);
  if (match) {
    const val = parseInt(match[1], 10);
    // Jika terisi 4-digit tahun lahir seperti 1981
    if (val >= 1900 && val <= 2026) {
      return 2026 - val;
    }
    // Jika ada typo lebih dari 120 (contoh: 539), utamakan hitung dari tglLahir
    if (val > 120 && patient.tglLahir) {
      const ym = String(patient.tglLahir).match(/\b(19\d\d|20\d\d)\b/);
      if (ym) return 2026 - parseInt(ym[1], 10);
      return parseInt(String(val).slice(0, 2), 10);
    }
    return val;
  }

  // Fallback ke tglLahir
  if (patient.tglLahir) {
    const ym = String(patient.tglLahir).match(/\b(19\d\d|20\d\d)\b/);
    if (ym) return 2026 - parseInt(ym[1], 10);
  }

  return null;
}

/**
 * Fungsi: matchPatientAgeGroup
 * Memeriksa apakah umur pasien masuk ke dalam kelompok usia target.
 * @param {object} patient - Data pasien
 * @param {string} targetGroup - 'semua' | '13-19' | '20-25' | '26-35' | '36-45' | '46+'
 * @returns {boolean} true jika cocok
 */
export function matchPatientAgeGroup(patient, targetGroup) {
  if (!targetGroup || targetGroup === 'semua' || targetGroup === 'all') {
    return true;
  }
  const age = getPatientAge(patient);
  if (age === null) return false;

  switch (targetGroup) {
    case '13-19':
      return age >= 13 && age <= 19;
    case '20-25':
      return age >= 20 && age <= 25;
    case '26-35':
      return age >= 26 && age <= 35;
    case '36-45':
      return age >= 36 && age <= 45;
    case '46+':
    case '46':
      return age >= 46;
    default:
      return true;
  }
}

