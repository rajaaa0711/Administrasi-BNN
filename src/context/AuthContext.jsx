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
      const savedUser = localStorage.getItem('simRehabUser');
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
      localStorage.setItem('simRehabToken', token);
      localStorage.setItem('simRehabUser', JSON.stringify(userData));
      setUser(userData);

      return { success: true, message: json.message };
    } catch (err) {
      console.error('Error login:', err);
      return {
        success: false,
        message: 'Gagal terhubung ke server backend (pastikan localhost:5000 aktif).',
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('simRehabToken');
    localStorage.removeItem('simRehabUser');
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