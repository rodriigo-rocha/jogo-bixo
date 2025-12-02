import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CardSorteio from "./CardSorteio";

function Sorteios({ draws, fetchDraws }) {
  const { token } = useAuth();
  const [pages, setPages] = useState(0);
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);

  function trocaPagina(num) {
    setPages(num);
  }

  async function registrarSorteio() {
    if (!token || !identifier.trim()) {
      alert("Por favor, insira um identificador válido");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3000/game/admin/draw/open", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          number: identifier.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Created draw response:", data);
        fetchDraws(); // Atualiza os sorteios no Dashboard
        setIdentifier("");
        alert("Sorteio criado com sucesso!");
      } else {
        const errorData = await response.json();
        alert(`Erro ao criar sorteio: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro de rede ao criar sorteio:", error);
      alert("Ocorreu um erro de rede. O backend está rodando?");
    } finally {
      setLoading(false);
    }
  }

  const filteredDraws = draws.filter((draw) => {
    if (pages === 0) return true; // Todas
    if (pages === 1) return draw.status === "OPEN";
    if (pages === 2) return draw.status === "CLOSED";
    return true;
  });

  return (
    <div className="p-4 text-center text-3xl overflow-y-auto max-h-[83.5dvh] flex-col lg:flex justify-center lg:justify-between flex-wrap px-[5%] py-[5%]">
      <div className="pb-4 mb-5 lg:mb-0 bg-blue-200 lg:w-[40%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70">
        <h2 className="text-xl text-center bg-gray-400 mb-4">
          Registrar Sorteios
        </h2>
        <div className="flex text-base flex-col px-3">
          <h3>Identificador do Sorteio</h3>
          <input
            type="number"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"
            placeholder="Ex: 1, 2, 3..."
            min="1"
          />
          <button
            type="button"
            onClick={registrarSorteio}
            disabled={loading}
            className="bg-blue-950 text-white w-25 cursor-pointer hover:bg-blue-900 active:bg-blue-800 active:text-indigo-100 disabled:opacity-50"
          >
            {loading ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </div>
      <div className="pb-4 bg-blue-200 lg:w-[55%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70">
        <h2 className="text-xl text-center bg-gray-400">
          Sorteios Registrados
        </h2>
        <div className="bg-gray-400 border-gray-400 border-b-4 flex mb-3">
          <nav className="flex list-none">
            <li
              className={`${pages === 0 ? "bg-gray-300 text-black" : "bg-gray-500 text-gray-100"} border-r-4 border-gray-400 px-3 text-lg cursor-pointer`}
              onClick={() => trocaPagina(0)}
            >
              Todas
            </li>
            <li
              className={`${pages === 1 ? "bg-gray-300 text-black" : "bg-gray-500 text-gray-100"} border-r-4 border-gray-400 px-3 text-lg cursor-pointer`}
              onClick={() => trocaPagina(1)}
            >
              Abertas
            </li>
            <li
              className={`${pages === 2 ? "bg-gray-300 text-black" : "bg-gray-500 text-gray-100"} border-r-4 border-gray-400 px-3 text-lg cursor-pointer`}
              onClick={() => trocaPagina(2)}
            >
              Finalizados
            </li>
          </nav>
        </div>
        <div className="min-h-[52dvh] flex flex-col px-4">
          <div className="p-3 gap-1  w-full h-[52dvh] overflow-y-auto shadow-inner shadow-gray-400 bg-white flex flex-col items-center">
            {filteredDraws.length === 0 ? (
              <p className="text-gray-500">Nenhum sorteio encontrado</p>
            ) : (
              filteredDraws.map((draw) => (
                <CardSorteio
                  key={draw.id}
                  drawId={draw.id}
                  identificador={draw.number}
                  status={draw.status}
                  onStatusChange={fetchDraws}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sorteios;
