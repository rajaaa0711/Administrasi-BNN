import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Printer,
  FloppyDiskBack,
  Clock,
  CheckCircle,
  WarningCircle,
  FileText,
  Check
} from '@phosphor-icons/react';

const INSTANSI_RUJUKAN_LIST = [
  {
    name: 'Klinik Pratama BNNK Buleleng',
    kabupaten: 'Buleleng',
    defaultStatus: 'Rawat Jalan Klinik Pratama BNNK Buleleng',
  },
  {
    name: 'UPTD. Rumah Sakit Jiwa Provinsi Bali Cq. Poli Psikiatri Rumah Sakit Jiwa Provinsi Bali',
    kabupaten: 'Bangli',
    defaultStatus: 'Rawat Inap RSJ Bangli',
  },
  {
    name: 'Kepala Badan Narkotika Nasional Provinsi Bali Cq. Kepala Bidang Rehabilitasi',
    kabupaten: 'Denpasar',
    defaultStatus: 'Rawat Jalan BNNP Bali',
  },
  {
    name: 'Balai Besar Rehabilitasi BNN Lido, Bogor',
    kabupaten: 'Bogor',
    defaultStatus: 'Rawat Inap Balai Lido',
  },
  {
    name: 'Balai Rehabilitasi BNN Badoka, Makassar',
    kabupaten: 'Makassar',
    defaultStatus: 'Rawat Inap Balai Badoka',
  },
  {
    name: 'Balai Rehabilitasi BNN Tanah Merah, Samarinda',
    kabupaten: 'Samarinda',
    defaultStatus: 'Rawat Inap Balai Tanah Merah',
  },
  {
    name: 'Loka Rehabilitasi BNN Batam',
    kabupaten: 'Batam',
    defaultStatus: 'Rawat Inap Loka Batam',
  },
];

export default function QuickActionModal({ isOpen, patient, onClose, onSave }) {
  const [selectedStatus, setSelectedStatus] = useState('ON GOING');
  const [selectedRawat, setSelectedRawat] = useState('Rawat Jalan Klinik Pratama BNNK Buleleng');
  const [selectedKepada, setSelectedKepada] = useState('Klinik Pratama BNNK Buleleng');
  const [selectedKabupaten, setSelectedKabupaten] = useState('Buleleng');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (patient) {
      setSelectedStatus((patient.statusProgres || 'ON GOING').toUpperCase());
      setSelectedRawat(patient.statusRawat || 'Rawat Jalan Klinik Pratama BNNK Buleleng');
      setSelectedKepada(patient.kepada || patient.tujuanRujukan || 'Klinik Pratama BNNK Buleleng');
      setSelectedKabupaten(patient.kabupaten || 'Buleleng');
      setNotes(patient.keterangan || '');
    }
  }, [patient]);

  if (!isOpen || !patient) return null;

  const handleKepadaChange = (val) => {
    setSelectedKepada(val);
    const match = INSTANSI_RUJUKAN_LIST.find((i) => i.name === val);
    if (match) {
      setSelectedKabupaten(match.kabupaten);
      setSelectedRawat(match.defaultStatus);
    }
  };

  const handleSave = () => {
    let layananTeks = '';
    if (selectedRawat.toLowerCase().includes('inap')) {
      const rujukanSingkat = selectedKepada.includes('Lido')
        ? '(Balai Lido)'
        : selectedKepada.includes('RSJ')
        ? '(RSJ Bangli)'
        : selectedKepada.includes('Badoka')
        ? '(Balai Badoka)'
        : `(${selectedKabupaten})`;
      layananTeks = `Rawat Inap\n${rujukanSingkat}`;
    } else {
      layananTeks = selectedRawat.includes('BNNP')
        ? 'Rawat Jalan\n(BNNP Bali)'
        : 'Rawat Jalan\n(Klinik BNNK)';
    }

    onSave(patient.nik, {
      statusProgres: selectedStatus,
      statusRawat: selectedRawat,
      kepada: selectedKepada,
      tujuanRujukan: selectedKepada,
      kabupaten: selectedKabupaten,
      layananTeks,
      keterangan: notes,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay open"
      id="quickActionModal"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-card">
        {/* Header Modal Bar */}
        <div className="modal-header-bar">
          <div className="modal-header-title">
            Pembaruan Status &amp; Progres Klien
          </div>
          <button
            type="button"
            className="btn-close-modal"
            id="btnCloseModal"
            title="Tutup Modal"
            onClick={onClose}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Banner Identitas Klien */}
        <div className="modal-patient-banner">
          <div className="patient-banner-avatar">
            {patient.foto ? (
              <img
                src={patient.foto}
                alt={patient.nama}
                className="modal-avatar-img"
              />
            ) : (
              <div className="modal-avatar-init">
                {(patient.nama || 'K').charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="patient-banner-text">
            <div className="patient-banner-top">
              <strong id="modalPatientName" className="patient-name-title">
                {patient.nama || 'Klien'}
              </strong>
            </div>
            <div className="patient-banner-meta" id="modalPatientNik">
              <span className="patient-meta-item">
                <strong>NIK:</strong> {patient.nik || '-'}
              </span>
              <span className="patient-meta-dot">&bull;</span>
              <span className="patient-meta-item">
                <strong>No. Surat:</strong> {patient.nomorSurat || '-'}
              </span>
              <span className="patient-meta-dot">&bull;</span>
              <span className="patient-meta-item">
                {patient.pekerjaan || 'Klien'}
              </span>
              {patient.kecamatan && (
                <>
                  <span className="patient-meta-dot">&bull;</span>
                  <span className="patient-meta-item">
                    Kec. {patient.kecamatan}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Form Isi Modal */}
        <div className="modal-body-content">
          {/* Pilihan Status Progres */}
          <div className="form-group">
            <label className="form-label">
              Status Progres Klien Terbaru <span className="req">*</span>
            </label>
            <div className="status-cards-picker">
              <button
                type="button"
                className={`status-chip chip-ongoing ${selectedStatus === 'ON GOING' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('ON GOING')}
              >
                <div className="status-chip-icon">
                  <Clock size={18} weight="bold" />
                </div>
                <div className="status-chip-content">
                  <span className="status-chip-title">ON GOING</span>
                  <span className="status-chip-sub">Dalam Program Rawatan</span>
                </div>
                <Check size={16} weight="bold" className="status-chip-check" />
              </button>

              <button
                type="button"
                className={`status-chip chip-selesai ${selectedStatus === 'SELESAI' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('SELESAI')}
              >
                <div className="status-chip-icon">
                  <CheckCircle size={18} weight="bold" />
                </div>
                <div className="status-chip-content">
                  <span className="status-chip-title">SELESAI / PULIH</span>
                  <span className="status-chip-sub">Lulus Program Rawatan</span>
                </div>
                <Check size={16} weight="bold" className="status-chip-check" />
              </button>

              <button
                type="button"
                className={`status-chip chip-dropout ${selectedStatus === 'DROP OUT' ? 'active' : ''}`}
                onClick={() => setSelectedStatus('DROP OUT')}
              >
                <div className="status-chip-icon">
                  <WarningCircle size={18} weight="bold" />
                </div>
                <div className="status-chip-content">
                  <span className="status-chip-title">DROP OUT (DO)</span>
                  <span className="status-chip-sub">Putus Kontak / Mangkir</span>
                </div>
                <Check size={16} weight="bold" className="status-chip-check" />
              </button>
            </div>
          </div>

          {/* Instansi Rujukan */}
          <div className="form-group">
            <label htmlFor="modalKepada" className="form-label">
              Instansi Tujuan Rujukan
            </label>
            <select
              id="modalKepada"
              className="form-select"
              value={selectedKepada}
              onChange={(e) => handleKepadaChange(e.target.value)}
            >
              {INSTANSI_RUJUKAN_LIST.map((ins) => (
                <option key={ins.name} value={ins.name}>
                  {ins.name} ({ins.kabupaten})
                </option>
              ))}
            </select>
          </div>

          {/* Status Rawatan */}
          <div className="form-group">
            <label htmlFor="modalStatusRawat" className="form-label">
              Status Rawatan Pasien
            </label>
            <select
              id="modalStatusRawat"
              className="form-select"
              value={selectedRawat}
              onChange={(e) => setSelectedRawat(e.target.value)}
            >
              <option value="Rawat Jalan Klinik Pratama BNNK Buleleng">
                Rawat Jalan Klinik Pratama BNNK Buleleng
              </option>
              <option value="Rawat Inap RSJ Bangli">
                Rawat Inap RSJ Bangli
              </option>
              <option value="Rawat Jalan BNNP Bali">
                Rawat Jalan BNNP Bali
              </option>
              <option value="Rawat Inap Balai Lido">
                Rawat Inap Balai Besar Lido, Bogor
              </option>
              <option value="Rawat Inap Balai Badoka">
                Rawat Inap Balai Badoka, Makassar
              </option>
              <option value="Rawat Inap Balai Tanah Merah">
                Rawat Inap Balai Tanah Merah, Samarinda
              </option>
              <option value="Rawat Inap Loka Batam">
                Rawat Inap Loka Rehabilitasi Batam
              </option>
            </select>
          </div>

          {/* Catatan Konseling */}
          <div className="form-group">
            <label htmlFor="modalNotes" className="form-label">
              Catatan Asesmen / Konseling Klinis <span className="req">*</span>
            </label>
            <textarea
              id="modalNotes"
              className="form-textarea"
              rows="3"
              placeholder="Masukkan perkembangan hasil asesmen, konseling, atau status terkini klien..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <div className="modal-footer-bar">
          <button
            type="button"
            className="btn btn-secondary"
            id="btnCancelModal"
            onClick={onClose}
          >
            Batal
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              id="btnPrintPdf"
              onClick={handlePrint}
            >
              <Printer size={16} weight="bold" />
              <span>Cetak Rekam (PDF)</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              id="btnSaveStatus"
              onClick={handleSave}
            >
              <FloppyDiskBack size={16} weight="bold" />
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
