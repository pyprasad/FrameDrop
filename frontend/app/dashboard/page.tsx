'use client';

import { useEffect, useState } from 'react';
import { Upload, Download, HardDrive, TrendingUp, File, Calendar, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { users } from '@/lib/api';
import { formatBytes, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [storage, setStorage] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [transfersRes, storageRes] = await Promise.all([
        users.getTransfers(),
        users.getStorage(),
      ]);

      setTransfers(transfersRes.data);
      setStorage(storageRes.data);

      // Calculate stats from transfers
      const activeTransfers = transfersRes.data.filter((t: any) => t.status === 'ACTIVE').length;
      const totalDownloads = transfersRes.data.reduce(
        (sum: number, t: any) => sum + t.downloadCount,
        0
      );

      setStats({
        totalTransfers: transfersRes.data.length,
        activeTransfers,
        totalDownloads,
      });

      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Overview of your file transfers and storage usage
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              title="Total Transfers"
              value={stats?.totalTransfers || 0}
              icon={Upload}
              color="indigo"
            />
            <StatCard
              title="Active Transfers"
              value={stats?.activeTransfers || 0}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              title="Total Downloads"
              value={stats?.totalDownloads || 0}
              icon={Download}
              color="blue"
            />
            <StatCard
              title="Storage Used"
              value={storage ? formatBytes(storage.used) : '0 B'}
              subtitle={storage ? `${storage.percentage.toFixed(1)}% of ${formatBytes(storage.limit)}` : ''}
              icon={HardDrive}
              color="purple"
            />
          </div>

          {/* Storage Bar */}
          {storage && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Storage Usage</h3>
                  <p className="text-sm text-gray-600">
                    {formatBytes(storage.used)} of {formatBytes(storage.limit)} used
                  </p>
                </div>
                <div className="text-2xl font-bold text-indigo-600">
                  {storage.percentage.toFixed(1)}%
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(storage.percentage, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Recent Transfers */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transfers</h2>
            </div>
            {transfers.length === 0 ? (
              <div className="p-12 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No transfers yet</p>
                <a
                  href="/"
                  className="text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Create your first transfer
                </a>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transfer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Files
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Downloads
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expires
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {transfers.slice(0, 10).map((transfer) => (
                      <tr key={transfer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <File className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {transfer.title || transfer.shortId}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatDate(transfer.createdAt)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transfer.files?.length || 0} file(s)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatBytes(transfer.totalSizeBytes)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 text-gray-400 mr-1" />
                            {transfer.downloadCount}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                            {formatDate(transfer.expiresAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              transfer.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : transfer.status === 'EXPIRED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {transfer.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}
