import React from 'react';
import { 
  X, 
  Settings, 
  Globe, 
  Coins, 
  Database, 
  RefreshCcw, 
  RotateCcw, 
  ShieldCheck, 
  User, 
  Building2,
  CheckCircle,
  ExternalLink,
  LogOut
} from 'lucide-react';
import { UserProfile } from '../types/crm';
import { Language, TRANSLATIONS } from '../utils/translations';
import { isSupabaseConfigured } from '../lib/supabase';
import { formatRupiahFull } from '../utils/formatters';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onResetZeroState: () => void;
  onLoadSampleData: () => void;
  onLogout?: () => void;
}

import { isSuperAdminEmail } from '../data/defaultData';

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  language,
  onToggleLanguage,
  onResetZeroState,
  onLoadSampleData,
  onLogout,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const isSuperAdmin = isSuperAdminEmail(currentUser.email);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/40 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-[#FAF8F5]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900 text-sm">{t.settings}</h3>
              <p className="text-[11px] text-stone-500">{t.tagline}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs">
          {/* Active User Profile Information */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-stone-800 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>Akun Anda yang Sedang Aktif</span>
              </label>
              <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                Sesi Terautentikasi
              </span>
            </div>
            
            <div className="p-3.5 rounded-2xl border border-stone-200 bg-[#FAF8F5] space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm">{currentUser.name}</h4>
                  <p className="text-[11px] font-mono text-stone-500">{currentUser.email}</p>
                </div>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    isSuperAdmin
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      : currentUser.role === 'admin'
                      ? 'bg-teal-100 text-teal-900 border border-teal-200'
                      : 'bg-stone-100 text-stone-800 border border-stone-200'
                  }`}
                >
                  {isSuperAdmin ? 'Super Admin' : currentUser.role === 'admin' ? 'Admin Cabang' : 'Agen Properti'}
                </span>
              </div>

              <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-600">
                <span>{currentUser.agencyName} · {currentUser.city}</span>
                <span className="font-mono text-emerald-700 font-semibold">Status: Aktif</span>
              </div>
            </div>
          </div>

          {/* Localized Language Settings */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-600" />
                <span>{t.language}</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">i18n</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onToggleLanguage('id')}
                className={`py-2 px-3 rounded-lg text-center font-semibold text-xs border transition-all ${
                  language === 'id'
                    ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                🇮🇩 Bahasa Indonesia
              </button>
              <button
                type="button"
                onClick={() => onToggleLanguage('en')}
                className={`py-2 px-3 rounded-lg text-center font-semibold text-xs border transition-all ${
                  language === 'en'
                    ? 'bg-slate-900 text-amber-300 border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          {/* IDR Currency Formatting Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>{t.currency}</span>
              </label>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                Aktif (IDR)
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              {t.currencyValue}
            </p>
            <div className="p-2 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 flex justify-between">
              <span>Contoh Transaksi:</span>
              <strong className="text-slate-900">{formatRupiahFull(12800000000)}</strong>
            </div>
          </div>

          {/* Supabase PostgreSQL Backend Status */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>{t.supabaseStatus}</span>
              </label>
              <span className="text-[10px] font-mono text-slate-500">PostgreSQL</span>
            </div>
            <div className="p-2.5 bg-white border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
                <span className="font-semibold text-slate-800 text-[11px]">
                  {isSupabaseConfigured ? t.supabaseConnected : t.supabaseLocal}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Data disimpan aman di browser dan siap sinkronisasi ke Supabase Cloud via Environment Variables.
              </p>
            </div>
          </div>

          {/* Zero-State and Demo Data Actions */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <label className="font-bold text-slate-800 block">Manajemen Data Workspace</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onResetZeroState();
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>{t.resetZeroState}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onLoadSampleData();
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
                <span>{t.loadSampleData}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200/80 bg-stone-50/50 flex items-center justify-between">
          {onLogout ? (
            <button
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-600" />
              <span>Keluar dari Akun</span>
            </button>
          ) : <div />}

          <button
            type="button"
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-stone-800 text-white font-semibold text-xs hover:bg-stone-900 transition-colors shadow-2xs"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
