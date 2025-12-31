
import React from 'react';

export const BrandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
    >
        <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="opacity-20" />
        <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="opacity-30" />
        <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="2" className="opacity-50" />

        <path d="M50 15 L50 25 M85 50 L75 50 M50 85 L50 75 M15 50 L25 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

        <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
        </defs>

        <circle cx="50" cy="50" r="8" fill="currentColor" filter="url(#glow)" />

        <path
            d="M50 10 A40 40 0 0 1 90 50"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            className="text-aurora-500"
        >
            <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 50 50"
                to="360 50 50"
                dur="10s"
                repeatCount="indefinite"
            />
        </path>
    </svg>
);
