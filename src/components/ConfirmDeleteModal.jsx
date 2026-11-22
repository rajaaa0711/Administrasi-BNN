import React from 'react';
import { Warning, Trash, X } from '@phosphor-icons/react';

export default function ConfirmDeleteModal({ isOpen, patient, onCancel, onConfirm }) {
  if (!isOpen || !patient) return null;

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal-card modal-delete-card">
        {/* Header Bar Danger */}
        <div className="modal-header-bar modal-delete-header-bar">
          <div className="modal-delete-header-title">
            <div className="modal-delete-badge-icon">
              <Trash size={16} weight="bold" />
            </div>
            <span>Konfirmasi Hapus Rekam Medis</span>
          </div>
          <button
            type="button"
            className="btn-close-modal"
            title="Tutup Modal"
            onClick={onCancel}
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Modal Delete Body */}
        <div className="modal-delete-body">
          <p className="modal-delete-prompt">
            Apakah Anda yakin ingin menghapus data rekam medis pasien berikut dari basis data SIM-REHAB?
          </p>

          {/* Kartu Profil Pasien yang Akan Dihapus */}
          <div className="modal-delete-patient-card">
            <div className="delete-patient-avatar">
              {patient.foto ? (
                <img src={patient.foto} alt={patient.nama} className="delete-avatar-img" />
              ) : (
                <div className="delete-avatar-init">
                  {(patient.nama || 'K').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="delete-patient-info">
              <strong className="delete-patient-name">{patient.nama}</strong>
              <div className="delete-patient-meta">
                <span className="font-mono">NIK: {patient.nik || '-'}</span>
                <span>&bull;</span>
                <span>{patient.gender === 'L' || patient.gender === 'laki' ? 'Laki-laki' : 'Perempuan'}</span>
                <span>&bull;</span>
                <span>{patient.statusRawat || 'Rawat Jalan'}</span>
              </div>
              <div className="delete-patient-sub">
                <span>{patient.desa ? `${patient.desa}, ` : ''}Kec. {patient.kecamatan || '-'}</span>
                <span>&bull;</span>
                <span>Tahun {patient.tahun || patient.tahunRehab || '2026'}</span>
              </div>
            </div>
          </div>

          {/* Alert Peringatan Penghapusan Permanen */}
          <div className="modal-delete-alert-box">
            <Warning size={20} weight="fill" className="delete-alert-icon" />
            <div className="delete-alert-text">
              <strong>Peringatan Tindakan Permanen</strong>
              Berkas rekam medis klien akan dihapus dari buku register. Tindakan ini tidak dapat dibatalkan.
            </div>
          </div>
        </div>

        {/* Footer Tombol Aksi */}
        <div className="modal-footer-bar modal-delete-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn-danger-action"
            onClick={onConfirm}
          >
            <Trash size={16} weight="bold" />
            <span>Ya, Hapus Pasien</span>
          </button>
        </div>
      </div>
    </div>
  );
}
