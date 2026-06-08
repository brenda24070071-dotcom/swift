import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('swiftcart_token');
    const storedUser  = localStorage.getItem('swiftcart_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  async function login(email, senha) {
    const data = await authService.login(email, senha);
    setToken(data.token);
    setUser(data.usuario);
    localStorage.setItem('swiftcart_token', data.token);
    localStorage.setItem('swiftcart_user', JSON.stringify(data.usuario));
    return data;
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('swiftcart_token');
    localStorage.removeItem('swiftcart_user');
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
