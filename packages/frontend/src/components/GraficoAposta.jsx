import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const dadosApostas = Array.from({ length: 30 }, (_, i) => ({
  data: i + 1, // Dia do mês (1 a 30)
  apostas: Math.floor(Math.random() * 500) + 100, // Nº de apostas (100 a 600)
}));

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // Exemplo de classes retro Tailwind: 
    // Fundo escuro, borda forte, fonte mono.
    return (
      <div className="p-2 bg-blue-300 text-white border-4 rounded-md border-gray-600 font-mono shadow-md text-base">
        <p>{`Dia ${label}: ${payload[0].value.toLocaleString('pt-BR')}`}</p>
      </div>
    );
  }
  return null;
};

const GraficoAposta = () => (
  <div className="w-[100%] p-4 border-4 border-black bg-white shadow-retro-md h-96 shadow-lg shadow-gray-500">
    <h2 className="text-xl font-bold mb-4">Número de Apostas por Dia do Mês</h2>

    <ResponsiveContainer width="100%" height="85%">
      <BarChart 
        data={dadosApostas} 
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid 
          strokeDasharray="3 3"
          stroke="#CCCCCC" 
        />

        <XAxis 
          dataKey="data" // Usa a propriedade 'data' do objeto
          interval={0} // Mostra um rótulo a cada 3 dias para evitar superlotação
          stroke="#000000" // Cor da linha do eixo
          strokeWidth={3} // Espessura para o visual retro
          tick={{ fontSize: 12, fill: '#000000' }} // Estilo do texto
        />

        {/* 4. EIXO Y (Nº de Apostas): Customizar a linha e os rótulos */}
        <YAxis 
          stroke="#000000" 
          strokeWidth={3}
          tick={{ fontSize: 12, fill: '#000000' }}
          label={{ 
            value: 'Nº de Apostas', 
            angle: -90, 
            position: 'insideLeft', 
            style: { textAnchor: 'middle', fill: '#000000' } 
          }}
        />

        {/* 5. TOOLTIP: Usa o componente customizado definido acima */}
        <Tooltip content={<CustomTooltip />} />

        {/* 6. BARRAS: Customizar a cor, borda e stroke */}
        <Bar 
          dataKey="apostas" 
          fill="#FF6347" // Cor primária sólida (ex: Laranja/Vermelho forte)
          stroke="#000000" // Contorno preto para o efeito NeoBrutalismo
          strokeWidth={2} 
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

export default GraficoAposta;