import React from 'react';

export default function VerificationBadge({ status, size = 'md' }) {
  if (status !== 'verified') return null;

  const sizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  return (
    <div className="group relative inline-flex items-center">
      <div className={`${sizes[size]} bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30 cursor-help transition-transform hover:scale-110 active:scale-90`}>
        <svg fill="currentColor" viewBox="0 0 20 20" className="w-[70%] h-[70%]">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-[100] shadow-xl">
        Profil vérifié par Ubiri
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
      </div>
    </div>
  );
}
