import { useAuth } from "../context/AuthContext"
import { useState, useEffect } from "react"

function CardSorteio({drawId, identificador, status, onStatusChange}){
    const { token } = useAuth()
    const [totalValue, setTotalValue] = useState(0)

    useEffect(() => {
        async function fetchTotalValue() {
            if (!token) return
            try {
                const response = await fetch(`http://localhost:3000/bets/draw/${drawId}/total`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                if (response.ok) {
                    const data = await response.json()
                    setTotalValue(data.total)
                }
            } catch (error) {
                console.error("Erro ao buscar valor total:", error)
            }
        }

        fetchTotalValue() // Buscar valor total inicialmente

        // Se o sorteio estiver aberto, buscar valor a cada 3 segundos
        let interval
        if (status === "open") {
            interval = setInterval(fetchTotalValue, 3000)
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [token, drawId, status])

    async function fecharSorteio() {
        if (!token) {
            alert("Você precisa estar logado")
            return
        }

        if (!window.confirm(`Deseja realmente fechar o sorteio ${identificador}?`)) {
            return
        }

        try {
            const response = await fetch(`http://localhost:3000/draws/${identificador}/close`, {
                method: "PATCH",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (response.ok) {
                alert("Sorteio fechado com sucesso!")
                if (onStatusChange) onStatusChange()
            } else {
                const errorData = await response.json()
                alert(`Erro ao fechar sorteio: ${errorData.message}`)
            }
        } catch (error) {
            console.error("Erro de rede ao fechar sorteio:", error)
            alert("Ocorreu um erro de rede")
        }
    }

    const statusText = status === "open" ? "Aberta" : "Encerrado"
    const statusColor = status === "open" ? "bg-green-500" : "bg-red-500"

    return(
        <div className="bg-gray-400 w-[98%] shadow-inner px-4 shadow-gray-300 flex flex-col py-2">
            <div className="flex justify-between px-3 py-2">
                <h3>{identificador}</h3>
                <span className={`text-xl ${statusColor} flex items-center px-3 border-black border-2 rounded-md text-white`}>
                    {statusText}
                </span>
            </div>
            <div className="flex gap-4 items-center justify-between">
                <span className="text-lg">Data: {new Date().toLocaleDateString('pt-BR')}</span>
                <span className="text-lg text-white">Valor Total: R${totalValue.toFixed(2)}</span>
            </div>
            {status === "open" && (
                <button 
                    type="button" 
                    onClick={fecharSorteio}
                    className="bg-blue-950 text-white text-lg w-50 cursor-pointer hover:bg-blue-900 active:bg-blue-800 active:text-indigo-100"
                >
                    Fechar Sorteio
                </button>
            )}
        </div>
    )
}

export default CardSorteio