import { GoogleGenAI } from "@google/genai";

// Lazy initialization - only create client when needed and if API key is available
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI | null => {
  if (ai) return ai;
  
  // Try to get API key from Vite environment variables
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn("Gemini API key not found. AI diagnosis will be disabled.");
    return null;
  }
  
  try {
    ai = new GoogleGenAI({ apiKey });
    return ai;
  } catch (error) {
    console.error("Failed to initialize Gemini AI:", error);
    return null;
  }
};

interface PollutionMetrics {
  no2: number;
  co: number;
  aerosol: number;
  aqi: number;
  dominant: string;
}

export const analyzePollutionData = async (
  lat: number,
  lon: number,
  metrics: PollutionMetrics
): Promise<string> => {
  const client = getAI();
  
  // If no API key, return a fallback diagnosis
  if (!client) {
    return generateFallbackDiagnosis(metrics);
  }

  try {
    const prompt = `
      You are an expert environmental scientist analyzing satellite data from Sentinel-5P.
      
      Location: Lat ${lat}, Lon ${lon}
      Overall Space AQI: ${metrics.aqi}/100
      Dominant Pollutant: ${metrics.dominant}
      
      Detailed Sensor Readings:
      - NO2 (Traffic/Industry): ${metrics.no2.toExponential(2)} mol/m^2
      - CO (Biomass Burning/Fires): ${metrics.co.toFixed(3)} mol/m^2
      - Aerosol Index (Dust/Smoke): ${metrics.aerosol.toFixed(2)}
      
      Please provide a concise 2-3 sentence health impact statement for the local population. 
      Explain what the dominant pollutant implies (e.g., if CO is high, mention fires; if NO2 is high, mention traffic).
      Advise on outdoor activity.
    `;

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return generateFallbackDiagnosis(metrics);
  }
};

// Fallback diagnosis when AI is not available
function generateFallbackDiagnosis(metrics: PollutionMetrics): string {
  const { aqi, dominant } = metrics;
  
  if (aqi <= 33) {
    return `Air quality is good in this area. The dominant pollutant is ${dominant.toLowerCase()}. Safe for outdoor activities.`;
  } else if (aqi <= 66) {
    return `Moderate air quality detected. Primary concern: ${dominant.toLowerCase()}. Sensitive individuals should consider limiting prolonged outdoor exposure.`;
  } else {
    return `Unhealthy air quality levels detected. Dominant pollutant: ${dominant.toLowerCase()}. All individuals should limit outdoor activities, especially those with respiratory conditions.`;
  }
}