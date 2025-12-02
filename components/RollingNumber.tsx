import React, { useEffect, useState, useRef } from 'react';

interface RollingNumberProps {
  isRolling: boolean;
  targetNumber?: string | null; // If provided, it stops on this number
  onAnimationComplete?: () => void;
}

const RollingNumber: React.FC<RollingNumberProps> = ({ 
  isRolling, 
  targetNumber, 
  onAnimationComplete 
}) => {
  const [displayNumber, setDisplayNumber] = useState('000');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isRolling) {
      // Start rolling
      intervalRef.current = window.setInterval(() => {
        const randomNum = Math.floor(Math.random() * 999) + 1;
        setDisplayNumber(randomNum.toString().padStart(3, '0'));
      }, 50); // Fast update
    } else {
      // Stop rolling
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (targetNumber) {
        setDisplayNumber(targetNumber);
        if(onAnimationComplete) onAnimationComplete();
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRolling, targetNumber, onAnimationComplete]);

  return (
    <div className="flex justify-center items-center py-10">
      <div className="relative">
        <div className="absolute inset-0 bg-wedding-200 blur-3xl opacity-30 rounded-full animate-pulse"></div>
        <h1 className="relative text-[8rem] md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-br from-wedding-600 to-wedding-800 font-serif leading-none tracking-widest tabular-nums drop-shadow-sm">
          {displayNumber}
        </h1>
      </div>
    </div>
  );
};

export default RollingNumber;