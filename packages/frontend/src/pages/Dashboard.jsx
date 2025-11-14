import Footer from "../components/Footer"
import TabelaAnimais from "../components/TabelaAnimais"
import Apostas from "../components/Apostas"
import Sorteios from "../components/Sorteios"
import Desempenho from "../components/Desempenho"

import { useState } from "react"

function Dashboard(){
    const [maximizado, setMaximizado] = useState(false)
    const [pages, setPages] = useState(0)
    function maximizar(){
        setMaximizado(!maximizado)
    }
    function trocaPagina(num){
        setPages(num)
    }
    return(
        <>
        <div className={`${maximizado ? 'h-dvh' : 'h-[93dvh]'} w-dvw border-6 border-gray-400 bg-gray-200`}>
             <div className="bg-gray-500 border-gray-400 border-b-4 justify-between flex">
                <span className="px-3 font-bold text-white">Sistema de Gerenciamento</span>
                <div>
                    <button className="bg-gray-500 border-gray-400 border-l-4 px-2 text-white cursor-pointer hover:text-black active:text-white" onClick={maximizar}>□</button>
                    <button className="bg-gray-500 border-gray-400 border-l-4 px-2 text-red-600 cursor-pointer hover:text-red-700 active:text-white">X</button>
                </div>
            </div>
            <div className="bg-gray-400 border-gray-400 border-b-4 flex">
                <nav className="flex list-none">
                    <li className={`${pages===0 ? 'bg-gray-300 text-black' : 'bg-gray-500 text-gray-100'} border-r-4 border-gray-400 px-3  cursor-pointer`} onClick={() => trocaPagina(0)}>Desempenho</li>
                    <li className={`${pages===3 ? 'bg-gray-300 text-black' : 'bg-gray-500 text-gray-100'} border-r-4 border-gray-400 px-3  cursor-pointer`} onClick={() => trocaPagina(3)}>Sorteios</li>
                    <li className={`${pages===1 ? 'bg-gray-300 text-black' : 'bg-gray-500 text-gray-100'} border-r-4 border-gray-400 px-3  cursor-pointer`} onClick={() => trocaPagina(1)}>Apostas</li>
                    <li className={`${pages===2 ? 'bg-gray-300 text-black' : 'bg-gray-500 text-gray-100'} border-r-4 border-gray-400 px-3  cursor-pointer`} onClick={() => trocaPagina(2)}>Tabela de Animais</li>
                </nav>
            </div>
            {pages==3 && <Sorteios/>}
            {pages===2 && <TabelaAnimais/>}
            {pages===1 && <Apostas/>}
            {pages===0 && <Desempenho/>}
            
        </div>
        {!maximizado && <Footer/>}
        </>
    )
}

export default Dashboard