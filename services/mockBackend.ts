import { ScanResult } from "../types";
import { analyzePollutionData } from "./geminiService";

export const simulateScan = async (lat: number, lon: number): Promise<ScanResult> => {
  return new Promise(async (resolve) => {
    // 1. Simulate network latency
    await new Promise(r => setTimeout(r, 2500));

    // 2. Generate Deterministic Random Values based on coordinates
    // We use Math.sin on lat/lon to get "random" but consistent numbers for specific locations
    const seed = Math.abs(Math.sin(lat * 12.9898 + lon * 78.233) * 43758.5453);
    const seed2 = Math.abs(Math.sin(lat * 93.9898 + lon * 12.233) * 23458.5453);
    const seed3 = Math.abs(Math.sin(lat * 45.1234 + lon * 89.123) * 98765.4321);

    // --- Generate Raw Values ---
    
    // NO2: Typical ~0.00005. Formula: raw * 1,000,000
    // We want scores between 0-100, so raw needs to be 0 - 0.0001
    const raw_no2 = (seed % 1) * 0.00012; 

    // CO: Typical ~0.03. Formula: raw * 1,000
    // We want scores between 0-100, so raw needs to be 0 - 0.1
    const raw_co = (seed2 % 1) * 0.08;

    // Aerosol: Typical -2 to +2. Formula: (raw + 1) * 30
    // Range roughly -1.0 to 2.5 for interesting scores
    const raw_aerosol = ((seed3 % 1) * 3.5) - 1.0; 

    // --- Apply Scoring Formulas ---
    
    const score_no2 = Math.min(Math.max(raw_no2 * 1000000, 0), 100);
    const score_co = Math.min(Math.max(raw_co * 1000, 0), 100);
    const score_aerosol = Math.min(Math.max((raw_aerosol + 1) * 30, 0), 100);

    // --- Calculate Overall AQI (Max Rule) ---
    const overallAqi = Math.round(Math.max(score_no2, score_co, score_aerosol));

    // --- Determine Status ---
    let healthStatus: 'Good' | 'Moderate' | 'Unhealthy' = 'Good';
    if (overallAqi > 66) healthStatus = 'Unhealthy';
    else if (overallAqi > 33) healthStatus = 'Moderate';

    // --- Find Dominant Pollutant ---
    let dominantPollutant = "Traffic Gas (NO2)";
    let maxScore = score_no2;
    
    if (score_co > maxScore) {
      dominantPollutant = "Carbon Monoxide (CO)";
      maxScore = score_co;
    }
    if (score_aerosol > maxScore) {
      dominantPollutant = "Dust/Smoke (Aerosol)";
      maxScore = score_aerosol;
    }

    // 4. Get AI Diagnosis
    const diagnosis = await analyzePollutionData(lat, lon, {
      no2: raw_no2,
      co: raw_co,
      aerosol: raw_aerosol,
      aqi: overallAqi,
      dominant: dominantPollutant
    });

    resolve({
      overallAqi,
      components: {
        no2: raw_no2,
        no2Score: Math.round(score_no2),
        co: raw_co,
        coScore: Math.round(score_co),
        aerosol: raw_aerosol,
        aerosolScore: Math.round(score_aerosol)
      },
      dominantPollutant,
      healthStatus,
      diagnosis,
      coordinates: { lat, lon },
      timestamp: new Date().toISOString()
    });
  });
};