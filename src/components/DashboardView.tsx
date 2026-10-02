import React, { useState } from 'react';
import { 
  Ship, 
  Layers, 
  Activity, 
  Clock, 
  ArrowUpRight, 
  TrendingUp, 
  Anchor, 
  Zap, 
  AlertCircle, 
  Calendar,
  CheckCircle,
  Truck,
  Gauge,
  Maximize2
} from 'lucide-react';
import { Vessel, Berth, YardBlock, Container, GateTransaction } from '../types/terminal';

interface DashboardViewProps {
  vessels: Vessel[];
  berths: Berth[];
  yardBlocks: YardBlock[];
  containers: Container[];
  gateTransactions: GateTransaction[];
  onSelectVessel: (vessel: Vessel) => void;
  onNavigateToTab: (tab: 'master' | 'transaction' | 'tracking' | 'reports') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vessels,
  berths,
  yardBlocks,
  containers,
  gateTransactions,
  onSelectVessel,
  onNavigateToTab
}) => {
  const [selectedBerthFilter, setSelectedBerthFilter] = useState<string>('all');

  // KPI Calculations
  const totalContainers = containers.length;
  const inYardContainers = containers.filter(c => c.status === 'in_yard').length;
  const dischargingContainers = containers.filter(c => c.status === 'discharging').length;
  const loadingContainers = containers.filter(c => c.status === 'loading').length;
  
  // Total yard capacity vs current
  const totalYardCapacity = yardBlocks.reduce((acc, b) => acc + (b.capacityTeu || 0), 0) || 1;
  const totalYardCurrent = yardBlocks.reduce((acc, b) => acc + (b.currentTeu || 0), 0);
  const yardOccupancyRate = Math.round((totalYardCurrent / totalYardCapacity) * 100);

  // Berth occupancy rate (occupied / total berths)
  const totalBerths = berths.length || 1;
  const occupiedBerths = berths.filter(b => b.status === 'occupied').length;
  const berthOccupancyRate = Math.round((occupiedBerths / totalBerths) * 100);

  // Working & Anchorage vessels
  const workingVessels = vessels.filter(v => v.status === 'working' || v.status === 'berthing');
  const anchorageVessels = vessels.filter(v => v.status === 'anchorage');

  // Average dwell time
  const avgDwellTime = containers.length > 0 
    ? (containers.reduce((acc, c) => acc + (c.dwellDays || 0), 0) / containers.length).toFixed(1)
    : '2.4';

  return (
    <div className="space-y-6">
      {/* Top Banner with live operational summary */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-cyan-950/60 border border-slate-800 p-6 shadow-xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-950 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                LIVE REAL-TIME STREAM
              </span>
              <span className="text-xs text-slate-400">Terminal Operasional Petikemas Internasional & Domestik</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Pusat Komando Operasional Kapal & Lapangan
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Pemantauan terpusat produktivitas STS crane, tambatan dermaga kapal (Quay), kapasitas lapangan penumpukan (Yard), dan throughput peti kemas secara real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigateToTab('transaction')}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/25 transition flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>Input Bongkar/Muat Baru</span>
            </button>
            <button
              onClick={() => onNavigateToTab('tracking')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-2"
            >
              <Anchor className="w-4 h-4 text-cyan-400" />
              <span>Lacak Posisi Petikemas</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* BOR */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">BOR (Dermaga)</span>
            <Anchor className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{berthOccupancyRate}%</div>
          <div className="mt-1 text-[11px] text-cyan-300 flex items-center gap-1">
            <span>{occupiedBerths} dari {totalBerths} Tambatan Terisi</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                berthOccupancyRate > 80 ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${Math.min(berthOccupancyRate, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* YOR */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">YOR (Lapangan)</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{yardOccupancyRate}%</div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span>{totalYardCurrent.toLocaleString()} / {totalYardCapacity.toLocaleString()} TEU</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                yardOccupancyRate > 85 ? 'bg-rose-500' : yardOccupancyRate > 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(yardOccupancyRate, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* GMPH (Crane Moves) */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">GMPH Produktivitas</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">28.4 <span className="text-xs font-normal text-slate-400">B/C/H</span></div>
          <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Target 25 Box/Crane/Jam</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: '85%' }}></div>
          </div>
        </div>

        {/* Active Vessels */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Kapal Sandar</span>
            <Ship className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{workingVessels.length} <span className="text-xs font-normal text-slate-400">Kapal</span></div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span>{anchorageVessels.length} Labuh di Luar (Anchorage)</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="h-full rounded-full bg-blue-500" style={{ width: '70%' }}></div>
          </div>
        </div>

        {/* Dwell Time */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Avg Dwell Time</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{avgDwellTime} <span className="text-xs font-normal text-slate-400">Hari</span></div>
          <div className="mt-1 text-[11px] text-slate-400 flex items-center gap-1">
            <span>Standar Nasional &lt; 3.0 Hari</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="h-full rounded-full bg-purple-500" style={{ width: '60%' }}></div>
          </div>
        </div>

        {/* Gate Throughput */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl relative overflow-hidden group hover:border-cyan-500/50 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Transaksi Gate</span>
            <Truck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{gateTransactions.length} <span className="text-xs font-normal text-slate-400">Truk</span></div>
          <div className="mt-1 text-[11px] text-cyan-300 flex items-center gap-1">
            <span>EIR Digital Realtime</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="h-full rounded-full bg-cyan-500" style={{ width: '90%' }}></div>
          </div>
        </div>
      </div>

      {/* 2D Graphical Berth Plan & Quay View */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Ship className="w-5 h-5 text-cyan-400" />
              <span>Peta Grafis Dermaga Tambatan Kapal (Interactive Berth & Quay Plan)</span>
            </h2>
            <p className="text-xs text-slate-400">Visualisasi langsung kapal sandar, alokasi crane STS, dan progres bongkar/muat per tambatan</p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Working / Sandar
            </span>
            <span className="flex items-center gap-1.5 text-blue-400 font-medium bg-blue-950/60 px-2 py-1 rounded border border-blue-500/20">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Berthing / Manuver
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 font-medium bg-slate-800/60 px-2 py-1 rounded border border-slate-700">
              Tersedia
            </span>
          </div>
        </div>

        {/* Visual Berths Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {berths.map((berth) => {
            const currentVesselData = vessels.find(v => v.name === berth.currentVessel || v.berthAssigned?.includes(berth.code));
            const isOccupied = berth.status === 'occupied' && currentVesselData;
            
            const totalWork = currentVesselData 
              ? (currentVesselData.dischargeTarget + currentVesselData.loadTarget) || 1
              : 1;
            const completedWork = currentVesselData 
              ? (currentVesselData.dischargedCount + currentVesselData.loadedCount)
              : 0;
            const progressPct = Math.round((completedWork / totalWork) * 100);

            return (
              <div 
                key={berth.id}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  isOccupied
                    ? 'bg-slate-850/90 border-cyan-500/40 shadow-lg shadow-cyan-950/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Berth header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950 border border-cyan-500/30 text-cyan-300">
                      {berth.code}
                    </span>
                    <span className="text-xs font-medium text-slate-300">{berth.name}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    berth.status === 'occupied'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      : berth.status === 'available'
                      ? 'bg-slate-800 text-slate-300 border border-slate-700'
                      : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                  }`}>
                    {berth.status === 'occupied' ? 'Terisi' : berth.status === 'available' ? 'Tersedia' : 'Maintenance'}
                  </span>
                </div>

                {/* Berth specs */}
                <div className="text-[11px] text-slate-400 grid grid-cols-2 gap-1 mb-3 bg-slate-950/50 p-2 rounded-lg font-mono">
                  <div>Panjang: <span className="text-slate-200">{berth.lengthMeters} m</span></div>
                  <div>Kedalaman: <span className="text-slate-200">{berth.depthMeters} m</span></div>
                  <div className="col-span-2 text-cyan-400 truncate">Alat: {berth.cranesAssigned}</div>
                </div>

                {/* Docked Vessel Content */}
                {isOccupied && currentVesselData ? (
                  <div className="bg-gradient-to-br from-slate-900 to-cyan-950/40 border border-cyan-500/30 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Ship className="w-3.5 h-3.5 text-cyan-400" />
                        {currentVesselData.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{currentVesselData.flag}</span>
                    </div>

                    <div className="text-[11px] text-slate-300 mb-2">
                      <span className="text-slate-400">Agen:</span> {currentVesselData.shippingLine}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Bongkar / Muat</span>
                        <span className="text-cyan-300 font-mono font-bold">{completedWork} / {totalWork} Box ({progressPct}%)</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(progressPct, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Call Sign: <strong className="text-slate-200">{currentVesselData.callSign}</strong></span>
                      <button
                        onClick={() => onSelectVessel(currentVesselData)}
                        className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline"
                      >
                        Detail Kapal →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-lg p-5 text-center flex flex-col items-center justify-center text-slate-400 text-xs">
                    <Anchor className="w-6 h-6 text-slate-600 mb-1" />
                    <span>Tambatan Siap Sandar</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">Alokasi draft maksimum: {berth.maxDraft}m</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Lower Section: Yard Blocks & Active Vessel Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Yard Blocks Matrix (1 col) */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>Kapasitas Lapangan Penumpukan</span>
              </h2>
              <p className="text-xs text-slate-400">Blok Yard Impor, Ekspor, Reefer & Empty</p>
            </div>
            <button
              onClick={() => onNavigateToTab('master')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              Kelola Blok →
            </button>
          </div>

          <div className="space-y-3.5">
            {yardBlocks.map((block) => {
              const utilPct = Math.round(((block.currentTeu || 0) / (block.capacityTeu || 1)) * 100);
              const isHigh = utilPct > 85;
              const isMedium = utilPct > 70 && utilPct <= 85;

              return (
                <div key={block.id} className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-white">{block.code}</span>
                      <span className="text-xs text-slate-300 truncate max-w-[140px]">{block.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      isHigh ? 'bg-rose-950 text-rose-300 border border-rose-500/40' :
                      isMedium ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                      'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {utilPct}% Okupansi
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                    <div 
                      className={`h-full rounded-full ${
                        isHigh ? 'bg-rose-500' : isMedium ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(utilPct, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{block.currentTeu} / {block.capacityTeu} TEU</span>
                    <span className="text-slate-400">{block.equipmentAssigned}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vessel Schedule & Performance Table (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Ship className="w-5 h-5 text-blue-400" />
                <span>Jadwal & Kinerja Operasional Kapal (Vessel Port Stay)</span>
              </h2>
              <p className="text-xs text-slate-400">Status kapal berlabuh, sandar, dan progres penyelesaian muatan</p>
            </div>

            <button
              onClick={() => onNavigateToTab('master')}
              className="text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition border border-slate-700 self-start sm:self-auto"
            >
              + Tambah Jadwal Kapal
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/70 border-b border-slate-800 font-semibold font-mono">
                <tr>
                  <th className="px-3.5 py-2.5">Nama Kapal & Bendera</th>
                  <th className="px-3 py-2.5">Shipping Line</th>
                  <th className="px-3 py-2.5">Tambatan</th>
                  <th className="px-3 py-2.5">ETA / ETD</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Progres Bongkar/Muat</th>
                  <th className="px-3 py-2.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {vessels.map((vessel) => {
                  const total = (vessel.dischargeTarget + vessel.loadTarget) || 1;
                  const done = (vessel.dischargedCount + vessel.loadedCount) || 0;
                  const pct = Math.round((done / total) * 100);

                  return (
                    <tr key={vessel.id} className="hover:bg-slate-850/50 transition">
                      <td className="px-3.5 py-3">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          {vessel.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          CS: {vessel.callSign} • IMO: {vessel.imoNumber} • {vessel.flag}
                        </div>
                      </td>

                      <td className="px-3 py-3 text-slate-300">
                        {vessel.shippingLine}
                      </td>

                      <td className="px-3 py-3">
                        <span className="font-mono text-cyan-300 bg-cyan-950/70 px-2 py-0.5 rounded text-[11px] border border-cyan-500/30">
                          {vessel.berthAssigned || 'Anchorage'}
                        </span>
                      </td>

                      <td className="px-3 py-3 font-mono text-[11px] text-slate-300">
                        <div>ETA: {new Date(vessel.eta).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-slate-400">ETD: {new Date(vessel.etd).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          vessel.status === 'working' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                          vessel.status === 'berthing' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' :
                          vessel.status === 'anchorage' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                          vessel.status === 'completed' ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {vessel.status}
                        </span>
                      </td>

                      <td className="px-3 py-3 min-w-[130px]">
                        <div className="flex items-center justify-between text-[10px] mb-1">
                          <span className="text-slate-400">{done}/{total}</span>
                          <span className="font-mono font-bold text-cyan-400">{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-cyan-500 rounded-full"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          ></div>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-right">
                        <button
                          onClick={() => onSelectVessel(vessel)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-xs transition border border-slate-700"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
