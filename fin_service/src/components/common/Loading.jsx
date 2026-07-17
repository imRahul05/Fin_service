import React from 'react';

function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50/60 backdrop-blur-md transition-opacity duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing pulsing ring */}
        <div className="absolute h-20 w-20 animate-ping rounded-full bg-blue-500/20 duration-1000"></div>
        
        {/* Inner rotating gradient ring */}
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-blue-600 border-r-indigo-500 border-b-purple-500"></div>
        
        {/* Logo/Icon placeholder inside */}
        <div className="absolute h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center">
          <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse"></div>
        </div>
      </div>
      
      {/* Loading Text */}
      <h3 className="mt-6 text-sm font-semibold tracking-wider text-gray-700 animate-pulse">
        Securing connection...
      </h3>
    </div>
  );
}

export default Loading;
