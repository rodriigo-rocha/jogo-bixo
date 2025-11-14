import GraficoAposta from "./GraficoAposta"

function Desempenho(){
    return(
        <div className="p-4 text-center text-3xl overflow-y-auto max-h-[83.5dvh] flex justify-center gap-5 flex-wrap">
            <div className="pb-4 mb-5 rounded-md lg:mb-0 bg-blue-200 lg:w-[20%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70 flex flex-col">
                <h2 className="text-xl text-center bg-gray-400 mb-4">Total de Sorteios</h2> 
                <span className="text-center">10</span>
            </div>
            <div className="pb-4 mb-5 rounded-md lg:mb-0 bg-blue-200 lg:w-[20%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70 flex flex-col">
                <h2 className="text-xl text-center bg-gray-400 mb-4">Sorteios Abertos</h2> 
                <span className="text-center">10</span>
            </div>
            <div className="pb-4 mb-5 rounded-md lg:mb-0 bg-blue-200 lg:w-[20%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70 flex flex-col">
                <h2 className="text-xl text-center bg-gray-400 mb-4">Apostas Ativas</h2> 
                <span className="text-center">450</span>
            </div>
            <div className="pb-4 mb-5 rounded-md lg:mb-0 bg-blue-200 lg:w-[20%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70 flex flex-col">
                <h2 className="text-xl text-center bg-gray-400 mb-4">Total Apostado</h2> 
                <span className="text-center">{`R$${"0,00"}`}</span>
            </div>
            <div className="flex justify-center gap-20 w-full px-10 mt-5 items-center">
                <div className="flex flex-col w-[45%]">
                    <div className="bg-gray-400 flex justify-center items-center gap-2 px-2 py-1 font-semibold text-lg">
                        <label>Selecione o Mês: </label>
                        <input type="month" className="bg-gray-200 px-2 py-1 border-2 rounded-sm "></input>
                    </div>
                    <GraficoAposta/>
                </div>
                <div className=" h-96 w-96 border-4 shadow-lg shadow-gray-500">
                    <a href="https://www.manual.com.br/?srsltid=AfmBOorI0seIwH6k7_CSHJRXS9czLQBNFmaOs-lZaLNUnGesdecXBx63" target="_blank"><img src="/public/Adphyl.jpg" className="w-fit"></img></a>
                </div>
            </div>
        </div>
    )
}

export default Desempenho