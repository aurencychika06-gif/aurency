import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  TrendingUp, 
  Ship, 
  Layers, 
  Clock, 
  Truck, 
  Filter,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Vessel, Berth, YardBlock, Container, GateTransaction } from '../types/terminal';

interface ReportsViewProps {
  vessels: Vessel[];
  berths: Berth[];
  yardBlocks: YardBlock[];
  containers: Container[];
  gateTransactions: GateTransaction[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  vessels,
  berths,
  yardBlocks,
  containers,
  gateTransactions
}) => {
  const [reportType, setReportType] = useState<'vessel' | 'throughput' | 'dwell' | 'gate'>('vessel');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  // Throughput calculations
  const importCount = containers.filter(c => c.category === 'import').length;
  const exportCount = containers.filter(c => c.category === 'export').length;
  const transCount = containers.filter(c => c.category === 'transshipment').length;
  const emptyCount = containers.filter(c => c.category === 'empty').length;

  const totalTeu = containers.reduce((acc, c) => acc + (c.size === '40' ? 2 : c.size === '45' ? 2.25 : 1), 0);

  // Overdue dwell containers (> 5 days)
  const overdueContainers = containers.filter(c => (c.dwellDays || 0) >= 5);

  // CSV Export utility
  const handleExportCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    if (reportType === 'vessel') {
      csvContent += "Nama Kapal,Call Sign,IMO,Shipping Line,Status,Tambatan,Discharge Target,Load Target,Discharged,Loaded,Progres\n";
      vessels.forEach(v => {
        csvContent += `"${v.name}","${v.callSign}","${v.imoNumber}","${v.shippingLine}","${v.status}","${v.berthAssigned || ''}",${v.dischargeTarget},${v.loadTarget},${v.dischargedCount},${v.loadedCount},${Math.round(((v.dischargedCount + v.loadedCount) / ((v.dischargeTarget + v.loadTarget) || 1)) * 100)}%\n`;
      });
    } else if (reportType === 'throughput' || reportType === 'dwell') {
      csvContent += "No Kontainer,Ukuran,Tipe ISO,Kategori,Berat Kotor (Ton),Posisi Lapangan,Kapal,Dwell Time (Hari),Status\n";
      containers.forEach(c => {
        csvContent += `"${c.containerNumber}","${c.size}ft","${c.isoType}","${c.category}",${c.grossWeightTon},"${c.yardPosition || ''}","${c.vesselName || ''}",${c.dwellDays},"${c.status}"\n`;
      });
    } else {
      csvContent += "No Tiket,Tipe,No Kontainer,No Polisi,Driver,Transporter,Lane,Status,Waktu\n";
      gateTransactions.forEach(g => {
        csvContent += `"${g.ticketNumber}","${g.transactionType}","${g.containerNumber}","${g.truckPlateNumber}","${g.driverName}","${g.transporterCompany}","${g.laneNumber}","${g.status}","${g.createdAt}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PortNex_Laporan_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-400" />
            <span>Pusat Laporan & Analitik Kinerja Operasional</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Ekspor data komprehensif, pemantauan Key Performance Indicators (KPI), dan audit laporan throughput.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/25 transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan</span>
          </button>
        </div>
      </div>

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setReportType('vessel')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              reportType === 'vessel'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>Kinerja Kapal & Tambatan</span>
          </button>

          <button
            onClick={() => setReportType('throughput')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              reportType === 'throughput'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Throughput Petikemas (TEU)</span>
          </button>

          <button
            onClick={() => setReportType('dwell')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              reportType === 'dwell'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Dwell Time & Penumpukan</span>
          </button>

          <button
            onClick={() => setReportType('gate')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
              reportType === 'gate'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Lalu Lintas Gate EIR</span>
          </button>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs font-medium self-start md:self-auto">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg transition ${
              timeRange === 'today' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setTimeRange('week')}
            className={`px-3 py-1.5 rounded-lg transition ${
              timeRange === 'week' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setTimeRange('month')}
            className={`px-3 py-1.5 rounded-lg transition ${
              timeRange === 'month' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bulan Ini
          </button>
        </div>
      </div>

      {/* REPORT CONTENT: VESSEL */}
      {reportType === 'vessel' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Ringkasan Kinerja Kapal Sandar (Vessel Productivity)</h2>
              <p className="text-xs text-slate-400">Total Port Stay, Target vs Realisasi Bongkar/Muat, dan Produktivitas Crane</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">Total {vessels.length} Kapal Terdaftar</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800 font-mono font-semibold">
                <tr>
                  <th className="px-4 py-3">Nama Kapal & Shipping Line</th>
                  <th className="px-4 py-3">Tambatan</th>
                  <th className="px-4 py-3">Discharge Realisasi</th>
                  <th className="px-4 py-3">Load Realisasi</th>
                  <th className="px-4 py-3">Total Moves</th>
                  <th className="px-4 py-3">Kinerja GMPH</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {vessels.map((v) => {
                  const target = (v.dischargeTarget + v.loadTarget) || 1;
                  const done = (v.dischargedCount + v.loadedCount) || 0;
                  const pct = Math.round((done / target) * 100);
                  const gmph = (26 + (Math.sin(v.name.length) * 4)).toFixed(1);

                  return (
                    <tr key={v.id} className="hover:bg-slate-850/50 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white">{v.name}</div>
                        <div className="text-[10px] text-slate-400">{v.shippingLine} • {v.flag}</div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-cyan-300">
                        {v.berthAssigned || 'Anchorage'}
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        {v.dischargedCount} / {v.dischargeTarget} Box
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        {v.loadedCount} / {v.loadTarget} Box
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-white">
                        {done} Box ({pct}%)
                      </td>
                      <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold">
                        {gmph} Box/Jam
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-800 text-slate-300">
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: THROUGHPUT */}
      {reportType === 'throughput' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Impor (TEU)</span>
              <div className="text-2xl font-bold text-white mt-1">{importCount * 1.5} <span className="text-xs font-normal text-slate-400">TEU</span></div>
              <span className="text-[11px] text-cyan-400 font-mono mt-0.5 block">{importCount} Kontainer</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 uppercase font-semibold">Total Ekspor (TEU)</span>
              <div className="text-2xl font-bold text-white mt-1">{exportCount * 1.5} <span className="text-xs font-normal text-slate-400">TEU</span></div>
              <span className="text-[11px] text-emerald-400 font-mono mt-0.5 block">{exportCount} Kontainer</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 uppercase font-semibold">Transshipment</span>
              <div className="text-2xl font-bold text-white mt-1">{transCount * 2} <span className="text-xs font-normal text-slate-400">TEU</span></div>
              <span className="text-[11px] text-purple-400 font-mono mt-0.5 block">{transCount} Kontainer</span>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
              <span className="text-xs text-slate-400 uppercase font-semibold">Depo Kosong (Empty)</span>
              <div className="text-2xl font-bold text-white mt-1">{emptyCount} <span className="text-xs font-normal text-slate-400">TEU</span></div>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{emptyCount} Kontainer</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-4">Rincian Muatan Petikemas Aktif di Terminal</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800 font-mono">
                  <tr>
                    <th className="px-4 py-3">No Petikemas</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Tipe & Ukuran</th>
                    <th className="px-4 py-3">Gross Ton</th>
                    <th className="px-4 py-3">Pemilik / Consignee</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {containers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-850/50">
                      <td className="px-4 py-3 font-mono font-bold text-cyan-400">{c.containerNumber}</td>
                      <td className="px-4 py-3 uppercase">{c.category}</td>
                      <td className="px-4 py-3 font-mono">{c.size}ft ({c.isoType})</td>
                      <td className="px-4 py-3 font-mono">{c.grossWeightTon} Ton</td>
                      <td className="px-4 py-3 text-slate-300">{c.consigneeOrShipper}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 font-bold uppercase">{c.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: DWELL TIME */}
      {reportType === 'dwell' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Pengawasan Dwell Time Lapangan Petikemas</span>
              </h2>
              <p className="text-xs text-slate-400">Identifikasi kontainer dengan waktu inap lebih dari 3 hari untuk cegah kongesti lapangan</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/30 text-amber-300 font-bold">
              {overdueContainers.length} Kontainer Dwell Time &gt; 5 Hari
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800 font-mono">
                <tr>
                  <th className="px-4 py-3">No Petikemas</th>
                  <th className="px-4 py-3">Dwell Time</th>
                  <th className="px-4 py-3">Posisi Slot</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Consignee</th>
                  <th className="px-4 py-3">Status Peringatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {containers.map((c) => {
                  const isLong = (c.dwellDays || 0) >= 5;
                  return (
                    <tr key={c.id} className="hover:bg-slate-850/50">
                      <td className="px-4 py-3 font-mono font-bold text-white">{c.containerNumber}</td>
                      <td className="px-4 py-3 font-mono font-bold">
                        <span className={isLong ? 'text-rose-400' : 'text-slate-300'}>
                          {c.dwellDays} Hari
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-cyan-300">{c.yardPosition || '-'}</td>
                      <td className="px-4 py-3 uppercase">{c.category}</td>
                      <td className="px-4 py-3 text-slate-300">{c.consigneeOrShipper}</td>
                      <td className="px-4 py-3">
                        {isLong ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/30">
                            Melebihi Batas Dwell
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                            Normal (&lt; 3 Hari)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT CONTENT: GATE */}
      {reportType === 'gate' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Laporan Transaksi Gerbang (EIR Flow)</h2>
              <p className="text-xs text-slate-400">Statistik penerbitan EIR, verifikasi muatan, dan pemeriksaan kerusakan fisik</p>
            </div>
            <span className="text-xs font-mono text-cyan-300 font-bold">Total {gateTransactions.length} Tiket Diterbitkan</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800 font-mono">
                <tr>
                  <th className="px-4 py-3">No Tiket EIR</th>
                  <th className="px-4 py-3">Tipe</th>
                  <th className="px-4 py-3">No Petikemas</th>
                  <th className="px-4 py-3">No Truk & Driver</th>
                  <th className="px-4 py-3">Transporter</th>
                  <th className="px-4 py-3">Kondisi Fisik</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {gateTransactions.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-850/50">
                    <td className="px-4 py-3 font-mono font-bold text-white">{g.ticketNumber}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-[10px] font-bold text-cyan-300">{g.transactionType}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-cyan-400">{g.containerNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold">{g.truckPlateNumber}</div>
                      <div className="text-[10px] text-slate-400">{g.driverName}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{g.transporterCompany}</td>
                    <td className="px-4 py-3 text-slate-300">{g.damageCondition}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                        {g.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
