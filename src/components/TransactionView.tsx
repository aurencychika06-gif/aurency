import React, { useState } from 'react';
import { 
  ArrowLeftRight, 
  Truck, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  X, 
  Printer, 
  MoveRight, 
  Check, 
  ShieldCheck, 
  Clock,
  Thermometer,
  Layers,
  Ship,
  Sparkles
} from 'lucide-react';
import { 
  Container, 
  GateTransaction, 
  Vessel, 
  YardBlock, 
  AppUser,
  ContainerStatus,
  ContainerLocation,
  ContainerCategory,
  ContainerSize
} from '../types/terminal';
import { 
  createContainer, 
  updateContainer, 
  deleteContainer, 
  createGateTransaction, 
  updateGateTransaction, 
  deleteGateTransaction 
} from '../services/firebase';

interface TransactionViewProps {
  containers: Container[];
  gateTransactions: GateTransaction[];
  vessels: Vessel[];
  yardBlocks: YardBlock[];
  currentUser: AppUser | null;
  onOpenTracking: (containerNumber: string) => void;
}

export const TransactionView: React.FC<TransactionViewProps> = ({
  containers,
  gateTransactions,
  vessels,
  yardBlocks,
  currentUser,
  onOpenTracking
}) => {
  const [subTab, setSubTab] = useState<'containers' | 'gate'>('containers');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals state
  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false);
  const [editingContainer, setEditingContainer] = useState<Container | null>(null);

  const [isGateModalOpen, setIsGateModalOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<GateTransaction | null>(null);

  const [eirModalTx, setEirModalTx] = useState<GateTransaction | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'container' | 'gate';
    id: string;
    identifier: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);

  // Container Form State
  const [containerForm, setContainerForm] = useState({
    containerNumber: '',
    isoType: '40HC',
    size: '40' as ContainerSize,
    category: 'import' as ContainerCategory,
    grossWeightTon: 24.5,
    sealNumber: 'SL-889123',
    vesselName: vessels[0]?.name || '',
    locationType: 'yard' as ContainerLocation,
    yardPosition: 'A-02-03-2',
    temperature: -18,
    hazardousClass: '',
    consigneeOrShipper: '',
    status: 'in_yard' as ContainerStatus
  });

  // Gate Transaction Form State
  const [gateForm, setGateForm] = useState({
    ticketNumber: `EIR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
    transactionType: 'GATE_IN' as GateTransaction['transactionType'],
    containerNumber: '',
    truckPlateNumber: '',
    driverName: '',
    transporterCompany: 'PT Samudera Logistik Indonesia',
    eirNumber: `EIR-ID-JKT-${Math.floor(10000 + Math.random() * 90000)}`,
    sealNumber: 'SL-771920',
    damageCondition: 'Kondisi Baik / Tanpa Kerusakan',
    laneNumber: 'Gate In Lane 01',
    status: 'approved' as GateTransaction['status'],
    notes: ''
  });

  const userName = currentUser?.displayName || 'Petugas Transaksi';

  // --- Container Actions ---
  const handleOpenContainerModal = (c?: Container) => {
    if (c) {
      setEditingContainer(c);
      setContainerForm({
        containerNumber: c.containerNumber,
        isoType: c.isoType,
        size: c.size,
        category: c.category,
        grossWeightTon: c.grossWeightTon,
        sealNumber: c.sealNumber,
        vesselName: c.vesselName || '',
        locationType: c.locationType,
        yardPosition: c.yardPosition || '',
        temperature: c.temperature || 0,
        hazardousClass: c.hazardousClass || '',
        consigneeOrShipper: c.consigneeOrShipper,
        status: c.status
      });
    } else {
      setEditingContainer(null);
      // Auto-generate realistic ISO container number
      const randomPrefix = ['MSKU', 'TCLU', 'MRKU', 'SITU', 'EMCU'][Math.floor(Math.random() * 5)];
      const randomDigits = Math.floor(1000000 + Math.random() * 9000000);
      setContainerForm({
        containerNumber: `${randomPrefix}${randomDigits}`,
        isoType: '40HC',
        size: '40',
        category: 'import',
        grossWeightTon: 22.5,
        sealNumber: `SL-${Math.floor(100000 + Math.random() * 900000)}`,
        vesselName: vessels[0]?.name || 'MV Meratus Nusantara',
        locationType: 'yard',
        yardPosition: 'A-03-02-1',
        temperature: 0,
        hazardousClass: '',
        consigneeOrShipper: 'PT Multi Ekspor Cargo',
        status: 'in_yard'
      });
    }
    setIsContainerModalOpen(true);
  };

  const handleSaveContainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingContainer) {
        await updateContainer(editingContainer.id, {
          ...containerForm,
          grossWeightTon: Number(containerForm.grossWeightTon),
          temperature: containerForm.isoType.includes('RF') ? Number(containerForm.temperature) : undefined
        }, userName);
      } else {
        await createContainer({
          ...containerForm,
          grossWeightTon: Number(containerForm.grossWeightTon),
          temperature: containerForm.isoType.includes('RF') ? Number(containerForm.temperature) : undefined,
          dwellDays: 1,
          gateInAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }, userName);
      }
      setIsContainerModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data kontainer ke database.');
    } finally {
      setSaving(false);
    }
  };

  // --- Gate Transaction Actions ---
  const handleOpenGateModal = (gt?: GateTransaction) => {
    if (gt) {
      setEditingGate(gt);
      setGateForm({
        ticketNumber: gt.ticketNumber,
        transactionType: gt.transactionType,
        containerNumber: gt.containerNumber,
        truckPlateNumber: gt.truckPlateNumber,
        driverName: gt.driverName,
        transporterCompany: gt.transporterCompany,
        eirNumber: gt.eirNumber,
        sealNumber: gt.sealNumber,
        damageCondition: gt.damageCondition,
        laneNumber: gt.laneNumber,
        status: gt.status,
        notes: gt.notes || ''
      });
    } else {
      setEditingGate(null);
      setGateForm({
        ticketNumber: `EIR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`,
        transactionType: 'GATE_IN',
        containerNumber: containers[0]?.containerNumber || 'MSKU9281724',
        truckPlateNumber: 'B 9102 QX',
        driverName: 'Sugianto Wibowo',
        transporterCompany: 'PT Puninar Logistics',
        eirNumber: `EIR-ID-JKT-${Math.floor(10000 + Math.random() * 90000)}`,
        sealNumber: `SL-${Math.floor(100000 + Math.random() * 900000)}`,
        damageCondition: 'Kondisi Baik / Tanpa Kerusakan',
        laneNumber: 'Gate In Lane 01',
        status: 'approved',
        notes: 'Pemeriksaan fisik peti kemas lolos'
      });
    }
    setIsGateModalOpen(true);
  };

  const handleSaveGate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingGate) {
        await updateGateTransaction(editingGate.id, gateForm, userName);
      } else {
        await createGateTransaction({
          ...gateForm,
          operatorName: userName,
          createdAt: new Date().toISOString()
        }, userName);
      }
      setIsGateModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal memproses transaksi gate.');
    } finally {
      setSaving(false);
    }
  };

  // --- Delete Handler ---
  const executeDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      if (deleteConfirm.type === 'container') {
        await deleteContainer(deleteConfirm.id, deleteConfirm.identifier, userName);
      } else if (deleteConfirm.type === 'gate') {
        await deleteGateTransaction(deleteConfirm.id, deleteConfirm.identifier, userName);
      }
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus data dari Firestore.');
    } finally {
      setSaving(false);
    }
  };

  // Filters for containers
  const filteredContainers = containers.filter(c => {
    const matchesSearch = 
      c.containerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.consigneeOrShipper.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.yardPosition && c.yardPosition.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCat = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Pusat Transaksi Data Operasional</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              Real-time CRUD
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Transaksi Bongkar / Muat Petikemas, Relokasi Posisi Lapangan (Slot), serta Gate In & Gate Out Truk EIR.
          </p>
        </div>

        <div>
          {subTab === 'containers' ? (
            <button
              onClick={() => handleOpenContainerModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/25 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Input Petikemas Baru</span>
            </button>
          ) : (
            <button
              onClick={() => handleOpenGateModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/25 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Terbitkan Tiket Gate (EIR)</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab selection & filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
          <button
            onClick={() => setSubTab('containers')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              subTab === 'containers'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Daftar Bongkar / Muat Petikemas ({containers.length})</span>
          </button>

          <button
            onClick={() => setSubTab('gate')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
              subTab === 'gate'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Transaksi Gerbang Truk & EIR ({gateTransactions.length})</span>
          </button>
        </div>

        {/* Search & Select Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {subTab === 'containers' && (
            <>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Semua Kategori</option>
                <option value="import">Impor</option>
                <option value="export">Ekspor</option>
                <option value="transshipment">Transshipment</option>
                <option value="empty">Empty (Kosong)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Semua Status</option>
                <option value="in_yard">In Yard (Lapangan)</option>
                <option value="discharging">Discharging (Bongkar)</option>
                <option value="loading">Loading (Muat)</option>
                <option value="on_board">On Board</option>
                <option value="gate_out">Gate Out</option>
              </select>
            </>
          )}

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Cari no kontainer / truk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* SUBTAB 1: CONTAINERS TABLE */}
      {subTab === 'containers' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800 font-semibold font-mono">
                <tr>
                  <th className="px-4 py-3">Nomor Petikemas</th>
                  <th className="px-4 py-3">Ukuran & Tipe</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Berat / Seal</th>
                  <th className="px-4 py-3">Posisi Slot Lapangan</th>
                  <th className="px-4 py-3">Kapal Pengangkut</th>
                  <th className="px-4 py-3">Status Operasi</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredContainers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada data petikemas yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredContainers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-850/50 transition">
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => onOpenTracking(c.containerNumber)}
                          className="font-mono font-bold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1.5"
                          title="Klik untuk lihat riwayat pelacakan lengkap"
                        >
                          <span>{c.containerNumber}</span>
                          <Search className="w-3 h-3 text-cyan-400 opacity-60" />
                        </button>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {c.consigneeOrShipper}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        <span className="font-bold text-white">{c.size}ft</span> ({c.isoType})
                        {c.temperature !== undefined && (
                          <div className="text-cyan-300 flex items-center gap-1 text-[10px]">
                            <Thermometer className="w-3 h-3" />
                            <span>{c.temperature}°C</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          c.category === 'import' ? 'bg-blue-950 text-blue-300 border border-blue-500/30' :
                          c.category === 'export' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                          c.category === 'transshipment' ? 'bg-purple-950 text-purple-300 border border-purple-500/30' :
                          'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {c.category}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-300">
                        <div>{c.grossWeightTon} Ton</div>
                        <div className="text-slate-400 text-[10px]">Seal: {c.sealNumber}</div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        <span className="bg-slate-950 border border-slate-750 px-2 py-1 rounded text-cyan-300 font-bold">
                          {c.yardPosition || 'Quay / Transfer'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-slate-300 text-xs">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Ship className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.vesselName || 'Belum Ditentukan'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'in_yard' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' :
                          c.status === 'discharging' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                          c.status === 'loading' ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30' :
                          c.status === 'on_board' ? 'bg-blue-950 text-blue-300 border border-blue-500/30' :
                          'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {c.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenContainerModal(c)}
                            title="Edit / Relokasi"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-700 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'container', id: c.id, identifier: c.containerNumber })}
                            title="Hapus"
                            className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg border border-slate-700 hover:border-rose-500/40 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: GATE TRANSACTIONS TABLE */}
      {subTab === 'gate' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800 font-semibold font-mono">
                <tr>
                  <th className="px-4 py-3">No Tiket & Waktu</th>
                  <th className="px-4 py-3">Tipe Gerbang</th>
                  <th className="px-4 py-3">No Petikemas</th>
                  <th className="px-4 py-3">Truk & Driver</th>
                  <th className="px-4 py-3">Transporter</th>
                  <th className="px-4 py-3">Kondisi / Seal</th>
                  <th className="px-4 py-3">Status Inspeksi</th>
                  <th className="px-4 py-3 text-right">Dokumen EIR & Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {gateTransactions.map((gt) => (
                  <tr key={gt.id} className="hover:bg-slate-850/50 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-white">{gt.ticketNumber}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(gt.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        gt.transactionType === 'GATE_IN'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                          : 'bg-blue-950 text-blue-300 border border-blue-500/40'
                      }`}>
                        {gt.transactionType}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{gt.laneNumber}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => onOpenTracking(gt.containerNumber)}
                        className="font-mono font-bold text-cyan-400 hover:underline"
                      >
                        {gt.containerNumber}
                      </button>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-white bg-slate-950 px-2 py-0.5 rounded inline-block border border-slate-800">
                        {gt.truckPlateNumber}
                      </div>
                      <div className="text-[11px] text-slate-300 mt-0.5">{gt.driverName}</div>
                    </td>

                    <td className="px-4 py-3.5 text-slate-300">
                      {gt.transporterCompany}
                    </td>

                    <td className="px-4 py-3.5 text-[11px] text-slate-300">
                      <div>{gt.damageCondition}</div>
                      <div className="text-[10px] text-slate-400 font-mono">Seal: {gt.sealNumber}</div>
                    </td>

                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        gt.status === 'approved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                        gt.status === 'pending_inspection' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                        'bg-rose-950 text-rose-300 border border-rose-500/40'
                      }`}>
                        {gt.status === 'approved' ? 'Disetujui' : gt.status === 'pending_inspection' ? 'Pemeriksaan' : 'Ditolak'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEirModalTx(gt)}
                          title="Cetak / Lihat Digital EIR"
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg border border-slate-700 transition flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Slip EIR</span>
                        </button>
                        <button
                          onClick={() => handleOpenGateModal(gt)}
                          title="Edit"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ type: 'gate', id: gt.id, identifier: gt.ticketNumber })}
                          title="Hapus"
                          className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg border border-slate-700 hover:border-rose-500/40 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONTAINER MODAL (CREATE / EDIT) */}
      {isContainerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-cyan-400" />
                <span>{editingContainer ? 'Edit Data / Posisi Petikemas' : 'Input Manifest Petikemas Baru'}</span>
              </h2>
              <button onClick={() => setIsContainerModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContainer} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Petikemas (ISO 6346)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MSKU9281724"
                    value={containerForm.containerNumber}
                    onChange={(e) => setContainerForm({ ...containerForm, containerNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Ukuran & Tipe ISO</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={containerForm.size}
                      onChange={(e) => setContainerForm({ ...containerForm, size: e.target.value as ContainerSize })}
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                    >
                      <option value="20">20 Feet</option>
                      <option value="40">40 Feet</option>
                      <option value="45">45 Feet</option>
                    </select>
                    <select
                      value={containerForm.isoType}
                      onChange={(e) => setContainerForm({ ...containerForm, isoType: e.target.value })}
                      className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                    >
                      <option value="20GP">20GP (Dry)</option>
                      <option value="40GP">40GP (Dry)</option>
                      <option value="40HC">40HC (High Cube)</option>
                      <option value="45HC">45HC (High Cube)</option>
                      <option value="20RF">20RF (Reefer)</option>
                      <option value="40RF">40RF (Reefer)</option>
                      <option value="20OT">20OT (Open Top)</option>
                      <option value="40FR">40FR (Flat Rack)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kategori Muatan</label>
                  <select
                    value={containerForm.category}
                    onChange={(e) => setContainerForm({ ...containerForm, category: e.target.value as ContainerCategory })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  >
                    <option value="import">Impor (Discharge ke Lapangan)</option>
                    <option value="export">Ekspor (Loading ke Kapal)</option>
                    <option value="transshipment">Transshipment (Pindah Kapal)</option>
                    <option value="empty">Empty Container (Depo Kosong)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Berat Kotor / Gross (Ton)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={containerForm.grossWeightTon}
                    onChange={(e) => setContainerForm({ ...containerForm, grossWeightTon: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Segel (Seal Number)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SL-992144"
                    value={containerForm.sealNumber}
                    onChange={(e) => setContainerForm({ ...containerForm, sealNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kapal Pengangkut (Vessel)</label>
                  <select
                    value={containerForm.vesselName}
                    onChange={(e) => setContainerForm({ ...containerForm, vesselName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  >
                    <option value="">Tidak Diketahui</option>
                    {vessels.map(v => (
                      <option key={v.id} value={v.name}>{v.name} ({v.shippingLine})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Lokasi & Posisi Lapangan (Slot)</label>
                  <input
                    type="text"
                    placeholder="Contoh: A-04-02-3 (Blok-Bay-Row-Tier)"
                    value={containerForm.yardPosition}
                    onChange={(e) => setContainerForm({ ...containerForm, yardPosition: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status Operasional</label>
                  <select
                    value={containerForm.status}
                    onChange={(e) => setContainerForm({ ...containerForm, status: e.target.value as ContainerStatus })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  >
                    <option value="in_yard">In Yard (Tertumpuk di Lapangan)</option>
                    <option value="discharging">Discharging (Sedang Dibongkar)</option>
                    <option value="loading">Loading (Sedang Dimuat)</option>
                    <option value="on_board">On Board (Di Atas Kapal)</option>
                    <option value="gate_out">Gate Out (Telah Keluar Terminal)</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pemilik Muatan (Shipper / Consignee)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Indofood Sukses Makmur Tbk"
                    value={containerForm.consigneeOrShipper}
                    onChange={(e) => setContainerForm({ ...containerForm, consigneeOrShipper: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsContainerModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/30 disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Petikemas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GATE TRANSACTION MODAL */}
      {isGateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan-400" />
                <span>{editingGate ? 'Edit Tiket Gerbang' : 'Terbitkan Tiket Gate In / Gate Out (EIR)'}</span>
              </h2>
              <button onClick={() => setIsGateModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tipe Transaksi Gerbang</label>
                  <select
                    value={gateForm.transactionType}
                    onChange={(e) => setGateForm({ ...gateForm, transactionType: e.target.value as GateTransaction['transactionType'] })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-semibold"
                  >
                    <option value="GATE_IN">GATE IN (Truk Masuk Terminal)</option>
                    <option value="GATE_OUT">GATE OUT (Truk Keluar Terminal)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Lane Gerbang</label>
                  <select
                    value={gateForm.laneNumber}
                    onChange={(e) => setGateForm({ ...gateForm, laneNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  >
                    <option value="Gate In Lane 01">Gate In Lane 01 (Weighbridge)</option>
                    <option value="Gate In Lane 02">Gate In Lane 02</option>
                    <option value="Gate Out Lane 01">Gate Out Lane 01</option>
                    <option value="Gate Out Lane 02">Gate Out Lane 02</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Petikemas</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MSKU9281724"
                    value={gateForm.containerNumber}
                    onChange={(e) => setGateForm({ ...gateForm, containerNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Polisi Truk</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: B 9481 UXT"
                    value={gateForm.truckPlateNumber}
                    onChange={(e) => setGateForm({ ...gateForm, truckPlateNumber: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nama Supir (Driver)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Bambang Sudirman"
                    value={gateForm.driverName}
                    onChange={(e) => setGateForm({ ...gateForm, driverName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Perusahaan Ekspedisi (Transporter)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: PT Puninar Jaya Logistics"
                    value={gateForm.transporterCompany}
                    onChange={(e) => setGateForm({ ...gateForm, transporterCompany: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nomor Segel (Seal No)</label>
                  <input
                    type="text"
                    required
                    value={gateForm.sealNumber}
                    onChange={(e) => setGateForm({ ...gateForm, sealNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status Inspeksi</label>
                  <select
                    value={gateForm.status}
                    onChange={(e) => setGateForm({ ...gateForm, status: e.target.value as GateTransaction['status'] })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  >
                    <option value="approved">Approved (Lolos Inspeksi)</option>
                    <option value="pending_inspection">Pending (Perlu Cek Fisik)</option>
                    <option value="rejected">Rejected (Ditolak / Segel Rusak)</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Catatan Kondisi Fisik Petikemas</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kondisi Baik / Tanpa Kerusakan"
                    value={gateForm.damageCondition}
                    onChange={(e) => setGateForm({ ...gateForm, damageCondition: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsGateModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                >
                  {saving ? 'Memproses...' : 'Terbitkan Tiket Gate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL EIR SLIP VIEW & PRINT MODAL */}
      {eirModalTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-white text-slate-900 rounded-2xl shadow-2xl p-6 border border-slate-300">
            {/* Header of EIR */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-900 mb-4">
              <div>
                <h3 className="font-extrabold text-lg tracking-tight uppercase">PORTNEX CONTAINER TERMINAL</h3>
                <p className="text-[11px] text-slate-600 font-mono">EQUIPMENT INTERCHANGE RECEIPT (EIR DIGITAL)</p>
              </div>
              <button onClick={() => setEirModalTx(null)} className="text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* EIR details */}
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-2.5 rounded-lg border border-slate-300">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">No Tiket / EIR:</span>
                  <span className="font-bold text-sm text-slate-900">{eirModalTx.ticketNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Tipe Transaksi:</span>
                  <span className="font-bold text-sm text-cyan-700">{eirModalTx.transactionType}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 border-b pb-2">
                <div>No Petikemas: <strong>{eirModalTx.containerNumber}</strong></div>
                <div>No Polisi: <strong>{eirModalTx.truckPlateNumber}</strong></div>
                <div>Supir: <strong>{eirModalTx.driverName}</strong></div>
                <div>Transporter: <strong>{eirModalTx.transporterCompany}</strong></div>
                <div>Segel (Seal): <strong>{eirModalTx.sealNumber}</strong></div>
                <div>Lane Gerbang: <strong>{eirModalTx.laneNumber}</strong></div>
              </div>

              <div className="border-b pb-2">
                <span className="text-[10px] text-slate-500 uppercase block">Kondisi Inspeksi Fisik:</span>
                <span className="font-semibold text-slate-800">{eirModalTx.damageCondition}</span>
              </div>

              <div className="flex justify-between items-center pt-2 text-[11px] text-slate-600">
                <span>Petugas: {eirModalTx.operatorName}</span>
                <span>Waktu: {new Date(eirModalTx.createdAt).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Print button */}
            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Bukti EIR</span>
              </button>
              <button
                onClick={() => setEirModalTx(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-center">
            <h3 className="text-base font-bold text-white mb-2">Hapus Transaksi</h3>
            <p className="text-xs text-slate-300 mb-6">
              Hapus catatan <strong>{deleteConfirm.identifier}</strong>?
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={executeDelete}
                disabled={saving}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl disabled:opacity-50"
              >
                {saving ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
