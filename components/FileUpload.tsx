
import React, { useState } from 'react';
import { UploadIcon, FileIcon } from './icons';

interface FileUploadProps {
  onUpload: (files: File[]) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, isProcessing }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileList = Array.from(e.target.files);
      setFiles(fileList);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileList = Array.from(e.dataTransfer.files);
      setFiles(fileList);
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = () => {
    if (files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-center text-slate-700 mb-2">Upload Bills for Scrutiny</h2>
      <p className="text-center text-slate-500 mb-6">Upload bills, supporting documents, and referral letters to begin.</p>
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-50'}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center">
          <UploadIcon />
          <p className="mt-4 text-slate-600">
            <label htmlFor="file-upload" className="font-semibold text-blue-600 hover:text-blue-500 cursor-pointer">
              Click to upload
            </label>
            {' '}or drag and drop files here
          </p>
          <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX, JPG, PNG, ZIP supported</p>
          <input id="file-upload" name="file-upload" type="file" multiple className="sr-only" onChange={handleFileChange} disabled={isProcessing} />
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-slate-600 mb-2">Selected Files:</h3>
          <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center bg-slate-100 p-2 rounded-md text-sm">
                <FileIcon />
                <span className="ml-3 text-slate-700 truncate">{file.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={files.length === 0 || isProcessing}
          className="w-full sm:w-auto px-12 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isProcessing ? 'Processing...' : 'Begin Scrutiny'}
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
