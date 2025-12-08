import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Estado para armazenar os dados do usuário
  const [token, setToken] = useState(localStorage.getItem("token")); // Estado para armazenar o token de autenticação

  // Carregar dados do usuário do localStorage ao montar o componente
  useEffect(() => {
    const storedUser = localStorage.getItem("user"); // Buscar dados do usuário do localStorage
    if (storedUser) // Verificar se há dados armazenados
      setUser(JSON.parse(storedUser));

  }, []);

  // Função para fazer login
  const login = (userData, authToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
    setUser(userData);
    setToken(authToken);
  };

  // Função para fazer logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  // Prover o contexto de autenticação para os componentes filhos
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};
