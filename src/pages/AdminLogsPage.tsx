import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, Activity, Clock, ShieldAlert } from 'lucide-react';

interface AdminLog {
  id: number;
  admin_email: string;
  action: string;
  entity: string;
  entity_id: number | null;
  details: string;
  created_at: string;
}

export default function AdminLogsPage() {
  const { logout, token } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'UPDATE': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'DELETE': return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
      case 'LOGIN': return 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#F8FAFC] font-sans flex flex-col relative">
      {/* Top Navigation / Brand Bar */}
      <header className="h-16 border-b border-[#2D323C] bg-[#1A1D23] px-8 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C2A35D] rounded flex items-center justify-center font-bold text-black">N</div>
          <h1 className="text-xl font-semibold tracking-tight">Norma <span className="text-[#94A3B8] font-normal text-sm ml-2 hidden sm:inline">Admin System</span></h1>
        </div>
        <div className="flex gap-4 items-center">
          <div className="px-3 py-1 bg-[#2D323C] rounded-full text-xs text-[#94A3B8] uppercase tracking-wider hidden sm:block">Admin</div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C2A35D] to-[#E5C170]"></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Nav */}
        <nav className="w-64 border-r border-[#2D323C] bg-[#14171C] p-6 hidden md:flex flex-col gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#4B5563] uppercase tracking-widest px-2 mb-2 block">Menu Management</label>
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-[#94A3B8] hover:text-white transition-colors"
            >
              Menu Data
            </button>
            <button 
              onClick={() => navigate('/admin/qr-codes')}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-[#94A3B8] hover:text-white transition-colors"
            >
              Table QR Codes
            </button>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[#4B5563] uppercase tracking-widest px-2 mb-2 block">System</label>
            <button 
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-left text-[#C2A35D] bg-[#C2A35D15] rounded-md font-medium"
            >
              Audit Logs
            </button>
          </div>
          
          <div className="mt-auto space-y-4">
            <div className="p-4 bg-[#1A1D23] border border-[#2D323C] rounded-lg">
              <p className="text-xs text-[#94A3B8] mb-2">System Status</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-[11px] font-mono text-[#94A3B8]">Connected</span>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start text-[#94A3B8] hover:text-white hover:bg-[#2D323C] h-9 px-3" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </Button>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#0F1115]">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Activity className="w-6 h-6 text-[#C2A35D]" /> Audit Logs
              </h2>
              <p className="text-[#94A3B8] text-sm mt-1">Review system activities and changes made by administrators.</p>
            </div>

            <div className="bg-[#1A1D23] rounded-xl border border-[#2D323C] overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-[#94A3B8]">Loading logs...</div>
              ) : logs.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center space-y-3">
                  <ShieldAlert className="w-12 h-12 text-[#2D323C]" />
                  <p className="text-[#94A3B8]">No audit logs found.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#2D323C]">
                  {logs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-[#2D323C30] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-start gap-4">
                        <div className="mt-1">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wider ${getActionColor(log.action)}`}>
                            {log.action}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#F8FAFC]">
                            {log.details || `${log.action} ${log.entity}`}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-[#94A3B8]">
                            <span className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full bg-[#2D323C] flex items-center justify-center text-[8px] text-white">
                                {log.admin_email.charAt(0).toUpperCase()}
                              </div>
                              {log.admin_email}
                            </span>
                            {log.entity_id && (
                              <span className="text-[#4B5563] font-mono border border-[#2D323C] px-1.5 rounded bg-[#0F1115]">
                                ID: {log.entity_id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-[#4B5563] font-mono bg-[#0F1115] border border-[#2D323C] px-2 py-1 rounded shrink-0 self-start sm:self-auto">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
