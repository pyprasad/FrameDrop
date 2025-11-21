'use client';

import { useEffect, useState } from 'react';
import { Users, Upload, Download, HardDrive, Activity, TrendingUp } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { AdminRoute } from '@/components/ProtectedRoute';
import { admin } from '@/lib/api';
import { formatBytes, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      const { data } = await admin.getDashboard();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </DashboardLayout>
      </AdminRoute>
    );
  }

  return (
    <AdminRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-gray-600">
              Platform overview and system metrics
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={Users}
              color="indigo"
              trend="+12%"
            />
            <StatCard
              title="Organizations"
              value={stats?.totalOrganizations || 0}
              icon={Activity}
              color="green"
            />
            <StatCard
              title="Total Transfers"
              value={stats?.totalTransfers || 0}
              icon={Upload}
              color="blue"
              trend="+8%"
            />
            <StatCard
              title="Active Transfers"
              value={stats?.activeTransfers || 0}
              icon={TrendingUp}
              color="purple"
            />
            <StatCard
              title="Total Downloads"
              value={stats?.totalDownloads || 0}
              icon={Download}
              color="pink"
            />
            <StatCard
              title="Storage Used"
              value={formatBytes(stats?.totalStorage || 0)}
              icon={HardDrive}
              color="orange"
            />
          </div>

          {/* Recent Transfers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transfers</h2>
              </div>
              <div className="p-6">
                {stats?.recentTransfers?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentTransfers.slice(0, 5).map((transfer: any) => (
                      <div key={transfer.id} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {transfer.title || transfer.shortId}
                          </p>
                          <p className="text-xs text-gray-500">
                            {transfer.user?.email || 'Anonymous'}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-900">
                            {transfer._count?.files || 0} files
                          </p>
                          <p className="text-xs text-gray-500">
                            {transfer._count?.downloads || 0} downloads
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No transfers yet</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Top Users</h2>
              </div>
              <div className="p-6">
                {stats?.topUsers?.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topUsers.slice(0, 5).map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.firstName || user.email}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-sm text-gray-900">
                            {user.transferCount} transfers
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatBytes(user.usedStorageBytes)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No users yet</p>
                )}
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left">
                <Users className="w-6 h-6 text-indigo-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Manage Users</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left">
                <Activity className="w-6 h-6 text-indigo-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">View Audit Logs</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left">
                <HardDrive className="w-6 h-6 text-indigo-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Storage Settings</p>
              </button>
              <button className="p-4 border border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left">
                <TrendingUp className="w-6 h-6 text-indigo-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">View Analytics</p>
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AdminRoute>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  trend?: string;
}) {
  const colorClasses = {
    indigo: 'bg-indigo-100 text-indigo-600',
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="text-sm font-medium text-green-600">{trend}</span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
