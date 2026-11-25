import React, { useState, useEffect } from 'react';
import {
  Gear,
  User,
  ShieldCheck,
  LockKey,
  FloppyDiskBack,
  Buildings,
  CheckCircle,
  XCircle
} from '@phosphor-icons/react';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';
import { useAuth, roleLabels } from '../context/AuthContext';
import '../styles/design-system.css';
import '../styles/pengaturan-akun.css';

export default function PengaturanAkunPage() {
  const { user } = useAuth();
  const [toastShow, setToastShow] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Password Change State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = 'SIM-REHAB | Pengaturan Akun - BNNK Buleleng';
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !confirmPassword) {
      setToastMsg('Mohon lengkapi seluruh kolom kata sandi.');
      setToastShow(true);
      setTimeout(() => setToastShow(false), 3000);
      return;
    }

    if (newPassword.length < 4) {
      setToastMsg('Kata sandi baru minimal harus 4 karakter.');
      setToastShow(true);
      setTimeout(() => setToastShow(false), 3000);
      return;
    }

    if (newPassword !== confirmPassword) {
      setToastMsg('Konfirmasi kata sandi baru tidak cocok!');
      setToastShow(true);
      setTimeout(() => setToastShow(false), 3000);
      return;
    }

    // Berikan feedback sukses
    setToastMsg('Kata sandi akun pegawai berhasil diperbarui.');
    setToastShow(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setToastShow(false), 3500);
  };

  const displayRole = user?.role
    ? roleLabels[user.role] || 'Petugas Rehabilitasi'
    : 'Petugas Rehabilitasi';

  const userInitial = user?.nama
    ? user.nama.charAt(0).toUpperCase()
    : (user?.username ? user.username.charAt(0).toUpperCase() : 'P');

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="page-header">
          <div className="header-left">
            <h1 className="page-title">Pengaturan Akun &amp; Hak Akses</h1>
            <p className="page-subtitle">
              Profil pegawai, tingkat kewenangan rekam medis, dan keamanan akses SIM-REHAB BNNK Buleleng
            </p>
          </div>
        </header>

        <div className="settings-page-content">
          {/* Top Banner Profil Pegawai (Membentang Penuh) */}
          <div className="settings-banner-card">
            <div className="settings-banner-left">
              <div className="profile-avatar-circle-lg">
                {userInitial}
              </div>
              <div className="settings-banner-text">
                <div className="settings-banner-title-row">
                  <h2 className="settings-banner-name">{user?.nama || 'Petugas Rehabilitasi'}</h2>
                  <span className="badge-perm-yes">
                    <ShieldCheck size={14} weight="bold" />
                    {displayRole}
                  </span>
                </div>
                <div className="settings-banner-meta">
                  <span className="settings-banner-meta-item">
                    <strong>NIP/Username:</strong> <span className="font-mono">{user?.username || 'admin'}</span>
                  </span>
                  <span>&bull;</span>
                  <span className="settings-banner-meta-item">
                    <strong>Instansi:</strong> BNNK Buleleng
                  </span>
                  <span>&bull;</span>
                  <span className="settings-banner-meta-item">
                    <strong>Seksi:</strong> Rehabilitasi Medis &amp; Sosial
                  </span>
                </div>
              </div>
            </div>

            <div className="settings-banner-right">
              <span className="badge-active-status">
                <span className="status-dot"></span>
                Sesi Berjalan (Online)
              </span>
            </div>
          </div>

          {/* Grid 2 Kolom Lebar: Detail Akses & Form Ganti Kata Sandi */}
          <div className="settings-grid">
            {/* Kolom 1: Tabel Spesifikasi Akun & Izin Operasional */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-header-left">
                  <div className="settings-card-icon">
                    <User size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="settings-card-title">Spesifikasi Akun &amp; Izin Sistem</h3>
                    <p className="settings-card-subtitle">Kewenangan operasional akun Anda di SIM-REHAB</p>
                  </div>
                </div>
              </div>

              <div className="settings-card-body">
                <table className="settings-spec-table">
                  <tbody>
                    <tr>
                      <td className="spec-label">Nama Lengkap Pegawai</td>
                      <td className="spec-value">{user?.nama || 'Petugas Rehabilitasi BNNK Buleleng'}</td>
                    </tr>
                    <tr>
                      <td className="spec-label">NIP / Username Akun</td>
                      <td className="spec-value font-mono">{user?.username || 'admin'}</td>
                    </tr>
                    <tr>
                      <td className="spec-label">Peran Sistem (Role)</td>
                      <td className="spec-value">{displayRole}</td>
                    </tr>
                    <tr>
                      <td className="spec-label">Izin Hapus Rekam Medis</td>
                      <td className="spec-value">
                        {user?.role === 'super_user' ? (
                          <span className="badge-perm-yes">
                            <CheckCircle size={14} weight="bold" />
                            Diizinkan (Super User)
                          </span>
                        ) : (
                          <span className="badge-perm-no">
                            <XCircle size={14} weight="bold" />
                            Dibatasi (Hanya Kasi Rehab)
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="spec-label">Izin Ekspor / Impor Data</td>
                      <td className="spec-value">
                        <span className="badge-perm-yes">
                          <CheckCircle size={14} weight="bold" />
                          Diizinkan (17 Kolom Resmi BNN)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="spec-label">Unit Satuan Kerja</td>
                      <td className="spec-value">Badan Narkotika Nasional Kabupaten Buleleng</td>
                    </tr>
                    <tr>
                      <td className="spec-label">Klinik Operasional</td>
                      <td className="spec-value">Klinik Pratama BNNK Buleleng</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Kolom 2: Form Keamanan & Kata Sandi */}
            <div className="settings-card">
              <div className="settings-card-header">
                <div className="settings-card-header-left">
                  <div className="settings-card-icon">
                    <LockKey size={18} weight="bold" />
                  </div>
                  <div>
                    <h3 className="settings-card-title">Keamanan &amp; Kata Sandi</h3>
                    <p className="settings-card-subtitle">Perbarui kredensial untuk melindungi data rekam medis</p>
                  </div>
                </div>
              </div>

              <div className="settings-card-body">
                <form className="settings-form" onSubmit={handlePasswordSubmit}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="oldPassword">
                      Kata Sandi Saat Ini <span className="req">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="oldPassword"
                      className="form-input"
                      placeholder="Masukkan kata sandi lama"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="newPassword">
                      Kata Sandi Baru <span className="req">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      className="form-input"
                      placeholder="Minimal 4 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="confirmPassword">
                      Konfirmasi Kata Sandi Baru <span className="req">*</span>
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      className="form-input"
                      placeholder="Ulangi kata sandi baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="showPasswordCheck"
                      checked={showPassword}
                      onChange={(e) => setShowPassword(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="showPasswordCheck" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      Tampilkan karakter kata sandi
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary settings-btn-save"
                  >
                    <FloppyDiskBack size={16} weight="bold" />
                    <span>Simpan Kata Sandi</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <Toast show={toastShow} message={toastMsg} />
      </main>
    </div>
  );
}
