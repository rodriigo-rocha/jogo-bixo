function Infobox({ onClose }) {
  return (
    <div className="select-none absolute top-[50%] left-[50%] bg-gray-300 border-gray-400 border-4 w-120 translate-[-50%] flex flex-col jusitfy-between align-middle">
      <div className="bg-gray-500 border-gray-400 border-b-4 justify-between flex">
        <span className="px-3 font-bold text-white">Meu Computador</span>
        <button
          type="button"
          className="bg-gray-400 px-2 text-red-600 cursor-pointer hover:text-red-700 active:text-white"
          onClick={onClose}
        >
          X
        </button>
      </div>
      <div className="p-4">
        <h2 className="text-center">Informações da Máquina</h2>
        <ul className="pl-3 mt-5">
          <li>Programadores: Dave, Isaac, Rodrigo</li>
          <li>Inspiração: Milícia do Rio de Janeiro</li>
        </ul>
      </div>
    </div>
  );
}

export default Infobox;
