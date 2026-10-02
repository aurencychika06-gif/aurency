import { 
  collection, 
  getDocs, 
  writeBatch, 
  doc 
} from 'firebase/firestore';
import { db } from './firebase';
import { Vessel, Berth, YardBlock, Container, GateTransaction, NotificationItem, AuditLog } from '../types/terminal';

export async function checkAndSeedInitialData(): Promise<boolean> {
  try {
    const vesselsSnap = await getDocs(collection(db, 'vessels'));
    if (!vesselsSnap.empty) {
      console.log("Database already initialized with data.");
      return false;
    }

    console.log("Seeding initial PortNex Terminal Operasional data to Firestore...");
    const batch = writeBatch(db);

    // Initial Vessels
    const initialVessels: Omit<Vessel, 'id'>[] = [
      {
        name: "MV Meratus Nusantara",
        callSign: "YB2918",
        imoNumber: "9382104",
        flag: "Indonesia 🇮🇩",
        shippingLine: "Meratus Line",
        loa: 195,
        beam: 30,
        draft: 10.5,
        capacityTeu: 2500,
        status: "working",
        berthAssigned: "D-01 (Dermaga Internasional 01)",
        eta: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        etd: new Date(Date.now() + 22 * 3600 * 1000).toISOString(),
        dischargeTarget: 420,
        loadTarget: 380,
        dischargedCount: 310,
        loadedCount: 140,
        updatedAt: new Date().toISOString()
      },
      {
        name: "MSC Palmetto Leader",
        callSign: "3ELW8",
        imoNumber: "9781921",
        flag: "Panama 🇵🇦",
        shippingLine: "Mediterranean Shipping Co.",
        loa: 335,
        beam: 48,
        draft: 14.2,
        capacityTeu: 9800,
        status: "berthing",
        berthAssigned: "D-02 (Dermaga Internasional 02)",
        eta: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        etd: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        dischargeTarget: 850,
        loadTarget: 720,
        dischargedCount: 120,
        loadedCount: 40,
        updatedAt: new Date().toISOString()
      },
      {
        name: "Maersk Tanjung Priok",
        callSign: "OX2819",
        imoNumber: "9651203",
        flag: "Denmark 🇩🇰",
        shippingLine: "Maersk Line",
        loa: 260,
        beam: 38,
        draft: 12.0,
        capacityTeu: 4500,
        status: "anchorage",
        berthAssigned: "Pending (Menunggu D-01)",
        eta: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
        etd: new Date(Date.now() + 60 * 3600 * 1000).toISOString(),
        dischargeTarget: 600,
        loadTarget: 550,
        dischargedCount: 0,
        loadedCount: 0,
        updatedAt: new Date().toISOString()
      },
      {
        name: "Samudera Jaya VI",
        callSign: "YC7741",
        imoNumber: "9248102",
        flag: "Indonesia 🇮🇩",
        shippingLine: "Samudera Shipping Line",
        loa: 160,
        beam: 25,
        draft: 8.5,
        capacityTeu: 1200,
        status: "completed",
        berthAssigned: "D-03 (Dermaga Feeder)",
        eta: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        etd: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
        dischargeTarget: 280,
        loadTarget: 310,
        dischargedCount: 280,
        loadedCount: 310,
        updatedAt: new Date().toISOString()
      }
    ];

    initialVessels.forEach(v => {
      const ref = doc(collection(db, 'vessels'));
      batch.set(ref, v);
    });

    // Initial Berths
    const initialBerths: Omit<Berth, 'id'>[] = [
      {
        code: "D-01",
        name: "Dermaga Internasional 01",
        lengthMeters: 380,
        depthMeters: 15.0,
        maxDraft: 14.5,
        cranesAssigned: "STS-01, STS-02",
        status: "occupied",
        currentVessel: "MV Meratus Nusantara",
        bollardStart: 1,
        bollardEnd: 24,
        updatedAt: new Date().toISOString()
      },
      {
        code: "D-02",
        name: "Dermaga Internasional 02",
        lengthMeters: 420,
        depthMeters: 16.0,
        maxDraft: 15.2,
        cranesAssigned: "STS-03, STS-04",
        status: "occupied",
        currentVessel: "MSC Palmetto Leader",
        bollardStart: 25,
        bollardEnd: 52,
        updatedAt: new Date().toISOString()
      },
      {
        code: "D-03",
        name: "Dermaga Domestik & Feeder 03",
        lengthMeters: 300,
        depthMeters: 12.0,
        maxDraft: 11.5,
        cranesAssigned: "STS-05",
        status: "occupied",
        currentVessel: "Samudera Jaya VI",
        bollardStart: 53,
        bollardEnd: 72,
        updatedAt: new Date().toISOString()
      },
      {
        code: "D-04",
        name: "Dermaga Cadangan 04 (Multi-Purpose)",
        lengthMeters: 250,
        depthMeters: 11.0,
        maxDraft: 10.0,
        cranesAssigned: "MHC-01 (Mobile Harbour Crane)",
        status: "available",
        bollardStart: 73,
        bollardEnd: 88,
        updatedAt: new Date().toISOString()
      }
    ];

    initialBerths.forEach(b => {
      const ref = doc(collection(db, 'berths'));
      batch.set(ref, b);
    });

    // Initial Yard Blocks
    const initialYardBlocks: Omit<YardBlock, 'id'>[] = [
      {
        code: "BLOCK-A",
        name: "Lapangan Penumpukan Impor (Dry)",
        type: "dry",
        capacityTeu: 1200,
        currentTeu: 960,
        maxTiers: 5,
        rows: 6,
        bays: 14,
        equipmentAssigned: "RTG-01, RTG-02",
        updatedAt: new Date().toISOString()
      },
      {
        code: "BLOCK-B",
        name: "Lapangan Penumpukan Ekspor (Dry)",
        type: "dry",
        capacityTeu: 1000,
        currentTeu: 720,
        maxTiers: 5,
        rows: 6,
        bays: 12,
        equipmentAssigned: "RTG-03",
        updatedAt: new Date().toISOString()
      },
      {
        code: "REEFER-01",
        name: "Lapangan Berpendingin (Reefer Stacking)",
        type: "reefer",
        capacityTeu: 400,
        currentTeu: 260,
        maxTiers: 4,
        rows: 4,
        bays: 8,
        equipmentAssigned: "RTG-04 (Monitoring Plug)",
        updatedAt: new Date().toISOString()
      },
      {
        code: "EMPTY-01",
        name: "Depo Kontainer Kosong (Empty Storage)",
        type: "empty",
        capacityTeu: 800,
        currentTeu: 490,
        maxTiers: 6,
        rows: 6,
        bays: 10,
        equipmentAssigned: "Reach Stacker RS-01, RS-02",
        updatedAt: new Date().toISOString()
      }
    ];

    initialYardBlocks.forEach(y => {
      const ref = doc(collection(db, 'yardBlocks'));
      batch.set(ref, y);
    });

    // Initial Containers
    const initialContainers: Omit<Container, 'id'>[] = [
      {
        containerNumber: "MSKU9281724",
        isoType: "40HC",
        size: "40",
        category: "import",
        grossWeightTon: 24.8,
        sealNumber: "SL-992144",
        vesselName: "MV Meratus Nusantara",
        locationType: "yard",
        yardPosition: "A-04-02-3",
        consigneeOrShipper: "PT Indofood Sukses Makmur",
        status: "in_yard",
        gateInAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        dwellDays: 2,
        updatedAt: new Date().toISOString()
      },
      {
        containerNumber: "MRKU8810291",
        isoType: "40RF",
        size: "40",
        category: "import",
        grossWeightTon: 28.2,
        sealNumber: "SL-771829",
        vesselName: "MSC Palmetto Leader",
        locationType: "yard",
        yardPosition: "R-02-01-2",
        temperature: -18.5,
        consigneeOrShipper: "PT Charoen Pokphand Indonesia",
        status: "in_yard",
        gateInAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        dwellDays: 1,
        updatedAt: new Date().toISOString()
      },
      {
        containerNumber: "TCLU4910283",
        isoType: "20GP",
        size: "20",
        category: "export",
        grossWeightTon: 18.5,
        sealNumber: "SL-661290",
        vesselName: "Samudera Jaya VI",
        locationType: "quay",
        yardPosition: "B-03-04-1",
        consigneeOrShipper: "PT Mayora Indah Tbk",
        status: "loading",
        gateInAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        dwellDays: 1,
        updatedAt: new Date().toISOString()
      },
      {
        containerNumber: "SITU3391028",
        isoType: "20GP",
        size: "20",
        category: "import",
        grossWeightTon: 22.1,
        sealNumber: "SL-118274",
        vesselName: "MV Meratus Nusantara",
        locationType: "vessel",
        hazardousClass: "IMO Class 3 (Flammable Liquids)",
        consigneeOrShipper: "PT Astra Otoparts Tbk",
        status: "discharging",
        dwellDays: 0,
        updatedAt: new Date().toISOString()
      },
      {
        containerNumber: "EMCU5581902",
        isoType: "40HC",
        size: "40",
        category: "transshipment",
        grossWeightTon: 26.4,
        sealNumber: "SL-883910",
        vesselName: "MSC Palmetto Leader",
        locationType: "yard",
        yardPosition: "A-06-03-4",
        consigneeOrShipper: "DHL Global Forwarding",
        status: "in_yard",
        dwellDays: 4,
        updatedAt: new Date().toISOString()
      },
      {
        containerNumber: "CXRU1298471",
        isoType: "20GP",
        size: "20",
        category: "empty",
        grossWeightTon: 2.3,
        sealNumber: "EMPTY-N/A",
        locationType: "yard",
        yardPosition: "E-01-02-5",
        consigneeOrShipper: "Ocean Network Express (ONE)",
        status: "in_yard",
        dwellDays: 6,
        updatedAt: new Date().toISOString()
      }
    ];

    initialContainers.forEach(c => {
      const ref = doc(collection(db, 'containers'));
      batch.set(ref, c);
    });

    // Initial Gate Transactions
    const initialGateTxs: Omit<GateTransaction, 'id'>[] = [
      {
        ticketNumber: "EIR-20261001-0081",
        transactionType: "GATE_IN",
        containerNumber: "MSKU9281724",
        truckPlateNumber: "B 9481 UXT",
        driverName: "Bambang Sudirman",
        transporterCompany: "PT Puninar Jaya Logistics",
        eirNumber: "EIR-ID-JKT-88912",
        sealNumber: "SL-992144",
        damageCondition: "Kondisi Baik / Utuh",
        laneNumber: "Gate In Lane 02",
        operatorName: "Agus Prasetyo",
        status: "approved",
        notes: "Muatan ekspor diverifikasi bea cukai",
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      },
      {
        ticketNumber: "EIR-20261001-0082",
        transactionType: "GATE_OUT",
        containerNumber: "MRKU8810291",
        truckPlateNumber: "B 9102 QWA",
        driverName: "Rudi Hermawan",
        transporterCompany: "PT Samudera Cargo Express",
        eirNumber: "EIR-ID-JKT-88913",
        sealNumber: "SL-771829",
        damageCondition: "Kondisi Baik / Plug Terjaga",
        laneNumber: "Gate Out Lane 01",
        operatorName: "Eko Nugroho",
        status: "approved",
        notes: "Reefer plug dilepas pada 18:30 WIB",
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
      },
      {
        ticketNumber: "EIR-20261001-0083",
        transactionType: "GATE_IN",
        containerNumber: "TCLU4910283",
        truckPlateNumber: "L 8412 UZ",
        driverName: "Dedi Supardi",
        transporterCompany: "PT Siba Surya Trans",
        eirNumber: "EIR-ID-JKT-88914",
        sealNumber: "SL-661290",
        damageCondition: "Goresan Ringan Pintu Belakang",
        laneNumber: "Gate In Lane 01",
        operatorName: "Agus Prasetyo",
        status: "approved",
        notes: "Catatan goresan dicantumkan pada EIR digital",
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      }
    ];

    initialGateTxs.forEach(g => {
      const ref = doc(collection(db, 'gateTransactions'));
      batch.set(ref, g);
    });

    // Initial Notifications
    const initialNotifs: Omit<NotificationItem, 'id'>[] = [
      {
        title: "Kapal Sandar di Dermaga 01",
        message: "MV Meratus Nusantara telah menyelesaikan manuver sandar di Dermaga Internasional 01.",
        type: "success",
        read: false,
        createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
      },
      {
        title: "Peringatan Kapasitas Lapangan",
        message: "Blok A (Impor) telah mencapai 80% okupansi (960 / 1200 TEU). Harap percepat pengeluaran kontainer.",
        type: "warning",
        read: false,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
      },
      {
        title: "Monitoring Reefer Aktif",
        message: "Kontainer MRKU8810291 stabil pada suhu -18.5°C dengan sensor plug RTG-04.",
        type: "info",
        read: true,
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
      }
    ];

    initialNotifs.forEach(n => {
      const ref = doc(collection(db, 'notifications'));
      batch.set(ref, n);
    });

    // Initial Audit Logs
    const initialAudits: Omit<AuditLog, 'id'>[] = [
      {
        action: "SYSTEM_BOOT",
        module: "Core Database",
        details: "Inisialisasi sistem PortNex TOS dan koneksi online Firestore aktif.",
        performedBy: "System Administrator",
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
      },
      {
        action: "BERTH_ALLOCATION",
        module: "Operasional Dermaga",
        details: "Alokasi D-01 untuk kapal MV Meratus Nusantara dengan crane STS-01 & STS-02.",
        performedBy: "Chief Ship Planner",
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
      }
    ];

    initialAudits.forEach(a => {
      const ref = doc(collection(db, 'auditLogs'));
      batch.set(ref, a);
    });

    await batch.commit();
    console.log("PortNex TOS seed data successfully committed to Firestore.");
    return true;
  } catch (error) {
    console.error("Failed to seed data:", error);
    return false;
  }
}
