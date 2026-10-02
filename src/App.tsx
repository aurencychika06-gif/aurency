import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, signOutApp } from './services/firebase';
import { 
  Vessel, 
  Berth, 
  YardBlock, 
  Container, 
  GateTransaction, 
  AuditLog, 
  NotificationItem, 
  AppUser 
} from './types/terminal';
import { 
  subscribeToVessels,
  subscribeToBerths,
  subscribeToYardBlocks,
  subscribeToContainers,
  subscribeToGateTransactions,
  subscribeToAuditLogs,
  subscribeToNotifications
} from './services/firebase';
import { checkAndSeedInitialData } from './services/seedData';
import { LoginModal } from './components/LoginModal';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { MasterDataView } from './components/MasterDataView';
import { TransactionView } from './components/TransactionView';
import { TrackingView } from './components/TrackingView';
import { ReportsView } from './components/ReportsView';
import { DatabaseHubModal } from './components/DatabaseHubModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AuditTrailModal } from './components/AuditTrailModal';
import { VesselDetailModal } from './components/VesselDetailModal';

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('portnex_session_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'master' | 'transaction' | 'tracking' | 'reports'>('dashboard');

  // Real-time Database state
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [berths, setBerths] = useState<Berth[]>([]);
  const [yardBlocks, setYardBlocks] = useState<YardBlock[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [gateTransactions, setGateTransactions] = useState<GateTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals
  const [isDatabaseHubOpen, setIsDatabaseHubOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuditLogsOpen, setIsAuditLogsOpen] = useState(false);
  const [selectedVesselDetail, setSelectedVesselDetail] = useState<Vessel | null>(null);
  const [trackingTargetNumber, setTrackingTargetNumber] = useState<string | undefined>(undefined);

  // Seeding loading state
  const [seedingLoading, setSeedingLoading] = useState(false);

  // Monitor Firebase Auth
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const isAdmin = fbUser.email === 'aurencychika06@gmail.com';
        const userObj: AppUser = {
          uid: fbUser.uid,
          email: fbUser.email || '',
          displayName: fbUser.displayName || (isAdmin ? 'Aditya Ramadhan (Admin)' : 'Terminal Operator'),
          role: isAdmin ? 'admin' : 'terminal_manager',
          employeeId: `EMP-${fbUser.uid.substring(0, 5).toUpperCase()}`,
          department: 'Operasional Terminal'
        };
        setCurrentUser(userObj);
        localStorage.setItem('portnex_session_user', JSON.stringify(userObj));
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Connect real-time listeners to Firestore when user is present
  useEffect(() => {
    // Check and seed initial data if empty
    checkAndSeedInitialData().then((didSeed) => {
      if (didSeed) {
        console.log("Database initialized with PortNex realistic master dataset.");
      }
    });

    // Subscriptions
    const unsubVessels = subscribeToVessels((data) => setVessels(data));
    const unsubBerths = subscribeToBerths((data) => setBerths(data));
    const unsubYard = subscribeToYardBlocks((data) => setYardBlocks(data));
    const unsubContainers = subscribeToContainers((data) => setContainers(data));
    const unsubGate = subscribeToGateTransactions((data) => setGateTransactions(data));
    const unsubAudits = subscribeToAuditLogs((data) => setAuditLogs(data));
    const unsubNotifs = subscribeToNotifications((data) => setNotifications(data));

    return () => {
      unsubVessels();
      unsubBerths();
      unsubYard();
      unsubContainers();
      unsubGate();
      unsubAudits();
      unsubNotifs();
    };
  }, []);

  const handleLoginSuccess = (user: AppUser) => {
    setCurrentUser(user);
    localStorage.setItem('portnex_session_user', JSON.stringify(user));
  };

  const handleLogout = async () => {
    try {
      await signOutApp();
    } catch {
      // ignore
    }
    setCurrentUser(null);
    localStorage.removeItem('portnex_session_user');
  };

  const handleTriggerManualSeed = async () => {
    setSeedingLoading(true);
    await checkAndSeedInitialData();
    setTimeout(() => {
      setSeedingLoading(false);
    }, 800);
  };

  const handleOpenTrackingFromAnywhere = (containerNumber: string) => {
    setTrackingTargetNumber(containerNumber);
    setActiveTab('tracking');
  };

  // GATEKEEPER: "DAN SEBELUM MASUK APLIKASINYA HARUS ADA FROM LOGINYA"
  if (!currentUser) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        notifications={notifications}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenDatabaseHub={() => setIsDatabaseHubOpen(true)}
        onOpenAuditLogs={() => setIsAuditLogsOpen(true)}
        onTriggerSeed={handleTriggerManualSeed}
        seedingLoading={seedingLoading}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            vessels={vessels}
            berths={berths}
            yardBlocks={yardBlocks}
            containers={containers}
            gateTransactions={gateTransactions}
            onSelectVessel={(v) => setSelectedVesselDetail(v)}
            onNavigateToTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'master' && (
          <MasterDataView
            vessels={vessels}
            berths={berths}
            yardBlocks={yardBlocks}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'transaction' && (
          <TransactionView
            containers={containers}
            gateTransactions={gateTransactions}
            vessels={vessels}
            yardBlocks={yardBlocks}
            currentUser={currentUser}
            onOpenTracking={handleOpenTrackingFromAnywhere}
          />
        )}

        {activeTab === 'tracking' && (
          <TrackingView
            containers={containers}
            gateTransactions={gateTransactions}
            vessels={vessels}
            auditLogs={auditLogs}
            initialSearchNumber={trackingTargetNumber}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            vessels={vessels}
            berths={berths}
            yardBlocks={yardBlocks}
            containers={containers}
            gateTransactions={gateTransactions}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-4 sm:px-6 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>PortNex Container Terminal Operating System (TOS)</span>
          </div>
          <div>
            Terhubung Real-Time Database • Firestore Online • Pelabuhan Indonesia Standar Operasional
          </div>
        </div>
      </footer>

      {/* Global Modals & Drawers */}
      <DatabaseHubModal
        isOpen={isDatabaseHubOpen}
        onClose={() => setIsDatabaseHubOpen(false)}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
      />

      <AuditTrailModal
        isOpen={isAuditLogsOpen}
        onClose={() => setIsAuditLogsOpen(false)}
        auditLogs={auditLogs}
      />

      <VesselDetailModal
        vessel={selectedVesselDetail}
        onClose={() => setSelectedVesselDetail(null)}
        containers={containers}
        userName={currentUser.displayName}
      />
    </div>
  );
}
