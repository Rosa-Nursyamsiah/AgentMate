import React, { memo } from 'react';
import { 
  Home, 
  Users, 
  Building2, 
  TrendingUp, 
  CalendarCheck, 
  Database,
  ShieldCheck,
  Settings,
  Globe,
  Sparkles,
  RotateCcw,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/crm';
import { NavTab } from './BottomNav';
import { Language, TRANSLATIONS } from '../utils/translations';
import { isSuperAdminEmail } from '../data/defaultData';

interface SidebarNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  currentUser: UserProfile;
  language: Language;
  onOpenSettings: () => void;
  onToggleLanguage: () => void;
  onLoadDemoData: () => void;
  onResetZeroState: () => void;
  isZeroState: boolean;
  onLogout: () => void;
  pendingRemindersCount?: number;
  pendingApprovalsCount?: number;
  isSuperAdmin?: boolean;
}

export const SidebarNav: React.FC<SidebarNavProps> = memo(({
  activeTab,
  onSelectTab,
  currentUser,
  language,
  onOpenSettings,
  onToggleLanguage,
  onLoadDemoData,
  onResetZeroState,
  isZeroState,
  onLogout,
  pendingRemindersCount = 0,
  pendingApprovalsCount = 0,
  isSuperAdmin = false,
}) => {
  const t = TRANSLATIONS[language];
  const isSuper = isSuperAdmin || isSuperAdminEmail(currentUser.email);

  const menuItems = [
    ...(isSuper
      ? [
          {
            id: 'superadmin' as NavTab,
            label: 'Approval Antrean',
            sublabel: 'Persetujuan Akun Baru',
            icon: ShieldCheck,
            badge: pendingApprovalsCount,
            badgeColor: 'bg-amber-500 text-white',
            highlight: true,
          },
        ]
      : []),
    {
      id: 'dashboard' as NavTab,
      label: 'Beranda / Dashboard',
      sublabel: 'Ringkasan & KPI Agen',
      icon: Home,
    },
    {
      id: 'contacts' as NavTab,
      label: 'Direktori Klien',
      sublabel: 'Segmentasi Pembeli & Pemilik',
      icon: Users,
    },
    {
      id: 'inventory' as NavTab,
      label: 'Listing Properti',
      sublabel: 'Katalog Portofolio Unit',
      icon: Building2,
    },
    {
      id: 'pipeline' as NavTab,
      label: 'Pipeline Closing',
      sublabel: 'Kanban Tahapan Transaksi',
      icon: TrendingUp,
    },
    {
      id: 'visits' as NavTab,
      label: 'Jadwal Survey',
      sublabel: 'Kunjungan Unit & Follow-Up',
      icon: CalendarCheck,
      badge: pendingRemindersCount,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'database' as NavTab,
      label: 'Database & Cloud',
      sublabel: 'Skema PostgreSQL Supabase',
      icon: Database,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-stone-200/90 h-screen sticky top-0 shrink-0 z-30 shadow-xs justify-between">
      {/* Top Branding & Workspace Identity */}
      <div className="p-5 border-b border-stone-100 space-y-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-600 text-white flex items-center justify-center font-extrabold shadow-md shadow-emerald-700/20 shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-stone-900 leading-none">
                AgenMate
              </span>
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                Desktop Pro
              </span>
            </div>
            <p className="text-[11px] text-stone-500 truncate mt-1">
              CRM Properti Indonesia
            </p>
          </div>
        </div>

        {/* User Card */}
        <div 
          onClick={onOpenSettings}
          className="p-3 bg-[#FAF8F5] border border-stone-200 rounded-2xl cursor-pointer hover:border-emerald-300 transition-all group"
          title="Klik untuk membuka Pengaturan Profil"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="font-bold text-xs text-stone-900 truncate">
                  {currentUser.name}
                </span>
                {isSuper && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                )}
              </div>
              <p className="text-[10px] text-stone-500 truncate">
                {currentUser.agencyName || 'Independen Broker'}
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </div>

          <div className="mt-2 pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px]">
            <span className="text-stone-400 font-mono">PERAN:</span>
            <span className={`px-2 py-0.5 rounded-full font-bold uppercase font-mono ${
              isSuper
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                : currentUser.role === 'admin'
                ? 'bg-teal-100 text-teal-800 border border-teal-200'
                : 'bg-stone-200 text-stone-700'
            }`}>
              {isSuper ? 'Super Admin' : currentUser.role === 'admin' ? 'Admin Cabang' : 'Agen Properti'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-mono font-bold tracking-wider text-stone-400 uppercase">
          Menu Operasional
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-emerald-700 text-white font-bold shadow-sm shadow-emerald-700/20'
                  : item.highlight
                  ? 'bg-amber-50 text-amber-900 font-semibold border border-amber-200/80 hover:bg-amber-100/70'
                  : 'text-stone-700 hover:bg-stone-100/80 hover:text-stone-900 font-medium'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive
                    ? 'text-white'
                    : item.highlight
                    ? 'text-amber-700'
                    : 'text-stone-500 group-hover:text-emerald-700'
                }`} />
                <div className="min-w-0">
                  <span className="text-xs truncate block leading-tight">
                    {item.label}
                  </span>
                  <span className={`text-[10px] truncate block font-normal leading-tight mt-0.5 ${
                    isActive
                      ? 'text-emerald-100'
                      : item.highlight
                      ? 'text-amber-700/80'
                      : 'text-stone-400'
                  }`}>
                    {item.sublabel}
                  </span>
                </div>
              </div>

              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 shadow-2xs ${
                  isActive
                    ? 'bg-white text-emerald-800'
                    : item.badgeColor || 'bg-stone-200 text-stone-700'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Utility Actions & Quick Toggles */}
      <div className="p-4 border-t border-stone-200/80 bg-[#FAF8F5]/80 space-y-2">
        {/* Quick Demo Data / Reset Zero-State Toggle */}
        <div className="flex items-center gap-1.5">
          {isZeroState ? (
            <button
              onClick={onLoadDemoData}
              className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-emerald-200 shadow-2xs transition-colors"
              title="Isi aplikasi dengan data contoh simulasi properti"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Muat Data Demo</span>
            </button>
          ) : (
            <button
              onClick={onResetZeroState}
              className="flex-1 py-2 px-2.5 rounded-xl bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-stone-200 transition-colors"
              title="Kosongkan data kembali ke 0 (Zero-State)"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
              <span>Reset ke Nol</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-[11px] font-mono font-bold flex items-center gap-1 transition-colors shrink-0"
            title="Ganti Bahasa (ID / EN)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <span className="uppercase">{language}</span>
          </button>
        </div>

        {/* Settings & Logout Dual Actions */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <button
            onClick={onOpenSettings}
            className="py-2 px-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
          >
            <Settings className="w-3.5 h-3.5 text-stone-500" />
            <span>Pengaturan</span>
          </button>

          <button
            onClick={onLogout}
            className="py-2 px-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
            title="Keluar dari akun Anda"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
});

export default SidebarNav;
