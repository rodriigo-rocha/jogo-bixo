import { useState } from "react"
import Login from "./Login"
import Infobox from "./Infobox";
import Cinema from "./Cinema";

function Desktop(){
    const [clicado, setClicado] = useState(false);
    const [info, setInfo] = useState(false);
    const [cinema, setCinema] = useState(false);

    function clique(){
        setClicado(!clicado)
    }
    function infoClique(){
        setInfo(!info)
    }
    function cinemaClique(){
        setCinema(!cinema)
    }

    return(
        <main className="h-dvh w-dvw bg-[url(./public/wallpaper.jpg)] bg-cover bg-center p-8 flex flex-col gap-8">
            {clicado && <Login onClose={clique}/>}
            <div className="w-30 flex flex-col justify-center ">
                <img onClick={clique} src="./public/jogobicho.png" className="h-30 hover:filter cursor-pointer hover:drop-shadow-lg hover:drop-shadow-white/20"></img>
                <span className="font-bold text-white text-sm text-center -m-4 px-2">Gerenciador de Jogo do Bicho</span>
            </div>
            {info && <Infobox onClose={infoClique}></Infobox>}
            <div className="w-30 flex flex-col justify-center ">
                <img onClick={infoClique} src="./public/computer.png" className="h-30 hover:filter cursor-pointer hover:drop-shadow-lg hover:drop-shadow-white/20"></img>
                <span className="font-bold text-white text-sm text-center -m-4 px-2">Meu Computador</span>
            </div>
            {cinema && <Cinema onClose={cinemaClique}/>}
            <div className="w-30 flex flex-col justify-center ">
                <img onClick={cinemaClique} src="./public/cinema.png" className="h-30 hover:filter cursor-pointer hover:drop-shadow-lg hover:drop-shadow-white/20"></img>
                <span className="font-bold text-white text-sm text-center -m-4 px-2">Cinema</span>
            </div>
        </main>
    )
}

export default Desktop