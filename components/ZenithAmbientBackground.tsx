import React from 'react';

interface ZenithAmbientBackgroundProps {
  mood: 'SAVINGS' | 'RISK';
}

export const ZenithAmbientBackground: React.FC<ZenithAmbientBackgroundProps> = ({ mood }) => {
  const getColorClasses = (index: number) => {
    if (mood === 'SAVINGS') {
        // Deep Blue, Cyan, Purple - Softer Opacities
        switch(index) {
            case 1: return 'bg-blue-400/10';
            case 2: return 'bg-purple-400/10';
            case 3: return 'bg-teal-300/10';
        }
    } else {
        // Amber, Orange, Red (Risk)
        switch(index) {
            case 1: return 'bg-orange-400/15';
            case 2: return 'bg-red-400/15';
            case 3: return 'bg-yellow-300/15';
        }
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-transparent opacity-80"></div>
        
        {/* Blob 1 - Top Left */}
        <div className={`absolute -top-[10%] -left-[10%] w-[800px] h-[800px] rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob ${getColorClasses(1)}`}></div>
        
        {/* Blob 2 - Top Right */}
        <div className={`absolute -top-[10%] -right-[10%] w-[800px] h-[800px] rounded-full mix-blend-multiply filter blur-[100px] opacity-60 animate-blob animation-delay-2000 ${getColorClasses(2)}`}></div>
        
        {/* Blob 3 - Bottom Center */}
        <div className={`absolute -bottom-[20%] left-[20%] w-[1000px] h-[1000px] rounded-full mix-blend-multiply filter blur-[120px] opacity-50 animate-blob animation-delay-4000 ${getColorClasses(3)}`}></div>
    </div>
  );
};