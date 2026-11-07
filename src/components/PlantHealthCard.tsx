import React from 'react';
import { Camera, Leaf } from 'lucide-react';

interface PlantHealthCardProps {
  onStartDiagnosis: () => void;
  className?: string;
}

const PlantHealthCard: React.FC<PlantHealthCardProps> = ({ onStartDiagnosis, className = "" }) => {
  // Sample crop data with progress indicators
  const cropProgress = [
    { name: "Peach", progress: 85, color: "#FF6B6B" },
    { name: "Tomato", progress: 92, color: "#FF4757" },
    { name: "Wheat", progress: 78, color: "#F39C12" }
  ];

  const CircularProgress = ({ progress, color, name }: { progress: number; color: string; name: string }) => {
    const circumference = 2 * Math.PI * 16; // radius = 16
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="relative w-10 h-10">
          {/* Background circle */}
          <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="2"
            />
            {/* Progress circle */}
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300 ease-in-out"
            />
          </svg>
          {/* Plant icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white/90" />
          </div>
        </div>
        {/* Crop name label */}
        <span className="text-xs text-white/80 font-medium">{name}</span>
      </div>
    );
  };

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-green-400 shadow-xl ${className}`}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
      </div>
      
      <div className="relative p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="inline-flex items-center px-3 py-1 bg-white/20 rounded-full mb-3">
              <span className="text-xs font-semibold text-white tracking-wide">AI Powered</span>
            </div>
            
            <h2 className="text-xl font-bold text-white mb-2 leading-tight">
              Diagnose Plant Health
            </h2>
            
            <p className="text-white/90 text-sm font-medium">
              Take a photo to check diseases
            </p>
          </div>
          
          {/* Start Button */}
          <button
            onClick={onStartDiagnosis}
            className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-green-600 font-bold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <Camera className="w-5 h-5" />
            <span>Start</span>
          </button>
        </div>

        {/* Bottom Progress Section */}
        <div className="flex items-center justify-center space-x-8 pt-4 border-t border-white/20">
          {cropProgress.map((crop, index) => (
            <CircularProgress
              key={index}
              progress={crop.progress}
              color={crop.color}
              name={crop.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlantHealthCard;
