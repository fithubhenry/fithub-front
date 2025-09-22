"use client"
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { getUserById } from '@/services/userService';
import type { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedToken = Cookies.get('token');
    if (storedToken) {
      setToken(storedToken);
      const decoded = decodeToken(storedToken);
      if (decoded?.userId) {
        getUserById(decoded.userId)
          .then((fullUser) => setUser({ ...decoded, ...fullUser }))
          .catch(() => setUser(decoded));
      } else {
        setUser(decoded);
      }
    }
  }, []);

  const login = async (newToken: string) => {
    setToken(newToken);
    Cookies.set('token', newToken, { expires: 7 }); // 7 días de expiración
    const decoded = decodeToken(newToken);
    if (decoded?.userId) {
      try {
        const fullUser = await getUserById(decoded.userId);
        setUser({ ...decoded, ...fullUser });
      } catch {
        setUser(decoded);
      }
    } else {
      setUser(decoded);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    Cookies.remove('token');
  };

  const refreshUserData = async () => {
    if (user?.userId) {
      try {
        // Intentar obtener los datos actualizados del usuario varias veces
        // ya que el webhook puede tardar en procesar
        let attempts = 0;
        const maxAttempts = 5;
        const delayBetweenAttempts = 2000; // 2 segundos
        
        while (attempts < maxAttempts) {
          try {
            const updatedUserData = await getUserById(user.userId);
            
            // Si el estado cambió a Activo, actualizar y salir
            if (updatedUserData.estado === 'Activo' && user.estado !== 'Activo') {
              const updatedUser = { ...user, ...updatedUserData };
              setUser(updatedUser);
              break;
            }
            
            // Si ya era Activo o en el último intento, actualizar datos
            if (updatedUserData.estado === 'Activo' || attempts === maxAttempts - 1) {
              const updatedUser = { ...user, ...updatedUserData };
              setUser(updatedUser);
              break;
            }
            
            attempts++;
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
            }
          } catch (error) {
            attempts++;
            if (attempts >= maxAttempts) {
              throw error;
            }
            await new Promise(resolve => setTimeout(resolve, delayBetweenAttempts));
          }
        }
      } catch (error) {
        console.error('Error al actualizar datos del usuario:', error);
      }
    }
  };

  function decodeToken(token: string): User | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload.userId,
        email: payload.email,
        esAdmin: payload.esAdmin,
        estado: payload.estado,
      };
    } catch {
      return null;
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout, setUser, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};
