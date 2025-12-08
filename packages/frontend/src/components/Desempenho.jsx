import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import GraficoAposta from "./GraficoAposta";

function Desempenho() {
  const { token } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [performanceData, setPerformanceData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [totalDraws, setTotalDraws] = useState(0);
  const [openDraws, setOpenDraws] = useState(0);
  const [openDrawsStats, setOpenDrawsStats] = useState({ totalBets: 0, totalValue: 0 });

  // Função para buscar estatísticas dos sorteios
  const fetchDrawsStats = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("http://localhost:3000/game/results", {
        headers: {Authorization: `Bearer ${token}`},
      });
      if (response.ok) {
        const draws = await response.json();
        setTotalDraws(draws.length); // Total de sorteios
        setOpenDraws(draws.filter((draw) => draw.status === "OPEN").length); // Contar apenas os sorteios abertos
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas dos sorteios:", error);
    }
  }, [token]);

  // Função para buscar estatísticas dos sorteios abertos
  const fetchOpenDrawsStats = useCallback(async () => {
    if (!token) return;

    try {
      const response = await fetch("http://localhost:3000/performance/open", {
        headers: {Authorization: `Bearer ${token}`},
      });
      if (response.ok) {
        const stats = await response.json();
        console.log("Open draws stats:", stats);
        setOpenDrawsStats(stats); // Atualiza as estatísticas dos sorteios abertos
      } else {
        console.log("Response not ok:", response.status);
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas dos sorteios abertos:", error);
    }
  }, [token]);

  // Buscar estatísticas dos sorteios ao carregar o componente
  useEffect(() => {
    fetchDrawsStats();
    fetchOpenDrawsStats();

    // Atualizar estatísticas a cada 10 segundos
    const interval = setInterval(() => {
      fetchDrawsStats();
      fetchOpenDrawsStats();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchDrawsStats, fetchOpenDrawsStats]);

  // Buscar dados de desempenho quando o mês selecionado mudar
  useEffect(() => {
    if (selectedMonth && token) {
      fetch(`http://localhost:3000/performance?month=${selectedMonth}`, {
        headers: {Authorization: `Bearer ${token}`},
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("Dados recebidos da API:", data);
          if (data.performance) {
            setPerformanceData(data.performance);
            const processedChartData = data.dailyPerformance.map((item) => ({ // Processar os dados do gráfico
              ...item,
              day: parseInt(item.day, 10),
              value: item.value / 100,
            }));
            setChartData(processedChartData); // Atualizar os dados do gráfico
          } else {
            setPerformanceData({ totalValue: 0, totalBets: 0 }); // Definir valores padrão, se não houver dados
            setChartData([]);
          }
        })
        .catch((err) => {
          console.error("Erro ao buscar dados de performance:", err);
          setPerformanceData({ totalValue: 0, totalBets: 0 });
          setChartData([]);
        });
    }
  }, [selectedMonth, token]);

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    return (value || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  return (
    <div className="p-4 text-center text-3xl overflow-y-auto max-h-[83.5dvh] flex justify-center gap-5 flex-wrap">
      <div className="pb-4 mb-5 rounded-md lg:mb-0 bg-blue-200 lg:w-[20%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70 flex flex-col">
        <h2 className="text-xl text-center bg-gray-400 mb-4">
          Total de Sorteios
        </h2>
        <span className="text-center">{totalDraws}</span>
      </div>
      <div className="pb-4 mb-5 rounded-md lg:mb-0 bg-blue-200 lg:w-[20%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70 flex flex-col">
        <h2 className="text-xl text-center bg-gray-400 mb-4">
          Sorteios Abertos
        </h2>
        <span className="text-center">{openDraws}</span>
      </div>
      <div className="pb-4 mb-5 rounded-md lg:mb-0 bg-blue-200 lg:w-[20%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70 flex flex-col">
        <h2 className="text-xl text-center bg-gray-400 mb-4">Apostas Ativas</h2>
        <span className="text-center">{openDrawsStats.totalBets}</span>
      </div>
      <div className="pb-4 mb-5 rounded-md lg:mb-0 bg-blue-200 lg:w-[20%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70 flex flex-col">
        <h2 className="text-xl text-center bg-gray-400 mb-4">Total Apostado</h2>
        <span className="text-center">
          {formatCurrency(openDrawsStats.totalValue / 100)}
        </span>
      </div>
      <div className="flex justify-center gap-20 w-full px-10 mt-5 items-center">
        <div className="flex flex-col w-[45%]">
          <div className="bg-gray-400 flex justify-center items-center gap-2 px-2 py-1 font-semibold text-lg">
            <span>Selecione o Mês: </span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-gray-200 px-2 py-1 border-2 rounded-sm "
            />
          </div>
          <GraficoAposta dadosApostas={chartData} />
        </div>
        <div className=" h-96 w-96 border-4 shadow-lg shadow-gray-500">
          <a
            href="https://www.manual.com.br/?srsltid=AfmBOorI0seIwH6k7_CSHJRXS9czLQBNFmaOs-lZaLNUnGesdecXBx63"
            target="_blank"
            rel="noopener"
          >
            <img
              src="/Adphyl.jpg"
              alt="Melhor anúncio de todos"
              className="w-fit"
            ></img>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Desempenho;
