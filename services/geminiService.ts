import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return "Space weather interference detected. Unable to generate AI diagnosis. Please follow standard AQI precautions.";
  }
};