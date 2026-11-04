import type { Plugin, Connect } from 'vite';
import fs from 'fs';
import path from 'path';

// Normalizes email by trimming, lowercasing, and removing dots from Gmail usernames
const normalizeEmail = (email?: string): string => {
  if (!email) return '';
  const clean = email.trim().toLowerCase();
  const parts = clean.split('@');
  if (parts.length === 2 && (parts[1] === 'gmail.com' || parts[1] === 'googlemail.com')) {
    return `${parts[0].replace(/\./g, '')}@gmail.com`;
  }
  return clean;
};

const SUPER_ADMIN_EMAIL = 'ochasyamsiah16@gmail.com';

const isSuperAdminEmail = (email?: string): boolean => {
  if (!email) return false;
  return normalizeEmail(email) === normalizeEmail(SUPER_ADMIN_EMAIL);
};

const DB_DIR = path.resolve(__dirname, '../shared_db');
const DB_FILE = path.join(DB_DIR, 'users.json');

const INITIAL_USERS = [
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

function readDb(): any[] {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_USERS, null, 2), 'utf-8');
      return INITIAL_USERS;
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    // Ensure Super Admin is always present
    const hasSuper = parsed.some((u: any) => isSuperAdminEmail(u.email));
    if (!hasSuper) {
      const merged = [INITIAL_USERS[0], ...parsed];
      fs.writeFileSync(DB_FILE, JSON.stringify(merged, null, 2), 'utf-8');
      return merged;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading shared users DB:', err);
    return INITIAL_USERS;
  }
}

function writeDb(users: any[]) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing shared users DB:', err);
  }
}

function parseJsonBody(req: Connect.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

export function sharedUserApiPlugin(): Plugin {
  return {
    name: 'shared-user-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || '';
        
        // CORS Headers so any connected mobile device or host can call the API
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        // GET /api/users
        if (url.startsWith('/api/users') && req.method === 'GET') {
          const users = readDb();
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, users }));
          return;
        }

        // POST /api/users/register
        if (url === '/api/users/register' && req.method === 'POST') {
          const body = await parseJsonBody(req);
          const users = readDb();
          const trimmedEmail = (body.email || '').trim();
          const norm = normalizeEmail(trimmedEmail);

          const existing = users.find((u) => normalizeEmail(u.email) === norm);
          if (existing) {
            res.setHeader('Content-Type', 'application/json');
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, message: 'Alamat email ini sudah terdaftar.' }));
            return;
          }

          const isSuper = isSuperAdminEmail(trimmedEmail);
          const newUser = {
            id: `user-${Date.now()}`,
            name: body.name || 'Agen Properti',
            email: trimmedEmail,
            password: body.password || 'password123',
            phone: body.phone || '+6281234567890',
            role: isSuper ? 'super_admin' : (body.role === 'admin' ? 'admin' : 'user'),
            status: isSuper ? 'approved' : 'pending',
            agencyName: body.agencyName || (isSuper ? 'AgenMate HQ (Principal Owner)' : 'Independen Broker'),
            city: body.city || 'Jakarta',
            licenseNumber: body.licenseNumber || 'Dalam Proses Verifikasi AREBI',
            registeredAt: new Date().toISOString().split('T')[0],
            notes: isSuper
              ? 'Akun Pemilik Sistem & Super Admin Utama.'
              : `Pendaftaran baru via form online sebagai ${body.role === 'admin' ? 'Admin Cabang' : 'Agen Properti'}. Menunggu persetujuan Super Admin (Ocha Syamsiah).`,
          };

          const updated = [newUser, ...users];
          writeDb(updated);

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, user: newUser }));
          return;
        }

        // POST /api/users/approve
        if (url === '/api/users/approve' && req.method === 'POST') {
          const body = await parseJsonBody(req);
          const users = readDb();
          const updated = users.map((u) => {
            if (u.id === body.userId) {
              return {
                ...u,
                status: 'approved',
                reviewedAt: new Date().toISOString().split('T')[0],
                reviewedBy: body.reviewedBy || 'Ocha Syamsiah (Super Admin)',
              };
            }
            return u;
          });
          writeDb(updated);

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true }));
          return;
        }

        // POST /api/users/reject
        if (url === '/api/users/reject' && req.method === 'POST') {
          const body = await parseJsonBody(req);
          const users = readDb();
          const updated = users.map((u) => {
            if (u.id === body.userId) {
              return {
                ...u,
                status: 'rejected',
                reviewedAt: new Date().toISOString().split('T')[0],
                reviewedBy: body.reviewedBy || 'Ocha Syamsiah (Super Admin)',
                notes: body.reason ? `Ditolak: ${body.reason}` : u.notes,
              };
            }
            return u;
          });
          writeDb(updated);

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true }));
          return;
        }

        next();
      });
    },
  };
}
