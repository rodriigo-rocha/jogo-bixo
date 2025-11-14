import { Link } from "react-router-dom"
import Desktop from "./Desktop"

function Login({onClose}){
    return(
        <div className="absolute top-[50%] left-[50%] bg-gray-300 border-gray-400 border-4 md:w-[45dvw] w-[85dvw] translate-[-50%] flex flex-col jusitfy-between align-middle">
            <div className="bg-gray-500 border-gray-400 border-b-4 justify-between flex">
                <span className="px-3 font-bold text-white">Gerenciador do Jogo do Bicho</span>
                <button className="bg-gray-400 px-2 text-red-600 cursor-pointer hover:text-red-700 active:text-white" onClick={onClose}>X</button>
            </div>
            <form action="" className="flex flex-col justify-center align-middle py-7 px-10">
                <label>E-mail</label>
                <input type="text" className="bg-white"></input>
                <label>Senha</label>
                <input type="password" className="bg-white"></input>
                <Link to={'/dashboard'}>
                <button type="button" className="mt-4 font-semibold relative left-[50%] translate-x-[-50%] cursor-pointer p-1 bg-gray-100 w-20 hover:bg-gray-500">Entrar</button>
                </Link>
            </form>
            <div className="w-full flex justify-between pb-3 px-10">
                <a href="#">Esqueci minha Senha</a>
                <a href="#">Criar Conta</a>
            </div>
        </div>
    )
}

export default Login