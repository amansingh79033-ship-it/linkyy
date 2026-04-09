import React from 'react';
import { X, Globe, Smartphone, MapPin, Clock, Activity, Shield, AlertTriangle, CheckCircle, Lock, Trash2, Key } from 'lucide-react';

interface UserDetailsModalProps {
  userData: any;
  onClose: () => void;
  onAction: (action: string) => void;
}

export default function UserDetailsModal({ userData, onClose, onAction }: UserDetailsModalProps) {
  if (!userData) return null;

  const { user, activityLogs, sessions, navigationHistory } = userData;

  const parseDeviceInfo = (deviceInfo: any) => {
    if (!deviceInfo) return { type: 'Unknown', browser: 'Unknown', os: 'Unknown' };
    try {
      return typeof deviceInfo === 'string' ? JSON.parse(deviceInfo) : deviceInfo;
    } catch {
      return { type: 'Unknown', browser: 'Unknown', os: 'Unknown' };
    }
  };

  const parseLocationInfo = (locationInfo: any) => {
    if (!locationInfo) return { country: 'Unknown', city: 'Unknown', region: 'Unknown' };
    try {
      return typeof locationInfo === 'string' ? JSON.parse(locationInfo) : locationInfo;
    } catch {
      return { country: 'Unknown', city: 'Unknown', region: 'Unknown' };
    }
  };

  const deviceInfo = parseDeviceInfo(user.device_info);
  const locationInfo = parseLocationInfo(user.location_info);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'frozen': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'revoked': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-neutral-800 text-neutral-400 border-neutral-700';
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-6xl rounded-2xl overflow-hidden shadow-2xl my-8">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-black sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-sky-500/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-sky-400">{user.codename.slice(0,2).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                {user.codename.toUpperCase()}
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Member since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-neutral-500 hover:text-white p-2 rounded-full hover:bg-neutral-800 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Left Column - User Info & Stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-neutral-800/50 rounded-xl p-5 border border-neutral-700">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-400" />
                Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-400 text-sm">Total Activities</span>
                  <span className="font-bold text-white">{user.statistics?.totalActivities || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 text-sm">Active Days</span>
                  <span className="font-bold text-white">{user.statistics?.activeDays || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 text-sm">Avg Dwell Score</span>
                  <span className="font-bold text-white">{user.statistics?.avgDwellScore?.toFixed(1) || 0}</span>
                </div>
              </div>
            </div>

            {/* Device Information */}
            <div className="bg-neutral-800/50 rounded-xl p-5 border border-neutral-700">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-400" />
                Device Information
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-400 text-sm">Device Type</span>
                  <span className="font-medium text-white">{deviceInfo.type || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 text-sm">Browser</span>
                  <span className="font-medium text-white">{deviceInfo.browser || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 text-sm">Operating System</span>
                  <span className="font-medium text-white">{deviceInfo.os || 'Unknown'}</span>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-neutral-800/50 rounded-xl p-5 border border-neutral-700">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-400" />
                Location
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-400 text-sm">Country</span>
                  <span className="font-medium text-white">{locationInfo.country || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 text-sm">City</span>
                  <span className="font-medium text-white">{locationInfo.city || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 text-sm">Region</span>
                  <span className="font-medium text-white">{locationInfo.region || 'Unknown'}</span>
                </div>
                {user.last_ip_address && (
                  <div className="pt-3 border-t border-neutral-700">
                    <span className="text-neutral-400 text-sm">Last IP</span>
                    <p className="font-mono text-white text-sm mt-1">{user.last_ip_address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Actions */}
            <div className="bg-neutral-800/50 rounded-xl p-5 border border-neutral-700">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-400" />
                Admin Actions
              </h3>
              <div className="space-y-2">
                {user.status !== 'frozen' ? (
                  <button 
                    onClick={() => onAction('FREEZE')}
                    className="w-full py-2.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Freeze Account
                  </button>
                ) : (
                  <button 
                    onClick={() => onAction('UNFREEZE')}
                    className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Unfreeze Account
                  </button>
                )}
                
                {user.status !== 'revoked' ? (
                  <button 
                    onClick={() => onAction('REVOKE')}
                    className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Revoke Access
                  </button>
                ) : (
                  <button 
                    onClick={() => onAction('ALLOW')}
                    className="w-full py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Restore Access
                  </button>
                )}
                
                <button 
                  onClick={() => onAction('DELETE')}
                  className="w-full py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All Data
                </button>
              </div>
            </div>
          </div>

          {/* Middle Column - Sessions & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Sessions */}
            <div className="bg-neutral-800/50 rounded-xl border border-neutral-700 overflow-hidden">
              <div className="p-4 border-b border-neutral-700 bg-black">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Recent Sessions
                </h3>
              </div>
              <div className="divide-y divide-neutral-800 max-h-80 overflow-y-auto">
                {sessions.length > 0 ? (
                  sessions.map((session: any) => (
                    <div key={session.id} className="p-4 hover:bg-neutral-800/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${session.is_active ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`}></div>
                          <div>
                            <p className="font-medium text-white">
                              {session.browser || 'Unknown Browser'} • {session.os || 'Unknown OS'}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {new Date(session.session_start).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {session.city && (
                            <p className="text-sm text-neutral-300 flex items-center gap-1 justify-end">
                              <MapPin className="w-3 h-3" />
                              {session.city}, {session.country}
                            </p>
                          )}
                          <p className="text-xs text-neutral-500 mt-1">
                            IP: {session.ip_address || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-neutral-500">No session data available</div>
                )}
              </div>
            </div>

            {/* Activity Logs */}
            <div className="bg-neutral-800/50 rounded-xl border border-neutral-700 overflow-hidden">
              <div className="p-4 border-b border-neutral-700 bg-black">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  Recent Activity
                </h3>
              </div>
              <div className="divide-y divide-neutral-800 max-h-96 overflow-y-auto">
                {activityLogs.length > 0 ? (
                  activityLogs.map((log: any) => (
                    <div key={log.id} className="p-4 hover:bg-neutral-800/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
                            <Activity className="w-5 h-5 text-sky-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white capitalize">{log.action.replace('_', ' ')}</p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {new Date(log.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {log.dwell_score > 0 && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs font-medium border border-yellow-500/30">
                              Dwell: {log.dwell_score}
                            </span>
                          )}
                          <p className="text-xs text-neutral-500 mt-1 font-mono">
                            {log.ip_address || 'IP hidden'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-neutral-500">No activity logs available</div>
                )}
              </div>
            </div>

            {/* Navigation History */}
            <div className="bg-neutral-800/50 rounded-xl border border-neutral-700 overflow-hidden">
              <div className="p-4 border-b border-neutral-700 bg-black">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  Navigation History
                </h3>
              </div>
              <div className="divide-y divide-neutral-800 max-h-96 overflow-y-auto">
                {navigationHistory.length > 0 ? (
                  navigationHistory.map((nav: any) => (
                    <div key={nav.id} className="p-4 hover:bg-neutral-800/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-white">{nav.page_path}</p>
                          {nav.referrer && (
                            <p className="text-xs text-neutral-500 mt-1">From: {nav.referrer}</p>
                          )}
                          <p className="text-xs text-neutral-500 mt-1">
                            {new Date(nav.created_at).toLocaleString()}
                          </p>
                        </div>
                        {nav.time_spent && (
                          <div className="text-right">
                            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs font-medium border border-purple-500/30">
                              {nav.time_spent}s
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-neutral-500">No navigation history available</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
