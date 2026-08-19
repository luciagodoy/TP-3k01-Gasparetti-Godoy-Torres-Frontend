import { useEffect, useState } from 'react';
import api from '../services/api';
import { AuthContext } from './authContextObject';

const STORAGE_KEY = 'auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [huesped, setHuesped] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHuesped = async () => {
    try {
      const data = await api.get('/huespedes/me');
      setHuesped(data);
    } catch {
      // Cuentas admin/empleado no tienen perfil de huésped: no es un error.
      setHuesped(null);
    }
  };

  useEffect(() => {
    const restore = async () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const { token: storedToken, user: storedUser } = JSON.parse(stored);
          api.setAuthToken(storedToken);
          setToken(storedToken);
          setUser(storedUser);
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
    setUser(newUser);
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

