import React, { memo } from 'react';
import { UserX, LogOut, AlertCircle, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types/crm';

interface RejectionScreenProps {
  currentUser: UserProfile;
  onLogout: () => void;
  onReapply: () => void;
}

export const RejectionScreen: React.FC<RejectionScreenProps> = memo(({
  currentUser,
  onLogout,
  onReapply,
}) => {
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center p-4 antialiased selection:bg-rose-100 selection:text-rose-900 font-sans">
      <div className="max-w-md w-full mx-auto space-y-4">
        <div className="bg-white border border-stone-200/90 rounded-3xl p-6 shadow-xl text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-rose-500" />

          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <UserX className="w-8 h-8 text-rose-600" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Pendaftaran Ditolak
            </span>
            <h2 className="text-xl font-bold text-stone-900">
              Permohonan Akun Tidak Disetujui
            </h2>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Super Admin telah meninjau pengajuan akun Anda dan memutuskan untuk menolaknya saat ini.
            </p>
          </div>

          {currentUser.notes && (
            <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-2xl text-left text-xs space-y-1">
              <span className="font-semibold text-rose-900 block text-[11px]">Catatan dari Super Admin:</span>
              <p className="text-rose-800 italic">"{currentUser.notes}"</p>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <button
              onClick={onReapply}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Daftar Ulang dengan Data Baru</span>
            </button>

            <button
              onClick={onLogout}
              className="w-full py-2.5 px-4 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-500" />
              <span>Keluar ke Halaman Utama</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

RejectionScreen.displayName = 'RejectionScreen';
export default RejectionScreen;
