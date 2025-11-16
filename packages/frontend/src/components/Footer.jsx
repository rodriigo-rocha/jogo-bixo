import { useState, useEffect } from 'react';

function Footer({id}){
    const [currentTime, setCurrentTime] = useState(new Date());
    const [weather, setWeather] = useState({ temp: '--', condition: 'Carregando...', icon: '' });

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch('https://api.weatherapi.com/v1/current.json?key=YOUR_API_KEY&q=Sao%20Paulo&aqi=no'); // WeatherAPI de SP pegando como exemplo
                
                if (response.ok) {
                    const data = await response.json();
                    setWeather({
                        temp: Math.round(data.current.temp_c),
                        condition: data.current.condition.text,
                        icon: `https:${data.current.condition.icon}`
                    });
                } else {
                    console.log('API de clima não disponível, usando dados simulados');
                    setWeather({
                        temp: Math.floor(Math.random() * 15) + 20, // Temperatura entre 20-35°C
                        condition: ['Ensolarado', 'Nublado', 'Chuvoso', 'Parcialmente nublado'][Math.floor(Math.random() * 4)],
                        icon: ''
                    });
                }
            } catch (error) {
                console.error('Erro ao buscar clima:', error);
                setWeather({
                    temp: Math.floor(Math.random() * 15) + 20,
                    condition: ['Ensolarado', 'Nublado', 'Chuvoso', 'Parcialmente nublado'][Math.floor(Math.random() * 4)],
                    icon: ''
                });
            }
        };

        fetchWeather();
        const weatherTimer = setInterval(fetchWeather, 30 * 60 * 1000); // Att a cada meia hora

        return () => clearInterval(weatherTimer);
    }, []);

    const formatDate = (date) => {
        return date.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return(
        <footer className="bg-gray-300 h-[7dvh] flex justify-between w-dvw px-5 absolute bottom-0 align-middle select-none cursor-pointer">
            <div className="flex px-2 py-2 border-gray-400 border-3 rounded-xs items-center">
                <img src="./public/logo.svg" className="h-8"></img>
                <span>Ebaaa</span>
            </div>
            
            <div className="flex flex-col items-end text-right">
                <span className="font-semibold">{formatTime(currentTime)}</span>
                <span className="text-sm text-gray-600">{formatDate(currentTime)}</span>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                    {weather.icon && <img src={weather.icon} alt="clima" className="w-4 h-4" />}
                    <span>{weather.temp}°C - {weather.condition}</span>
                </div>
            </div>
        </footer>
    )
}

export default Footer