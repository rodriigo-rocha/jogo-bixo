// Retorna o Grupo (1-25) baseado em uma DEZENA (00-99)
export const getAnimalGroup = (dezena: number): number => {
  if (dezena === 0) return 25;
  return Math.ceil(dezena / 4);
};

// Retorna o nome do bicho
export const getAnimalName = (group: number) => {
  const animals = [
    "Avestruz",
    "Águia",
    "Burro",
    "Borboleta",
    "Cachorro",
    "Cabra",
    "Carneiro",
    "Camelo",
    "Cobra",
    "Coelho",
    "Cavalo",
    "Elefante",
    "Galo",
    "Gato",
    "Jacaré",
    "Leão",
    "Macaco",
    "Porco",
    "Pavão",
    "Peru",
    "Touro",
    "Tigre",
    "Urso",
    "Veado",
    "Vaca",
  ];
  return animals[group - 1];
};

// Verifica se a aposta ganhou
export const checkVictory = (
  type: "GRUPO" | "DEZENA" | "CENTENA" | "MILHAR",
  selection: number,
  drawnNumber: string,
): boolean => {
  const firstPrizeDezena = parseInt(drawnNumber.slice(-2), 10);
  const firstPrizeCentena = parseInt(drawnNumber.slice(0, 3), 10);
  const firstPrizeMilhar = parseInt(drawnNumber, 10);
  const firstPrizeGroup = getAnimalGroup(firstPrizeDezena);

  if (type === "MILHAR")
    return selection === firstPrizeMilhar;

  if (type === "CENTENA")
    return selection === firstPrizeCentena;

  if (type === "DEZENA")
    return selection === firstPrizeDezena;

  if (type === "GRUPO")
    return selection === firstPrizeGroup;

  return false;
};
