'use client';

import { useEffect, useState } from 'react';

interface Log {
  id: string;
  action: string;
  description: string;
  utilisateurId: string | null;
  adresseIp: string | null;
  userAgent: string | null;
  deviceType: string | null;
  deviceName: string | null;
  decretId: string | null;
  metadonnees: any;
  dateCreation: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/logs?limit=200');
      const data = await response.json();
      setLogs(data.logs);
    } catch (error) {
      console.error('Erreur lors du chargement des logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = filter === '' || 
      log.description.toLowerCase().includes(filter.toLowerCase()) ||
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      (log.deviceName && log.deviceName.toLowerCase().includes(filter.toLowerCase())) ||
      (log.adresseIp && log.adresseIp.toLowerCase().includes(filter.toLowerCase()));
    
    const matchesAction = actionFilter === '' || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadgeColor = (action: string) => {
    const colors: Record<string, string> = {
      'IMPORT': 'bg-blue-100 text-blue-800',
      'PUBLICATION': 'bg-green-100 text-green-800',
      'CONSULTATION': 'bg-purple-100 text-purple-800',
      'RECHERCHE': 'bg-yellow-100 text-yellow-800',
      'TELECHARGEMENT': 'bg-orange-100 text-orange-800',
      'SUPPRESSION': 'bg-red-100 text-red-800',
      'MODIFICATION': 'bg-indigo-100 text-indigo-800',
    };
    return colors[action] || 'bg-gray-100 text-gray-800';
  };

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case 'Mobile':
        return '📱';
      case 'Tablet':
        return '📱';
      case 'Desktop':
        return '💻';
      default:
        return '🖥️';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Logs d'Activité</h1>
        <p className="text-gray-600">Suivi de toutes les activités sur la plateforme</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Rechercher par description, action, appareil, IP..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par action
            </label>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Toutes les actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredLogs.length} résultat{filteredLogs.length > 1 ? 's' : ''} trouvé{filteredLogs.length > 1 ? 's' : ''}
          </p>
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🔄 Actualiser
          </button>
        </div>
      </div>

      {/* Table des logs */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Heure
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appareil
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adresse IP
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucun log trouvé
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(log.dateCreation)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-md">
                      <div className="truncate" title={log.description}>
                        {log.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getDeviceIcon(log.deviceType)}</span>
                        <span className="truncate max-w-[200px]" title={log.deviceName || 'Non disponible'}>
                          {log.deviceName || 'Non disponible'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.deviceType || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {log.adresseIp || 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600 mb-1">Total des logs</div>
          <div className="text-2xl font-bold text-gray-900">{logs.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600 mb-1">Desktop</div>
          <div className="text-2xl font-bold text-blue-600">
            {logs.filter(l => l.deviceType === 'Desktop').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600 mb-1">Mobile</div>
          <div className="text-2xl font-bold text-green-600">
            {logs.filter(l => l.deviceType === 'Mobile').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="text-sm text-gray-600 mb-1">Tablet</div>
          <div className="text-2xl font-bold text-purple-600">
            {logs.filter(l => l.deviceType === 'Tablet').length}
          </div>
        </div>
      </div>
    </div>
  );
}
