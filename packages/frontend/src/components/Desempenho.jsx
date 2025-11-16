import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import GraficoAposta from "./GraficoAposta";

function Desempenho() {
  const { token } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [performanceData, setPerformanceData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [totalDraws, setTotalDraws] = useState(0);
  const [openDraws, setOpenDraws] = useState(0);

  const fetchDrawsStats = async () => {
    if (!token) return;
    try {
      const response = await fetch("http://localhost:3000/draws", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const draws = await response.json();
        setTotalDraws(draws.length);
        setOpenDraws(draws.filter(draw => draw.status === "open").length);
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas dos sorteios:", error);
    }
  };

  useEffect(() => {
    fetchDrawsStats();
    
    // Atualizar estatísticas a cada 10 segundos
    const interval = setInterval(fetchDrawsStats, 10000);
    
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (selectedMonth && token) {
      fetch(
        `http://localhost:3000/performance?month=${selectedMonth}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )
        .then((res) => res.json())
        .then((data) => {
          console.log("Dados recebidos da API:", data); // Adicionado para depuração
          if (data.performance) {
            setPerformanceData(data.performance);
            const processedChartData = data.dailyPerformance.map((item) => ({
            ...item,
            day: parseInt(item.day, 10),
            }));
            setChartData(processedChartData);
          } else {
            setPerformanceData({ totalValue: 0, totalBets: 0 });
            setChartData([]);
          }
        })
        .catch((err) => {
          console.error("Erro ao buscar dados de performance:", err); // Adicionado para depuração
          setPerformanceData({ totalValue: 0, totalBets: 0 });
          setChartData([]);
        });
    }
  }, [selectedMonth, token]);

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
        <span className="text-center">
          {performanceData?.totalBets || 0}
        </span>
      </div>
      <div className="pb-4 mb-5 rounded-md lg:mb-0 bg-blue-200 lg:w-[20%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70 flex flex-col">
        <h2 className="text-xl text-center bg-gray-400 mb-4">Total Apostado</h2>
        <span className="text-center">
          {formatCurrency(performanceData?.totalValue)}
        </span>
      </div>
      <div className="flex justify-center gap-20 w-full px-10 mt-5 items-center">
        <div className="flex flex-col w-[45%]">
          <div className="bg-gray-400 flex justify-center items-center gap-2 px-2 py-1 font-semibold text-lg">
            <label>Selecione o Mês: </label>
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
          >
            <img src="/public/Adphyl.jpg" className="w-fit"></img>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Desempenho;