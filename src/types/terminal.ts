export type UserRole = 
  | 'admin' 
  | 'terminal_manager' 
  | 'ship_planner' 
  | 'yard_supervisor' 
  | 'gate_operator';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  employeeId?: string;
  department?: string;
  photoURL?: string;
}

export type VesselStatus = 'anchorage' | 'berthing' | 'working' | 'completed' | 'departed';

export interface Vessel {
  id: string;
  name: string;
  callSign: string;
  imoNumber: string;
  flag: string;
  shippingLine: string;
  loa: number; // Length Overall in meters
  beam: number; // Width in meters
  draft: number; // Draft in meters
  capacityTeu: number;
  status: VesselStatus;
  berthAssigned?: string;
  eta: string; // ISO date string
  etd: string; // ISO date string
  dischargeTarget: number;
  loadTarget: number;
  dischargedCount: number;
  loadedCount: number;
  updatedAt: string;
}

export type BerthStatus = 'available' | 'occupied' | 'maintenance' | 'reserved';

export interface Berth {
  id: string;
  code: string; // e.g. "D-01"
  name: string; // e.g. "Dermaga Internasional 01"
  lengthMeters: number;
  depthMeters: number;
  maxDraft: number;
  cranesAssigned: string; // e.g. "STS-01, STS-02"
  status: BerthStatus;
  currentVessel?: string;
  bollardStart?: number;
  bollardEnd?: number;
  updatedAt: string;
}

export type YardType = 'dry' | 'reefer' | 'hazardous' | 'empty';

export interface YardBlock {
  id: string;
  code: string; // e.g. "BLOCK-A"
  name: string;
  type: YardType;
  capacityTeu: number;
  currentTeu: number;
  maxTiers: number; // e.g. 5
  rows: number; // e.g. 6
  bays: number; // e.g. 12
  equipmentAssigned: string; // e.g. "RTG-01, RTG-02"
  updatedAt: string;
}

export type ContainerSize = '20' | '40' | '45';
export type ContainerCategory = 'import' | 'export' | 'transshipment' | 'empty';
export type ContainerLocation = 'vessel' | 'yard' | 'quay' | 'gate' | 'delivered';
export type ContainerStatus = 'planned' | 'discharging' | 'in_yard' | 'loading' | 'on_board' | 'gate_out';

export interface Container {
  id: string;
  containerNumber: string; // e.g. "MSKU7281920"
  isoType: string; // 20GP, 40HC, etc.
  size: ContainerSize;
  category: ContainerCategory;
  grossWeightTon: number;
  sealNumber: string;
  vesselId?: string;
  vesselName?: string;
  locationType: ContainerLocation;
  yardPosition?: string; // e.g. "A-04-02-3" (Block-Bay-Row-Tier)
  temperature?: number; // for reefer
  hazardousClass?: string; // IMO Class e.g. "Class 3 - Flammable"
  consigneeOrShipper: string;
  status: ContainerStatus;
  gateInAt?: string;
  gateOutAt?: string;
  dwellDays: number;
  updatedAt: string;
}

export type GateTransactionType = 'GATE_IN' | 'GATE_OUT';
export type GateStatus = 'approved' | 'pending_inspection' | 'rejected';

export interface GateTransaction {
  id: string;
  ticketNumber: string;
  transactionType: GateTransactionType;
  containerNumber: string;
  truckPlateNumber: string;
  driverName: string;
  transporterCompany: string;
  eirNumber: string; // Equipment Interchange Receipt
  sealNumber: string;
  damageCondition: string; // "Baik / Tanpa Kerusakan", "Penyok Samping", etc.
  laneNumber: string;
  operatorName: string;
  status: GateStatus;
  notes?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  module: string;
  entityId?: string;
  entityName?: string;
  details: string;
  performedBy: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  link?: string;
  createdAt: string;
}
