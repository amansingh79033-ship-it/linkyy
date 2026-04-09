import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Trash2, Send, History, X, Lock, Unlock, AlertTriangle, Loader2, CheckCircle, Eye, Key, RefreshCw } from 'lucide-react';
import UserDetailsModal from './UserDetailsModal';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Modals state
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [showMessageBox, setShowMessageBox] = useState(false);
  const [messageTarget, setMessageTarget] = useState<string>('ALL'); // 'ALL' or codename
  const [messageText, setMessageText] = useState('');
  const [messageStatus, setMessageStatus] = useState<string | null>(null);

  // User details modal state
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userDetailsData, setUserDetailsData] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin-data');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error("Failed to fetch users from DB:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (codename: string, action: 'FREEZE' | 'UNFREEZE' | 'REVOKE' | 'DELETE') => {
    if (action === 'DELETE' && !window.confirm(`Are you sure you want to permanently delete user ${codename}?`)) return;

    try {
      const res = await fetch('/api/manage-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, codename })
      });
      if (res.ok) {
        fetchUsers(); // Refresh list
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleViewHistory = async (codename: string) => {
    setSelectedUser(codename);
    setHistoryData([]);
    setShowHistoryModal(true);
    setHistoryLoading(true);

    try {
      const res = await fetch(`/api/user-info?codename=${encodeURIComponent(codename)}`);
      if (res.ok) setHistoryData(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleViewDetails = async (codename: string) => {
    setSelectedUser(codename);
    setUserDetailsData(null);
    setShowUserDetails(true);
    setDetailsLoading(true);

    try {
      const res = await fetch(`/api/user-info?codename=${encodeURIComponent(codename)}`);
      if (res.ok) {
        const data = await res.json();
        setUserDetailsData(data);
      }
    } catch (e) {
      console.error("Failed to fetch user details:", e);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleUserAction = async (action: 'FREEZE' | 'UNFREEZE' | 'REVOKE' | 'ALLOW' | 'DELETE') => {
    if (!selectedUser) return;
    
    if (action === 'DELETE' && !window.confirm(`Are you sure you want to permanently delete all data for ${selectedUser}? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch('/api/manage-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, codename: selectedUser })
      });
      
      if (res.ok) {
        setShowUserDetails(false);
        fetchUsers(); // Refresh list
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setMessageStatus('sending');

    try {
      const res = await fetch('/api/admin-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetCodename: messageTarget,
          messageText
        })
      });
      if (res.ok) {
        setMessageStatus('success');
        setMessageText('');
        setTimeout(() => {
          setMessageStatus(null);
          setShowMessageBox(false);
        }, 1500);
      }
    } catch (e) {
      setMessageStatus('error');
      setTimeout(() => setMessageStatus(null), 2000);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2 text-sky-400">
          <Shield className="w-5 h-5" />
          Access & Content Control
        </h2>
        <button 
          onClick={() => { setMessageTarget('ALL'); setShowMessageBox(true); }}
          className="bg-sky-500 hover:bg-sky-400 text-black px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <Send className="w-4 h-4" />
          Broadcast to All
        </button>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-sky-400 animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-800/50">
                  <th className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">User / ID</th>
                  <th className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Activity</th>
                  <th className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Last Active</th>
                  <th className="p-4 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {users.map(u => (
                  <tr key={u.codename} className="hover:bg-neutral-800/20 transition-colors group">
                    <td className="p-4">
                      <div className="font-medium text-white">{u.codename}</div>
                      <div className="text-xs text-neutral-500">Joined: {new Date(u.created_at).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4">
                      {u.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : u.status === 'frozen' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Lock className="w-3 h-3" /> Frozen
                        </span>
                      ) : u.status === 'revoked' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                          <Key className="w-3 h-3" /> Revoked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-700 text-neutral-400 border border-neutral-600">
                          Unknown
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-neutral-300">
                      {u.total_activities} interactions
                    </td>
                    <td className="p-4 text-sm text-neutral-400">
                      {new Date(u.last_active).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleViewDetails(u.codename)}
                          className="p-1.5 bg-sky-500/20 hover:bg-sky-500 hover:text-black rounded text-sky-400 transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { setMessageTarget(u.codename); setShowMessageBox(true); }}
                          className="p-1.5 bg-neutral-800 hover:bg-sky-500 hover:text-black rounded text-neutral-400 transition-colors" title="Message User">
                          <Send className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleViewHistory(u.codename)}
                          className="p-1.5 bg-neutral-800 hover:bg-white hover:text-black rounded text-neutral-400 transition-colors" title="View History">
                          <History className="w-4 h-4" />
                        </button>
                        
                        {u.status === 'active' ? (
                          <button 
                            onClick={() => handleAction(u.codename, 'FREEZE')}
                            className="p-1.5 bg-neutral-800 hover:bg-amber-500 hover:text-black rounded text-neutral-400 transition-colors" title="Freeze Account">
                            <Lock className="w-4 h-4" />
                          </button>
                        ) : u.status === 'frozen' ? (
                          <button 
                            onClick={() => handleAction(u.codename, 'UNFREEZE')}
                            className="p-1.5 bg-neutral-800 hover:bg-emerald-500 hover:text-black rounded text-neutral-400 transition-colors" title="Unfreeze Account">
                            <Unlock className="w-4 h-4" />
                          </button>
                        ) : null}
                        
                        {u.status !== 'revoked' && (
                          <button 
                            onClick={() => handleAction(u.codename, 'REVOKE')}
                            className="p-1.5 bg-neutral-800 hover:bg-red-500 hover:text-black rounded text-neutral-400 transition-colors" title="Revoke Access">
                            <Key className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button 
                          onClick={() => handleAction(u.codename, 'DELETE')}
                          className="p-1.5 bg-neutral-800 hover:bg-red-500 hover:text-black rounded text-neutral-400 transition-colors" title="Purge Data">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-500">No registered users in PostgreSQL database.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col max-h-[80vh] shadow-2xl">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-black">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-sky-400" />
                Audit Log: <span className="text-sky-400">{selectedUser}</span>
              </h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-neutral-500 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {historyLoading ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-6 h-6 text-sky-400 animate-spin" /></div>
              ) : (
                <div className="space-y-3">
                  {historyData.map((log, i) => (
                    <div key={i} className="p-3 bg-neutral-800/30 rounded-lg flex items-center justify-between border border-neutral-800/50">
                      <div>
                        <div className="font-semibold text-white capitalize">{log.action.replace('_', ' ')}</div>
                        <div className="text-xs text-neutral-500 mt-1 flex gap-3">
                          <span>{new Date(log.created_at).toLocaleString()}</span>
                          {log.ip_address && <span>IP: {log.ip_address}</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        {log.dwell_score > 0 && (
                          <span className="text-xs font-mono bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">Score: {log.dwell_score}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {historyData.length === 0 && <p className="text-center text-neutral-500 py-8">No specific history recorded.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Send Message Modal */}
      {showMessageBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-black">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-sky-400" />
                {messageTarget === 'ALL' ? 'Broadcast Message' : `Message ${messageTarget}`}
              </h3>
              <button 
                onClick={() => { setShowMessageBox(false); setMessageStatus(null); setMessageText(''); }} 
                className="text-neutral-500 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2 block">Message Content (5 sec duration)</label>
                <textarea 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="e.g. System undergoing maintenance in 5 minutes..."
                  className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-white focus:border-sky-400 outline-none resize-none h-24"
                />
              </div>

              {messageStatus === 'success' && (
                <div className="bg-emerald-500/10 text-emerald-400 text-sm p-3 rounded-lg border border-emerald-500/20 text-center">
                  Message sent successfully!
                </div>
              )}

              {messageStatus === 'error' && (
                <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg border border-red-500/20 text-center flex items-center justify-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Failed to relay message
                </div>
              )}

              <button 
                onClick={handleSendMessage}
                disabled={!messageText.trim() || messageStatus === 'sending'}
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-black font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {messageStatus === 'sending' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Blast Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserDetails && (
        <UserDetailsModal
          userData={userDetailsData}
          onClose={() => { setShowUserDetails(false); setSelectedUser(null); }}
          onAction={handleUserAction}
        />
      )}
    </div>
  );
}
