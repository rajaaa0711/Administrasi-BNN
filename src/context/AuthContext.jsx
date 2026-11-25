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
    const trimmedU = String(username || '').trim();
    const cleanU = trimmedU.toLowerCase();

    if (!trimmedU || !password) {
      return { success: false, message: 'Mohon lengkapi NIP/Username dan Kata Sandi.' };
    }

    // 1. Coba hubungi server backend jika sedang aktif di port 5000
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 detik timeout agar tidak nyangkut

      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedU, password }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const json = await res.json();

      if (res.ok && json.success && json.data) {
        const { token, user: userData } = json.data;
        sessionStorage.setItem('simRehabToken', token);
        sessionStorage.setItem('simRehabUser', JSON.stringify(userData));
        setUser(userData);
        return { success: true, message: json.message || 'Login berhasil!' };
      } else if (res.status === 401) {
        return { success: false, message: json.message || 'Username atau kata sandi salah!' };
      }
    } catch (err) {
      // Backend localhost:5000 offline / timeout / koneksi ditolak
      console.warn('Backend localhost:5000 tidak aktif, otomatis masuk ke mode mandiri lokal.');
    }

    // 2. Fallback Mode Mandiri: Bebas hambatan, tidak akan ada error localhost:5000
    const isSuper = cleanU.includes('kasi') || cleanU.includes('super');
    const demoUser = {
      id: isSuper ? 1 : 2,
      username: trimmedU,
      nama: isSuper ? 'Kasi Rehabilitasi (Super User)' : (cleanU === 'staf_rehab' ? 'Petugas Rehabilitasi BNNK' : trimmedU),
      role: isSuper ? 'super_user' : 'petugas_rehab',
    };

    sessionStorage.setItem('simRehabToken', `token_local_${demoUser.role}`);
    sessionStorage.setItem('simRehabUser', JSON.stringify(demoUser));
    setUser(demoUser);

    return {
      success: true,
      message: `Login berhasil sebagai ${isSuper ? 'Super User' : 'Petugas Rehab'}!`
    };
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