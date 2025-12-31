
import React from 'react';

interface SliderProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  color?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
  disabled = false,
  color = '#8b5cf6'
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative w-full h-8 flex items-center group">
      {/* Track Background */}
      <div className="absolute w-full h-1.5 bg-space-600 rounded-full" />

      {/* Active Track */}
      <div
        className="absolute h-1.5 rounded-full transition-all duration-300 ease-out"
        style={{
          width: `${percentage}%`,
          background: color,
          boxShadow: `0 0 10px ${color}33`
        }}
      />

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="absolute w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
      />

      {/* Visual Thumb */}
      <div
        className="absolute w-5 h-5 bg-white border-2 rounded-full shadow-lg pointer-events-none transition-transform group-hover:scale-125 duration-200"
        style={{
          left: `calc(${percentage}% - 10px)`,
          borderColor: color,
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      />
    </div>
  );
}
