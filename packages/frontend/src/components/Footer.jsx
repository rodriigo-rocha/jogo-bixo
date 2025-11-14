function Footer({id}){
    return(
        <footer className="bg-gray-300 h-[7dvh] flex justify-between w-dvw px-5 absolute bottom-0 align-middle select-none cursor-pointer">
            <div className="flex px-2 py-2 border-gray-400 border-3 rounded-xs items-center">
                <img src="./public/logo.svg" className="h-8"></img>
                <span>Ebaaa</span>
            </div>
            
            <div className="flex flex-col">
                <span>Data hora</span>
                <span> clima tempo</span>
            </div>
        </footer>
    )
}

export default Footer