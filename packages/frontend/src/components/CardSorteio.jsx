function CardSorteio({identificador}){
    return(
        <div className="bg-gray-400 w-[98%] shadow-inner px-4 shadow-gray-300 flex flex-col py-2">
            <div className="flex justify-between px-3 py-2">
                <h3>{identificador}</h3>
                <span className={`text-xl bg-red-500 flex items-center px-3 border-black border-2 rounded-md text-white`}>Flag</span>
            </div>
            <div className="flex gap-4 items-center justify-between">
                <span className="text-lg">Data: 20/04/2004</span>
                <span className="text-lg text-white">Valor Total: R$20,00</span>
            </div>
            <button type="button" className="bg-blue-950 text-white text-lg w-50 cursor-pointer hover:bg-blue-900 active:bg-blue-800 active:text-indigo-100">Realizar Sorteio</button>
        </div>
    )
}

export default CardSorteio