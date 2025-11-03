import React from 'react';
// FIX: Correct import path for types
import { AnalysisStatus } from '../types';

interface AnalysisProgressProps {
  status: AnalysisStatus;
  progress: number;
  statusText: string;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ status, progress, statusText }) => {
  if (status === AnalysisStatus.IDLE || status === AnalysisStatus.COMPLETE) {
    return null;
  }
  
  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center text-slate-700 mb-4">AI Agent is at Work</h2>
      <p className="text-center text-slate-500 mb-6">{statusText}</p>
      <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
        <div 
          className="bg-blue-600 h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default AnalysisProgress;
