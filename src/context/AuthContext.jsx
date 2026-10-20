import { useEffect, useState } from 'react';
import api from '../services/api';
import { guestService } from '../services/resources';
import { User } from '../models';
import { AuthContext } from './authContextObject';

const STORAGE_KEY = 'auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [guest, setGuest] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Only guest accounts have a guest profile: asking for it as admin or
  // employee just produced a 404 on every page load.
  const fetchGuestProfile = async (account) => {
    if (!account.isGuest) {
      setGuest(null);
      return;
    }
    try {
      setGuest(await guestService.myProfile());
    } catch {
      setGuest(null);
    }
  };

  useEffect(() => {
    api.onUnauthorized(() => {
      localStorage.removeItem(STORAGE_KEY);
      api.clearAuthToken();
      setToken(null);
      setUser(null);
      setGuest(null);
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
          // localStorage keeps plain JSON (getters like isStaff are not
          // serialized): the instance is rebuilt when the session is restored.
          const restoredUser = User.fromJSON(storedUser);
          setUser(restoredUser);
          await fetchGuestProfile(restoredUser);
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
    const account = newUser instanceof User ? newUser : User.fromJSON(newUser);
    setUser(account);
    await fetchGuestProfile(account);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    api.clearAuthToken();
    setToken(null);
    setUser(null);
    setGuest(null);
  };

  return (
    <AuthContext.Provider value={{ user, guest, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
