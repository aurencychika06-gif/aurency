import React from 'react';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { NotificationItem } from '../types/terminal';
import { markNotificationRead, clearAllNotifications } from '../services/firebase';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications
}) => {
  if (!isOpen) return null;

  const handleMarkAsRead = async (id: string) => {
    await markNotificationRead(id);
  };

  const handleClearAll = async () => {
    await clearAllNotifications(notifications);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white">Notifikasi Operasional</h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              {notifications.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                title="Hapus Semua Notifikasi"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notification Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
              <Bell className="w-10 h-10 text-slate-700 mb-2" />
              <span>Tidak ada notifikasi aktif saat ini.</span>
              <span className="text-[10px] text-slate-500 mt-1">Notifikasi otomatis muncul ketika ada aktivitas kapal atau gerbang.</span>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = !n.read;
              return (
                <div
                  key={n.id}
                  onClick={() => isUnread && handleMarkAsRead(n.id)}
                  className={`p-3.5 rounded-xl border text-xs transition cursor-pointer ${
                    isUnread
                      ? 'bg-slate-850 border-cyan-500/40 shadow-md shadow-cyan-950/20'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      {n.type === 'alert' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                      {n.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                      {n.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      {n.type === 'info' && <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                      <span>{n.title}</span>
                    </span>

                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 mt-1"></span>
                    )}
                  </div>

                  <p className="text-slate-300 text-[11px] leading-relaxed mb-2">{n.message}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                    </span>
                    {isUnread && (
                      <span className="text-cyan-400 hover:underline">Tandai sudah dibaca</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 text-center text-[11px] text-slate-400 font-mono">
          <span>Notifikasi Terhubung ke Realtime Snapshot Stream</span>
        </div>
      </div>
    </div>
  );
};
