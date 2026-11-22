import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PatientContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper ubah format tanggal ke YYYY-MM-DD agar diterima MySQL DATE
function toMySQLDate(val) {
  if (!val || val === '-') return null;
  let str = String(val).replace(/^'+/, '').trim();

  // 1. Format standar YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);

  // 2. Format DD/MM/YYYY atau DD-MM-YYYY
  const dmy = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;

  // 3. Format angka serial tanggal Excel (contoh: 28217)
  if (/^\d{5}$/.test(str)) {
    const excelDate = new Date(Date.UTC(1899, 11, 30) + Number(str) * 86400000);
    return excelDate.toISOString().slice(0, 10);
  }

  // 4. Format teks Indonesia (dengan/tanpa kota, typo 0ktober/pebruari/Nopember, atau tanpa spasi)
  if (str.includes(',')) {
    str = str.split(',').pop().trim();
  }
  const bulanMap = {
    januari: '01', jan: '01',
    februari: '02', pebruari: '02', feb: '02',
    maret: '03', mar: '03',
    april: '04', apr: '04',
    mei: '05',
    juni: '06', jun: '06',
    juli: '07', jul: '07',
    agustus: '08', agu: '08', ags: '08',
    september: '09', sep: '09',
    oktober: '10', '0ktober': '10', okt: '10',
    november: '11', nopember: '11', nov: '11',
    desember: '12', des: '12'
  };
  const teksMatch = str.match(/^(\d{1,2})\s*([a-zA-Z0]+)\s*(\d{4})$/);
  if (teksMatch) {
    const day = teksMatch[1].padStart(2, '0');
    const mon = bulanMap[teksMatch[2].toLowerCase()];
    const year = teksMatch[3];
    if (mon) return `${year}-${mon}-${day}`;
  }

  return null;
}

// Terjemahkan data dari MySQL (snake_case) -> Frontend React (camelCase)
function mapFromApi(row) {
  const isFemale = String(row.gender || '').toUpperCase() === 'P';
  return {
    id: row.id,
    nik: row.nik || '',
    nama: row.nama || '',
    tglLahir: row.tgl_lahir ? String(row.tgl_lahir).slice(0, 10) : '',
    gender: isFemale ? 'perempuan' : 'laki',
    jenisKelamin: isFemale ? 'Perempuan' : 'Laki-Laki',
    telepon: row.telepon || '-',
    noHp: row.telepon || '-',
    pekerjaan: row.pekerjaan || 'Tidak Bekerja',
    kecamatan: row.kecamatan || '',
    desa: row.desa || '',
    kabupatenAsal: row.kabupaten_asal || 'Buleleng',
    alamat: row.alamat || '',
    nomorSurat: row.nomor_surat || '-',
    tglKedatangan: row.tgl_kedatangan ? String(row.tgl_kedatangan).slice(0, 10) : '',
    tahunRehab: row.tahun ? String(row.tahun) : new Date().getFullYear().toString(),
    kepada: row.kepada || '',
    tujuanRujukan: row.kepada || '',
    kabupaten: row.kabupaten_rujukan || 'Buleleng',
    statusRawat: row.status_rawat || '',
    statusProgres: row.status_progres || 'ON GOING',
    rehabKe: row.rehab_ke || 'Ke-1',
    keterangan: row.keterangan || '',
  };
}

// Terjemahkan data dari Frontend React (camelCase) -> MySQL (snake_case) untuk POST
function mapToApi(p) {
  const genderStr = String(p.gender || p.jenisKelamin || '').toLowerCase();
  const genderEnum = genderStr.includes('p') ? 'P' : 'L';
  const tahunNum = parseInt(p.tahunRehab || p.tahun, 10);

  return {
    nik: String(p.nik || '').trim(),
    nama: String(p.nama || '').trim(),
    tgl_lahir: toMySQLDate(p.tglLahir || p.tgl_lahir),
    gender: genderEnum,
    telepon: p.telepon && p.telepon !== '-' ? p.telepon : (p.noHp && p.noHp !== '-' ? p.noHp : null),
    pekerjaan: p.pekerjaan || null,
    kecamatan: p.kecamatan || null,
    desa: p.desa || null,
    kabupaten_asal: p.kabupatenAsal || p.kabupaten_asal || 'Buleleng',
    alamat: p.alamat || null,
    nomor_surat: p.nomorSurat || p.nomor_surat || '-',
    tgl_kedatangan: toMySQLDate(p.tglKedatangan || p.tgl_kedatangan),
    tahun: Number.isNaN(tahunNum) ? new Date().getFullYear() : tahunNum,
    kepada: p.kepada || p.tujuanRujukan || null,
    kabupaten_rujukan: p.kabupaten || p.kabupaten_rujukan || 'Buleleng',
    status_rawat: p.statusRawat || p.status_rawat || null,
    status_progres: p.statusProgres || p.status_progres || 'ON GOING',
    rehab_ke: p.rehabKe || p.rehab_ke || 'Ke-1',
    keterangan: p.keterangan || null,
  };
}

// Terjemahkan field parsial untuk PUT (Update) agar kolom lain tidak tertimpa null
function mapPartialToApi(fields) {
  const payload = {};
  if (fields.nama !== undefined) payload.nama = fields.nama;
  if (fields.tglLahir !== undefined) payload.tgl_lahir = toMySQLDate(fields.tglLahir);
  if (fields.gender !== undefined || fields.jenisKelamin !== undefined) {
    const g = String(fields.gender || fields.jenisKelamin || '').toLowerCase();
    payload.gender = g.includes('p') ? 'P' : 'L';
  }
  if (fields.telepon !== undefined) payload.telepon = fields.telepon;
  if (fields.noHp !== undefined && payload.telepon === undefined) payload.telepon = fields.noHp;
  if (fields.pekerjaan !== undefined) payload.pekerjaan = fields.pekerjaan;
  if (fields.kecamatan !== undefined) payload.kecamatan = fields.kecamatan;
  if (fields.desa !== undefined) payload.desa = fields.desa;
  if (fields.kabupatenAsal !== undefined) payload.kabupaten_asal = fields.kabupatenAsal;
  if (fields.alamat !== undefined) payload.alamat = fields.alamat;
  if (fields.nomorSurat !== undefined) payload.nomor_surat = fields.nomorSurat;
  if (fields.tglKedatangan !== undefined) payload.tgl_kedatangan = toMySQLDate(fields.tglKedatangan);
  if (fields.tahunRehab !== undefined) payload.tahun = parseInt(fields.tahunRehab, 10) || new Date().getFullYear();
  if (fields.kepada !== undefined) payload.kepada = fields.kepada;
  if (fields.tujuanRujukan !== undefined && payload.kepada === undefined) payload.kepada = fields.tujuanRujukan;
  if (fields.kabupaten !== undefined) payload.kabupaten_rujukan = fields.kabupaten;
  if (fields.statusRawat !== undefined) payload.status_rawat = fields.statusRawat;
  if (fields.statusProgres !== undefined) payload.status_progres = fields.statusProgres;
  if (fields.rehabKe !== undefined) payload.rehab_ke = fields.rehabKe;
  if (fields.keterangan !== undefined) payload.keterangan = fields.keterangan;
  return payload;
}

function normalizePatientList(list) {
  if (!Array.isArray(list) || list.length === 0) return [];

  return list.map((p) => {
    const item = { ...p };

    if (!item.nomorSurat) item.nomorSurat = '-';
    if (!item.kabupatenAsal) item.kabupatenAsal = 'Buleleng';

    if (!item.kabupaten) {
      if ((item.statusRawat || '').includes('Bangli') || (item.tujuanRujukan || '').includes('Bangli')) {
        item.kabupaten = 'Bangli';
      } else if ((item.statusRawat || '').includes('BNNP') || (item.tujuanRujukan || '').includes('Bali')) {
        item.kabupaten = 'Denpasar';
      } else if ((item.statusRawat || '').includes('Lido') || (item.tujuanRujukan || '').includes('Lido')) {
        item.kabupaten = 'Bogor';
      } else {
        item.kabupaten = 'Buleleng';
      }
    }

    if (!item.kepada) {
      if (item.statusRawat === 'Rawat Inap RSJ Bangli' || (item.tujuanRujukan || '').includes('RSJ')) {
        item.kepada = 'UPTD. Rumah Sakit Jiwa Provinsi Bali Cq. Poli Psikiatri Rumah Sakit Jiwa Provinsi Bali';
      } else if (item.statusRawat === 'Rawat Jalan BNNP Bali') {
        item.kepada = 'Kepala Badan Narkotika Nasional Provinsi Bali Cq. Kepala Bidang Rehabilitasi';
      } else if ((item.tujuanRujukan || '').includes('Lido')) {
        item.kepada = 'Balai Besar Rehabilitasi BNN Lido, Bogor';
      } else {
        item.kepada = 'Klinik Pratama BNNK Buleleng';
      }
    }

    const isInvalidPhone = (val) => {
      if (!val) return true;
      const s = String(val).trim().toLowerCase();
      if (s === '-' || s === '' || s === 'null' || s === 'undefined') return true;
      return ['rawat', 'jalan', 'inap', 'bnn', 'rsj', 'lido', 'klinik', 'uptd', 'bali', 'surat', 'singaraja', 'buleleng', 'kab']
        .some((kw) => s.includes(kw));
    };

    if (isInvalidPhone(item.noHp)) item.noHp = '-';
    if (isInvalidPhone(item.telepon)) item.telepon = '-';
    if (item.noHp === '-' && !isInvalidPhone(item.telepon)) item.noHp = item.telepon;
    if (item.telepon === '-' && !isInvalidPhone(item.noHp)) item.telepon = item.noHp;

    if (!item.jenisKelamin) {
      item.jenisKelamin = (item.gender || 'laki') === 'perempuan' ? 'Perempuan' : 'Laki-Laki';
    }
    if (!item.gender) {
      item.gender = (item.jenisKelamin || '').toLowerCase().includes('p') ? 'perempuan' : 'laki';
    }

    if (!item.pekerjaan) item.pekerjaan = 'Tidak Bekerja';
    if (!item.statusProgres) item.statusProgres = 'ON GOING';
    if (!item.rehabKe) item.rehabKe = 'Ke-1';
    if (!item.tahunRehab) {
      item.tahunRehab = item.tglKedatangan ? String(item.tglKedatangan).slice(0, 4) : new Date().getFullYear().toString();
    }

    if (!item.layananTeks) {
      if (String(item.statusRawat || '').toLowerCase().includes('inap')) {
        const rujukanSingkat = (item.kepada || item.tujuanRujukan || '').includes('Lido')
          ? '(Balai Lido)'
          : (item.kepada || item.tujuanRujukan || '').includes('RSJ')
          ? '(RSJ Bangli)'
          : '(Rujukan)';
        item.layananTeks = `Rawat Inap\n${rujukanSingkat}`;
      } else {
        item.layananTeks = (item.statusRawat || '').includes('BNNP')
          ? 'Rawat Jalan\n(BNNP Bali)'
          : 'Rawat Jalan\n(Klinik BNNK)';
      }
    }
    return item;
  });
}

export function PatientProvider({ children }) {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Ambil semua data pasien dari Backend MySQL saat web dibuka
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/patients?per_page=10000`);
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        const mapped = json.data.map(mapFromApi);
        setPatients(normalizePatientList(mapped));
      } else {
        console.error('Gagal mengambil data pasien:', json.message);
      }
    } catch (err) {
      console.error('Error koneksi ke backend:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // 2. Tambah Pasien Baru (POST /api/patients)
  const addPatient = useCallback(async (newPatient) => {
    const normalizedItem = normalizePatientList([newPatient])[0];
    const payload = mapToApi(normalizedItem);

    try {
      const res = await fetch(`${API_URL}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(`Gagal menyimpan ke database: ${json.message || 'Terjadi kesalahan'}`);
        return null;
      }

      setPatients((prev) => [normalizedItem, ...prev]);
      return normalizedItem;
    } catch (err) {
      console.error('Error POST patient:', err);
      alert('Gagal terhubung ke server backend (pastikan localhost:5000 aktif).');
      return null;
    }
  }, []);

  // 3. Hapus Pasien (DELETE /api/patients/:nik)
  const deletePatient = useCallback(async (nik) => {
    const cleanNik = String(nik).trim();
    try {
      const res = await fetch(`${API_URL}/patients/${encodeURIComponent(cleanNik)}`, {
        method: 'DELETE',
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(`Gagal menghapus data: ${json.message || 'Terjadi kesalahan'}`);
        return;
      }

      setPatients((prev) => prev.filter((p) => String(p.nik).trim() !== cleanNik));
    } catch (err) {
      console.error('Error DELETE patient:', err);
      alert('Gagal terhubung ke server backend.');
    }
  }, []);

  // 4. Perbarui Status & Data Pasien (PUT /api/patients/:nik)
  const updatePatientStatus = useCallback(async (nik, updatedFields) => {
    const cleanNik = String(nik).trim();
    const fieldsObj = typeof updatedFields === 'string'
      ? { statusProgres: updatedFields }
      : updatedFields;
    const payload = mapPartialToApi(fieldsObj);

    try {
      const res = await fetch(`${API_URL}/patients/${encodeURIComponent(cleanNik)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        alert(`Gagal memperbarui data: ${json.message || 'Terjadi kesalahan'}`);
        return;
      }

      setPatients((prev) =>
        normalizePatientList(
          prev.map((p) =>
            String(p.nik).trim() === cleanNik ? { ...p, ...fieldsObj } : p
          )
        )
      );
    } catch (err) {
      console.error('Error PUT patient:', err);
      alert('Gagal terhubung ke server backend.');
    }
  }, []);

  // 5. Impor Pasien Massal dari Excel/CSV (POST /api/patients/bulk-import)
const importPatients = useCallback(async (incomingList, mode = 'append') => {
  const normalizedIncoming = normalizePatientList(incomingList);
  const payloadList = normalizedIncoming.map(mapToApi);

  try {
    const res = await fetch(`${API_URL}/patients/bulk-import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patients: payloadList, mode }),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      alert(`Gagal impor massal: ${json.message || 'Terjadi kesalahan'}`);
      return;
    }

    await fetchPatients();
  } catch (err) {
    console.error('Error bulk-import:', err);
    alert('Gagal terhubung ke server backend saat impor data.');
  }
}, [fetchPatients]);

  // 6. Kosongkan daftar tampilan (tidak langsung hapus DB demi keamanan)
  const clearAllPatients = useCallback(() => {
    setPatients([]);
  }, []);

  return (
    <PatientContext.Provider
      value={{
        patients,
        loading,
        fetchPatients,
        addPatient,
        deletePatient,
        updatePatientStatus,
        importPatients,
        clearAllPatients,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

export function usePatients() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients harus digunakan di dalam PatientProvider');
  }
  return context;
}