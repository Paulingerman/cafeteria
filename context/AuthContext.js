// context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuarioLogado, setUsuarioLogado] = useState(null); 

  // Função centralizada para fazer logout
  const logout = () => {
    setUsuarioLogado(null);
    console.log("[AuthContext] Usuário deslogado.");
  };

  const value = {
    usuarioLogado,
    setUsuarioLogado,
    logout, // ✅ Adicionamos a função logout ao contexto
    isCliente: usuarioLogado?.tipo === 'cliente',
    isGarcom: usuarioLogado?.tipo === 'garcom',
    isGerente: usuarioLogado?.tipo === 'gerente',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}