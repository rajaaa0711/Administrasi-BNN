import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  LockKey,
  Eye,
  EyeSlash,
  SignIn,
  Buildings,
  WarningCircle,
  ShieldCheck
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import '../styles/design-system.css';
import '../styles/login.css';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    document.title = 'SIM-REHAB | Login Pegawai - BNNK Buleleng';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setErrorMessage('Mohon lengkapi NIP/Username dan Kata Sandi.');
      return;
    }

    setIsSubmitting(true);
    const result = await login(trimmedUsername, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message);
      return;
    }

    navigate('/dashboard');
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Panel Kiri: Identitas Resmi BNN */}
        <div className="login-brand-panel">
          <div className="brand-header">
            <img
              src="/assets/images/bnn.png"
              alt="Logo BNN RI"
              className="brand-logo"
            />
            <div className="brand-org-meta">
              <span className="brand-instansi">BADAN NARKOTIKA NASIONAL</span>
              <span className="brand-cabang">KABUPATEN BULELENG</span>
            </div>
          </div>

          <div className="brand-hero-text">
            <h1 className="brand-app-name">SIM-REHAB</h1>
            <p className="brand-app-desc">
              Sistem Informasi Administrasi Pasien Rehabilitasi
            </p>
          </div>

          <div className="brand-tagline-card">
            <div className="tagline-title">#WARONDRUGS &bull; SINGARAJA BERSINAR</div>
            <p className="tagline-desc">
              Layanan Rehabilitasi Medis &amp; Sosial: Pulih, Mandiri, dan Berdaya.
            </p>
          </div>

          <div className="brand-footer-note">
            <Buildings size={16} weight="bold" />
            <span>Klinik Pratama BNNK Buleleng</span>
          </div>
        </div>

        {/* Panel Kanan: Form Masuk */}
        <div className="login-form-panel">
          <div className="form-title-group">
            <h2 className="login-heading">Portal Masuk Pegawai</h2>
            <p className="login-subheading">
              Gunakan kredensial resmi staf rehabilitasi untuk mengakses sistem
            </p>
          </div>

          {errorMessage && (
            <div className="login-error-alert" role="alert">
              <WarningCircle size={18} weight="fill" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="login-form" id="loginForm" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                NIP / Nama Pengguna (Username)
              </label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <User size={18} weight="bold" />
                </span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-input with-prefix"
                  placeholder="kasi_rehab / staf_rehab"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Kata Sandi
              </label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <LockKey size={18} weight="bold" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-input with-prefix with-suffix"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  id="togglePassword"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlash size={18} weight="bold" />
                  ) : (
                    <Eye size={18} weight="bold" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block btn-lg"
              disabled={isSubmitting}
            >
              <SignIn size={18} weight="bold" />
              <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk ke Sistem'}</span>
            </button>
          </form>

          {/* Tombol Akses Cepat */}
          <div className="quick-login-section">
            <span className="quick-login-label">Pilihan Cepat Masuk:</span>
            <div className="quick-login-chips">
              <button
                type="button"
                className="quick-chip chip-super"
                onClick={() => handleQuickFill('kasi_rehab', 'admin123')}
                title="Isi Akun Super User (Akses Penuh + Tombol Hapus)"
              >
                <ShieldCheck size={14} weight="bold" />
                <span>Super User (Kasi)</span>
              </button>
              <button
                type="button"
                className="quick-chip chip-staf"
                onClick={() => handleQuickFill('staf_rehab', 'staf123')}
                title="Isi Akun Petugas Rehabilitasi"
              >
                <User size={14} weight="bold" />
                <span>Petugas Rehab</span>
              </button>
            </div>
          </div>

          <div className="login-security-info">
            <span>Sistem internal terenkripsi BNN RI</span>
          </div>
        </div>
      </div>
    </div>
  );
}