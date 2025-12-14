import React, { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, Globe, ArrowDownUp, Loader2 } from 'lucide-react';

interface ScannerFormProps {
  onScan: (lat: number, lon: number) => void;
  isLoading: boolean;
}

export const ScannerForm: React.FC<ScannerFormProps> = ({ onScan, isLoading }) => {
  const [lat, setLat] = useState<string>('34.0522');
  const [lon, setLon] = useState<string>('-118.2437');
  const [address, setAddress] = useState<string>('Los Angeles, California, USA');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (!isNaN(latNum) && !isNaN(lonNum)) {
      onScan(latNum, lonNum);
    }
  };

  // Forward Geocoding: Address -> Coordinates
  const handleAddressSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!address.trim()) return;

    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        setLat(parseFloat(data[0].lat).toFixed(4));
        setLon(parseFloat(data[0].lon).toFixed(4));
      } else {
        alert("Location not found. Please try a clearer city or place name.");
      }
    } catch (error) {
      console.error("Geocoding failed:", error);
      alert("Could not connect to location service.");
    } finally {
      setIsGeocoding(false);
    }
  };

  // Reverse Geocoding: Coordinates -> Address
  const handleReverseGeocode = async (latitude: number, longitude: number) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress("Unknown Location");
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsGeocoding(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude;
        const newLon = position.coords.longitude;
        setLat(newLat.toFixed(4));
        setLon(newLon.toFixed(4));
        // Automatically fetch address for this location
        handleReverseGeocode(newLat, newLon);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please check permissions.");
        setIsGeocoding(false);
      }
    );
  };

  // Helper for manual "Sync Address" button
  const handleManualReverseGeocode = () => {
    const l = parseFloat(lat);
    const lg = parseFloat(lon);
    if (!isNaN(l) && !isNaN(lg)) {
      handleReverseGeocode(l, lg);
    }
  };

  return (
    <div className="bg-[#1e1b4b] p-6 sm:p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-indigo-500/30 w-full max-w-lg mx-auto relative overflow-hidden backdrop-blur-xl transition-all">
       {/* Glow effects */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 pointer-events-none"></div>
       <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20 pointer-events-none"></div>

      <div className="relative z-10">
        <h2 className="text-xl sm:text-2xl font-black mb-6 text-white flex items-center justify-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl text-yellow-300 shadow-lg">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          Target Coordinates
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Address Input Section */}
          <div className="bg-[#0f0c29]/50 p-4 rounded-xl border border-indigo-500/20">
            <label className="block text-xs font-bold text-cyan-300 mb-2 uppercase tracking-widest pl-1">
              Search Location
            </label>
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault(); // Prevent form submit
                    handleAddressSearch();
                  }
                }}
                className="w-full bg-[#0f0c29] border-2 border-indigo-800 rounded-xl py-3 pl-10 pr-12 text-white font-medium focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all outline-none shadow-inner text-sm"
                placeholder="Enter city..."
              />
              <Globe className="absolute left-3 w-5 h-5 text-indigo-400" />
              
              <button 
                type="button"
                onClick={(e) => handleAddressSearch(e)}
                disabled={isGeocoding}
                className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors"
                title="Convert Address to Coordinates"
              >
                {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-indigo-400 mt-2 pl-1 italic">
              Press Enter to update coordinates.
            </p>
          </div>

          <div className="relative flex items-center justify-center -my-3 z-10">
            <button 
              type="button" 
              onClick={handleManualReverseGeocode}
              className="bg-[#2e2a5b] border border-indigo-500/30 rounded-full p-2 text-indigo-300 hover:text-white hover:bg-indigo-600 transition-all shadow-lg transform hover:scale-110 active:scale-95"
              title="Sync Address from Coordinates"
            >
              {isGeocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDownUp className="w-4 h-4" />}
            </button>
          </div>

          {/* Coordinates Section - Stacks on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="group">
              <label className="block text-xs font-bold text-cyan-300 mb-2 uppercase tracking-widest pl-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full bg-[#0f0c29] border-2 border-indigo-800 rounded-xl py-3 px-4 text-white font-mono text-lg focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all outline-none shadow-inner"
                placeholder="0.00"
                required
              />
            </div>
            <div className="group">
              <label className="block text-xs font-bold text-cyan-300 mb-2 uppercase tracking-widest pl-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                className="w-full bg-[#0f0c29] border-2 border-indigo-800 rounded-xl py-3 px-4 text-white font-mono text-lg focus:ring-4 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all outline-none shadow-inner"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Action Buttons - Stacked on mobile */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleUseLocation}
              className="w-full sm:w-auto px-6 py-4 bg-[#2e2a5b] hover:bg-[#3b3675] text-indigo-200 rounded-xl transition-all border-2 border-transparent hover:border-indigo-400 flex items-center justify-center gap-2 group active:scale-95"
              title="Use my location"
              disabled={isLoading || isGeocoding}
            >
              <Navigation className="w-5 h-5 group-hover:text-cyan-400 transition-colors" />
              <span className="font-bold text-xs uppercase tracking-wider group-hover:text-white transition-colors whitespace-nowrap">Locate Me</span>
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full sm:flex-1 flex items-center justify-center gap-3 rounded-xl py-4 text-lg font-black text-white transition-all shadow-xl transform active:scale-95
                ${isLoading 
                  ? 'bg-slate-700 cursor-not-allowed opacity-75' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-purple-500/40 hover:shadow-purple-500/60'
                }`}
            >
              {isLoading ? (
                <>Initiating...</>
              ) : (
                <>
                  <Search className="w-5 h-5 stroke-[3]" />
                  SCAN SECTOR
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};