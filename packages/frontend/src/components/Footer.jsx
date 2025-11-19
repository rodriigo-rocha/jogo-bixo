import { useState, useEffect } from 'react';

function Footer({id}){
    const [currentTime, setCurrentTime] = useState(new Date());
    const [weather, setWeather] = useState({ temp: '--', condition: 'Carregando...', icon: '' });
    const [showMenu, setShowMenu] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');
    const [videoTitle, setVideoTitle] = useState('');

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

    const handleEbaaaClick = () => {
        setShowMenu(!showMenu);
    };

    const handleGalinhaDinossauro = () => {
        window.open('http://www.republiquedesmangues.fr/', '_blank', 'noopener');
        setShowMenu(false);
    };

    const handleKoala = () => {
        window.open('https://www.koalastothemax.com/', '_blank', 'noopener');
        setShowMenu(false);
    };

    const handleHarleyDavidson = () => {
        window.open('https://www.harley-davidson.com/br/pt/index.html', '_blank', 'noopener');
        setShowMenu(false);
    };

    const handleLionelMessi = () => {
        window.open('https://www.lionelofficialwines.com/?v=dc634e207282', '_blank', 'noopener');
        setShowMenu(false);
    };

    const closeVideoModal = () => {
        setShowVideoModal(false);
        setVideoUrl('');
        setVideoTitle('');
    };

    return(
        <footer className="bg-gray-300 h-[7dvh] flex justify-between w-dvw px-5 absolute bottom-0 align-middle select-none cursor-pointer">
            <div className="flex px-2 py-2 border-gray-400 border-3 rounded-xs items-center">
                <img src="./public/logo.svg" className="h-8"></img>
                <span onClick={handleEbaaaClick} className="cursor-pointer hover:text-blue-500">Ebaaa</span>
            </div>
            
            <div className="flex flex-col items-end text-right">
                <span className="font-semibold">{formatTime(currentTime)}</span>
                <span className="text-sm text-gray-600">{formatDate(currentTime)}</span>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                    {weather.icon && <img src={weather.icon} alt="clima" className="w-4 h-4" />}
                    <span>{weather.temp}°C - {weather.condition}</span>
                </div>
            </div>
            {showMenu && (
                <div className="absolute bottom-full left-5 bg-gray-200 border border-gray-400 shadow-lg z-50">
                    <div className="p-2 cursor-pointer hover:bg-gray-300" onClick={handleGalinhaDinossauro}>Você gosta de mangas? 🥭</div>
                    <div className="p-2 cursor-pointer hover:bg-gray-300" onClick={handleKoala}>E coalas? Você gosta de coalas? 🐨</div>
                    <div className="p-2 cursor-pointer hover:bg-gray-300" onClick={handleHarleyDavidson}>Conheça a Harley Davidson 🏍️</div>
                    <div className="p-2 cursor-pointer hover:bg-gray-300" onClick={handleLionelMessi}>Vinhos Lionel Messi 🍷</div>
                </div>
            )}
            {showVideoModal && (
                <div className="select-none absolute top-10 left-10 bg-gray-300 border-gray-400 border-4 w-[80vw] h-[70vh] flex flex-col justify-between align-middle z-50">
                    <div className="bg-gray-500 border-gray-400 border-b-4 justify-between flex">
                        <span className="px-3 font-bold text-white">{videoTitle}</span>
                        <button className="bg-gray-400 px-2 text-red-600 cursor-pointer hover:text-red-700 active:text-white" onClick={closeVideoModal}>X</button>
                    </div>
                    <iframe width="100%" height="100%" src={videoUrl} title={videoTitle} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                    <div className="p-2 border-t-8 border-gray-400">
                        <h1 className="text-3xl font-bold">{videoTitle}</h1>
                        <span className="text-lg font-semibold">Vídeo especial do Ebaaa!</span>
                    </div>
                </div>
            )}
        </footer>
    )
}

export default Footer