import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const roleLabels = {
  petugas_rehab: 'Petugas Rehabilitasi',
  super_user: 'Super User (Kasi Rehab)',
  admin: 'Administrator Sistem',
  dokter: 'Dokter / Tenaga Medis',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      // Bersihkan cache lama di localStorage agar tidak langsung otomatis masuk
      localStorage.removeItem('simRehabUser');
      localStorage.removeItem('simRehabToken');
      const savedUser = sessionStorage.getItem('simRehabUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const login = async (username, password) => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        return { success: false, message: json.message || 'Username atau kata sandi salah!' };
      }

      const { token, user: userData } = json.data;
      sessionStorage.setItem('simRehabToken', token);
      sessionStorage.setItem('simRehabUser', JSON.stringify(userData));
      setUser(userData);

      return { success: true, message: json.message };
    } catch (err) {
      console.error('Error login:', err);

      // Fallback Demo Login jika server backend belum dihidupkan
      const cleanU = username.trim().toLowerCase();
      if ((cleanU === 'kasi_rehab' && password === 'admin123') || (cleanU === 'super_user' && password === 'admin123')) {
        const demoUser = {
          id: 1,
          username: 'kasi_rehab',
          nama: 'Kasi Rehabilitasi BNNK (Demo)',
          role: 'super_user'
        };
        sessionStorage.setItem('simRehabToken', 'demo_token_super_user');
        sessionStorage.setItem('simRehabUser', JSON.stringify(demoUser));
        setUser(demoUser);
        return { success: true, message: 'Login berhasil (Mode Demo - Super User)!' };
      }

      if ((cleanU === 'staf_rehab' && password === 'staf123') || (cleanU === 'admin' && password === 'admin')) {
        const demoUser = {
          id: 2,
          username: cleanU,
          nama: 'Petugas Rehabilitasi (Demo)',
          role: 'petugas_rehab'
        };
        sessionStorage.setItem('simRehabToken', 'demo_token_petugas');
        sessionStorage.setItem('simRehabUser', JSON.stringify(demoUser));
        setUser(demoUser);
        return { success: true, message: 'Login berhasil (Mode Demo - Petugas Rehab)!' };
      }

      return {
        success: false,
        message: 'Gagal terhubung ke server backend (pastikan localhost:5000 aktif).',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('simRehabToken');
    localStorage.removeItem('simRehabUser');
    sessionStorage.removeItem('simRehabToken');
    sessionStorage.removeItem('simRehabUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam komponen AuthProvider');
  }
  return context;
}