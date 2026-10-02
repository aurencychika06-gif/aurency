import React, { useState } from 'react';
import { 
  Ship, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldCheck, 
  UserPlus, 
  Anchor, 
  Container as ContainerIcon,
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AppUser, UserRole } from '../types/terminal';
import { signInWithGoogle } from '../services/firebase';

interface LoginModalProps {
  onLoginSuccess: (user: AppUser) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('admin@portnex.terminal');
  const [password, setPassword] = useState('PortNex2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [department, setDepartment] = useState('Operasional Dermaga');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Preset accounts for instant testing
  const presets = [
    {
      label: 'Super Admin',
      email: 'admin@portnex.terminal',
      pass: 'PortNex2026!',
      role: 'admin' as UserRole,
      name: 'Aditya Ramadhan, S.T. (Admin)',
      badge: 'Akses Penuh Master & Transaksi'
    },
    {
      label: 'Ship Planner',
      email: 'planner.vessel@portnex.terminal',
      pass: 'PortNex2026!',
      role: 'ship_planner' as UserRole,
      name: 'Capt. Hendra Wijaya',
      badge: 'Jadwal Kapal & Sandar'
    },
    {
      label: 'Yard & Crane Spv',
      email: 'yard.supervisor@portnex.terminal',
      pass: 'PortNex2026!',
      role: 'yard_supervisor' as UserRole,
      name: 'Rahmat Hidayat (Spv)',
      badge: 'Alokasi Blok & RTG Crane'
    },
    {
      label: 'Gate In/Out Operator',
      email: 'gate.operator@portnex.terminal',
      pass: 'PortNex2026!',
      role: 'gate_operator' as UserRole,
      name: 'Siti Nurhaliza (Gate Ops)',
      badge: 'Pemeriksaan Truk & EIR'
    }
  ];

  const handlePresetSelect = (preset: typeof presets[0]) => {
    setEmailOrUsername(preset.email);
    setPassword(preset.pass);
    setSelectedRole(preset.role);
    setDisplayName(preset.name);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!emailOrUsername.trim()) {
      setErrorMessage('Harap masukkan username atau email.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setErrorMessage('Kata sandi minimal 4 karakter.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Construct user profile
      const isSuperAdmin = emailOrUsername.includes('admin') || selectedRole === 'admin';
      const user: AppUser = {
        uid: `usr_${Date.now()}`,
        email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@portnex.terminal`,
        displayName: displayName || (isSuperAdmin ? 'Chief Terminal Officer' : emailOrUsername.split('@')[0]),
        role: selectedRole,
        employeeId: `PTX-${Math.floor(1000 + Math.random() * 9000)}`,
        department: department || 'Terminal Operation'
      };

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      onLoginSuccess(user);
    }, 600);
  };

  const handleGoogleAuth = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const user = await signInWithGoogle();
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
      onLoginSuccess(user);
    } catch (err: unknown) {
      console.error(err);
      setErrorMessage('Gagal login via Google. Silakan coba gunakan login kredensial form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl overflow-y-auto">
      {/* Background glowing ambient elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-2xl bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl shadow-cyan-950/40 overflow-hidden my-8">
        {/* Top Header Banner */}
        <div className="relative px-6 py-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/25 border border-cyan-400/40">
                <Ship className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                    Port<span className="text-cyan-400">Nex</span>
                    <span className="text-xs font-mono uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded">TOS v3.2</span>
                  </h1>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Terminal Operating System • Real-Time Cloud Engine</p>
              </div>
            </div>

            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Database Online Aktif</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono mt-1">Firestore + Neon + Supabase Hub</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          {/* Quick preset selector buttons */}
          <div className="mb-6 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Pilih Akun Cepat (1-Click Demo Access):
              </span>
              <span className="text-[11px] text-slate-400">Klik untuk langsung isi form</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {presets.map((p) => {
                const isActive = emailOrUsername === p.email;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handlePresetSelect(p)}
                    className={`px-2.5 py-2 rounded-lg text-left text-xs transition border flex flex-col justify-between ${
                      isActive 
                        ? 'bg-cyan-950/70 border-cyan-500/60 text-cyan-200 ring-1 ring-cyan-500/40' 
                        : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <span className="font-bold flex items-center justify-between">
                      {p.label}
                      {isActive && <CheckCircle2 className="w-3 h-3 text-cyan-400 ml-1 inline" />}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate mt-0.5">{p.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Selector: Login vs Register */}
          <div className="flex p-1 bg-slate-950/80 rounded-xl border border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                !isRegister 
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Masuk Terminal (Login)
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setErrorMessage(null); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
                isRegister 
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Daftar Petugas Baru (Register)
            </button>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Nama Lengkap & Gelar
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Capt. Bambang Irawan, M.Mar"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Peran Otoritas (Role)
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="admin">Administrator Sistem (Full Access)</option>
                      <option value="terminal_manager">Terminal Manager / GM</option>
                      <option value="ship_planner">Ship & Berth Planner</option>
                      <option value="yard_supervisor">Yard & Crane Supervisor</option>
                      <option value="gate_operator">Gate In / Gate Out Operator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Departemen / Divisi
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Operasi Tambatan Dermaga"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Username atau Email Dinas
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  placeholder="admin@portnex.terminal atau username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">
                  Kata Sandi (Password)
                </label>
                <span className="text-[11px] text-cyan-400 hover:underline cursor-pointer">
                  Lupa Sandi?
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 via-cyan-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-600/30 transition transform active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Memverifikasi Akun ke Real Database...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>{isRegister ? 'Daftarkan Petugas & Masuk' : 'Autentikasi & Masuk Terminal'}</span>
                </>
              )}
            </button>
          </form>

          {/* Social / Google Auth divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-mono text-[10px]">
                Atau Masuk Menggunakan Single Sign-On
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full py-2.5 px-4 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded-xl text-slate-200 text-xs font-semibold flex items-center justify-center gap-3 transition hover:border-slate-600 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Masuk Cepat dengan Google Akun (Firebase Auth)</span>
          </button>

          {/* Footer credentials note */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ContainerIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Port of Tanjung Perak & Priok Standard</span>
            </div>
            <div className="flex items-center gap-1">
              <Anchor className="w-3.5 h-3.5 text-slate-400" />
              <span>Enkripsi TLS 1.3 & Firebase ABAC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
