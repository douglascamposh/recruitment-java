import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { CandidateProfile } from '@/types';

// Interface defining the props for the CvUpload component
interface CvUploadProps {
  onUploadSuccess?: (profile: CandidateProfile) => void;
  userId?: string;
  className?: string;
}

/**
 * Reusable component to upload and ingest CV files
 */
const CvUpload: React.FC<CvUploadProps> = ({ onUploadSuccess, userId = '12345', className = '' }) => {
  // State to hold the selected file
  const [file, setFile] = useState<File | null>(null);
  // State to track upload progress status
  const [isUploading, setIsUploading] = useState(false);

  // Callback to handle file drop using react-dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]); // Only take the first file
    }
  }, []);

  // Initialize react-dropzone hook with supported formats
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  // Handler to post the file to the ingest endpoint
  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    
    // Construct the FormData payload
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Call the candidates ingest API
      const response = await api.post('/api/v1/candidates/ingest', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('CV uploaded and processed successfully!');
      setFile(null); // Reset the file state after success
      
      // Trigger the success callback if provided
      if (onUploadSuccess && response.data) {
        onUploadSuccess(response.data);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error('Failed to upload CV. Please try again.');
    } finally {
      setIsUploading(false); // Remove loading state
    }
  };

  // Handler to clear the selected file before upload
  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent propagation to dropzone
    setFile(null);
  };

  return (
    <div className={`p-6 bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Upload Candidate CV</h2>
      
      {/* Dropzone Area: shown when no file is selected */}
      {!file ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm text-gray-600 font-medium">
            {isDragActive ? "Drop the file here" : "Drag & drop a CV file here, or click to select"}
          </p>
          <p className="text-xs text-gray-400 mt-2">Supported formats: PDF, DOC, DOCX</p>
        </div>
      ) : (
        /* Selected File View: shown when a file is ready to be uploaded */
        <div className="border rounded-lg p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md border border-blue-100">
            <div className="flex items-center gap-3 overflow-hidden">
              <File className="text-blue-500 shrink-0" />
              <div className="truncate">
                <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            
            {/* Remove File Button */}
            <button 
              onClick={removeFile}
              disabled={isUploading}
              className="p-1 hover:bg-blue-100 rounded-full text-gray-500 hover:text-red-500 transition-colors shrink-0"
              title="Remove file"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              'Upload and Process CV'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default CvUpload;
