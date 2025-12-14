import React from 'react';
import { ScanResult } from '../types';
import { AlertTriangle, CheckCircle, Wind, Factory, Flame, Sparkles } from 'lucide-react';

interface ResultCardProps {
  result: ScanResult;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  
  // Status Color Logic
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good': return {
        bg: 'bg-emerald-500',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        gradient: 'from-emerald-500 to-teal-400'
      };
      case 'Moderate': return {
        bg: 'bg-yellow-500',
        text: 'text-yellow-400',
        border: 'border-yellow-500/30',
        gradient: 'from-yellow-400 to-orange-500'
      };
      case 'Unhealthy': return {
        bg: 'bg-rose-500',
        text: 'text-rose-400',
        border: 'border-rose-500/30',
        gradient: 'from-rose-500 to-red-600'
      };
      default: return { bg: 'bg-gray-500', text: 'text-gray-400', border: 'border-gray-500', gradient: 'from-gray-500 to-gray-400' };
    }
  };

  const theme = getStatusColor(result.healthStatus);

  // Circular Progress Calculation
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.overallAqi / 100) * circumference;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fade-in-up pb-10">
      
      {/* 1. Status Banner - Flex column on mobile, row on desktop */}
      <div className={`w-full p-5 rounded-xl border ${theme.border} bg-[#0f0c29]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between shadow-lg gap-4 text-center sm:text-left`}>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className={`p-3 rounded-full ${theme.bg} bg-opacity-20`}>
            {result.healthStatus === 'Good' ? <CheckCircle className={`w-8 h-8 ${theme.text}`} /> : <AlertTriangle className={`w-8 h-8 ${theme.text}`} />}
          </div>
          <div>
            <h3 className="text-white font-bold text-xl">Status: {result.healthStatus}</h3>
            <p className="text-gray-400 text-xs uppercase tracking-wider mt-1">Dominant: {result.dominantPollutant}</p>
          </div>
        </div>
        <div className={`text-4xl sm:text-3xl font-black ${theme.text} bg-black/20 px-4 py-2 rounded-lg`}>AQI {result.overallAqi}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Main Gauge Card */}
        {/* Adjusted padding for responsiveness */}
        <div className="lg:col-span-1 bg-[#1e1b4b] rounded-[2rem] pt-12 pb-10 px-6 sm:px-8 border-4 border-indigo-500/20 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
          {/* Background Glow */}
          <div className={`absolute top-0 left-0 w-full h-full opacity-10 bg-gradient-to-b ${theme.gradient}`}></div>
          
          <h4 className="text-indigo-200 font-bold uppercase tracking-widest text-sm mb-8 z-10 text-center whitespace-nowrap">Overall Space AQI</h4>
          
          <div className="relative w-48 h-48 flex items-center justify-center z-10 scale-90 sm:scale-100 transition-transform">
            {/* SVG Circle Gauge - viewBox ensures no cutting */}
            <svg className="w-full h-full" viewBox="0 0 192 192">
              <g transform="rotate(-90 96 96)">
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-indigo-900/50"
                />
                <circle
                  cx="96"
                  cy="96"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className={`${theme.text} transition-all duration-1000 ease-out`}
                />
              </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
              <span className="text-5xl font-black text-white leading-none">{result.overallAqi}</span>
              <span className="text-xs text-indigo-300 font-bold mt-1 opacity-70">Pollution Index</span>
            </div>
          </div>
          
          <p className="text-center text-xs text-indigo-400/80 mt-6 max-w-[200px] z-10">
            Calculated from max value of 3 satellite sensors.
          </p>
        </div>

        {/* 3. Component Details Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* NO2 Card */}
          <div className="bg-[#0f0c29] p-5 rounded-2xl border border-indigo-500/30 relative overflow-hidden group hover:border-cyan-400/50 transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <Factory className="w-12 h-12 text-cyan-400" />
            </div>
            <div className="text-xs text-cyan-500 font-bold uppercase mb-2">Nitrogen Dioxide</div>
            <div className="text-2xl font-bold text-white mb-1">{result.components.no2Score} <span className="text-sm text-gray-500 font-normal">/100</span></div>
            <div className="text-[10px] text-gray-400 font-mono">{result.components.no2.toExponential(2)} mol/m²</div>
            <div className="w-full bg-gray-800 h-1 mt-3 rounded-full overflow-hidden">
              <div className="bg-cyan-500 h-full transition-all duration-1000" style={{width: `${result.components.no2Score}%`}}></div>
            </div>
          </div>

          {/* CO Card */}
          <div className="bg-[#0f0c29] p-5 rounded-2xl border border-indigo-500/30 relative overflow-hidden group hover:border-orange-400/50 transition-all">
             <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <Flame className="w-12 h-12 text-orange-400" />
            </div>
            <div className="text-xs text-orange-500 font-bold uppercase mb-2">Carbon Monoxide</div>
            <div className="text-2xl font-bold text-white mb-1">{result.components.coScore} <span className="text-sm text-gray-500 font-normal">/100</span></div>
            <div className="text-[10px] text-gray-400 font-mono">{result.components.co.toFixed(4)} mol/m²</div>
            <div className="w-full bg-gray-800 h-1 mt-3 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full transition-all duration-1000" style={{width: `${result.components.coScore}%`}}></div>
            </div>
          </div>

          {/* Aerosol Card */}
          <div className="bg-[#0f0c29] p-5 rounded-2xl border border-indigo-500/30 relative overflow-hidden group hover:border-purple-400/50 transition-all">
             <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
              <Wind className="w-12 h-12 text-purple-400" />
            </div>
            <div className="text-xs text-purple-500 font-bold uppercase mb-2">Aerosols (Dust)</div>
            <div className="text-2xl font-bold text-white mb-1">{result.components.aerosolScore} <span className="text-sm text-gray-500 font-normal">/100</span></div>
            <div className="text-[10px] text-gray-400 font-mono">Idx: {result.components.aerosol.toFixed(2)}</div>
            <div className="w-full bg-gray-800 h-1 mt-3 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full transition-all duration-1000" style={{width: `${result.components.aerosolScore}%`}}></div>
            </div>
          </div>

          {/* AI Diagnosis Box */}
          <div className="md:col-span-3 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 p-5 rounded-2xl border border-indigo-500/20 mt-2">
             <div className="flex items-center gap-2 text-xs font-bold text-pink-300 uppercase mb-2">
               <Sparkles className="w-3 h-3" /> Gemini Space Diagnosis
             </div>
             <p className="text-indigo-100 text-sm leading-relaxed font-medium">
               "{result.diagnosis}"
             </p>
          </div>

        </div>
      </div>
    </div>
  );
};