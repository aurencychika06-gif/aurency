import React, { useState, useEffect } from 'react';
import { 
  Ship, 
  LayoutDashboard, 
  Database, 
  ArrowLeftRight, 
  Search, 
  FileText, 
  Bell, 
  LogOut, 
  RefreshCw, 
  Activity, 
  Shield, 
  Sparkles,
  Server,
  Layers
} from 'lucide-react';
import { AppUser, NotificationItem } from '../types/terminal';

interface NavbarProps {
  activeTab: 'dashboard' | 'master' | 'transaction' | 'tracking' | 'reports';
  setActiveTab: (tab: 'dashboard' | 'master' | 'transaction' | 'tracking' | 'reports') => void;
  currentUser: AppUser | null;
  onLogout: () => void;
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onOpenDatabaseHub: () => void;
  onOpenAuditLogs: () => void;
  onTriggerSeed: () => void;
  seedingLoading: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  notifications,
  onOpenNotifications,
  onOpenDatabaseHub,
  onOpenAuditLogs,
  onTriggerSeed,
  seedingLoading
}) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('id-ID'));
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('id-ID'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return { label: 'SUPER ADMIN', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' };
      case 'terminal_manager':
        return { label: 'TERMINAL MGR', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'ship_planner':
        return { label: 'SHIP PLANNER', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' };
      case 'yard_supervisor':
        return { label: 'YARD SPV', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'gate_operator':
        return { label: 'GATE OPERATOR', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      default:
        return { label: 'OFFICER', color: 'bg-slate-700 text-slate-300 border-slate-600' };
    }
  };

  const roleInfo = getRoleBadge(currentUser?.role);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/90 bg-slate-950/80 backdrop-blur-xl">
      {/* Top micro bar: Real-time telemetry */}
      <div className="px-4 py-1 bg-slate-900/60 border-b border-slate-800/40 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-mono font-medium">TERMINAL BERSTATUS OPERASIONAL ONLINE</span>
          </div>
          <span className="hidden md:inline text-slate-600">|</span>
          <button 
            onClick={onOpenDatabaseHub}
            className="hidden md:flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 hover:underline transition"
          >
            <Server className="w-3 h-3 text-cyan-400" />
            <span>Database Hub: Firebase Firestore (Active) • Neon DB • Supabase</span>
          </button>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="text-slate-300 font-semibold">{time} WIB</span>
          <span className="text-slate-500 hidden sm:inline">UTC+07</span>
          <button 
            onClick={onTriggerSeed} 
            disabled={seedingLoading}
            title="Inisialisasi atau Tambah Data Contoh Realistis"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 text-cyan-300 text-[10px] transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${seedingLoading ? 'animate-spin' : ''}`} />
            <span>{seedingLoading ? 'Menyinkronkan...' : 'Sinkron/Reset Data Master'}</span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
              <Ship className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  Port<span className="text-cyan-400">Nex</span>
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  TOS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider uppercase font-medium">Terminal Petikemas Digital</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard Analitik</span>
            </button>

            <button
              onClick={() => setActiveTab('master')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'master'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Master Data</span>
            </button>

            <button
              onClick={() => setActiveTab('transaction')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'transaction'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Transaksi Data</span>
            </button>

            <button
              onClick={() => setActiveTab('tracking')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'tracking'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Pelacakan Kontainer</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition flex items-center gap-2 ${
                activeTab === 'reports'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Laporan & KPI</span>
            </button>
          </nav>

          {/* Right Action Icons & User profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Database Hub Trigger */}
            <button
              onClick={onOpenDatabaseHub}
              title="Status Database & Multi-Cloud Connectors"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-700/80 transition"
            >
              <Server className="w-4 h-4" />
            </button>

            {/* Audit Trail Modal Trigger */}
            <button
              onClick={onOpenAuditLogs}
              title="Audit Trail & Histori Pelacakan Log"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition"
            >
              <Activity className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80 transition"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* User Profile Pill */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {currentUser.displayName}
                  </div>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border ${roleInfo.color}`}>
                      {roleInfo.label}
                    </span>
                  </div>
                </div>

                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center font-bold text-xs text-white border border-cyan-400/40 uppercase">
                  {currentUser.displayName.substring(0, 2)}
                </div>

                <button
                  onClick={onLogout}
                  title="Keluar dari Sistem (Logout)"
                  className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2.5 border-t border-slate-800/60 gap-1.5 scrollbar-none">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'dashboard' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('master')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'master' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            Master Data
          </button>
          <button
            onClick={() => setActiveTab('transaction')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'transaction' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            Transaksi
          </button>
          <button
            onClick={() => setActiveTab('tracking')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'tracking' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            Pelacakan
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              activeTab === 'reports' ? 'bg-cyan-600 text-white' : 'text-slate-400'
            }`}
          >
            Laporan
          </button>
        </div>
      </div>
    </header>
  );
};
