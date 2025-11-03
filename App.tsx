import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import AnalysisProgress from './components/AnalysisProgress';
// FIX: Correct import paths for newly created modules
import ReportDisplay from './components/ReportDisplay';
import { AnalysisStatus, ReportData } from './types';
import { analyzeSSTBill } from './services/geminiService';
import { ANALYSIS_STEPS } from './constants';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  const isProcessing = analysisStatus !== AnalysisStatus.IDLE && analysisStatus !== AnalysisStatus.COMPLETE && analysisStatus !== AnalysisStatus.ERROR;

  const handleFileUpload = async (uploadedFiles: File[]) => {
    if (isProcessing) return;

    // 1. Reset state and set initial status
    setFiles(uploadedFiles);
    setError(null);
    setReportData(null);
    setProgress(0);
    setAnalysisStatus(AnalysisStatus.UPLOADING);

    try {
      const totalDuration = ANALYSIS_STEPS.reduce((sum, step) => sum + step.duration, 0);
      
      // 2. Animate progress and update text through each step
      let startProgress = 0;
      for (const step of ANALYSIS_STEPS) {
        setStatusText(step.text);
        
        const targetProgress = startProgress + (step.duration / totalDuration) * 99; // Animate towards 99%
        
        await new Promise<void>(resolve => {
          const animationStartTime = performance.now();
          const animate = (currentTime: number) => {
            const stepElapsed = currentTime - animationStartTime;
            const fraction = Math.min(stepElapsed / step.duration, 1);
            setProgress(startProgress + (fraction * (targetProgress - startProgress)));

            if (fraction < 1) {
              requestAnimationFrame(animate);
            } else {
              resolve();
            }
          };
          requestAnimationFrame(animate);
        });
        
        startProgress = targetProgress;
      }
      
      // 3. Perform the actual analysis after animation
      setStatusText('Generating Scrutiny Report...');
      const data = await analyzeSSTBill(uploadedFiles);
      setReportData(data);
      setProgress(100);
      setAnalysisStatus(AnalysisStatus.COMPLETE);

    } catch (err) {
      console.error(err);
      setError('An error occurred during analysis. Please check the file format and try again.');
      setAnalysisStatus(AnalysisStatus.ERROR);
    }
  };

  const handleReset = () => {
    setFiles([]);
    setReportData(null);
    setError(null);
    setAnalysisStatus(AnalysisStatus.IDLE);
    setProgress(0);
    setStatusText('');
  };

  const renderContent = () => {
    switch (analysisStatus) {
      case AnalysisStatus.COMPLETE:
        return reportData && <ReportDisplay reportData={reportData} onReset={handleReset} />;
      case AnalysisStatus.ERROR:
        return (
          <div className="text-center bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative max-w-3xl mx-auto" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
            <button onClick={handleReset} className="ml-4 mt-2 sm:mt-0 px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700">Try Again</button>
          </div>
        );
      case AnalysisStatus.IDLE:
        return <FileUpload onUpload={handleFileUpload} isProcessing={isProcessing} />;
      default: // UPLOADING, ANALYZING, etc.
        return <AnalysisProgress status={analysisStatus} progress={progress} statusText={statusText} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800">
          TUH SST Bill Scrutiny <span className="text-blue-600">AI Agent</span>
        </h1>
        <p className="mt-2 text-lg text-slate-500 max-w-2xl mx-auto">Automated Medical Claim Auditing Powered by AI</p>
      </header>
      <main className="w-full">
        {renderContent()}
      </main>
      <footer className="text-center mt-10 text-sm text-slate-400">
        <p>&copy; {new Date().getFullYear()} TUH AI Solutions. All Rights Reserved.</p>
        <p>This is a demonstration app. All rules are based on a simulated knowledge base.</p>
      </footer>
    </div>
  );
};

export default App;
