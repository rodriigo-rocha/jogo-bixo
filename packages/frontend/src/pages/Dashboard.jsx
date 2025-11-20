import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Apostas from "../components/Apostas";
import Desempenho from "../components/Desempenho";
import Footer from "../components/Footer";
import Sorteios from "../components/Sorteios";
import TabelaAnimais from "../components/TabelaAnimais";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [maximizado, setMaximizado] = useState(false);
  const [pages, setPages] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Estados para Apostas
  const [apostas, setApostas] = useState([]);
  const [draws, setDraws] = useState([]);
  const [selectedDraw, setSelectedDraw] = useState("");
  const [selectedFilterDraw, setSelectedFilterDraw] = useState("");
  const [animal, setAnimal] = useState("1");
  const [tipoAposta, setTipoAposta] = useState("grupo");
  const [valor, setValor] = useState("");
  const [numero, setNumero] = useState("");
  const [apostador, setApostador] = useState("");
  const [editingBetId, setEditingBetId] = useState(null);

  const fetchDraws = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("http://localhost:3000/draws", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDraws(data);
        const openDraw = data.find((d) => d.status === "open");
        if (openDraw) {
          setSelectedDraw(openDraw.id.toString());
        }
      } else {
        console.error("Falha ao buscar sorteios");
      }
    } catch (error) {
      console.error("Erro de rede ao buscar sorteios:", error);
    }
  });

  const fetchApostas = useCallback(async () => {
    if (!user || !token) return; // Não faz nada se não houver usuário ou token
    try {
      const response = await fetch(`http://localhost:3000/bets/${user.id}`, {
        headers: {
          // ADICIONANDO O HEADER DE AUTORIZAÇÃO
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setApostas(data);
      } else {
        console.error("Falha ao buscar apostas");
      }
    } catch (error) {
      console.error("Erro de rede ao buscar apostas:", error);
    }
  });

  useEffect(() => {
    if (user && token) {
      // Garante que ambos existam antes de buscar
      fetchDraws();
      fetchApostas();
    }
  }, [
    user,
    token,
    fetchApostas, // Garante que ambos existam antes de buscar
    fetchDraws,
  ]); // Adiciona 'token' como dependência

  async function registrarAposta() {
    if (!user) {
      alert("Você precisa estar logado para fazer uma aposta.");
      return;
    }
    if (!selectedDraw) {
      alert("Selecione um sorteio primeiro.");
      return;
    }
    try {
      const betData = {
        userId: user.id,
        drawId: parseInt(selectedDraw, 10),
        betor: apostador,
        animal,
        betType: tipoAposta,
        value: parseFloat(valor),
        number: tipoAposta !== "grupo" ? parseInt(numero, 10) : undefined,
      };

      let response;
      if (editingBetId) {
        // Editar aposta existente
        response = await fetch(`http://localhost:3000/bets/${editingBetId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            drawId: parseInt(selectedDraw, 10),
            betor: apostador,
            animal,
            betType: tipoAposta,
            value: parseFloat(valor),
            number: tipoAposta !== "grupo" ? parseInt(numero, 10) : undefined,
          }),
        });
      } else {
        // Criar nova aposta
        response = await fetch("http://localhost:3000/bets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(betData),
        });
      }

      if (response.ok) {
        const updatedBet = await response.json();
        if (editingBetId) {
          // Atualizar a aposta na lista
          setApostas((apostasAtuais) =>
            apostasAtuais.map((aposta) =>
              aposta.id === editingBetId ? updatedBet : aposta,
            ),
          );
          alert("Aposta atualizada com sucesso!");
        } else {
          // Adicionar nova aposta
          setApostas((apostasAtuais) => [...apostasAtuais, updatedBet]);
          alert("Aposta registrada com sucesso!");
        }
        // Limpar campos e sair do modo edição
        setValor("");
        setNumero("");
        setApostador("");
        setEditingBetId(null);
      } else {
        const errorData = await response.json();
        alert(
          `Erro ao ${editingBetId ? "atualizar" : "registrar"} aposta: ${errorData.message}`,
        );
      }
    } catch (error) {
      console.error(
        `Erro de rede ao ${editingBetId ? "atualizar" : "registrar"} aposta:`,
        error,
      );
      alert("Ocorreu um erro de rede. O backend está rodando?");
    }
  }

  async function deletarAposta(id) {
    if (!token) {
      alert("Você precisa estar logado para excluir uma aposta.");
      return;
    }

    if (!window.confirm("Deseja realmente excluir esta aposta?")) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/bets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setApostas((apostasAtuais) =>
          apostasAtuais.filter((aposta) => aposta.id !== id),
        );
        alert("Aposta excluída com sucesso!");
      } else {
        const errorData = await response.json();
        alert(`Erro ao excluir aposta: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro de rede ao excluir aposta:", error);
      alert("Ocorreu um erro de rede ao excluir aposta.");
    }
  }

  function editarAposta(aposta) {
    setEditingBetId(aposta.id);
    setSelectedDraw(aposta.drawId.toString());
    setApostador(aposta.betor || "");
    setAnimal(aposta.animal);
    setTipoAposta(aposta.betType);
    setValor(aposta.value.toString());
    setNumero(aposta.number ? aposta.number.toString() : "");
  }

  function maximizar() {
    setMaximizado(!maximizado);
  }
  function trocaPagina(num) {
    setPages(num);
  }

  function confirmLogout() {
    logout();
    navigate("/");
  }

  function cancelLogout() {
    setShowLogoutModal(false);
  }
  return (
    <>
      <div
        className={`${maximizado ? "h-dvh" : "h-[93dvh]"} w-dvw border-6 border-gray-400 bg-gray-200`}
      >
        <div className="bg-gray-500 border-gray-400 border-b-4 justify-between flex">
          <span className="px-3 font-bold text-white">
            Sistema de Gerenciamento
          </span>
          <div>
            <button
              type="button"
              className="bg-gray-500 border-gray-400 border-l-4 px-2 text-white cursor-pointer hover:text-black active:text-white"
              onClick={maximizar}
            >
              □
            </button>
            <button
              type="button"
              className="bg-gray-500 border-gray-400 border-l-4 px-2 text-red-600 cursor-pointer hover:text-red-700 active:text-white"
              onClick={() => setShowLogoutModal(true)}
            >
              X
            </button>
          </div>
        </div>
        <div className="bg-gray-400 border-gray-400 border-b-4 flex">
          <nav className="flex list-none">
            <li
              className={`${pages === 0 ? "bg-gray-300 text-black" : "bg-gray-500 text-gray-100"} border-r-4 border-gray-400 px-3  cursor-pointer`}
              onClick={() => trocaPagina(0)}
            >
              Desempenho
            </li>
            <li
              className={`${pages === 3 ? "bg-gray-300 text-black" : "bg-gray-500 text-gray-100"} border-r-4 border-gray-400 px-3  cursor-pointer`}
              onClick={() => trocaPagina(3)}
            >
              Sorteios
            </li>
            <li
              className={`${pages === 1 ? "bg-gray-300 text-black" : "bg-gray-500 text-gray-100"} border-r-4 border-gray-400 px-3  cursor-pointer`}
              onClick={() => trocaPagina(1)}
            >
              Apostas
            </li>
            <li
              className={`${pages === 2 ? "bg-gray-300 text-black" : "bg-gray-500 text-gray-100"} border-r-4 border-gray-400 px-3  cursor-pointer`}
              onClick={() => trocaPagina(2)}
            >
              Tabela de Animais
            </li>
          </nav>
        </div>
        {pages === 3 && <Sorteios />}
        {pages === 2 && <TabelaAnimais />}
        {pages === 1 && (
          <Apostas
            apostas={apostas}
            setApostas={setApostas}
            draws={draws}
            setDraws={setDraws}
            selectedDraw={selectedDraw}
            setSelectedDraw={setSelectedDraw}
            selectedFilterDraw={selectedFilterDraw}
            setSelectedFilterDraw={setSelectedFilterDraw}
            animal={animal}
            setAnimal={setAnimal}
            tipoAposta={tipoAposta}
            setTipoAposta={setTipoAposta}
            valor={valor}
            setValor={setValor}
            numero={numero}
            setNumero={setNumero}
            apostador={apostador}
            setApostador={setApostador}
            editingBetId={editingBetId}
            setEditingBetId={setEditingBetId}
            registrarAposta={registrarAposta}
            deletarAposta={deletarAposta}
            editarAposta={editarAposta}
          />
        )}
        {pages === 0 && <Desempenho />}
      </div>
      {!maximizado && <Footer />}

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <h2 className="text-xl font-bold mb-4">
              🏴 Tem certeza que quer desertar o navio?
            </h2>
            <p className="mb-6">Os piratas vão sentir sua falta...</p>
            <div className="flex gap-4 justify-center">
              <button
                type="button"
                onClick={confirmLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                SIM, FUJA! 🏃
              </button>
              <button
                type="button"
                onClick={cancelLogout}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                NÃO, FICO! 💪
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Dashboard;
