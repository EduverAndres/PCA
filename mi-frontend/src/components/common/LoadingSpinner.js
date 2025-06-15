// src/components/common/LoadingSpinner.js
import React from 'react';
import { AcademicCapIcon } from '@heroicons/react/24/outline';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="relative">
          <AcademicCapIcon className="w-16 h-16 text-university-red-600 mx-auto mb-4 animate-pulse-subtle" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-university-red-200 border-t-university-red-600 rounded-full animate-spin mx-auto"></div>
        </div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Cargando...</h2>
        <p className="text-slate-500">Iniciando el sistema</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;