import CardAnimais from "./CardAnimais"

function TabelaAnimais(){
    return(
        <div className="p-4 text-center text-3xl overflow-y-auto max-h-[83.5dvh]">
            <h2>Tabela de Animais</h2>
            <div className="grid grid-cols-5 md:px-40 gap-y-2 justify-items-center mt-3">
                <>
                    <CardAnimais nome="Avestruz" numeros="01 02 03 04" titulo="01" source="../public/animais/1.png"/>
                    <CardAnimais nome="Águia" numeros="05 06 07 08" titulo="02" source="../public/animais/2.png"/>
                    <CardAnimais nome="Burro" numeros="09 10 11 12" titulo="03" source="../public/animais/3.png"/>
                    <CardAnimais nome="Borboleta" numeros="13 14 15 16" titulo="04" source="../public/animais/4.png"/>
                    <CardAnimais nome="Cachorro" numeros="17 18 19 20" titulo="05" source="../public/animais/5.png"/>
                    <CardAnimais nome="Cabra" numeros="21 22 23 24" titulo="06" source="../public/animais/6.png"/>
                    <CardAnimais nome="Carneiro" numeros="25 26 27 28" titulo="07" source="../public/animais/7.png"/>
                    <CardAnimais nome="Camelo" numeros="29 30 31 32" titulo="08" source="../public/animais/8.png"/>
                    <CardAnimais nome="Cobra" numeros="33 34 35 36" titulo="09" source="../public/animais/9.png"/>
                    <CardAnimais nome="Coelho" numeros="37 38 39 40" titulo="10" source="../public/animais/10.png"/>
                    <CardAnimais nome="Cavalo" numeros="41 42 43 44" titulo="11" source="../public/animais/11.png"/>
                    <CardAnimais nome="Elefante" numeros="45 46 47 48" titulo="12" source="../public/animais/12.png"/>
                    <CardAnimais nome="Galo" numeros="49 50 51 52" titulo="13" source="../public/animais/13.png"/>
                    <CardAnimais nome="Gato" numeros="53 54 55 56" titulo="14" source="../public/animais/14.png"/>
                    <CardAnimais nome="Jacaré" numeros="57 58 59 60" titulo="15" source="../public/animais/15.png"/>
                    <CardAnimais nome="Leão" numeros="61 62 63 64" titulo="16" source="../public/animais/16.png"/>
                    <CardAnimais nome="Macaco" numeros="65 66 67 68" titulo="17" source="../public/animais/17.png"/>
                    <CardAnimais nome="Porco" numeros="69 70 71 72" titulo="18" source="../public/animais/18.png"/>
                    <CardAnimais nome="Pavão" numeros="73 74 75 76" titulo="19" source="../public/animais/19.png"/>
                    <CardAnimais nome="Peru" numeros="77 78 79 80" titulo="20" source="../public/animais/20.png"/>
                    <CardAnimais nome="Touro" numeros="81 82 83 84" titulo="21" source="../public/animais/21.png"/>
                    <CardAnimais nome="Tigre" numeros="85 86 87 88" titulo="22" source="../public/animais/22.png"/>
                    <CardAnimais nome="Urso" numeros="89 90 91 92" titulo="23" source="../public/animais/23.png"/>
                    <CardAnimais nome="Veado" numeros="93 94 95 96" titulo="24" source="../public/animais/24.png"/>
                    <CardAnimais nome="Vaca" numeros="97 98 99 00" titulo="25" source="../public/animais/25.png"/>
                </>
            </div>
        </div>
    )
}

export default TabelaAnimais