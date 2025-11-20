function Apostas({
  apostas,
  draws,
  selectedDraw,
  setSelectedDraw,
  selectedFilterDraw,
  setSelectedFilterDraw,
  animal,
  setAnimal,
  tipoAposta,
  setTipoAposta,
  valor,
  setValor,
  numero,
  setNumero,
  apostador,
  setApostador,
  editingBetId,
  setEditingBetId,
  registrarAposta,
  deletarAposta,
  editarAposta,
}) {
  return (
    <div className="p-4 text-center text-3xl overflow-y-auto max-h-[83.5dvh] flex-col lg:flex justify-center lg:justify-between flex-wrap px-[5%] py-[5%]">
      <div className="pb-4 mb-5 lg:mb-0 bg-blue-200 lg:w-[40%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70">
        <h2 className="text-xl text-center bg-gray-400 mb-4">
          Registrar Apostas
        </h2>
        <div className="flex text-base flex-col px-3 min-h-[52dvh]">
          <span>Sorteio</span>
          <select
            value={selectedDraw}
            onChange={(e) => setSelectedDraw(e.target.value)}
            className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"
          >
            <option value="">Selecione um sorteio</option>
            {draws
              .filter((d) => d.status === "open")
              .map((draw) => (
                <option key={draw.id} value={draw.id}>
                  {draw.identifier}
                </option>
              ))}
          </select>
          <span>Apostador</span>
          <input
            type="text"
            value={apostador}
            onChange={(e) => setApostador(e.target.value)}
            className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"
          />
          <span>Animal</span>
          <select
            value={animal}
            onChange={(e) => setAnimal(e.target.value)}
            className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"
          >
            {[
              "Avestruz",
              "Águia",
              "Burro",
              "Borboleta",
              "Cachorro",
              "Cabra",
              "Carneiro",
              "Camelo",
              "Cobra",
              "Coelho",
              "Cavalo",
              "Elefante",
              "Galo",
              "Gato",
              "Jacaré",
              "Leão",
              "Macaco",
              "Porco",
              "Pavão",
              "Peru",
              "Touro",
              "Tigre",
              "Urso",
              "Veado",
              "Vaca",
            ].map((animal, index) => (
              <option key={animal} value={index + 1}>
                {animal}
              </option>
            ))}
          </select>
          <span>Número (00-99)</span>
          <input
            type="text"
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"
          />
          <span>Tipo de Aposta</span>
          <select
            value={tipoAposta}
            onChange={(e) => setTipoAposta(e.target.value)}
            className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"
          >
            <option value="grupo">Grupo</option>
            <option value="dezena">Dezena</option>
            <option value="centena">Centena</option>
            <option value="milhar">Milhar</option>
          </select>
          <span>Valor da Aposta</span>
          <input
            placeholder="R$0,00"
            type="Number"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={registrarAposta}
              className="bg-blue-950 text-white w-25 cursor-pointer hover:bg-blue-900 active:bg-blue-800 active:text-indigo-100"
            >
              {editingBetId ? "Atualizar" : "Registrar"}
            </button>
            {editingBetId && (
              <button
                type="button"
                onClick={() => {
                  setEditingBetId(null);
                  setValor("");
                  setNumero("");
                  setApostador("");
                }}
                className="bg-gray-500 text-white w-25 cursor-pointer hover:bg-gray-400 active:bg-gray-300"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="pb-4 bg-blue-200 lg:w-[55%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70">
        <h2 className="text-xl text-center bg-gray-400 mb-2">
          Apostas Registradas
        </h2>
        <div className="min-h-[52dvh] flex flex-col px-4 mb-2">
          <span className="text-base">Filtrar por Sorteio</span>
          <select
            value={selectedFilterDraw}
            onChange={(e) => setSelectedFilterDraw(e.target.value)}
            className="w-[30%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3 text-sm"
          >
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
                ? apostas.filter(
                    (aposta) =>
                      aposta.drawId === parseInt(selectedFilterDraw, 10),
                  )
                : apostas;
              return apostasFiltradas.map((aposta) => (
                <div
                  key={aposta.id}
                  className="mb-2 p-2 border rounded text-sm flex justify-between items-start gap-4"
                >
                  <div>
                    <p>
                      <b>Apostador:</b> {aposta.betor || "N/A"}
                    </p>
                    <p>
                      <b>Sorteio:</b> {aposta.draw?.identifier || "N/A"}
                    </p>
                    <p>
                      <b>Animal:</b> {aposta.animal}
                    </p>
                    <p>
                      <b>Tipo:</b> {aposta.betType}
                    </p>
                    <p>
                      <b>Valor:</b> R$ {parseFloat(aposta.value).toFixed(2)}
                    </p>
                    {aposta.number != null && (
                      <p>
                        <b>Número:</b> {aposta.number}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editarAposta(aposta)}
                      className="bg-green-600 text-white px-2 py-1 rounded hover:bg-green-500"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => deletarAposta(aposta.id)}
                      className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-500"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Apostas;
