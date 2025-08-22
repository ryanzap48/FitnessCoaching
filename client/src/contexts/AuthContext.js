// contexts/AuthContext.js
import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const AuthContext = createContext();

let logoutTimer = null;



export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || 'user'); // default to user

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole('user');
    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
    window.location.href = '/login'; // redirect to login
  }, []);

   const setupAutoLogout = useCallback((jwtToken) => {
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const now = Date.now();
      const timeout = expiryTime - now;

      if (timeout > 0) {
        logoutTimer = setTimeout(logout, timeout);
      } else {
        logout();
      }
    } catch (err) {
      console.error('Failed to decode token for auto logout:', err);
      logout();
    }
  }, [logout]);

  const login = (newToken, userRole) => {
    console.log(userRole);
    localStorage.setItem('token', newToken);
    localStorage.setItem('role', userRole);
    setToken(newToken);
    setRole(userRole);
    setupAutoLogout(newToken);
  };


  useEffect(() => {
    if (token) {
      setupAutoLogout(token);
    }
    return () => {
      if (logoutTimer) {
        clearTimeout(logoutTimer);
      }
    };
  }, [token, setupAutoLogout]);


  const isAuthenticated = !!token;
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated, isAdmin, role}}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
