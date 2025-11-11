'use client';

import { useState, useEffect } from 'react';
import { Download, Lock, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatBytes } from '@/lib/utils';
import { transfers } from '@/lib/api';

export default function DownloadPage({ params }: { params: { shortId: string } }) {
  const [transfer, setTransfer] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadTransfer();
  }, []);

  const loadTransfer = async () => {
    try {
      const { data } = await transfers.get(params.shortId);
      setTransfer(data);
      setLoading(false);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('password_required');
      } else {
        setError(err.response?.data?.message || 'Transfer not found');
      }
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const { data } = await transfers.get(params.shortId, password);
      setTransfer(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid password');
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data } = await transfers.download(params.shortId, password);

      // Download each file
      for (const file of data) {
        const link = document.createElement('a');
        link.href = file.url;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Small delay between downloads
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transfer...</p>
        </div>
      </div>
    );
  }

  if (error === 'password_required') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">
            Password Required
          </h1>
          <p className="text-gray-600 text-center mb-6">
            This transfer is password protected
          </p>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {error && error !== 'password_required' && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <Button onClick={handlePasswordSubmit} className="w-full" size="lg">
              Continue
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Transfer Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => (window.location.href = '/')}>
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  if (!transfer) return null;

  const totalSize = transfer.files.reduce(
    (sum: number, file: any) => sum + file.sizeBytes,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-3xl mx-auto py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {transfer.senderName} sent you {transfer.files.length} file
              {transfer.files.length > 1 ? 's' : ''}
            </h1>
            {transfer.message && (
              <p className="text-gray-600 mt-4 p-4 bg-gray-50 rounded-lg">
                "{transfer.message}"
              </p>
            )}
          </div>

          {/* File List */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Files</h2>
            <div className="space-y-2">
              {transfer.files.map((file: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <File className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{file.filename}</p>
                    <p className="text-sm text-gray-500">
                      {formatBytes(file.sizeBytes)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Total Size</p>
              <p className="text-lg font-semibold">{formatBytes(totalSize)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expires</p>
              <p className="text-lg font-semibold">
                {new Date(transfer.expiresAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            {downloading ? 'Downloading...' : 'Download All Files'}
          </Button>

          {/* Download Counter */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Downloaded {transfer.downloadCount} time
            {transfer.downloadCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-2">Want to send files too?</p>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Try FrameDrop
          </Button>
        </div>
      </div>
    </div>
  );
}
