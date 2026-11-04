import React, { memo } from 'react';
import { 
  Clock, 
  ShieldCheck, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText, 
  LogOut 
} from 'lucide-react';
import { UserProfile } from '../types/crm';

interface PendingApprovalScreenProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onSwitchToSuperAdmin?: () => void;
}

export const PendingApprovalScreen: React.FC<PendingApprovalScreenProps> = memo(({
  currentUser,
  onLogout,
  onSwitchToSuperAdmin,
}) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between p-4 antialiased selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      <div className="max-w-md w-full mx-auto my-auto space-y-4 py-6">
        {/* Gateway Card */}
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-5">
          {/* Top Sage Green Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700" />

          {/* Pending Icon & Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-inner relative">
              <Clock className="w-8 h-8 text-emerald-700 animate-pulse" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                ⏳
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Pintu Gerbang Approval
              </span>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                Menunggu Persetujuan Akun
              </h2>
              <p className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto">
                Permohonan pendaftaran Anda telah berhasil dicatat dan sedang dalam antrean verifikasi oleh Super Admin.
              </p>
            </div>
          </div>

          {/* Registered Details Summary Card */}
          <div className="p-4 bg-[#FAF8F5] border border-stone-200 rounded-2xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200/80">
              <span className="text-stone-500">Status Permohonan:</span>
              <span className="font-bold font-mono text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full uppercase text-[10px] border border-amber-200 animate-pulse">
                Pending Review
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Nama Pemohon:</span>
                <span className="font-bold text-stone-900">{currentUser.name}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-500">Peran yang Dipilih:</span>
                <span className="font-semibold text-stone-800 bg-stone-200/70 px-2 py-0.5 rounded text-[11px]">
                  {currentUser.role === 'admin' ? 'Admin Kantor Cabang' : 'User / Agen Properti'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-500">Alamat Email:</span>
                <span className="text-stone-700 font-mono text-[11px] truncate max-w-[170px]">{currentUser.email}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-500">Kantor Broker:</span>
                <span className="text-stone-800 font-medium truncate max-w-[170px]">{currentUser.agencyName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-500">Kota Operasional:</span>
                <span className="text-stone-800">{currentUser.city}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-500">Tanggal Pengajuan:</span>
                <span className="text-stone-600 font-mono text-[11px]">{currentUser.registeredAt}</span>
              </div>
            </div>
          </div>

          {/* Why Gateway is Enforced */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1 text-xs text-emerald-950">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Keamanan Multi-Tier Role-Based</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Sebagai kepatuhan standar broker AREBI, hak akses workspace operasional (katalog listing, nomor kontak klien, dan pipeline closing) hanya aktif setelah diverifikasi oleh Super Admin.
            </p>
          </div>

          {/* Super Admin Review Testing Helper */}
          {onSwitchToSuperAdmin && (
            <div className="p-3 bg-amber-50/90 border border-amber-200/90 rounded-2xl space-y-2 text-xs text-amber-950 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Verifikasi Akun sebagai Super Admin</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Sedang menguji alur pendaftaran? Masuk sebagai Super Admin (<strong>ochasyamsiah16@gmail.com</strong>) untuk langsung meninjau & menyetujui akun ini di Dashboard Approval.
              </p>
              <button
                type="button"
                onClick={onSwitchToSuperAdmin}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-700/20 transition-all active:scale-[0.98]"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Beralih ke Super Admin (Ocha Syamsiah)</span>
              </button>
            </div>
          )}

          {/* Logout / Switch Account */}
          <div className="pt-1">
            <button
              onClick={onLogout}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-500" />
              <span>Keluar / Kembali ke Halaman Utama</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

PendingApprovalScreen.displayName = 'PendingApprovalScreen';
export default PendingApprovalScreen;
