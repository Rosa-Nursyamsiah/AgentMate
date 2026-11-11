import React, { memo } from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Calendar, 
  ShieldCheck, 
  Plus, 
  Search, 
  Sparkles,
  RefreshCw,
  Database
} from 'lucide-react';
import { NavTab } from './BottomNav';
import { UserProfile } from '../types/crm';
import { isSuperAdminEmail } from '../data/defaultData';

interface DesktopTopBarProps {
  activeTab: NavTab;
  currentUser: UserProfile;
  onOpenAddContact: () => void;
  onOpenAddProperty: () => void;
  onOpenAddDeal: () => void;
  onOpenAddVisit: () => void;
  onOpenSettings: () => void;
  isSuperAdmin?: boolean;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Ringkasan Beranda CRM',
    subtitle: 'Metrik kinerja closing, komisi berjalan, dan match alert calon pembeli.',
  },
  contacts: {
    title: 'Direktori Klien & Pemilik',
    subtitle: 'Daftar segmentasi pembeli, penjual, penyewa, dan preferensi budget properti.',
  },
  inventory: {
    title: 'Katalog Portofolio Listing',
    subtitle: 'Inventori rumah tapak, apartemen, ruko, tanah, dan villa spesifikasi AREBI.',
  },
  pipeline: {
    title: 'Papan Visual Pipeline Penjualan',
    subtitle: 'Pantau tahapan closing transaksi dari inquiry awal hingga tanda tangan AJB.',
  },
  visits: {
    title: 'Jadwal Survey & Janji Temu Lokasi',
    subtitle: 'Catatan hasil inspeksi show unit, minat klien, dan agenda tindak lanjut.',
  },
  database: {
    title: 'Database Cloud PostgreSQL Supabase',
    subtitle: 'Integrasi backend multi-tenant 24/7 dan status enkripsi data.',
  },
  superadmin: {
    title: 'Pusat Approval Super Admin',
    subtitle: 'Otoritas eksklusif Ocha Syamsiah untuk verifikasi perusahaan, cabang, dan akun se-Indonesia.',
  },
  branchadmin: {
    title: 'Manajemen Tim Kantor Cabang',
    subtitle: 'Verifikasi permohonan keanggotaan agen baru dan kelola tim agen dalam cabang Anda.',
  },
};

export const DesktopTopBar: React.FC<DesktopTopBarProps> = memo(({
  activeTab,
  currentUser,
  onOpenAddContact,
  onOpenAddProperty,
  onOpenAddDeal,
  onOpenAddVisit,
  onOpenSettings,
  isSuperAdmin = false,
}) => {
  const meta = TAB_TITLES[activeTab] || TAB_TITLES.dashboard;
  const isSuper = isSuperAdmin || isSuperAdminEmail(currentUser.email);

  return (
    <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white/95 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-20 shadow-2xs">
      {/* Left: Breadcrumbs & Page Title */}
      <div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-stone-400 uppercase tracking-wider">
          <span>AgenMate Pro</span>
          <span>/</span>
          <span className="text-emerald-700 font-bold">{activeTab}</span>
        </div>
        <h1 className="text-xl font-extrabold text-stone-900 tracking-tight mt-0.5">
          {meta.title}
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          {meta.subtitle}
        </p>
      </div>

      {/* Right: Quick Action Shortcuts & Cloud Status */}
      <div className="flex items-center gap-2.5">
        {/* Quick Action Shortcuts depending on tab */}
        {activeTab === 'contacts' && (
          <button
            onClick={onOpenAddContact}
            className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Klien</span>
          </button>
        )}

        {activeTab === 'inventory' && (
          <button
            onClick={onOpenAddProperty}
            className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Listing</span>
          </button>
        )}

        {activeTab === 'pipeline' && (
          <button
            onClick={onOpenAddDeal}
            className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deal Baru</span>
          </button>
        )}

        {activeTab === 'visits' && (
          <button
            onClick={onOpenAddVisit}
            className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Jadwalkan Survey</span>
          </button>
        )}

        {activeTab === 'dashboard' && (
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddContact}
              className="py-2 px-3 rounded-xl bg-white border border-stone-200 hover:border-emerald-300 text-stone-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <Users className="w-3.5 h-3.5 text-emerald-700" />
              <span>+ Klien</span>
            </button>
            <button
              onClick={onOpenAddProperty}
              className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 transition-all active:scale-95"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>+ Listing</span>
            </button>
          </div>
        )}

        {/* Cloud Status Pill */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100/80 border border-stone-200 text-xs text-stone-600 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Supabase Cloud Terhubung</span>
        </div>
      </div>
    </header>
  );
});

export default DesktopTopBar;
