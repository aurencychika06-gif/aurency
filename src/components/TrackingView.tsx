import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Container as ContainerIcon, 
  Ship, 
  Truck, 
  Anchor, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Layers, 
  FileText, 
  ArrowRight,
  Thermometer,
  AlertTriangle,
  History,
  QrCode
} from 'lucide-react';
import { Container, GateTransaction, Vessel, AuditLog } from '../types/terminal';

interface TrackingViewProps {
  containers: Container[];
  gateTransactions: GateTransaction[];
  vessels: Vessel[];
  auditLogs: AuditLog[];
  initialSearchNumber?: string;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  containers,
  gateTransactions,
  vessels,
  auditLogs,
  initialSearchNumber
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchNumber || (containers[0]?.containerNumber || 'MSKU9281724'));
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);

  useEffect(() => {
    if (initialSearchNumber) {
      setSearchTerm(initialSearchNumber);
    }
  }, [initialSearchNumber]);

  useEffect(() => {
    if (!searchTerm.trim()) return;
    const found = containers.find(c => 
      c.containerNumber.toLowerCase() === searchTerm.trim().toLowerCase()
    );
    if (found) {
      setSelectedContainer(found);
    } else if (containers.length > 0 && !selectedContainer) {
      setSelectedContainer(containers[0]);
    }
  }, [searchTerm, containers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = containers.find(c => 
      c.containerNumber.toLowerCase() === searchTerm.trim().toLowerCase()
    );
    if (found) {
      setSelectedContainer(found);
    } else {
      alert(`Kontainer dengan nomor "${searchTerm}" tidak ditemukan.`);
    }
  };

  // Find related gate transaction
  const relatedGate = selectedContainer 
    ? gateTransactions.find(g => g.containerNumber === selectedContainer.containerNumber)
    : null;

  // Find related vessel
  const relatedVessel = selectedContainer
    ? vessels.find(v => v.name === selectedContainer.vesselName)
    : null;

  // Filter logs related to this container
  const containerLogs = selectedContainer
    ? auditLogs.filter(log => 
        log.details.includes(selectedContainer.containerNumber) || 
        log.entityName === selectedContainer.containerNumber
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Top Banner & Search Form */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Search className="w-6 h-6 text-cyan-400" />
              <span>Pelacakan Histori Petikemas Real-Time</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Telusuri riwayat pergerakan lengkap petikemas dari kapal sandar, penumpukan di blok lapangan, hingga gerbang gate-out.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-slate-400">Contoh Cepat:</span>
            {containers.slice(0, 3).map(c => (
              <button
                key={c.id}
                onClick={() => {
                  setSearchTerm(c.containerNumber);
                  setSelectedContainer(c);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition border ${
                  selectedContainer?.containerNumber === c.containerNumber
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-300 border-slate-700'
                }`}
              >
                {c.containerNumber}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <ContainerIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              required
              placeholder="Masukkan nomor petikemas ISO (contoh: MSKU9281724)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono uppercase placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-600/30 transition flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            <span>Lacak Posisi</span>
          </button>
        </form>
      </div>

      {selectedContainer ? (
        <div className="space-y-6">
          {/* Main Info Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
                  <ContainerIcon className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-mono font-extrabold text-white tracking-wider">
                      {selectedContainer.containerNumber}
                    </h2>
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-200 border border-slate-700">
                      {selectedContainer.size}ft • {selectedContainer.isoType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Shipper / Consignee: <strong className="text-slate-200">{selectedContainer.consigneeOrShipper}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                  <span className="text-slate-400 mr-1.5">Kategori:</span>
                  <strong className="text-white uppercase">{selectedContainer.category}</strong>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                  <span className="text-slate-400 mr-1.5">Berat Kotor:</span>
                  <strong className="text-white font-mono">{selectedContainer.grossWeightTon} Ton</strong>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                  <span className="text-slate-400 mr-1.5">Posisi Saat Ini:</span>
                  <strong className="font-mono text-cyan-200">{selectedContainer.yardPosition || 'Quay / Transfer'}</strong>
                </div>
              </div>
            </div>

            {/* Lifecycle Stepper / Journey Timeline */}
            <div className="py-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Tahapan Siklus Pergerakan Petikemas (Container Life Cycle)</span>
              </h3>

              <div className="relative">
                {/* Connecting Line */}
                <div className="hidden md:block absolute top-1/2 left-6 right-6 h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative z-10">
                  {/* Step 1: Vessel Arrival */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-2 shadow-md">
                      <Ship className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white">1. Kapal Sandar</span>
                    <span className="text-[10px] text-slate-400 mt-1">{selectedContainer.vesselName || 'Vessel Port Call'}</span>
                    <span className="text-[9px] text-emerald-400 font-mono mt-1">SELESAI</span>
                  </div>

                  {/* Step 2: STS Discharge / Quay */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mb-2 shadow-md">
                      <Anchor className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-white">2. Bongkar Crane STS</span>
                    <span className="text-[10px] text-slate-400 mt-1">Quay Crane STS-01/02</span>
                    <span className="text-[9px] text-emerald-400 font-mono mt-1">SELESAI</span>
                  </div>

                  {/* Step 3: Yard Stacking */}
                  <div className="bg-slate-950/80 border border-cyan-500/50 p-4 rounded-xl text-center flex flex-col items-center shadow-lg shadow-cyan-950/40">
                    <div className="w-10 h-10 rounded-full bg-cyan-950 border border-cyan-500/60 text-cyan-400 flex items-center justify-center mb-2 shadow-md animate-pulse">
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-cyan-200">3. Penumpukan Lapangan</span>
                    <span className="text-[10px] text-slate-300 font-mono mt-1">Slot: {selectedContainer.yardPosition || 'A-02'}</span>
                    <span className="text-[9px] text-cyan-400 font-mono mt-1">POSISI AKTIF</span>
                  </div>

                  {/* Step 4: Inspection & Customs */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-center mb-2 shadow-md">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-300">4. Bea Cukai / Kliring</span>
                    <span className="text-[10px] text-slate-400 mt-1">Seal: {selectedContainer.sealNumber}</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-1">INSPEKSI VALID</span>
                  </div>

                  {/* Step 5: Gate Out Delivery */}
                  <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-center flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 text-slate-400 flex items-center justify-center mb-2 shadow-md">
                      <Truck className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-300">5. Gerbang Gate-Out</span>
                    <span className="text-[10px] text-slate-400 mt-1">{relatedGate ? relatedGate.truckPlateNumber : 'Menunggu Truk'}</span>
                    <span className={`text-[9px] font-mono mt-1 ${relatedGate?.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {relatedGate?.status === 'approved' ? 'EIR DITERBITKAN' : 'MENUNGGU PICKUP'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Audit Trail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Specs card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Spesifikasi Fisik & Keamanan</span>
              </h3>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Nomor Segel (Seal):</span>
                  <span className="font-bold text-cyan-300">{selectedContainer.sealNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Dwell Time (Hari):</span>
                  <span className="font-bold text-white">{selectedContainer.dwellDays} Hari</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Kapal Pengangkut:</span>
                  <span className="text-slate-200">{selectedContainer.vesselName || '-'}</span>
                </div>
                {selectedContainer.temperature !== undefined && (
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="text-slate-400">Monitoring Suhu Reefer:</span>
                    <span className="font-bold text-cyan-400">{selectedContainer.temperature}°C</span>
                  </div>
                )}
                {selectedContainer.hazardousClass && (
                  <div className="flex justify-between py-1.5 border-b border-slate-800 text-rose-300">
                    <span className="text-slate-400">Klasifikasi B3 (Hazmat):</span>
                    <span className="font-bold">{selectedContainer.hazardousClass}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Status Database:</span>
                  <span className="text-emerald-400 font-bold">Tersinkronisasi Online</span>
                </div>
              </div>
            </div>

            {/* Audit Log history for this container */}
            <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <History className="w-4 h-4 text-amber-400" />
                <span>Histori Log Aktivitas & Perubahan Posisi Petikemas</span>
              </h3>

              {containerLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl">
                  <span>Belum ada log pergerakan baru untuk petikemas ini. Seluruh aksi Create/Update akan tercatat otomatis.</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {containerLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{log.action} - {log.module}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(log.timestamp).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1 text-[11px]">{log.details}</p>
                        <span className="text-[10px] text-slate-500 mt-0.5 block font-mono">
                          Operator: {log.performedBy}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
