import React from 'react';
import { 
  Ship, 
  X, 
  Anchor, 
  Layers, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Vessel, Container } from '../types/terminal';
import { updateVessel } from '../services/firebase';

interface VesselDetailModalProps {
  vessel: Vessel | null;
  onClose: () => void;
  containers: Container[];
  userName: string;
}

export const VesselDetailModal: React.FC<VesselDetailModalProps> = ({
  vessel,
  onClose,
  containers,
  userName
}) => {
  if (!vessel) return null;

  const vesselContainers = containers.filter(c => c.vesselName === vessel.name);
  const totalTarget = (vessel.dischargeTarget + vessel.loadTarget) || 1;
  const totalCompleted = (vessel.dischargedCount + vessel.loadedCount) || 0;
  const progressPct = Math.round((totalCompleted / totalTarget) * 100);

  const handleUpdateStatus = async (newStatus: Vessel['status']) => {
    try {
      await updateVessel(vessel.id, { status: newStatus }, userName);
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui status kapal.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
              <Ship className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{vessel.name}</h2>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-slate-300">
                  {vessel.flag}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Shipping Line: <strong className="text-slate-200">{vessel.shippingLine}</strong> • Call Sign: <span className="font-mono text-cyan-300">{vessel.callSign}</span> • IMO: <span className="font-mono text-slate-300">{vessel.imoNumber}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress & Status Bar */}
        <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl mb-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Status Operasi Kapal:</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                {vessel.status}
              </span>
            </div>

            {/* Quick Status Buttons */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 text-[11px] mr-1">Ubah Status:</span>
              <button
                onClick={() => handleUpdateStatus('berthing')}
                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] transition"
              >
                Berthing
              </button>
              <button
                onClick={() => handleUpdateStatus('working')}
                className="px-2 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded text-[11px] border border-emerald-500/40 transition"
              >
                Working
              </button>
              <button
                onClick={() => handleUpdateStatus('completed')}
                className="px-2 py-1 bg-blue-950 hover:bg-blue-900 text-blue-300 rounded text-[11px] border border-blue-500/40 transition"
              >
                Completed
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1 font-mono">
              <span>Progres Bongkar & Muat ({totalCompleted} / {totalTarget} Box)</span>
              <span className="font-bold text-cyan-400">{progressPct}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                style={{ width: `${Math.min(progressPct, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono mb-5">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Tambatan Dermaga</span>
            <span className="font-bold text-cyan-300 text-sm">{vessel.berthAssigned || 'Anchorage'}</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Dimensi (LOA × Beam)</span>
            <span className="font-bold text-white text-sm">{vessel.loa}m × {vessel.beam}m</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Draft Kapal</span>
            <span className="font-bold text-white text-sm">{vessel.draft} Meter</span>
          </div>

          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Kapasitas Maksimal</span>
            <span className="font-bold text-white text-sm">{vessel.capacityTeu.toLocaleString()} TEU</span>
          </div>
        </div>

        {/* Manifest Containers on this vessel */}
        <div>
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Daftar Petikemas Manifest Kapal Ini ({vesselContainers.length} Box)</span>
          </h3>

          <div className="border border-slate-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
            {vesselContainers.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Belum ada petikemas yang dialokasikan ke kapal ini. Tambahkan melalui menu Transaksi.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] text-slate-400 uppercase bg-slate-950 font-mono">
                  <tr>
                    <th className="px-3 py-2">No Petikemas</th>
                    <th className="px-3 py-2">Ukuran</th>
                    <th className="px-3 py-2">Kategori</th>
                    <th className="px-3 py-2">Posisi Slot</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {vesselContainers.map(c => (
                    <tr key={c.id} className="hover:bg-slate-850/50">
                      <td className="px-3 py-2 font-mono font-bold text-cyan-400">{c.containerNumber}</td>
                      <td className="px-3 py-2 font-mono">{c.size}ft ({c.isoType})</td>
                      <td className="px-3 py-2 uppercase">{c.category}</td>
                      <td className="px-3 py-2 font-mono text-slate-300">{c.yardPosition || 'Quay'}</td>
                      <td className="px-3 py-2">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 uppercase">{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
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
