import { useAuth } from "../context/AuthContext";

function CardSorteio({ drawId, identificador, status, onStatusChange, totalValue, createdAt }) {
  const { token } = useAuth();

  // Função para fechar o sorteio
  async function fecharSorteio() {
    if (!token) {
      alert("Você precisa estar logado");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/game/admin/draw/${drawId}/execute`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        alert("Sorteio fechado com sucesso!");
        if (onStatusChange) 
          onStatusChange();
      } else {
        const errorData = await response.json();
        alert(`Erro ao fechar sorteio: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro de rede ao fechar sorteio:", error);
      alert("Ocorreu um erro de rede");
    }
  }

  // Função para editar o sorteio
  async function editarSorteio() {
    if (!token) {
      alert("Você precisa estar logado");
      return;
    }

    const novoNumero = prompt("Digite o novo número do sorteio:", identificador);
    if (!novoNumero || novoNumero.trim() === "") return;

    try {
      const response = await fetch(
        `http://localhost:3000/game/admin/draw/${drawId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            number: novoNumero.trim(),
          }),
        },
      );

      if (response.ok) {
        alert("Sorteio editado com sucesso!");
        if (onStatusChange) onStatusChange();
      } else {
        const errorData = await response.json();
        alert(`Erro ao editar sorteio: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro de rede ao editar sorteio:", error);
      alert("Ocorreu um erro de rede");
    }
  }

  async function excluirSorteio() {
    if (!token) {
      alert("Você precisa estar logado");
      return;
    }

    if (!window.confirm(`Deseja realmente excluir o sorteio ${identificador}?`)) return;

    try {
      const response = await fetch(
        `http://localhost:3000/game/admin/draw/${drawId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (response.ok) {
        alert("Sorteio excluído com sucesso!");
        if (onStatusChange) 
          onStatusChange();
      } else {
        const errorData = await response.json();
        alert(`Erro ao excluir sorteio: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Erro de rede ao excluir sorteio:", error);
      alert("Ocorreu um erro de rede");
    }
  }

  const statusText = status === "OPEN" ? "Aberta" : "Encerrado";
  const statusColor = status === "OPEN" ? "bg-green-500" : "bg-red-500";

  return (
    <div className="bg-gray-400 w-[98%] shadow-inner px-4 shadow-gray-300 flex flex-col py-2">
      <div className="flex justify-between px-3 py-2">
        <h3>{identificador}</h3>
        <span
          className={`text-xl ${statusColor} flex items-center px-3 border-black border-2 rounded-md text-white`}
        >
          {statusText}
        </span>
      </div>
      <div className="flex gap-4 items-center justify-between">
        <span className="text-lg">
          Data: {new Date(createdAt).toLocaleDateString("pt-BR")}
        </span>
        <span className="text-lg text-white">
          Valor Total: R${totalValue.toFixed(2)}
        </span>
      </div>
      {status === "OPEN" && (
        <button
          type="button"
          onClick={fecharSorteio}
          className="bg-yellow-600 text-white text-lg px-2 py-1 cursor-pointer hover:bg-yellow-500 active:bg-yellow-400 active:text-black border-black border-2 rounded-md"
        >
          🎲 Realizar Sorteio
        </button>
      )}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={editarSorteio}
          className="bg-green-600 text-white px-2 py-1 border-black border-2 rounded-md hover:bg-green-500 flex items-center text-lg"
        >
          Editar
        </button>
        <button
          type="button"
          onClick={excluirSorteio}
          className="bg-red-600 text-white px-2 py-1 border-black border-2 rounded-md hover:bg-red-500 flex items-center text-lg"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}

export default CardSorteio;
