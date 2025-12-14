export interface ScanResult {
  overallAqi: number; // 0-100 Score
  components: {
    no2: number;     // Raw value
    no2Score: number; // 0-100
    co: number;      // Raw value
    coScore: number; // 0-100
    aerosol: number; // Raw value
    aerosolScore: number; // 0-100
  };
  dominantPollutant: string;
  healthStatus: 'Good' | 'Moderate' | 'Unhealthy';
  diagnosis: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  timestamp: string;
}

export enum PollutionLevel {
  CLEAN = 'Good',
  MODERATE = 'Moderate',
  HIGH = 'Unhealthy'
}