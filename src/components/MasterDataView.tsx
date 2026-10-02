import React, { useState } from 'react';
import { 
  Ship, 
  Anchor, 
  Layers, 
  Truck, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { Vessel, Berth, YardBlock, AppUser } from '../types/terminal';
import { 
  createVessel, 
  updateVessel, 
  deleteVessel, 
  createBerth, 
  updateBerth, 
  deleteBerth, 
  createYardBlock, 
  updateYardBlock, 
  deleteYardBlock 
} from '../services/firebase';

interface MasterDataViewProps {
  vessels: Vessel[];
  berths: Berth[];
  yardBlocks: YardBlock[];
  currentUser: AppUser | null;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  vessels,
  berths,
  yardBlocks,
  currentUser
}) => {
  const [subTab, setSubTab] = useState<'vessels' | 'berths' | 'yard' | 'equipment'>('vessels');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isVesselModalOpen, setIsVesselModalOpen] = useState(false);
  const [editingVessel, setEditingVessel] = useState<Vessel | null>(null);

  const [isBerthModalOpen, setIsBerthModalOpen] = useState(false);
  const [editingBerth, setEditingBerth] = useState<Berth | null>(null);

  const [isYardModalOpen, setIsYardModalOpen] = useState(false);
  const [editingYard, setEditingYard] = useState<YardBlock | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'vessel' | 'berth' | 'yard';
    id: string;
    name: string;
  } | null>(null);

  const [saving, setSaving] = useState(false);

  // Vessel Form State
  const [vesselForm, setVesselForm] = useState({
    name: '',
    callSign: '',
    imoNumber: '',
    flag: 'Indonesia 🇮🇩',
    shippingLine: '',
    loa: 200,
    beam: 32,
    draft: 11.0,
    capacityTeu: 3000,
    status: 'working' as Vessel['status'],
    berthAssigned: 'D-01',
    eta: new Date().toISOString().substring(0, 16),
    etd: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().substring(0, 16),
    dischargeTarget: 400,
    loadTarget: 350,
    dischargedCount: 0,
    loadedCount: 0
  });

  // Berth Form State
  const [berthForm, setBerthForm] = useState({
    code: '',
    name: '',
    lengthMeters: 300,
    depthMeters: 14.0,
    maxDraft: 13.0,
    cranesAssigned: 'STS-01, STS-02',
    status: 'available' as Berth['status'],
    currentVessel: '',
    bollardStart: 1,
    bollardEnd: 20
  });

  // Yard Form State
  const [yardForm, setYardForm] = useState({
    code: '',
    name: '',
    type: 'dry' as YardBlock['type'],
    capacityTeu: 1000,
    currentTeu: 0,
    maxTiers: 5,
    rows: 6,
    bays: 12,
    equipmentAssigned: 'RTG-01'
  });

  const userName = currentUser?.displayName || 'Petugas Terminal';

  // --- Vessel Actions ---
  const handleOpenVesselModal = (v?: Vessel) => {
    if (v) {
      setEditingVessel(v);
      setVesselForm({
        name: v.name,
        callSign: v.callSign,
        imoNumber: v.imoNumber,
        flag: v.flag,
        shippingLine: v.shippingLine,
        loa: v.loa,
        beam: v.beam,
        draft: v.draft,
        capacityTeu: v.capacityTeu,
        status: v.status,
        berthAssigned: v.berthAssigned || '',
        eta: new Date(v.eta).toISOString().substring(0, 16),
        etd: new Date(v.etd).toISOString().substring(0, 16),
        dischargeTarget: v.dischargeTarget,
        loadTarget: v.loadTarget,
        dischargedCount: v.dischargedCount,
        loadedCount: v.loadedCount
      });
    } else {
      setEditingVessel(null);
      setVesselForm({
        name: '',
        callSign: '',
        imoNumber: '',
        flag: 'Indonesia 🇮🇩',
        shippingLine: 'Meratus Line',
        loa: 210,
        beam: 32,
        draft: 11.5,
        capacityTeu: 2800,
        status: 'berthing',
        berthAssigned: 'D-01',
        eta: new Date().toISOString().substring(0, 16),
        etd: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString().substring(0, 16),
        dischargeTarget: 350,
        loadTarget: 300,
        dischargedCount: 0,
        loadedCount: 0
      });
    }
    setIsVesselModalOpen(true);
  };

  const handleSaveVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingVessel) {
        await updateVessel(editingVessel.id, {
          ...vesselForm,
          loa: Number(vesselForm.loa),
          beam: Number(vesselForm.beam),
          draft: Number(vesselForm.draft),
          capacityTeu: Number(vesselForm.capacityTeu),
          dischargeTarget: Number(vesselForm.dischargeTarget),
          loadTarget: Number(vesselForm.loadTarget),
          dischargedCount: Number(vesselForm.dischargedCount),
          loadedCount: Number(vesselForm.loadedCount),
          eta: new Date(vesselForm.eta).toISOString(),
          etd: new Date(vesselForm.etd).toISOString()
        }, userName);
      } else {
        await createVessel({
          ...vesselForm,
          loa: Number(vesselForm.loa),
          beam: Number(vesselForm.beam),
          draft: Number(vesselForm.draft),
          capacityTeu: Number(vesselForm.capacityTeu),
          dischargeTarget: Number(vesselForm.dischargeTarget),
          loadTarget: Number(vesselForm.loadTarget),
          dischargedCount: Number(vesselForm.dischargedCount),
          loadedCount: Number(vesselForm.loadedCount),
          eta: new Date(vesselForm.eta).toISOString(),
          etd: new Date(vesselForm.etd).toISOString(),
          updatedAt: new Date().toISOString()
        }, userName);
      }
      setIsVesselModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan kapal ke Firebase Firestore.');
    } finally {
      setSaving(false);
    }
  };

  // --- Berth Actions ---
  const handleOpenBerthModal = (b?: Berth) => {
    if (b) {
      setEditingBerth(b);
      setBerthForm({
        code: b.code,
        name: b.name,
        lengthMeters: b.lengthMeters,
        depthMeters: b.depthMeters,
        maxDraft: b.maxDraft,
        cranesAssigned: b.cranesAssigned,
        status: b.status,
        currentVessel: b.currentVessel || '',
        bollardStart: b.bollardStart || 1,
        bollardEnd: b.bollardEnd || 20
      });
    } else {
      setEditingBerth(null);
      setBerthForm({
        code: `D-0${berths.length + 1}`,
        name: `Dermaga Baru 0${berths.length + 1}`,
        lengthMeters: 320,
        depthMeters: 14.5,
        maxDraft: 13.5,
        cranesAssigned: 'STS-06',
        status: 'available',
        currentVessel: '',
        bollardStart: 1,
        bollardEnd: 24
      });
    }
    setIsBerthModalOpen(true);
  };

  const handleSaveBerth = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingBerth) {
        await updateBerth(editingBerth.id, {
          ...berthForm,
          lengthMeters: Number(berthForm.lengthMeters),
          depthMeters: Number(berthForm.depthMeters),
          maxDraft: Number(berthForm.maxDraft)
        }, userName);
      } else {
        await createBerth({
          ...berthForm,
          lengthMeters: Number(berthForm.lengthMeters),
          depthMeters: Number(berthForm.depthMeters),
          maxDraft: Number(berthForm.maxDraft),
          updatedAt: new Date().toISOString()
        }, userName);
      }
      setIsBerthModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data dermaga ke database.');
    } finally {
      setSaving(false);
    }
  };

  // --- Yard Block Actions ---
  const handleOpenYardModal = (y?: YardBlock) => {
    if (y) {
      setEditingYard(y);
      setYardForm({
        code: y.code,
        name: y.name,
        type: y.type,
        capacityTeu: y.capacityTeu,
        currentTeu: y.currentTeu,
        maxTiers: y.maxTiers,
        rows: y.rows,
        bays: y.bays,
        equipmentAssigned: y.equipmentAssigned
      });
    } else {
      setEditingYard(null);
      setYardForm({
        code: `BLOCK-${String.fromCharCode(65 + yardBlocks.length)}`,
        name: `Lapangan Penumpukan Blok ${String.fromCharCode(65 + yardBlocks.length)}`,
        type: 'dry',
        capacityTeu: 1000,
        currentTeu: 0,
        maxTiers: 5,
        rows: 6,
        bays: 12,
        equipmentAssigned: 'RTG-05'
      });
    }
    setIsYardModalOpen(true);
  };

  const handleSaveYard = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingYard) {
        await updateYardBlock(editingYard.id, {
          ...yardForm,
          capacityTeu: Number(yardForm.capacityTeu),
          currentTeu: Number(yardForm.currentTeu),
          maxTiers: Number(yardForm.maxTiers),
          rows: Number(yardForm.rows),
          bays: Number(yardForm.bays)
        }, userName);
      } else {
        await createYardBlock({
          ...yardForm,
          capacityTeu: Number(yardForm.capacityTeu),
          currentTeu: Number(yardForm.currentTeu),
          maxTiers: Number(yardForm.maxTiers),
          rows: Number(yardForm.rows),
          bays: Number(yardForm.bays),
          updatedAt: new Date().toISOString()
        }, userName);
      }
      setIsYardModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data blok lapangan.');
    } finally {
      setSaving(false);
    }
  };

  // --- Delete Handler ---
  const executeDelete = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      if (deleteConfirm.type === 'vessel') {
        await deleteVessel(deleteConfirm.id, deleteConfirm.name, userName);
      } else if (deleteConfirm.type === 'berth') {
        await deleteBerth(deleteConfirm.id, deleteConfirm.name, userName);
      } else if (deleteConfirm.type === 'yard') {
        await deleteYardBlock(deleteConfirm.id, deleteConfirm.name, userName);
      }
      setDeleteConfirm(null);
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus data dari Firestore.');
    } finally {
      setSaving(false);
    }
  };

  // Filtered vessels
  const filteredVessels = vessels.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.callSign.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.shippingLine.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Pusat Master Data Terminal</span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              CRUD Online
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Pengelolaan referensi Master Kapal, Master Dermaga Tambatan, dan Master Lapangan Penumpukan Petikemas.
          </p>
        </div>

        {/* Action Button based on active subtab */}
        <div>
          {subTab === 'vessels' && (
            <button
              onClick={() => handleOpenVesselModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/25 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Master Kapal</span>
            </button>
          )}
          {subTab === 'berths' && (
            <button
              onClick={() => handleOpenBerthModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/25 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Master Dermaga</span>
            </button>
          )}
          {subTab === 'yard' && (
            <button
              onClick={() => handleOpenYardModal()}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/25 transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Blok Lapangan</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab selection & search filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setSubTab('vessels')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              subTab === 'vessels'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Ship className="w-3.5 h-3.5" />
            <span>Master Kapal ({vessels.length})</span>
          </button>

          <button
            onClick={() => setSubTab('berths')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              subTab === 'berths'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Anchor className="w-3.5 h-3.5" />
            <span>Master Dermaga ({berths.length})</span>
          </button>

          <button
            onClick={() => setSubTab('yard')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 whitespace-nowrap ${
              subTab === 'yard'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Master Blok Lapangan ({yardBlocks.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Cari nama kapal, dermaga, call sign..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* SUBTAB 1: VESSELS */}
      {subTab === 'vessels' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] text-slate-400 uppercase bg-slate-950/80 border-b border-slate-800 font-semibold font-mono">
                <tr>
                  <th className="px-4 py-3">Nama Kapal & Bendera</th>
                  <th className="px-4 py-3">Call Sign / IMO</th>
                  <th className="px-4 py-3">Shipping Line</th>
                  <th className="px-4 py-3">Dimensi (LOA/Draft)</th>
                  <th className="px-4 py-3">Kapasitas</th>
                  <th className="px-4 py-3">Alokasi Dermaga</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi CRUD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {filteredVessels.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada data kapal yang sesuai dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredVessels.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-850/50 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Ship className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{v.name}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{v.flag}</div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        <div className="text-cyan-300 font-bold">{v.callSign}</div>
                        <div className="text-slate-400">IMO: {v.imoNumber}</div>
                      </td>

                      <td className="px-4 py-3.5 text-slate-300 font-medium">
                        {v.shippingLine}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-300">
                        <div>LOA: {v.loa}m • Beam: {v.beam}m</div>
                        <div className="text-slate-400">Draft: {v.draft}m</div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-200">
                        <span className="font-bold text-white">{v.capacityTeu.toLocaleString()}</span> TEU
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                          {v.berthAssigned || 'TBA'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          v.status === 'working' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                          v.status === 'berthing' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' :
                          v.status === 'anchorage' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' :
                          v.status === 'completed' ? 'bg-blue-950 text-blue-300 border border-blue-500/40' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {v.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenVesselModal(v)}
                            title="Edit Kapal"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg border border-slate-700 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ type: 'vessel', id: v.id, name: v.name })}
                            title="Hapus Kapal"
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

      {/* SUBTAB 2: BERTHS */}
      {subTab === 'berths' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {berths.map((b) => (
            <div key={b.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative group hover:border-cyan-500/40 transition">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  {b.code}
                </span>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                  b.status === 'occupied' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' :
                  b.status === 'available' ? 'bg-slate-800 text-slate-300 border border-slate-700' :
                  'bg-amber-950 text-amber-300 border border-amber-500/40'
                }`}>
                  {b.status === 'occupied' ? 'Terisi' : b.status === 'available' ? 'Tersedia' : 'Maintenance'}
                </span>
              </div>

              <h3 className="text-base font-bold text-white mb-2">{b.name}</h3>

              <div className="space-y-1.5 text-xs text-slate-300 font-mono bg-slate-950/50 p-3 rounded-xl border border-slate-850 mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-400">Panjang Dermaga:</span>
                  <span className="font-bold text-white">{b.lengthMeters} Meter</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Kedalaman (LWS):</span>
                  <span className="font-bold text-white">{b.depthMeters} Meter</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Draft Maksimum:</span>
                  <span className="font-bold text-cyan-400">{b.maxDraft} Meter</span>
                </div>
                <div className="flex justify-between border-t border-slate-800 pt-1">
                  <span className="text-slate-400">Crane Assigned:</span>
                  <span className="text-slate-200">{b.cranesAssigned}</span>
                </div>
              </div>

              {b.currentVessel && (
                <div className="text-xs text-cyan-300 bg-cyan-950/60 p-2.5 rounded-xl border border-cyan-500/30 mb-4 flex items-center gap-2">
                  <Ship className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">Kapal Sandar: <strong>{b.currentVessel}</strong></span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                <button
                  onClick={() => handleOpenBerthModal(b)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg transition border border-slate-700 flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Dermaga</span>
                </button>
                <button
                  onClick={() => setDeleteConfirm({ type: 'berth', id: b.id, name: b.name })}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 text-xs font-semibold rounded-lg transition border border-slate-700 hover:border-rose-500/40 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SUBTAB 3: YARD BLOCKS */}
      {subTab === 'yard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {yardBlocks.map((y) => {
            const pct = Math.round(((y.currentTeu || 0) / (y.capacityTeu || 1)) * 100);
            return (
              <div key={y.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl relative group hover:border-amber-500/40 transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-500/40">
                    {y.code}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    {y.type}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white mb-2">{y.name}</h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-mono">
                    <span>{y.currentTeu} / {y.capacityTeu} TEU</span>
                    <span className="font-bold text-amber-400">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${pct > 80 ? 'bg-rose-500' : 'bg-amber-500'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 font-mono space-y-1 bg-slate-950/50 p-2.5 rounded-xl border border-slate-850 mb-4">
                  <div>Grid: {y.bays} Bay × {y.rows} Row × {y.maxTiers} Tier</div>
                  <div>Alat RTG: <span className="text-slate-200">{y.equipmentAssigned}</span></div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => handleOpenYardModal(y)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg transition border border-slate-700 flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ type: 'yard', id: y.id, name: y.name })}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 text-xs font-semibold rounded-lg transition border border-slate-700 hover:border-rose-500/40 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VESSEL MODAL (CREATE / EDIT) */}
      {isVesselModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Ship className="w-5 h-5 text-cyan-400" />
                <span>{editingVessel ? 'Edit Data Master Kapal' : 'Tambah Master Kapal Baru'}</span>
              </h2>
              <button onClick={() => setIsVesselModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVessel} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nama Kapal (Vessel Name)</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: MV Meratus Nusantara"
                    value={vesselForm.name}
                    onChange={(e) => setVesselForm({ ...vesselForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Shipping Line / Agen</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Meratus / Maersk / MSC"
                    value={vesselForm.shippingLine}
                    onChange={(e) => setVesselForm({ ...vesselForm, shippingLine: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Call Sign</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: YB2918"
                    value={vesselForm.callSign}
                    onChange={(e) => setVesselForm({ ...vesselForm, callSign: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Nomor IMO</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 9382104"
                    value={vesselForm.imoNumber}
                    onChange={(e) => setVesselForm({ ...vesselForm, imoNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Bendera (Flag)</label>
                  <input
                    type="text"
                    value={vesselForm.flag}
                    onChange={(e) => setVesselForm({ ...vesselForm, flag: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Status Operasional</label>
                  <select
                    value={vesselForm.status}
                    onChange={(e) => setVesselForm({ ...vesselForm, status: e.target.value as Vessel['status'] })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  >
                    <option value="anchorage">Anchorage (Labuh Luar)</option>
                    <option value="berthing">Berthing (Manuver Sandar)</option>
                    <option value="working">Working (Bongkar/Muat Aktif)</option>
                    <option value="completed">Completed (Selesai Operasi)</option>
                    <option value="departed">Departed (Berangkat)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Alokasi Dermaga (Tambatan)</label>
                  <select
                    value={vesselForm.berthAssigned}
                    onChange={(e) => setVesselForm({ ...vesselForm, berthAssigned: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  >
                    <option value="">Belum Ditentukan (Anchorage)</option>
                    {berths.map(b => (
                      <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kapasitas Kapal (TEU)</label>
                  <input
                    type="number"
                    value={vesselForm.capacityTeu}
                    onChange={(e) => setVesselForm({ ...vesselForm, capacityTeu: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Bongkar (Discharge Box)</label>
                  <input
                    type="number"
                    value={vesselForm.dischargeTarget}
                    onChange={(e) => setVesselForm({ ...vesselForm, dischargeTarget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Muat (Load Box)</label>
                  <input
                    type="number"
                    value={vesselForm.loadTarget}
                    onChange={(e) => setVesselForm({ ...vesselForm, loadTarget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Estimasi Tiba (ETA)</label>
                  <input
                    type="datetime-local"
                    value={vesselForm.eta}
                    onChange={(e) => setVesselForm({ ...vesselForm, eta: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Estimasi Berangkat (ETD)</label>
                  <input
                    type="datetime-local"
                    value={vesselForm.etd}
                    onChange={(e) => setVesselForm({ ...vesselForm, etd: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsVesselModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-cyan-600/30 disabled:opacity-50"
                >
                  {saving ? 'Menyimpan...' : 'Simpan ke Firestore Online'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BERTH MODAL */}
      {isBerthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Anchor className="w-5 h-5 text-cyan-400" />
                <span>{editingBerth ? 'Edit Data Dermaga' : 'Tambah Dermaga Baru'}</span>
              </h2>
              <button onClick={() => setIsBerthModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBerth} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Kode Dermaga</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: D-01"
                  value={berthForm.code}
                  onChange={(e) => setBerthForm({ ...berthForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Dermaga</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dermaga Internasional 01"
                  value={berthForm.name}
                  onChange={(e) => setBerthForm({ ...berthForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Panjang (m)</label>
                  <input
                    type="number"
                    value={berthForm.lengthMeters}
                    onChange={(e) => setBerthForm({ ...berthForm, lengthMeters: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kedalaman (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={berthForm.depthMeters}
                    onChange={(e) => setBerthForm({ ...berthForm, depthMeters: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Max Draft (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={berthForm.maxDraft}
                    onChange={(e) => setBerthForm({ ...berthForm, maxDraft: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Alat STS Crane</label>
                <input
                  type="text"
                  placeholder="Contoh: STS-01, STS-02"
                  value={berthForm.cranesAssigned}
                  onChange={(e) => setBerthForm({ ...berthForm, cranesAssigned: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Status Tambatan</label>
                <select
                  value={berthForm.status}
                  onChange={(e) => setBerthForm({ ...berthForm, status: e.target.value as Berth['status'] })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                >
                  <option value="available">Tersedia (Siap Sandar)</option>
                  <option value="occupied">Terisi Kapal</option>
                  <option value="maintenance">Maintenance / Perawatan</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBerthModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-xl"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Dermaga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YARD MODAL */}
      {isYardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 my-8">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>{editingYard ? 'Edit Blok Lapangan' : 'Tambah Blok Lapangan Baru'}</span>
              </h2>
              <button onClick={() => setIsYardModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveYard} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Kode Blok</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: BLOCK-A"
                  value={yardForm.code}
                  onChange={(e) => setYardForm({ ...yardForm, code: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nama Lapangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Lapangan Penumpukan Impor"
                  value={yardForm.name}
                  onChange={(e) => setYardForm({ ...yardForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Tipe Yard</label>
                  <select
                    value={yardForm.type}
                    onChange={(e) => setYardForm({ ...yardForm, type: e.target.value as YardBlock['type'] })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  >
                    <option value="dry">Dry Container</option>
                    <option value="reefer">Reefer (Pendingin)</option>
                    <option value="hazardous">Hazardous (B3/Hazmat)</option>
                    <option value="empty">Empty Depot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Kapasitas Maksimal (TEU)</label>
                  <input
                    type="number"
                    value={yardForm.capacityTeu}
                    onChange={(e) => setYardForm({ ...yardForm, capacityTeu: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Total Bays</label>
                  <input
                    type="number"
                    value={yardForm.bays}
                    onChange={(e) => setYardForm({ ...yardForm, bays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Total Rows</label>
                  <input
                    type="number"
                    value={yardForm.rows}
                    onChange={(e) => setYardForm({ ...yardForm, rows: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Max Tiers</label>
                  <input
                    type="number"
                    value={yardForm.maxTiers}
                    onChange={(e) => setYardForm({ ...yardForm, maxTiers: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Alat RTG / Stacker</label>
                <input
                  type="text"
                  placeholder="Contoh: RTG-01, RTG-02"
                  value={yardForm.equipmentAssigned}
                  onChange={(e) => setYardForm({ ...yardForm, equipmentAssigned: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsYardModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Blok'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl shadow-2xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Konfirmasi Hapus Data</h3>
            <p className="text-xs text-slate-300 mb-6">
              Apakah Anda yakin ingin menghapus <strong>"{deleteConfirm.name}"</strong>? Aksi ini akan mencatat log audit dan menghapus dokumen dari online database.
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
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/30 disabled:opacity-50"
              >
                {saving ? 'Menghapus...' : 'Ya, Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
