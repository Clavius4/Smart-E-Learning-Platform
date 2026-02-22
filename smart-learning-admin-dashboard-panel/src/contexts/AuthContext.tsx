// src/contexts/AuthContext.tsx
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

interface User {
  id: string;
  role: string;
  email: string;
  // add other fields as needed
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (token) {
      try {
        // simple parse or use jwt-decode if available. 
        // For now, let's assume standard intuitive base64 decode/JSON parse if library missing, 
        // but checking package.json is safer.
        // If the user object is not in the token, we might need to fetch it.
        // But typically key info like role IS in the token.
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        const decoded = JSON.parse(jsonPayload);
        setUser({ ...decoded, role: decoded.accountType || decoded.role }); // Ensure role is mapped
      } catch (e) {
        console.error("Invalid token", e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ✅ Make sure this is exported!
export { AuthContext };
