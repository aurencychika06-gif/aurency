import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocFromServer, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  limit
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Vessel, 
  Berth, 
  YardBlock, 
  Container, 
  GateTransaction, 
  AuditLog, 
  NotificationItem, 
  AppUser,
  UserRole 
} from '../types/terminal';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// CRITICAL: Must use firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore error interface required by skills
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection test as required by skill
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Firestore online connection verified.");
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Please check your Firebase configuration or internet connection.");
      return false;
    }
    // Expected when /test/connection doc does not exist yet; connection is alive
    return true;
  }
}

// Execute connection test on boot
testConnection();

// --- Auth Utilities ---
export async function signInWithGoogle(): Promise<AppUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    
    // Check if user is the root admin
    const isAdmin = fbUser.email === 'aurencychika06@gmail.com';
    const role: UserRole = isAdmin ? 'admin' : 'terminal_manager';

    const userProfile: AppUser = {
      uid: fbUser.uid,
      email: fbUser.email || '',
      displayName: fbUser.displayName || 'Terminal Staff',
      role,
      employeeId: `EMP-${fbUser.uid.substring(0, 5).toUpperCase()}`,
      department: isAdmin ? 'Executive Operation' : 'Operations & Logistics',
      photoURL: fbUser.photoURL || undefined,
    };

    // Save/update profile in Firestore
    try {
      await setDoc(doc(db, 'users', fbUser.uid), userProfile, { merge: true });
    } catch {
      // Non-blocking if rules are pending
    }

    return userProfile;
  } catch (err) {
    console.error("Sign in with Google error:", err);
    throw err;
  }
}

export async function signOutApp(): Promise<void> {
  await fbSignOut(auth);
}

// --- Audit Log Utility ---
export async function recordAudit(
  action: string, 
  module: string, 
  details: string, 
  performedBy: string,
  entityId?: string,
  entityName?: string
) {
  const logData: Omit<AuditLog, 'id'> = {
    action,
    module,
    details,
    performedBy,
    entityId: entityId || '',
    entityName: entityName || '',
    timestamp: new Date().toISOString()
  };

  try {
    await addDoc(collection(db, 'auditLogs'), logData);
  } catch (error) {
    console.warn("Audit log creation notice:", error);
  }
}

// --- Notification Utility ---
export async function pushNotification(
  title: string,
  message: string,
  type: 'info' | 'warning' | 'success' | 'alert' = 'info',
  link?: string
) {
  try {
    await addDoc(collection(db, 'notifications'), {
      title,
      message,
      type,
      read: false,
      link: link || '',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.warn("Notification push notice:", error);
  }
}

// --- Realtime Subscriptions ---

export function subscribeToVessels(callback: (vessels: Vessel[]) => void, onError?: (err: unknown) => void) {
  const path = 'vessels';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Vessel[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Vessel);
      });
      callback(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeToBerths(callback: (berths: Berth[]) => void, onError?: (err: unknown) => void) {
  const path = 'berths';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Berth[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Berth);
      });
      callback(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeToYardBlocks(callback: (blocks: YardBlock[]) => void, onError?: (err: unknown) => void) {
  const path = 'yardBlocks';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: YardBlock[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as YardBlock);
      });
      callback(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeToContainers(callback: (containers: Container[]) => void, onError?: (err: unknown) => void) {
  const path = 'containers';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Container[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Container);
      });
      callback(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeToGateTransactions(callback: (txs: GateTransaction[]) => void, onError?: (err: unknown) => void) {
  const path = 'gateTransactions';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: GateTransaction[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as GateTransaction);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeToAuditLogs(callback: (logs: AuditLog[]) => void, onError?: (err: unknown) => void) {
  const path = 'auditLogs';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: AuditLog[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as AuditLog);
      });
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      callback(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export function subscribeToNotifications(callback: (notifications: NotificationItem[]) => void, onError?: (err: unknown) => void) {
  const path = 'notifications';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: NotificationItem[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as NotificationItem);
      });
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

// --- CRUD Operations for Vessels ---
export async function createVessel(vessel: Omit<Vessel, 'id'>, performedBy: string): Promise<string> {
  const path = 'vessels';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...vessel,
      updatedAt: new Date().toISOString()
    });
    await recordAudit('CREATE', 'Master Kapal', `Menambahkan kapal baru ${vessel.name} (${vessel.callSign})`, performedBy, docRef.id, vessel.name);
    await pushNotification('Kapal Baru Ditambahkan', `Kapal ${vessel.name} (${vessel.shippingLine}) terdaftar dalam jadwal port.`, 'info');
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateVessel(id: string, vessel: Partial<Vessel>, performedBy: string): Promise<void> {
  const path = `vessels/${id}`;
  try {
    await updateDoc(doc(db, 'vessels', id), {
      ...vessel,
      updatedAt: new Date().toISOString()
    });
    await recordAudit('UPDATE', 'Master Kapal', `Memperbarui data kapal ${vessel.name || id}`, performedBy, id, vessel.name);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteVessel(id: string, vesselName: string, performedBy: string): Promise<void> {
  const path = `vessels/${id}`;
  try {
    await deleteDoc(doc(db, 'vessels', id));
    await recordAudit('DELETE', 'Master Kapal', `Menghapus kapal ${vesselName} (ID: ${id})`, performedBy, id, vesselName);
    await pushNotification('Kapal Dihapus', `Data kapal ${vesselName} telah dihapus dari sistem.`, 'warning');
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- CRUD Operations for Berths ---
export async function createBerth(berth: Omit<Berth, 'id'>, performedBy: string): Promise<string> {
  const path = 'berths';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...berth,
      updatedAt: new Date().toISOString()
    });
    await recordAudit('CREATE', 'Master Dermaga', `Menambahkan dermaga ${berth.name} (${berth.code})`, performedBy, docRef.id, berth.name);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateBerth(id: string, berth: Partial<Berth>, performedBy: string): Promise<void> {
  const path = `berths/${id}`;
  try {
    await updateDoc(doc(db, 'berths', id), {
      ...berth,
      updatedAt: new Date().toISOString()
    });
    await recordAudit('UPDATE', 'Master Dermaga', `Memperbarui status dermaga ${berth.name || id}`, performedBy, id, berth.name);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteBerth(id: string, berthName: string, performedBy: string): Promise<void> {
  const path = `berths/${id}`;
  try {
    await deleteDoc(doc(db, 'berths', id));
    await recordAudit('DELETE', 'Master Dermaga', `Menghapus dermaga ${berthName}`, performedBy, id, berthName);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- CRUD Operations for Yard Blocks ---
export async function createYardBlock(block: Omit<YardBlock, 'id'>, performedBy: string): Promise<string> {
  const path = 'yardBlocks';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...block,
      updatedAt: new Date().toISOString()
    });
    await recordAudit('CREATE', 'Master Lapangan', `Menambahkan blok penumpukan ${block.name} (${block.code})`, performedBy, docRef.id, block.name);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateYardBlock(id: string, block: Partial<YardBlock>, performedBy: string): Promise<void> {
  const path = `yardBlocks/${id}`;
  try {
    await updateDoc(doc(db, 'yardBlocks', id), {
      ...block,
      updatedAt: new Date().toISOString()
    });
    await recordAudit('UPDATE', 'Master Lapangan', `Memperbarui data blok penumpukan ${block.name || id}`, performedBy, id, block.name);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteYardBlock(id: string, blockName: string, performedBy: string): Promise<void> {
  const path = `yardBlocks/${id}`;
  try {
    await deleteDoc(doc(db, 'yardBlocks', id));
    await recordAudit('DELETE', 'Master Lapangan', `Menghapus blok ${blockName}`, performedBy, id, blockName);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- CRUD Operations for Containers ---
export async function createContainer(container: Omit<Container, 'id'>, performedBy: string): Promise<string> {
  const path = 'containers';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...container,
      updatedAt: new Date().toISOString()
    });
    await recordAudit('CREATE', 'Data Kontainer', `Menambahkan kontainer ${container.containerNumber} (${container.size}ft ${container.isoType})`, performedBy, docRef.id, container.containerNumber);
    await pushNotification('Kontainer Baru Terdaftar', `Kontainer ${container.containerNumber} dialokasikan ke posisi ${container.yardPosition || 'Quay/Vessel'}.`, 'info');
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateContainer(id: string, container: Partial<Container>, performedBy: string): Promise<void> {
  const path = `containers/${id}`;
  try {
    await updateDoc(doc(db, 'containers', id), {
      ...container,
      updatedAt: new Date().toISOString()
    });
    await recordAudit('UPDATE', 'Data Kontainer', `Memperbarui data / posisi kontainer ${container.containerNumber || id}`, performedBy, id, container.containerNumber);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteContainer(id: string, containerNumber: string, performedBy: string): Promise<void> {
  const path = `containers/${id}`;
  try {
    await deleteDoc(doc(db, 'containers', id));
    await recordAudit('DELETE', 'Data Kontainer', `Menghapus kontainer ${containerNumber}`, performedBy, id, containerNumber);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- CRUD Operations for Gate Transactions ---
export async function createGateTransaction(tx: Omit<GateTransaction, 'id'>, performedBy: string): Promise<string> {
  const path = 'gateTransactions';
  try {
    const docRef = await addDoc(collection(db, path), {
      ...tx,
      createdAt: new Date().toISOString()
    });
    await recordAudit('CREATE', 'Transaksi Gate', `Tiket ${tx.ticketNumber} (${tx.transactionType}) diterbitkan untuk truk ${tx.truckPlateNumber}`, performedBy, docRef.id, tx.ticketNumber);
    await pushNotification(`Transaksi ${tx.transactionType} Sukses`, `Truk ${tx.truckPlateNumber} dengan kontainer ${tx.containerNumber} telah diproses di ${tx.laneNumber}.`, 'success');
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateGateTransaction(id: string, tx: Partial<GateTransaction>, performedBy: string): Promise<void> {
  const path = `gateTransactions/${id}`;
  try {
    await updateDoc(doc(db, 'gateTransactions', id), tx);
    await recordAudit('UPDATE', 'Transaksi Gate', `Memperbarui transaksi gerbang ${tx.ticketNumber || id}`, performedBy, id, tx.ticketNumber);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteGateTransaction(id: string, ticketNumber: string, performedBy: string): Promise<void> {
  const path = `gateTransactions/${id}`;
  try {
    await deleteDoc(doc(db, 'gateTransactions', id));
    await recordAudit('DELETE', 'Transaksi Gate', `Menghapus tiket gerbang ${ticketNumber}`, performedBy, id, ticketNumber);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Notification Actions ---
export async function markNotificationRead(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  } catch (error) {
    console.error("Mark notification read error:", error);
  }
}

export async function clearAllNotifications(notifications: NotificationItem[]): Promise<void> {
  try {
    for (const notif of notifications) {
      await deleteDoc(doc(db, 'notifications', notif.id));
    }
  } catch (error) {
    console.error("Clear notifications error:", error);
  }
}
