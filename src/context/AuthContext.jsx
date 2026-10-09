import { useEffect, useState } from 'react';
import api from '../services/api';
import { huespedService } from '../services/recursos';
import { User } from '../models';
import { AuthContext } from './authContextObject';

const STORAGE_KEY = 'auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [huesped, setHuesped] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHuesped = async () => {
    try {
      setHuesped(await huespedService.miPerfil());
    } catch {
      // Cuentas admin/empleado no tienen perfil de huésped: no es un error.
      setHuesped(null);
    }
  };

  useEffect(() => {
    api.onUnauthorized(() => {
      localStorage.removeItem(STORAGE_KEY);
      api.clearAuthToken();
      setToken(null);
      setUser(null);
      setHuesped(null);
    });
  }, []);

  useEffect(() => {
    const restore = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const { token: storedToken, user: storedUser } = JSON.parse(stored);
          api.setAuthToken(storedToken);
          setToken(storedToken);
          // localStorage guarda JSON plano (los getters como esStaff no se
          // serializan): se vuelve a armar la instancia al restaurar la sesión.
          setUser(User.fromJSON(storedUser));
          await fetchHuesped();
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setLoading(false);
    };
    restore();
  }, []);

  const login = async (newToken, newUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: newToken, user: newUser }));
    api.setAuthToken(newToken);
    setToken(newToken);
    setUser(newUser instanceof User ? newUser : User.fromJSON(newUser));
    await fetchHuesped();
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    api.clearAuthToken();
    setToken(null);
    setUser(null);
    setHuesped(null);
  };

  return (
    <AuthContext.Provider value={{ user, huesped, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

