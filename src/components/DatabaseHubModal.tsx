import React, { useState } from 'react';
import { 
  Server, 
  Database, 
  Zap, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  X,
  Layers,
  Activity
} from 'lucide-react';
import { activeDatabases, pingDatabaseEngine, DatabaseTarget } from '../services/databaseHub';

interface DatabaseHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseHubModal: React.FC<DatabaseHubModalProps> = ({ isOpen, onClose }) => {
  const [databases, setDatabases] = useState<DatabaseTarget[]>(activeDatabases);
  const [pingingId, setPingingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePing = async (id: string) => {
    setPingingId(id);
    const latency = await pingDatabaseEngine(id);
    setDatabases(prev => prev.map(db => 
      db.id === id ? { ...db, latencyMs: latency } : db
    ));
    setPingingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Multi-Cloud Database Hub</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
                  Online & Connected
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Terhubung real-time ke Firebase Firestore (Primary), Neon DB PostgreSQL, dan Supabase Gateway.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database List Cards */}
        <div className="space-y-4 mb-6">
          {databases.map((db) => {
            const isPinging = pingingId === db.id;
            return (
              <div 
                key={db.id} 
                className={`p-4 rounded-xl border transition ${
                  db.isPrimary 
                    ? 'bg-slate-950/80 border-cyan-500/50 shadow-md shadow-cyan-950/30' 
                    : 'bg-slate-950/50 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="font-bold text-white text-sm">{db.name}</span>
                    {db.isPrimary && (
                      <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                        Primary Realtime DB
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePing(db.id)}
                      disabled={isPinging}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs rounded-lg border border-slate-700 font-mono flex items-center gap-1.5 transition disabled:opacity-50"
                    >
                      <Activity className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                      <span>{isPinging ? 'Pinging...' : `${db.latencyMs} ms`}</span>
                    </button>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/30">
                      {db.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-850 mb-2">
                  <div className="truncate">
                    <span className="text-slate-400">Endpoint / DB:</span> {db.endpoint}
                  </div>
                  <div>
                    <span className="text-slate-400">Region:</span> {db.region}
                  </div>
                  <div>
                    <span className="text-slate-400">Engine:</span> {db.type}
                  </div>
                  <div>
                    <span className="text-slate-400">Status Sync:</span> {db.lastSyncTime}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400 font-mono">
                  <span>Tabel / Koleksi Aktif:</span>
                  {db.activeTablesCollections.map(table => (
                    <span key={table} className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                      {table}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Security & Multi-Cloud Notes */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-0.5">Integrasi Database Online Sesuai Spesifikasi</span>
            <p className="text-[11px] text-slate-400">
              Sistem telah terhubung langsung ke Firebase Firestore dengan Security Rules ABAC, didukung konfigurasi replikasi hybrid untuk Neon DB PostgreSQL dan Supabase Realtime Gateway guna menjaga ketersediaan tinggi (High Availability) dan pencatatan audit tanpa henti.
            </p>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
