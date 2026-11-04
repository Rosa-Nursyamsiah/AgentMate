import { Client, Property, Deal, SiteVisit, FollowUpReminder, UserProfile } from '../types/crm';

// Normalizes email by trimming, lowercasing, and removing dots from Gmail usernames
// so ochasyamsiah16@gmail.com and ocha.syamsiah16@gmail.com are strictly equivalent.
export const normalizeEmail = (email?: string): string => {
  if (!email) return '';
  const clean = email.trim().toLowerCase();
  const parts = clean.split('@');
  if (parts.length === 2 && (parts[1] === 'gmail.com' || parts[1] === 'googlemail.com')) {
    return `${parts[0].replace(/\./g, '')}@gmail.com`;
  }
  return clean;
};

// Security & Access Control: The ONLY Super Admin authorized for direct access & approval queue
export const SUPER_ADMIN_EMAIL = 'ochasyamsiah16@gmail.com';

export const isSuperAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  return normalizeEmail(email) === normalizeEmail(SUPER_ADMIN_EMAIL);
};

// Default User Accounts for Role-based Authentication & Approval Queue
export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-superadmin',
    name: 'Ocha Syamsiah',
    email: 'ochasyamsiah16@gmail.com',
    password: 'password123',
    phone: '+6281299887766',
    role: 'super_admin',
    status: 'approved',
    agencyName: 'AgenMate HQ (Principal Owner)',
    licenseNumber: 'AREBI-001-OCHA',
    city: 'Jakarta',
    registeredAt: '2026-10-01',
    reviewedAt: '2026-10-01',
    reviewedBy: 'System Root',
    notes: 'Pemilik Sistem & Super Admin Utama.',
  },
  {
    id: 'user-admin',
    name: 'Siti Rahmawati',
    email: 'siti.rahma@agenmate.id',
    password: 'password123',
    phone: '+6281234567890',
    role: 'admin',
    status: 'approved',
    agencyName: 'AgenMate Cabang BSD',
    licenseNumber: 'AREBI-042-TNG',
    city: 'Tangerang Selatan',
    registeredAt: '2026-10-05',
    reviewedAt: '2026-10-06',
    reviewedBy: 'Ocha Syamsiah',
    notes: 'Admin Operasional Cabang BSD (Disetujui Ocha Syamsiah).',
  },
  {
    id: 'user-agent',
    name: 'Rizky Pratama',
    email: 'rizky.pratama@agenmate.id',
    password: 'password123',
    phone: '+6281312345678',
    role: 'user',
    status: 'approved',
    agencyName: 'AgenMate South Jakarta',
    licenseNumber: 'AREBI-089-JKT',
    city: 'Jakarta Selatan',
    registeredAt: '2026-10-10',
    reviewedAt: '2026-10-11',
    reviewedBy: 'Ocha Syamsiah',
    notes: 'Agen Lapangan Senior Spesialis SCBD (Disetujui Ocha Syamsiah).',
  },
  // Pending Approval Applicants waiting for Super Admin (Ocha Syamsiah) review:
  {
    id: 'user-pending-1',
    name: 'Dina Marlina',
    email: 'dina.marlina@erastar.co.id',
    password: 'password123',
    phone: '+6281898765432',
    role: 'user',
    status: 'pending',
    agencyName: 'ERA Star Menteng',
    licenseNumber: 'AREBI-104-JKT',
    city: 'Jakarta Pusat',
    registeredAt: '2026-11-01',
    notes: 'Mendaftar sebagai agen lapangan spesialis rumah hunian Menteng & Kebayoran.',
  },
  {
    id: 'user-pending-2',
    name: 'Agus Setiawan',
    email: 'agus.setiawan@raywhite-cbd.id',
    password: 'password123',
    phone: '+6281900112233',
    role: 'admin',
    status: 'pending',
    agencyName: 'Ray White CBD Tower',
    licenseNumber: 'SIUP-PRO-889',
    city: 'Surabaya',
    registeredAt: '2026-11-02',
    notes: 'Permohonan akun Admin Kantor Cabang Surabaya untuk kelola 12 agen tim.',
  },
  {
    id: 'user-pending-3',
    name: 'Farhan Hidayat',
    email: 'farhan.hidayat@century21.id',
    password: 'password123',
    phone: '+6281355443322',
    role: 'user',
    status: 'pending',
    agencyName: 'Century 21 Prima Bali',
    licenseNumber: 'AREBI-215-DPS',
    city: 'Badung, Bali',
    registeredAt: '2026-11-02',
    notes: 'Mendaftar sebagai agen independen spesialis villa dan tanah Canggu & Seminyak.',
  }
];

// ZERO-STATE REQUIREMENT: All initial CRM data arrays start completely empty ([])
export const INITIAL_EMPTY_CLIENTS: Client[] = [];
export const INITIAL_EMPTY_PROPERTIES: Property[] = [];
export const INITIAL_EMPTY_DEALS: Deal[] = [];
export const INITIAL_EMPTY_VISITS: SiteVisit[] = [];
export const INITIAL_EMPTY_REMINDERS: FollowUpReminder[] = [];

// Optional sample data generator for agents who wish to load test data via explicit button
export const SAMPLE_DEMO_DATA = {
  properties: [
    {
      id: 'demo-prop-1',
      title: 'Cluster Navapark Luxury Villa',
      address: 'Grand Boulevard Navapark No. 12',
      city: 'Tangerang Selatan',
      neighborhood: 'BSD City',
      propertyType: 'Rumah Tapak / Cluster' as const,
      certificateType: 'SHM (Sertifikat Hak Milik)' as const,
      price: 12800000000,
      listingType: 'sale' as const,
      status: 'available' as const,
      bedrooms: 5,
      bathrooms: 5,
      areaLandSqft: 350,
      areaBuildingSqft: 450,
      commissionRate: 2.5,
      description: 'Hunian prestisius di tepi danau buatan 10 hektar. Dilengkapi kolam renang pribadi, dapur gourmet marmer, dan sertifikat SHM sudah pecah.',
      features: ['SHM Lengkap', 'Kolam Renang Privat', 'View Danau', 'Clubhouse Resort', 'Smart Lock & CCTV'],
      svgPreset: 'villa' as const,
      sellerName: 'Ibu Ratna Paramitha',
      createdAt: '2026-11-01',
    },
    {
      id: 'demo-prop-2',
      title: 'Ruko Prime 4 Lantai PIK 2',
      address: 'Rukan Osaka Avenue Blok A No. 16',
      city: 'Tangerang',
      neighborhood: 'Pantai Indah Kapuk 2',
      propertyType: 'Ruko / Komersial' as const,
      certificateType: 'HGB (Hak Guna Bangunan)' as const,
      price: 4800000000,
      listingType: 'sale' as const,
      status: 'available' as const,
      bedrooms: 0,
      bathrooms: 4,
      areaLandSqft: 90,
      areaBuildingSqft: 280,
      commissionRate: 2.5,
      description: 'Unit komersial hadap jalan boulevard utama. Cocok untuk kantor perbankan, klinik kecantikan, atau coffee shop premium.',
      features: ['HGB Murni', 'Hadap Jalan Boulevard', 'Parkir Luas', 'Lift Barang', 'Listrik 16.500 VA'],
      svgPreset: 'condo' as const,
      sellerName: 'Ibu Cindy Wijaya',
      createdAt: '2026-11-01',
    }
  ],
  clients: [
    {
      id: 'demo-client-1',
      name: 'Bapak Alexander Wiratama',
      phone: '+6281298765432',
      email: 'alex.wiratama@techinvest.id',
      segment: 'buyer' as const,
      status: 'active' as const,
      preferredLocations: ['BSD City', 'Alam Sutera', 'Gading Serpong'],
      preferredTypes: ['Rumah Tapak / Cluster' as const],
      budgetMin: 10000000000,
      budgetMax: 15000000000,
      paymentPreference: 'Cash Keras' as const,
      notes: 'Mencari rumah di cluster mewah untuk keluarga. Sudah siap dana tunai dan tidak memerlukan KPR bank.',
      source: 'WhatsApp' as const,
      createdAt: '2026-11-01',
      lastContactedAt: '2026-11-02',
      nextFollowUpDate: '2026-11-03',
    }
  ],
  deals: [
    {
      id: 'demo-deal-1',
      title: 'Wiratama - Navapark BSD City',
      clientId: 'demo-client-1',
      clientName: 'Bapak Alexander Wiratama',
      clientPhone: '+6281298765432',
      propertyId: 'demo-prop-1',
      propertyTitle: 'Cluster Navapark Luxury Villa',
      propertyPrice: 12800000000,
      stage: 'negotiation' as const,
      dealValue: 12500000000,
      estimatedCommission: 312500000,
      probabilityPercent: 75,
      targetClosingDate: '2026-11-20',
      lastActivityDate: '2026-11-02',
      bookingFeeAmount: 100000000,
      paymentMethod: 'Cash Keras' as const,
      notes: 'Penawaran harga masuk di Rp 12,5 Miliar. Penjual setuju dengan syarat biaya BPHTB dan notaris dibagi sesuai aturan standar.',
    }
  ],
  visits: [],
  reminders: [
    {
      id: 'demo-fu-1',
      clientId: 'demo-client-1',
      clientName: 'Bapak Alexander Wiratama',
      clientPhone: '+6281298765432',
      propertyTitle: 'Cluster Navapark Luxury Villa',
      dueDate: '2026-11-03',
      priority: 'high' as const,
      note: 'Konfirmasi draf Surat Penawaran Harga (SPH) senilai Rp 12,5 Miliar dan atur jadwal penandatanganan di kantor notaris.',
      completed: false,
      type: 'whatsapp' as const,
    }
  ]
};
