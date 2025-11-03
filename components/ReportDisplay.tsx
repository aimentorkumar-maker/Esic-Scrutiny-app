import React from 'react';
import { ReportData } from '../types';
import { CheckCircleIcon, AlertTriangleIcon, DownloadIcon } from './icons';

interface ReportDisplayProps {
  reportData: ReportData;
  onReset: () => void;
}

const SeverityBadge: React.FC<{ severity: 'High' | 'Medium' | 'Low' }> = ({ severity }) => {
  const baseClasses = "px-2 py-0.5 text-xs font-semibold rounded-full inline-block";
  const colorClasses = {
    High: "bg-red-100 text-red-800",
    Medium: "bg-yellow-100 text-yellow-800",
    Low: "bg-green-100 text-green-800",
  };
  return <span className={`${baseClasses} ${colorClasses[severity]}`}>{severity}</span>;
};


const ReportDisplay: React.FC<ReportDisplayProps> = ({ reportData, onReset }) => {
  const { summary, discrepancies, totalSavings } = reportData;

  const handleDownload = () => {
    // Basic CSV download functionality
    const headers = ["Line Item", "Issue Found", "Recommendation", "Severity"];
    const rows = discrepancies.map(d => [
      `"${d.lineItem.replace(/"/g, '""')}"`,
      `"${d.issue.replace(/"/g, '""')}"`,
      `"${d.recommendation.replace(/"/g, '""')}"`,
      d.severity
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "scrutiny_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Scrutiny Report Complete</h2>
          <p className="text-slate-500">AI analysis has identified potential issues and savings.</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
        >
          <DownloadIcon />
          Download CSV
        </button>
      </div>

      {/* Summary Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-blue-800 mb-2 flex items-center"><CheckCircleIcon /> <span className="ml-2">Analysis Summary</span></h3>
        <p className="text-slate-700 mb-4">{summary}</p>
        {totalSavings > 0 && (
          <div className="text-center bg-green-100 border border-green-300 rounded-lg p-4">
            <p className="text-lg text-green-800">Potential Savings Identified:</p>
            <p className="text-3xl font-bold text-green-600">${totalSavings.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Discrepancies Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center"><AlertTriangleIcon /> <span className="ml-2">Discrepancies Found</span></h3>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Line Item</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Issue</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Recommendation</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Severity</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {discrepancies.length > 0 ? (
                discrepancies.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{item.lineItem}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-slate-600">{item.issue}</td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-slate-600">{item.recommendation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500"><SeverityBadge severity={item.severity} /></td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-slate-500">No discrepancies found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 pt-6 border-t text-center">
        <button
          onClick={onReset}
          className="w-full sm:w-auto px-12 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200"
        >
          Scrutinize New Bills
        </button>
      </div>
    </div>
  );
};

export default ReportDisplay;
