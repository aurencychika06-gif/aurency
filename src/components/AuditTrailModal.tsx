import React, { useState } from 'react';
import { 
  Activity, 
  X, 
  Search, 
  Clock, 
  User, 
  Layers, 
  Filter,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AuditLog } from '../types/terminal';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLog[];
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  auditLogs
}) => {
  const [filterModule, setFilterModule] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter(log => {
    const matchMod = filterModule === 'all' || log.module.toLowerCase().includes(filterModule.toLowerCase());
    const matchSearch = 
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(search.toLowerCase());
    return matchMod && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Histori Audit Trail & Pelacakan Sistem</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {auditLogs.length} Entri
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Pencatatan real-time seluruh aktivitas Create, Update, Delete, dan pergerakan peti kemas di terminal.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <select
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="all">Semua Modul</option>
              <option value="Master Kapal">Master Kapal</option>
              <option value="Master Dermaga">Master Dermaga</option>
              <option value="Master Lapangan">Master Lapangan</option>
              <option value="Data Kontainer">Data Kontainer</option>
              <option value="Transaksi Gate">Transaksi Gate (EIR)</option>
              <option value="Core Database">Core Database</option>
            </select>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari aktivitas atau operator..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden max-h-[460px] overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 uppercase bg-slate-950 border-b border-slate-800 font-mono sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3">Waktu & Tanggal</th>
                <th className="px-4 py-3">Aksi</th>
                <th className="px-4 py-3">Modul</th>
                <th className="px-4 py-3">Rincian Perubahan</th>
                <th className="px-4 py-3">Petugas / Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    Tidak ada catatan audit yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        log.action === 'CREATE' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                        log.action === 'UPDATE' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' :
                        log.action === 'DELETE' ? 'bg-rose-950 text-rose-300 border border-rose-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-cyan-300 font-medium whitespace-nowrap">
                      {log.module}
                    </td>
                    <td className="px-4 py-3 text-slate-200 max-w-sm">
                      {log.details}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {log.performedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit trail terkunci dan disimpan langsung di Google Cloud Firestore</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
