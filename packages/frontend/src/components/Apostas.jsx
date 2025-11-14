function Apostas(){
    return(
        <div className="p-4 text-center text-3xl overflow-y-auto max-h-[83.5dvh] flex-col lg:flex justify-center lg:justify-between flex-wrap px-[5%] py-[5%]">
            <div className="pb-4 mb-5 lg:mb-0 bg-blue-200 lg:w-[40%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70">
                <h2 className="text-xl text-center bg-gray-400 mb-4">Registrar Apostas</h2>
                <div className="flex text-base flex-col px-3 min-h-[52dvh]">
                    <label>Sorteio</label>
                    <select className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3">
                        <option value="">3</option>
                    </select>
                    <label>Apostador</label>
                    <input type="text" className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"/>
                    <label>Sorteio</label>
                    <select className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3">
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
                    <input type="text" className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"/>
                    <label>Tipo de Aposta</label>
                    <select className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3">
                        <option value="grupo">Grupo</option>
                        <option value="grupo">Dezena</option>
                        <option value="grupo">Centena</option>
                        <option value="grupo">Milhar</option>
                    </select>
                    <label>Valor da Aposta</label>
                    <input placeholder="R$0,00" type="Number" className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"/>
                    <button type="button" className="bg-blue-950 text-white w-25 cursor-pointer hover:bg-blue-900 active:bg-blue-800 active:text-indigo-100">Registrar</button>
                </div>
            </div>
            <div className="pb-4 bg-blue-200 lg:w-[55%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70">
                <h2 className="text-xl text-center bg-gray-400 mb-2">Apostas Registradas</h2>
                <div className="min-h-[52dvh] flex flex-col px-4 mb-2">
                    <label className="text-base">Sorteio</label>
                    <select className="w-[30%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3 text-sm">
                        <option value="">3</option>
                    </select>
                    <div className="p-4 w-full h-[44dvh] overflow-y-auto shadow-inner shadow-gray-400 bg-white">

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Apostas