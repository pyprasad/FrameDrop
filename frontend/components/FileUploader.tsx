'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, File, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { formatBytes } from '@/lib/utils';
import { transfers } from '@/lib/api';

interface UploadedFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export function FileUploader() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [recipientEmails, setRecipientEmails] = useState('');
  const [message, setMessage] = useState('');
  const [transferUrl, setTransferUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending' as const,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 10 * 1024 * 1024 * 1024, // 10GB
  });

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      // Create transfer
      const { data: transfer } = await transfers.create({
        recipientEmails: recipientEmails.split(',').map((e) => e.trim()).filter(Boolean),
        message,
      });

      // Upload files
      for (let i = 0; i < files.length; i++) {
        const fileObj = files[i];

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: 'uploading' } : f
          )
        );

        try {
          await transfers.upload(transfer.id, fileObj.file);

          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: 'completed', progress: 100 } : f
            )
          );
        } catch (error) {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i
                ? { ...f, status: 'error', error: 'Upload failed' }
                : f
            )
          );
        }
      }

      // Finalize transfer
      await transfers.finalize(transfer.id);

      const url = `${window.location.origin}/download/${transfer.shortId}`;
      setTransferUrl(url);
    } catch (error) {
      console.error('Transfer failed:', error);
      alert('Transfer failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (transferUrl) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Transfer Complete!</h2>
        <p className="text-gray-600 mb-6">Your files are ready to share</p>
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <p className="text-sm text-gray-500 mb-2">Share this link:</p>
          <p className="font-mono text-sm break-all">{transferUrl}</p>
        </div>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => {
              navigator.clipboard.writeText(transferUrl);
              alert('Link copied!');
            }}
          >
            Copy Link
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setTransferUrl('');
              setFiles([]);
              setRecipientEmails('');
              setMessage('');
            }}
          >
            Send Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Dropzone */}
      {files.length === 0 ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            Up to 10GB per transfer
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File List */}
          <div className="space-y-2">
            {files.map((fileObj, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <File className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileObj.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatBytes(fileObj.file.size)}
                  </p>
                  {fileObj.status === 'uploading' && (
                    <Progress value={fileObj.progress} className="mt-2" />
                  )}
                </div>
                {fileObj.status === 'completed' && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                {fileObj.status !== 'uploading' && (
                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add More Button */}
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
          >
            <input {...getInputProps()} />
            <p className="text-sm text-gray-600">+ Add more files</p>
          </div>

          {/* Transfer Details */}
          <div className="space-y-3 pt-4">
            <input
              type="text"
              placeholder="Recipient emails (comma-separated)"
              value={recipientEmails}
              onChange={(e) => setRecipientEmails(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <textarea
              placeholder="Add a message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={isUploading}
            className="w-full"
            size="lg"
          >
            {isUploading ? 'Uploading...' : 'Send Files'}
          </Button>
        </div>
      )}
    </div>
  );
}
