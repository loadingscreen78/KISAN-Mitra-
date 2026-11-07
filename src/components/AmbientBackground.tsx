import React from 'react';

interface AmbientBackgroundProps {
  className?: string;
  variant?: 'default' | 'vibrant' | 'subtle';
}

export const AmbientBackground: React.FC<AmbientBackgroundProps> = ({ 
  className = '', 
  variant = 'default' 
}) => {
  return (
    <div 
      aria-hidden="true" 
      className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 ${className}`}
    >
      {/* Top right emerald orb */}
      <div 
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-400/20 via-green-300/15 to-transparent blur-3xl transform animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      
      {/* Top left soft sunlight orb */}
      <div 
        className="absolute top-1/4 -left-28 w-80 h-80 rounded-full bg-gradient-to-tr from-amber-300/15 via-emerald-200/10 to-transparent blur-3xl transform animate-pulse"
        style={{ animationDuration: '10s', animationDelay: '1s' }}
      />
      
      {/* Center ambient glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] rounded-full bg-gradient-to-r from-emerald-200/10 via-teal-300/10 to-transparent blur-3xl"
      />
      
      {/* Bottom right teal/green orb */}
      <div 
        className="absolute -bottom-24 right-0 w-96 h-96 rounded-full bg-gradient-to-tl from-emerald-500/15 via-teal-400/10 to-transparent blur-3xl transform animate-pulse"
        style={{ animationDuration: '12s', animationDelay: '2s' }}
      />

      {/* Very subtle mesh overlay for texture */}
      <div 
        className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"
      />
    </div>
  );
};

export default AmbientBackground;
