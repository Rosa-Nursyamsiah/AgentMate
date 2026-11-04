import React from 'react';
import { 
  Building2, 
  Settings, 
  ShieldCheck, 
  Sparkles, 
  User, 
  RotateCcw,
  RefreshCw,
  Globe,
  LogOut
} from 'lucide-react';
import { UserProfile } from '../types/crm';
import { Language, TRANSLATIONS } from '../utils/translations';

import { isSuperAdminEmail } from '../data/defaultData';

interface HeaderProps {
  currentUser: UserProfile;
  language: Language;
  onOpenSettings: () => void;
  onToggleLanguage: () => void;
  onLoadDemoData: () => void;
  onResetZeroState: () => void;
  isZeroState: boolean;
  onLogout?: () => void;
}

const HeaderComponent: React.FC<HeaderProps> = ({
  currentUser,
  language,
  onOpenSettings,
  onToggleLanguage,
  onLoadDemoData,
  onResetZeroState,
  isZeroState,
  onLogout,
}) => {
  const t = TRANSLATIONS[language];
  const isSuperAdmin = isSuperAdminEmail(currentUser.email);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md text-stone-800 border-b border-stone-200/80 shadow-xs">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center font-extrabold shadow-sm shadow-emerald-700/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm tracking-tight text-stone-900 leading-none">
                AgenMate
              </h1>
              <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                Pro
              </span>
            </div>
            <p className="text-[10px] text-stone-500 truncate max-w-[140px] mt-0.5">
              {currentUser.agencyName}
            </p>
          </div>
        </div>

        {/* Right Action Icons: Language Toggle, Role Indicator & Settings */}
        <div className="flex items-center gap-1.5">
          {/* Quick Language Toggle */}
          <button
            onClick={onToggleLanguage}
            className="h-8 px-2 rounded-lg bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-stone-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
            title="Ganti Bahasa (ID / EN)"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span className="uppercase font-mono">{language}</span>
          </button>

          {/* Quick Sample Data / Reset toggle */}
          {isZeroState ? (
            <button
              onClick={onLoadDemoData}
              className="h-8 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold flex items-center gap-1 border border-emerald-200 transition-colors shadow-2xs"
              title="Muat Data Contoh Demo"
            >
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span className="hidden sm:inline">Demo</span>
            </button>
          ) : (
            <button
              onClick={onResetZeroState}
              className="h-8 w-8 rounded-lg bg-stone-100 hover:bg-rose-50 border border-stone-200 text-stone-500 hover:text-rose-600 flex items-center justify-center transition-colors"
              title="Reset ke Zero-State (0 Data)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Active User Avatar / Role Button */}
          <button
            onClick={onOpenSettings}
            className={`h-8 px-2.5 rounded-lg flex items-center gap-1.5 border transition-all ${
              isSuperAdmin
                ? 'bg-emerald-100/80 border-emerald-300 text-emerald-900 font-bold'
                : currentUser.role === 'admin'
                ? 'bg-teal-50 border-teal-200 text-teal-800 font-bold'
                : 'bg-stone-100 border-stone-200 text-stone-800'
            }`}
            title="Buka Pengaturan Akun"
          >
            {isSuperAdmin ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            ) : (
              <User className="w-3.5 h-3.5 text-emerald-600" />
            )}
            <span className="text-[11px] font-bold truncate max-w-[70px]">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>

          {/* Settings Gear Button */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200/80 border border-stone-200 text-stone-600 flex items-center justify-center transition-colors"
            title={t.settings}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 text-stone-500 hover:text-rose-600 flex items-center justify-center transition-colors"
              title="Keluar / Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export const Header = React.memo(HeaderComponent);
export default Header;
