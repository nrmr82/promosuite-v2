import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer 
} from 'recharts';
import { toast } from 'react-toastify';
import { useSocialConnections } from '../../hooks/useSocialConnections';
import errorHandler from '../../services/ErrorHandler';
import tokenRefreshManager from '../../services/TokenRefreshManager';
import platformAdapterFactory from '../../services/adapters/PlatformAdapterFactory';

/**
 * Connection status badge component
 */
const StatusBadge = ({ status }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'expired':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor()}`}>
      {status}
    </span>
  );
};

/**
 * Connection monitoring dashboard
 */
export default function ConnectionMonitoring() {
  const {
    connections,
    healthStatus,
    refreshStatus,
    batchConnect,
    batchDisconnect,
    batchRefresh,
    getRefreshStatus,
    getHealthStatus
  } = useSocialConnections();

  const [selectedPlatforms, setSelectedPlatforms] = useState(new Set());
  const [errorHistory, setErrorHistory] = useState([]);
  const [statsData, setStatsData] = useState({
    errorRates: [],
    statusDistribution: []
  });

  // Load error history
  useEffect(() => {
    setErrorHistory(errorHandler.getErrorHistory());
  }, []);

  // Update stats data
  useEffect(() => {
    // Calculate error rates
    const errorRates = Object.values(connections).map(conn => ({
      platform: conn.platform,
      errors: errorHistory.filter(e => 
        e.error.platform === conn.platform &&
        e.timestamp > Date.now() - 24 * 60 * 60 * 1000
      ).length
    }));

    // Calculate status distribution
    const statusCounts = Object.values(connections).reduce((acc, conn) => {
      const status = conn.connection_status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count
    }));

    setStatsData({
      errorRates,
      statusDistribution
    });
  }, [connections, errorHistory]);

  // Handle platform selection
  const togglePlatform = (platform) => {
    const newSelected = new Set(selectedPlatforms);
    if (newSelected.has(platform)) {
      newSelected.delete(platform);
    } else {
      newSelected.add(platform);
    }
    setSelectedPlatforms(newSelected);
  };

  // Handle bulk operations
  const handleBulkOperation = async (operation) => {
    const platforms = Array.from(selectedPlatforms);
    if (platforms.length === 0) {
      toast.warning('Please select at least one platform');
      return;
    }

    switch (operation) {
      case 'refresh':
        await batchRefresh(platforms);
        break;
      case 'reconnect':
        await batchConnect(platforms);
        break;
      case 'disconnect':
        await batchDisconnect(platforms);
        break;
    }

    setSelectedPlatforms(new Set());
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Connection Monitoring</h1>
        <p className="mt-2 text-gray-600">
          Monitor and manage social media platform connections
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Connections</h3>
          <p className="text-3xl font-bold">{Object.keys(connections).length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Active Connections</h3>
          <p className="text-3xl font-bold text-green-500">
            {Object.values(connections).filter(c => c.connection_status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Error Rate (24h)</h3>
          <p className="text-3xl font-bold text-red-500">
            {errorHistory.filter(e => e.timestamp > Date.now() - 24 * 60 * 60 * 1000).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Pending Refreshes</h3>
          <p className="text-3xl font-bold text-blue-500">
            {tokenRefreshManager.getActiveTasks().length}
          </p>
        </div>
      </div>

      {/* Error Rate Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Error Rates by Platform</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statsData.errorRates}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="errors" fill="#f56565" name="Errors (24h)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Distribution Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Connection Status Distribution</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statsData.statusDistribution}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#4299e1"
                label
              >
                {statsData.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Connection List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Connection Status</h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkOperation('refresh')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={selectedPlatforms.size === 0}
            >
              Refresh Selected
            </button>
            <button
              onClick={() => handleBulkOperation('reconnect')}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              disabled={selectedPlatforms.size === 0}
            >
              Reconnect Selected
            </button>
            <button
              onClick={() => handleBulkOperation('disconnect')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              disabled={selectedPlatforms.size === 0}
            >
              Disconnect Selected
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedPlatforms.size === Object.keys(connections).length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPlatforms(new Set(Object.keys(connections)));
                      } else {
                        setSelectedPlatforms(new Set());
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Refresh
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Token Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(connections).map(([platform, connection]) => {
                const health = getHealthStatus(platform);
                const refresh = getRefreshStatus(platform);
                return (
                  <tr key={platform}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.has(platform)}
                        onChange={() => togglePlatform(platform)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={`/images/platforms/${platform}.png`}
                          alt={platform}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {platform}
                          </div>
                          <div className="text-sm text-gray-500">
                            {connection.platform_username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={connection.connection_status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={health.status} />
                      {health.error && (
                        <div className="text-xs text-red-500 mt-1">
                          {health.error.message}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {refresh?.lastAttempt
                          ? format(new Date(refresh.lastAttempt), 'PPp')
                          : 'Never'}
                      </div>
                      {refresh?.status === 'refreshing' && (
                        <div className="text-xs text-blue-500">Refreshing...</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {connection.token_expires_at
                          ? format(new Date(connection.token_expires_at), 'PPp')
                          : 'N/A'}
                      </div>
                      {connection.token_expires_at && (
                        <div className={`text-xs ${
                          new Date(connection.token_expires_at) < new Date(Date.now() + 24 * 60 * 60 * 1000)
                            ? 'text-red-500'
                            : 'text-gray-500'
                        }`}>
                          {format(new Date(connection.token_expires_at), 'relative')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => batchRefresh([platform])}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                        disabled={refresh?.status === 'refreshing'}
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => batchDisconnect([platform])}
                        className="text-red-600 hover:text-red-900"
                      >
                        Disconnect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Error Log */}
      <div className="mt-8 bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Error Log</h2>
          <button
            onClick={() => errorHandler.clearErrorHistory()}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear History
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {errorHistory.map((entry, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(entry.timestamp), 'PPp')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {entry.error.platform || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      entry.error.category === 'token' ? 'bg-yellow-100 text-yellow-800' :
                      entry.error.category === 'rate_limit' ? 'bg-blue-100 text-blue-800' :
                      entry.error.category === 'network' ? 'bg-purple-100 text-purple-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {entry.error.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{entry.error.message}</div>
                    {entry.error.code && (
                      <div className="text-xs text-gray-400">
                        Code: {entry.error.code}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}