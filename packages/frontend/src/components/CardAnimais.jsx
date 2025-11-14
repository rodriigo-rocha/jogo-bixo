function CardAnimais({titulo, nome, source, numeros}){
    return(
        <div className="w-[80%] text-center flex flex-col items-center bg-blue-200 p-2 relative border-2 border-gray-700">
            <h2 className="text-sm md:text-sm absolute top-1 left-1 lg:top-3 lg:left-3 font-bold text-red-600">{titulo}</h2>
            <h2 className="lg:text-xs hidden lg:block absolute top-1 right-1 lg:top-3 lg:right-3 font-bold text-blue-950">{nome}</h2>
            <img className="w-[80%] aspect-square" src={source}></img>
            <span className="text-blue-950 text-center text-xs lg:text-base font-extrabold mt-2">{numeros}</span>
        </div>
    )
}

export default CardAnimais