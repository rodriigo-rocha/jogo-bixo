import { logger } from "../plugins/logger.ts";

// Lista de cidades fallback em caso de erro na API de clima
const FALLBACK_CITIES = [
  { name: "Tokyo, Japan", lat: 35.6895, lng: 139.6917 },
  { name: "London, UK", lat: 51.5074, lng: -0.1278 },
  { name: "New York, USA", lat: 40.7128, lng: -74.006 },
  { name: "São Paulo, Brazil", lat: -23.5505, lng: -46.6333 },
  { name: "Moscow, Russia", lat: 55.7558, lng: 37.6173 },
];

// Gera coordenadas geográficas aleatórias
function generateRandomCoordinates() {
  const lat = Math.random() * 180 - 90;
  const lng = Math.random() * 360 - 180;

  return { lat, lng };
}

// Obtém o nome da localização a partir das coordenadas geográficas
async function getLocationName(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lng}&limit=1&format=json`;
    const res = await fetch(url);

    if (!res.ok) 
      return `Coords (${lat.toFixed(2)}, ${lng.toFixed(2)})`;

    const data = await res.json();
    // Se houver resultados, retorna o nome da cidade e país
    if (data.results && data.results.length > 0) {
      const loc = data.results[0];
      return `${loc.name}, ${loc.country}`;
    }
    // Se não houver resultados, retorna as coordenadas
    return `Remote Location (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
  } catch (_error) {
    return `Coords (${lat.toFixed(2)}, ${lng.toFixed(2)})`;
  }
}

// Obtém um clima aleatório
export async function getRandomWeather() {
  const { lat, lng } = generateRandomCoordinates();

  try {
    const cityName = await getLocationName(lat, lng);
    // Busca o clima atual usando a API Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,wind_speed_10m`;

    const response = await fetch(url);
    if (!response.ok) 
      throw new Error("Weather API Error");

    const data = await response.json();
    const current = data.current;

    return {
      success: true,
      city: cityName,
      temp: current.temperature_2m as number,
      humidity: current.relative_humidity_2m as number,
      wind: current.wind_speed_10m as number,
    };
  } catch (error) {
    logger.error(error, "Erro ao buscar clima aleatório");
    
    const fallback =
      FALLBACK_CITIES[Math.floor(Math.random() * FALLBACK_CITIES.length)];
    return {
      success: false,
      city: `Fallback: ${fallback.name}`,
      temp: 20 + Math.random() * 10,
      humidity: 50 + Math.random() * 30,
      wind: 10 + Math.random() * 20,
    };
  }
}
