import React, { useState } from 'react';
import { ScannerForm } from './components/ScannerForm';
import { ResultCard } from './components/ResultCard';
import { simulateScan } from './services/mockBackend';
import { ScanResult } from './types';
import { Satellite, Rocket, Radio } from 'lucide-react';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);

  const handleScan = async (lat: number, lon: number) => {
    setLoading(true);
    setResult(null);
    try {
      const data = await simulateScan(lat, lon);
      setResult(data);
    } catch (error) {
      console.error("Scan failed", error);
      alert("Satellite connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-indigo-100 selection:bg-pink-500/30 overflow-x-hidden font-sans">
      
      {/* Cartoon Space Hero Section */}
      <header className="relative pt-12 pb-32 sm:pt-20 sm:pb-48 overflow-hidden">
        {/* Stars background effect */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full opacity-80 animate-pulse"></div>
            <div className="absolute top-20 right-20 w-3 h-3 bg-yellow-300 rounded-full opacity-90 animate-pulse delay-75"></div>
            <div className="absolute top-40 left-1/4 w-1 h-1 bg-cyan-300 rounded-full opacity-60"></div>
            <div className="absolute top-10 right-1/3 w-2 h-2 bg-purple-300 rounded-full opacity-70"></div>
            {/* More stars for depth */}
            <div className="absolute bottom-1/3 left-10 w-1.5 h-1.5 bg-white rounded-full opacity-50"></div>
            <div className="absolute top-1/2 right-10 w-2 h-2 bg-pink-300 rounded-full opacity-60 animate-pulse"></div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-10 right-4 sm:right-10 md:right-32 text-cyan-400 opacity-20 animate-float pointer-events-none transform scale-75 sm:scale-100">
            <Rocket size={120} />
        </div>
        <div className="absolute top-20 left-4 sm:left-10 md:left-32 text-pink-500 opacity-20 animate-float pointer-events-none transform scale-75 sm:scale-100" style={{animationDelay: '1s'}}>
            <Satellite size={80} />
        </div>

        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-indigo-900/50 border border-cyan-500/50 text-cyan-300 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-4 sm:mb-6 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <Radio className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
            Multi-Constellation Link Active
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 mb-4 sm:mb-6 drop-shadow-sm filter">
            Satellite AQI Scanner
          </h1>
          
          <p className="max-w-2xl text-white text-lg sm:text-xl md:text-2xl font-bold leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] px-2">
             Analyzing <span className="text-cyan-300">NO₂</span>, <span className="text-orange-400">CO</span> & <span className="text-purple-300">Aerosols</span> via Sentinel-5P.
          </p>
        </div>

        {/* The "Planet Surface" Curve (Stylized as Earth) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[160%] sm:w-[140%] h-56 sm:h-72 bg-[#0077be] rounded-t-[100%] shadow-[0_-20px_90px_rgba(56,189,248,0.4)] z-0 overflow-hidden border-t-[6px] border-cyan-200/40">
           
           {/* Ocean Gradient */}
           <div className="absolute inset-0 bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#0c4a6e]"></div>

           {/* Stylized Landmasses (Green/Teal Blobs) */}
           <div className="absolute top-[25%] left-[15%] w-[25%] h-[60%] bg-emerald-500 rounded-[40%] filter blur-[30px] opacity-60 transform -rotate-12"></div>
           <div className="absolute top-[10%] right-[20%] w-[30%] h-[50%] bg-emerald-600 rounded-[30%] filter blur-[35px] opacity-50 transform rotate-6"></div>
           <div className="absolute bottom-[0%] left-[40%] w-[20%] h-[40%] bg-teal-500 rounded-full filter blur-[25px] opacity-40"></div>

           {/* Cloud Layers */}
           <div className="absolute top-[15%] left-[30%] w-[15%] h-[10%] bg-white rounded-full filter blur-[15px] opacity-30 animate-pulse" style={{animationDuration: '8s'}}></div>
           <div className="absolute top-[25%] right-[35%] w-[20%] h-[12%] bg-white rounded-full filter blur-[20px] opacity-20 animate-pulse" style={{animationDuration: '10s', animationDelay: '2s'}}></div>

           {/* Atmosphere Glow Overlay */}
           <div className="absolute inset-0 bg-gradient-to-b from-cyan-300/10 via-transparent to-transparent"></div>
        </div>
      </header>

      {/* Main Content - Pushed up to overlap the "Planet" */}
      <main className="container mx-auto px-4 relative z-10 -mt-24 sm:-mt-32">
        
        <ScannerForm onScan={handleScan} isLoading={loading} />

        {/* Loading State Animation */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 border-8 border-indigo-500/20 border-t-cyan-400 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <Rocket className="w-8 h-8 sm:w-10 sm:h-10 text-pink-500 animate-bounce" />
              </div>
            </div>
            <div className="text-center bg-indigo-900/80 p-4 rounded-xl backdrop-blur-sm border border-indigo-500/30 shadow-xl">
                <h3 className="text-cyan-300 font-bold text-lg">Acquiring Telemetry...</h3>
                <p className="text-indigo-200 text-sm">Triangulating Sentinel-5P & Copernicus Data</p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {result && !loading && (
          <div className="mt-8">
            <ResultCard result={result} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 text-center text-indigo-400/60 text-sm font-medium relative z-10">
        <p className="mb-2">© 2024 Galactic Remote Sensing Lab.</p>
        <p>Made with ❤️ - Kavya</p>
      </footer>
    </div>
  );
}