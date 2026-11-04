import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Clock, 
  Building2, 
  BadgeCheck, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { UserProfile, UserRole, UserStatus } from '../types/crm';

interface SuperAdminViewProps {
  users: UserProfile[];
  currentUserId: string;
  onApproveUser: (userId: string, reviewedBy: string) => void;
  onRejectUser: (userId: string, notes?: string) => void;
  onRefreshUsers?: () => void;
}

const SuperAdminViewComponent: React.FC<SuperAdminViewProps> = ({
  users,
  currentUserId,
  onApproveUser,
  onRejectUser,
  onRefreshUsers,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | UserStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'queue' | 'all_users'>('queue');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { pendingUsers, approvedUsers, rejectedUsers } = useMemo(() => {
    const pending: UserProfile[] = [];
    const approved: UserProfile[] = [];
    const rejected: UserProfile[] = [];
    for (const u of users) {
      if (u.status === 'pending') pending.push(u);
      else if (u.status === 'approved') approved.push(u);
      else if (u.status === 'rejected') rejected.push(u);
    }
    return { pendingUsers: pending, approvedUsers: approved, rejectedUsers: rejected };
  }, [users]);

  const normalizedSearch = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;
      return (
        u.name.toLowerCase().includes(normalizedSearch) ||
        u.agencyName.toLowerCase().includes(normalizedSearch) ||
        u.city.toLowerCase().includes(normalizedSearch) ||
        u.email.toLowerCase().includes(normalizedSearch) ||
        u.phone.includes(normalizedSearch)
      );
    });
  }, [users, filterStatus, normalizedSearch]);

  const handleApprove = (user: UserProfile) => {
    onApproveUser(user.id, 'Ocha Syamsiah (Super Admin)');
    setSuccessMessage(`Akun ${user.name} (${user.agencyName}) berhasil disetujui!`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleReject = (user: UserProfile) => {
    const reason = prompt(`Alasan penolakan untuk ${user.name}:`, 'Dokumen lisensi AREBI belum terverifikasi');
    if (reason !== null) {
      onRejectUser(user.id, reason);
      setSuccessMessage(`Permohonan ${user.name} telah ditolak.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return <span className="bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Super Admin</span>;
      case 'admin':
        return <span className="bg-teal-100 text-teal-900 border border-teal-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Admin Cabang</span>;
      case 'user':
        return <span className="bg-stone-100 text-stone-800 border border-stone-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Agen Properti</span>;
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Super Admin Top Header - Soft Sage Green Gradient */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-5 text-white shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-mono font-semibold tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Workspace Super Admin</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              Antrean Verifikasi Agen
            </h2>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Multi-tier role approval untuk kantor broker & agen properti
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onRefreshUsers && (
              <button
                type="button"
                onClick={onRefreshUsers}
                title="Muat ulang antrean permohonan akun"
                className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold flex items-center gap-1.5 transition-all border border-white/20 active:scale-95"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Segarkan Data</span>
              </button>
            )}
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 shrink-0">
              <BadgeCheck className="w-5 h-5 text-emerald-200" />
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-2 pt-4 mt-3 border-t border-emerald-700/60">
          <div>
            <span className="text-[10px] text-emerald-200 block font-mono">MENUNGGU REVIEW</span>
            <span className="text-base font-bold font-mono text-white tabular-nums">
              {pendingUsers.length} Pemohon
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-200 block font-mono">AGEN DISETUJUI</span>
            <span className="text-base font-bold font-mono text-emerald-200 tabular-nums">
              {approvedUsers.length} Pengguna
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-200 block font-mono">DITOLAK</span>
            <span className="text-base font-bold font-mono text-rose-200 tabular-nums">
              {rejectedUsers.length} Berkas
            </span>
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

      {/* Search & Status Filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama agen, kantor broker, no. lisensi AREBI..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl overflow-x-auto text-xs border border-stone-200">
          <button
            onClick={() => setFilterStatus('pending')}
            className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterStatus === 'pending'
                ? 'bg-white text-emerald-900 shadow-2xs font-semibold border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Menunggu Approval ({pendingUsers.length})</span>
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              filterStatus === 'approved'
                ? 'bg-white text-emerald-900 shadow-2xs font-semibold border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Disetujui ({approvedUsers.length})</span>
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'all'
                ? 'bg-white text-emerald-900 shadow-2xs font-semibold border border-stone-200'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Semua ({users.length})
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center bg-white border border-stone-200 rounded-2xl">
            <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2" />
            <p className="text-xs text-stone-500">Tidak ada permohonan akun di kategori ini.</p>
          </div>
        ) : (
          filteredUsers.map((user) => {
            const isPending = user.status === 'pending';

            return (
              <div
                key={user.id}
                className={`p-4 bg-white border rounded-2xl shadow-2xs transition-shadow space-y-3 ${
                  isPending ? 'border-amber-300 ring-1 ring-amber-100' : 'border-stone-200'
                }`}
              >
                {/* Header Profile Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-stone-900 text-sm">{user.name}</h3>
                        {getRoleBadge(user.role)}
                      </div>
                      <div className="flex items-center gap-1.5 text-stone-600 text-xs mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-stone-400" />
                        <span className="font-medium text-stone-800">{user.agencyName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        user.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : user.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {user.status === 'approved' ? 'Aktif' : user.status === 'pending' ? 'Review' : 'Ditolak'}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-mono mt-1">
                      Daftar: {user.registeredAt}
                    </span>
                  </div>
                </div>

                {/* License & Details Strip */}
                <div className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-600">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Lisensi: <strong>{user.licenseNumber || 'Dalam Proses'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Kota: <strong>{user.city}</strong></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`tel:${user.phone}`} className="truncate hover:text-slate-900">{user.phone}</a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>

                  {user.notes && (
                    <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
                      "{user.notes}"
                    </p>
                  )}

                  {user.reviewedBy && (
                    <p className="text-[10px] text-slate-400 font-mono pt-0.5">
                      Direview oleh: {user.reviewedBy} ({user.reviewedAt})
                    </p>
                  )}
                </div>

                {/* Approval Action Buttons (Only for Pending applicants) */}
                {isPending && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                    <button
                      onClick={() => handleReject(user)}
                      className="py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                    >
                      <UserX className="w-3.5 h-3.5 text-rose-600" />
                      <span>Tolak Permohonan</span>
                    </button>

                    <button
                      onClick={() => handleApprove(user)}
                      className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors active:scale-95"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-white" />
                      <span>Setujui Akun</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const SuperAdminView = React.memo(SuperAdminViewComponent);
export default SuperAdminView;
