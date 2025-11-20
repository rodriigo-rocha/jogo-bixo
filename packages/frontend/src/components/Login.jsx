import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login({ onClose }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleAuth(e) {
    e.preventDefault();
    const url = `http://localhost:3000/auth/${isRegistering ? "register" : "login"}`;
    const body = isRegistering
      ? { email, password, username }
      : { email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const { token, user } = await response.json();
        login(user, token); // Salva o usuário e o token no contexto
        alert(`Bem-vindo, ${user.username}!`);
        navigate("/dashboard"); // Redireciona para o dashboard
      } else {
        const error = await response.json();
        alert(`Erro: ${error.message}`);
      }
    } catch (error) {
      console.error("Erro de autenticação:", error);
      alert("Ocorreu um erro de rede. O backend está rodando?");
    }
  }

  return (
    <div className="absolute top-[50%] left-[50%] bg-gray-300 border-gray-400 border-4 md:w-[45dvw] w-[85dvw] translate-[-50%] flex flex-col jusitfy-between align-middle">
      <div className="bg-gray-500 border-gray-400 border-b-4 justify-between flex">
        <span className="px-3 font-bold text-white">
          Gerenciador do Jogo do Bicho
        </span>
        <button
          type="button"
          className="bg-gray-400 px-2 text-red-600 cursor-pointer hover:text-red-700 active:text-white"
          onClick={onClose}
        >
          X
        </button>
      </div>
      <form
        onSubmit={handleAuth}
        className="flex flex-col justify-center align-middle py-7 px-10"
      >
        {isRegistering && (
          <>
            <label for="username">Nome de Usuário</label>
            <input
              id="username"
              type="text"
              className="bg-white mb-2"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </>
        )}
        <label for="email">E-mail</label>
        <input
          id="email"
          type="email"
          className="bg-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label for="password">Senha</label>
        <input
          id="password"
          type="password"
          className="bg-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="mt-4 font-semibold relative left-[50%] translate-x-[-50%] cursor-pointer p-1 bg-gray-100 w-20 hover:bg-gray-500"
        >
          {isRegistering ? "Criar Conta" : "Entrar"}
        </button>
      </form>
      <div className="w-full flex justify-between pb-3 px-10">
        <a href="#" className="cursor-pointer hover:underline">
          Esqueci minha Senha
        </a>
        <button
          type="button"
          className="cursor-pointer hover:underline"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? "Já tenho uma conta" : "Criar Conta"}
        </button>
      </div>
    </div>
  );
}

export default Login;
