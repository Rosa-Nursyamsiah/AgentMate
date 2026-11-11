import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CheckCircle, 
  KeyRound,
  Sparkles,
  MapPin
} from 'lucide-react';
import { UserProfile } from '../types/crm';

interface BranchAdminViewProps {
  currentUser: UserProfile;
  users: UserProfile[];
  onApproveAgent: (agentId: string) => void;
  onRejectAgent: (agentId: string, reason?: string) => void;
  onOpenWhatsApp?: (phone: string, name: string) => void;
}

export const BranchAdminView: React.FC<BranchAdminViewProps> = ({
  currentUser,
  users,
  onApproveAgent,
  onRejectAgent,
  onOpenWhatsApp,
}) => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filter only agents belonging to THIS branch
  const branchUsers = useMemo(() => {
    return users.filter((u) => {
      if (u.role !== 'user') return false;
      // Match by branchId if available, or fallback to matching branchName / agencyName
      if (currentUser.branchId && u.branchId) {
        return u.branchId === currentUser.branchId;
      }
      if (currentUser.branchName && u.branchName) {
        return u.branchName === currentUser.branchName;
      }
      return u.agencyName === currentUser.agencyName;
    });
  }, [users, currentUser]);

  const { pendingAgents, activeAgents } = useMemo(() => {
    const pending: UserProfile[] = [];
    const active: UserProfile[] = [];
    for (const u of branchUsers) {
      if (u.status === 'pending') {
        pending.push(u);
      } else if (u.status === 'approved') {
        active.push(u);
      }
    }
    return { pendingAgents: pending, activeAgents: active };
  }, [branchUsers]);

  const handleApprove = (agent: UserProfile) => {
    onApproveAgent(agent.id);
    setSuccessMessage(`Agen ${agent.name} berhasil disetujui untuk bergabung di cabang ${currentUser.branchName || 'Anda'}!`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleReject = (agent: UserProfile) => {
    const reason = prompt(`Alasan penolakan permohonan agen ${agent.name}:`, 'Kualifikasi atau domisili kantor cabang tidak sesuai');
    if (reason !== null) {
      onRejectAgent(agent.id, reason);
      setSuccessMessage(`Permohonan ${agent.name} telah ditolak.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Branch Admin Executive Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-emerald-800 to-teal-900 rounded-3xl p-5 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-teal-200 text-xs font-mono font-semibold tracking-wider uppercase">
            <Building2 className="w-4 h-4 text-teal-300" />
            <span>Pusat Kendali Kantor Cabang</span>
          </div>

          <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                {currentUser.branchName || 'Kantor Cabang Properti'}
              </h2>
              <p className="text-xs text-teal-100/90 mt-0.5">
                {currentUser.companyName || currentUser.agencyName}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {currentUser.branchId && (
                <span className="text-[10px] font-mono font-bold bg-white/15 px-2.5 py-1 rounded-xl border border-white/20 text-teal-100">
                  Branch ID: {currentUser.branchId}
                </span>
              )}
              {currentUser.companyId && (
                <span className="text-[10px] font-mono font-bold bg-white/15 px-2.5 py-1 rounded-xl border border-white/20 text-teal-100">
                  Company ID: {currentUser.companyId}
                </span>
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 mt-3 border-t border-teal-700/60">
            <div>
              <span className="text-[10px] text-teal-200 block font-mono">AGEN AKTIF CABANG</span>
              <span className="text-base font-bold font-mono text-white tabular-nums">
                {activeAgents.length} Agen
              </span>
            </div>
            <div>
              <span className="text-[10px] text-teal-200 block font-mono">MENUNGGU APPROVAL</span>
              <span className="text-base font-bold font-mono text-amber-200 tabular-nums">
                {pendingAgents.length} Permohonan
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="text-[10px] text-teal-200 block font-mono">KOTA OPERASIONAL</span>
              <span className="text-base font-bold font-mono text-white">
                {currentUser.city || 'Indonesia'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-2xs">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* PENDING AGENTS QUEUE FOR THIS BRANCH */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-stone-900 text-xs uppercase font-mono tracking-wide">
              Permohonan Agen Bergabung ({pendingAgents.length})
            </h3>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            Kewenangan Admin Cabang
          </span>
        </div>

        {pendingAgents.length === 0 ? (
          <div className="p-6 text-center bg-white border border-stone-200 rounded-2xl shadow-2xs">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-stone-900 text-xs">Semua Permohonan Agen Telah Diproses!</h4>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Tidak ada agen yang sedang menunggu persetujuan untuk cabang ini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingAgents.map((agent) => (
              <div
                key={agent.id}
                className="p-4 bg-white border border-amber-300 ring-2 ring-amber-100 rounded-2xl shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center font-bold text-sm shrink-0">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-sm">{agent.name}</h4>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase">
                          Pending Review
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 font-medium mt-0.5">
                        {agent.position || 'Agen Properti Lapangan'}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] text-stone-400 font-mono">
                    Daftar: {agent.registeredAt}
                  </span>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl space-y-1.5 text-xs text-stone-600">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <a href={`tel:${agent.phone}`} className="truncate hover:text-stone-900 font-mono">{agent.phone}</a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{agent.email}</span>
                    </div>
                  </div>

                  {agent.inviteCode && (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-stone-200/60 text-[11px]">
                      <KeyRound className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      <span>Kode Undangan: <strong className="font-mono text-teal-900">{agent.inviteCode}</strong></span>
                    </div>
                  )}

                  {agent.notes && (
                    <p className="text-[11px] text-stone-500 italic pt-1 border-t border-stone-200/60">
                      "{agent.notes}"
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                  <button
                    onClick={() => handleReject(agent)}
                    className="py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                  >
                    <UserX className="w-3.5 h-3.5 text-rose-600" />
                    <span>Tolak</span>
                  </button>

                  <button
                    onClick={() => handleApprove(agent)}
                    className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors active:scale-95"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-white" />
                    <span>Setujui Bergabung</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVE AGENTS IN THIS BRANCH */}
      <div className="space-y-3 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-stone-900 text-xs uppercase font-mono tracking-wide">
              Daftar Agen Aktif Cabang ({activeAgents.length})
            </h3>
          </div>
          <span className="text-[11px] text-stone-500 font-mono">
            Keanggotaan Terverifikasi
          </span>
        </div>

        {activeAgents.length === 0 ? (
          <div className="p-6 text-center bg-white border border-stone-200 rounded-2xl shadow-2xs">
            <p className="text-xs text-stone-500">Belum ada agen aktif yang terdaftar di cabang ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeAgents.map((agent) => (
              <div
                key={agent.id}
                className="p-3.5 bg-white border border-stone-200 rounded-2xl shadow-2xs flex items-center justify-between gap-3 hover:border-emerald-300 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs shrink-0">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-stone-900 text-xs truncate">{agent.name}</h4>
                    <p className="text-[10px] text-stone-500 truncate">{agent.position || 'Agen Properti'}</p>
                    <p className="text-[10px] text-emerald-700 font-mono truncate">{agent.phone}</p>
                  </div>
                </div>

                <span className="text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                  Aktif
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchAdminView;
