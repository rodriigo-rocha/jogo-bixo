import CardSorteio from "./CardSorteio"
import { useState } from "react"

function Sorteios(){
    const [pages, setPages] = useState(0)
    function trocaPagina(num){
        setPages(num)
    }
    return(
        <div className="p-4 text-center text-3xl overflow-y-auto max-h-[83.5dvh] flex-col lg:flex justify-center lg:justify-between flex-wrap px-[5%] py-[5%]">
            <div className="pb-4 mb-5 lg:mb-0 bg-blue-200 lg:w-[40%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70">
                <h2 className="text-xl text-center bg-gray-400 mb-4">Registrar Sorteios</h2> 
                <div className="flex text-base flex-col px-3">
                    <label>Identificador do Sorteio</label>
                    <input type="text" className="w-[70%] bg-white shadow-gray-300 shadow-inner px-2 border border-gray-600 mb-3"/>
                    <button type="button" className="bg-blue-950 text-white w-25 cursor-pointer hover:bg-blue-900 active:bg-blue-800 active:text-indigo-100">Registrar</button>
                </div>
            </div>
            <div className="pb-4 bg-blue-200 lg:w-[55%] text-start border-4 border-gray-400 shadow-lg shadow-gray-400/70">
                <h2 className="text-xl text-center bg-gray-400">Apostas Registradas</h2>
                <div className="bg-gray-400 border-gray-400 border-b-4 flex mb-3">
                <nav className="flex list-none">
                    <li className={`${pages===0 ? 'bg-gray-300 text-black' : 'bg-gray-500 text-gray-100'} border-r-4 border-gray-400 px-3 text-lg cursor-pointer`} onClick={() => trocaPagina(0)}>Todas</li>
                    <li className={`${pages===1 ? 'bg-gray-300 text-black' : 'bg-gray-500 text-gray-100'} border-r-4 border-gray-400 px-3 text-lg cursor-pointer`} onClick={() => trocaPagina(1)}>Abertas</li>
                    <li className={`${pages===2 ? 'bg-gray-300 text-black' : 'bg-gray-500 text-gray-100'} border-r-4 border-gray-400 px-3 text-lg cursor-pointer`} onClick={() => trocaPagina(2)}>Finalizadas</li>
                </nav>
                </div>
                <div className="min-h-[52dvh] flex flex-col px-4">
                    <div className="p-3 gap-1  w-full h-[52dvh] overflow-y-auto shadow-inner shadow-gray-400 bg-white flex flex-col items-center">
                        {/* Fazer um condicional de renderização baseado no pages (vai precisar puxar os objetos pelo back) */}
                        <CardSorteio identificador="1"/>
                        <CardSorteio identificador="2"/>
                        <CardSorteio identificador="3"/>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sorteios