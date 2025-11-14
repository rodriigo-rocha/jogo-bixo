function Cinema({onClose}){
    return(
        <div className="select-none absolute top-0 left-0 bg-gray-300 border-gray-400 border-4 w-dvw h-[93dvh] flex flex-col jusitfy-between align-middle">
            <div className="bg-gray-500 border-gray-400 border-b-4 justify-between flex">
                <span className="px-3 font-bold text-white">Absolute Cinema</span>
                <button className="bg-gray-400 px-2 text-red-600 cursor-pointer hover:text-red-700 active:text-white" onClick={onClose}>X</button>
            </div>
            <iframe width="1521" height="569" src="https://www.youtube.com/embed/KEoGrbKAyKE" title="Who Killed Captain Alex: Uganda&#39;s First Action Movie (English Subtitles &amp; Video Joker) - Wakaliwood" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            <div className="p-2 border-t-8 border-gray-400">
                <h1 className="text-3xl font-bold">Who Killed Captain Alex? Oscar 2025 Winner</h1>
                <span className="text-lg font-semibold">5M visualizações</span>
            </div>
        </div>
    )
}

export default Cinema