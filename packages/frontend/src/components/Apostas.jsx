import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

function Apostas(){
    const { user, token } = useAuth(); // Pega o usuário do contexto
    const [apostas, setApostas] = useState([]);
    const [draws, setDraws] = useState([]);
    const [selectedDraw, setSelectedDraw] = useState("");
    const [selectedFilterDraw, setSelectedFilterDraw] = useState("");
    const [animal, setAnimal] = useState("1");
    const [tipoAposta, setTipoAposta] = useState("grupo");
    const [valor, setValor] = useState("");
    const [numero, setNumero] = useState("");
    const [apostador, setApostador] = useState("");

    async function fetchDraws() {
        if (!token) return
        try {
            const response = await fetch("http://localhost:3000/draws", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            if (response.ok) {
                const data = await response.json()
                setDraws(data)
                const openDraw = data.find(d => d.status === "open")
                if (openDraw) {
                    setSelectedDraw(openDraw.id.toString())
                }
            } else {
                console.error("Falha ao buscar sorteios")
            }
        } catch (error) {
            console.error("Erro de rede ao buscar sorteios:", error)
        }
    }

    async function fetchApostas() {
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
    }

    useEffect(() => {
        if (user && token) { // Garante que ambos existam antes de buscar
            fetchDraws();
            fetchApostas();
        }
    }, [user, token]); // Adiciona 'token' como dependência

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
            const response = await fetch("http://localhost:3000/bets", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    userId: user.id,
                    drawId: parseInt(selectedDraw),
                    betor: apostador,
                    animal,
                    betType: tipoAposta,
                    value: parseFloat(valor),
                    number: tipoAposta !== "grupo" ? parseInt(numero) : undefined,
                }),
            });
            if (response.ok) {
                const novaAposta = await response.json();
                setApostas((apostasAtuais) => [...apostasAtuais, novaAposta]); 
                setValor("");
                setNumero("");
                setApostador("");
                alert("Aposta registrada com sucesso!");
            } else {
                const errorData = await response.json();
                alert(`Erro ao registrar aposta: ${errorData.message}`);
            }
        } catch (error) {
            console.error("Erro de rede ao registrar aposta:", error);
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
                    apostasAtuais.filter((aposta) => aposta.id !== id)
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

    return(
        <div className="p-4 text-center text-3xl overflow-y-auto max-h-[83.5dvh] flex-col lg:flex justify-center lg:justify-between flex-wrap px-[5%] py-[5%]">
            <div className="pb-4 mb-5 lg:mb-0 bg-blue-200 lg:w-[40%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70">
                <h2 className="text-xl text-center bg-gray-400 mb-4">Registrar Apostas</h2>
                <div className="flex text-base flex-col px-3 min-h-[52dvh]">
                    <label>Sorteio</label>
                    <select 
                        value={selectedDraw} 
                        onChange={(e) => setSelectedDraw(e.target.value)} 
                        className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"
                    >
                        <option value="">Selecione um sorteio</option>
                        {draws.filter(d => d.status === "open").map((draw) => (
                            <option key={draw.id} value={draw.id}>
                                {draw.identifier}
                            </option>
                        ))}
                    </select>
                    <label>Apostador</label>
                    <input type="text" value={apostador} onChange={(e) => setApostador(e.target.value)} className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"/>
                    <label>Animal</label>
                    <select value={animal} onChange={(e) => setAnimal(e.target.value)} className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3">
                        {["Avestruz", "Águia", "Burro", "Borboleta", "Cachorro", "Cabra", "Carneiro", 
                        "Camelo", "Cobra", "Coelho", "Cavalo", "Elefante", "Galo", "Gato", "Jacaré", 
                        "Leão", "Macaco", "Porco", "Pavão", "Peru", "Touro", "Tigre", "Urso", 
                        "Veado", "Vaca"]
                        .map((animal, index) => (
                            <option key={index} value={index + 1}>
                                {animal}
                            </option>
                        ))}
                    </select>
                    <label>Número (00-99)</label>
                    <input type="text" value={numero} onChange={(e) => setNumero(e.target.value)} className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"/>
                    <label>Tipo de Aposta</label>
                    <select value={tipoAposta} onChange={(e) => setTipoAposta(e.target.value)} className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3">
                        <option value="grupo">Grupo</option>
                        <option value="dezena">Dezena</option>
                        <option value="centena">Centena</option>
                        <option value="milhar">Milhar</option>
                    </select>
                    <label>Valor da Aposta</label>
                    <input placeholder="R$0,00" type="Number" value={valor} onChange={(e) => setValor(e.target.value)} className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"/>
                    <button type="button" onClick={registrarAposta} className="bg-blue-950 text-white w-25 cursor-pointer hover:bg-blue-900 active:bg-blue-800 active:text-indigo-100">Registrar</button>
                </div>
            </div>
            <div className="pb-4 bg-blue-200 lg:w-[55%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70">
                <h2 className="text-xl text-center bg-gray-400 mb-2">Apostas Registradas</h2>
                <div className="min-h-[52dvh] flex flex-col px-4 mb-2">
                    <label className="text-base">Filtrar por Sorteio</label>
                    <select value={selectedFilterDraw} onChange={(e) => setSelectedFilterDraw(e.target.value)} className="w-[30%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3 text-sm">
                        <option value="">Todos os sorteios</option>
                        {draws.map((draw) => (
                            <option key={draw.id} value={draw.id}>
                                {draw.identifier}
                            </option>
                        ))}
                    </select>
                    <div className="p-4 w-full h-[44dvh] overflow-y-auto shadow-inner shadow-gray-400 bg-white">
                        {(() => {
                            const apostasFiltradas = selectedFilterDraw 
                                ? apostas.filter(aposta => aposta.drawId === parseInt(selectedFilterDraw)) 
                                : apostas;
                            return apostasFiltradas.map((aposta) => (
                                <div key={aposta.id} className="mb-2 p-2 border rounded text-sm flex justify-between items-start gap-4">
                                    <div>
                                        <p><b>Apostador:</b> {aposta.betor || 'N/A'}</p>
                                        <p><b>Sorteio:</b> {aposta.draw?.identifier || 'N/A'}</p>
                                        <p><b>Animal:</b> {aposta.animal}</p>
                                        <p><b>Tipo:</b> {aposta.betType}</p>
                                        <p><b>Valor:</b> R$ {parseFloat(aposta.value).toFixed(2)}</p>
                                        {aposta.number != null && <p><b>Número:</b> {aposta.number}</p>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => deletarAposta(aposta.id)}
                                        className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Apostas