import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Exemplo de classes retro Tailwind:
    // Fundo escuro, borda forte, fonte mono.
    return (
      <div className="p-2 bg-blue-300 text-white border-4 rounded-md border-gray-600 font-mono shadow-md text-base">
        <p>{`Dia ${label}: R$${payload[0].value.toLocaleString("pt-BR")}`}</p>
      </div>
    );
  }
  return null;
};

const GraficoAposta = ({ dadosApostas = [] }) => {
  if (dadosApostas.length === 0) {
    return (
      <div className="w-[100%] p-4 border-4 border-black bg-white shadow-retro-md h-96 shadow-lg shadow-gray-500 flex items-center justify-center">
        <p className="text-xl">Nenhum dado disponível para o mês selecionado.</p>
      </div>
    );
  }
  console.log("Dados no gráfico:", dadosApostas);
  return (
  <div className="w-[100%] p-4 border-4 border-black bg-white shadow-retro-md h-96 shadow-lg shadow-gray-500">
    <h2 className="text-xl font-bold mb-4">Valor Apostado por Dia do Mês</h2>

    <ResponsiveContainer width="100%" height="85%">
      <BarChart
        data={dadosApostas}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#CCCCCC" />

        <XAxis
          dataKey="day" // Usa a propriedade 'day' do objeto
          interval={0} // Mostra um rótulo a cada 3 dias para evitar superlotação
          stroke="#000000" // Cor da linha do eixo
          strokeWidth={3} // Espessura para o visual retro
          tick={{ fontSize: 12, fill: "#000000" }} // Estilo do texto
        />

        {/* 4. EIXO Y (Nº de Apostas): Customizar a linha e os rótulos */}
        <YAxis
          stroke="#000000"
          strokeWidth={3}
          tick={{ fontSize: 12, fill: "#000000" }}
          tickFormatter={(value) => `R$${value.toLocaleString("pt-BR")}`}
          label={{
            value: "Valor Apostado",
            angle: -90,
            position: "insideLeft",
            style: { textAnchor: "middle", fill: "#000000" },
          }}
        />

        <Tooltip content={<CustomTooltip />} />

        {/* 6. BARRAS: Customizar a cor, borda e stroke */}
        <Bar
          dataKey="value"
          fill="#FF6347" // Cor primária sólida (ex: Laranja/Vermelho forte)
          stroke="#000000" // Contorno preto para o efeito NeoBrutalismo
          strokeWidth={2}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
};

export default GraficoAposta;
