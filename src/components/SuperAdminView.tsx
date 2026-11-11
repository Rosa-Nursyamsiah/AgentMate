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
  RefreshCw,
  Building,
  KeyRound,
  Check,
  X
} from 'lucide-react';
import { UserProfile, UserRole, UserStatus, PropertyCompany, CompanyBranch } from '../types/crm';

interface SuperAdminViewProps {
  users: UserProfile[];
  companies?: PropertyCompany[];
  branches?: CompanyBranch[];
  currentUserId: string;
  onApproveUser: (userId: string, reviewedBy: string) => void;
  onRejectUser: (userId: string, notes?: string) => void;
  onApproveCompany?: (companyId: string, reviewedBy: string) => void;
  onRejectCompany?: (companyId: string, reviewedBy: string) => void;
  onRefreshUsers?: () => void;
}

const SuperAdminViewComponent: React.FC<SuperAdminViewProps> = ({
  users,
  companies = [],
  branches = [],
  currentUserId,
  onApproveUser,
  onRejectUser,
  onApproveCompany,
  onRejectCompany,
  onRefreshUsers,
}) => {
  const [activeMainTab, setActiveMainTab] = useState<'queue' | 'companies' | 'users'>('queue');
  const [filterStatus, setFilterStatus] = useState<'all' | UserStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Group users
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

  // Group companies
  const { pendingCompanies, approvedCompanies } = useMemo(() => {
    const pending: PropertyCompany[] = [];
    const approved: PropertyCompany[] = [];
    for (const c of companies) {
      if (c.status === 'pending') pending.push(c);
      else if (c.status === 'approved') approved.push(c);
    }
    return { pendingCompanies: pending, approvedCompanies: approved };
  }, [companies]);

  const normalizedSearch = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;
      return (
        u.name.toLowerCase().includes(normalizedSearch) ||
        (u.companyName && u.companyName.toLowerCase().includes(normalizedSearch)) ||
        (u.branchName && u.branchName.toLowerCase().includes(normalizedSearch)) ||
        (u.companyId && u.companyId.toLowerCase().includes(normalizedSearch)) ||
        (u.branchId && u.branchId.toLowerCase().includes(normalizedSearch)) ||
        u.agencyName.toLowerCase().includes(normalizedSearch) ||
        u.city.toLowerCase().includes(normalizedSearch) ||
        u.email.toLowerCase().includes(normalizedSearch) ||
        u.phone.includes(normalizedSearch)
      );
    });
  }, [users, filterStatus, normalizedSearch]);

  const handleApprove = (user: UserProfile) => {
    onApproveUser(user.id, 'Ocha Syamsiah (Super Admin)');
    setSuccessMessage(`Akun ${user.name} (${user.companyName || user.agencyName}) berhasil disetujui!`);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleReject = (user: UserProfile) => {
    const reason = prompt(`Alasan penolakan untuk ${user.name}:`, 'Dokumen perusahaan / lisensi AREBI belum sesuai');
    if (reason !== null) {
      onRejectUser(user.id, reason);
      setSuccessMessage(`Permohonan ${user.name} telah ditolak.`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const handleApproveComp = (comp: PropertyCompany) => {
    if (onApproveCompany) {
      onApproveCompany(comp.id, 'Ocha Syamsiah (Super Admin)');
      setSuccessMessage(`Perusahaan ${comp.name} [${comp.id}] berhasil disetujui & diaktifkan di platform!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  const handleRejectComp = (comp: PropertyCompany) => {
    if (onRejectCompany) {
      const reason = prompt(`Alasan penolakan perusahaan ${comp.name}:`, 'Profil perusahaan tidak dapat diverifikasi');
      if (reason !== null) {
        onRejectCompany(comp.id, 'Ocha Syamsiah (Super Admin)');
        setSuccessMessage(`Pendaftaran perusahaan ${comp.name} telah ditolak.`);
        setTimeout(() => setSuccessMessage(null), 3500);
      }
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
              <span>Workspace Super Admin (Ocha Syamsiah)</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white mt-1">
              Pusat Otoritas & Verifikasi Multi-Perusahaan
            </h2>
            <p className="text-xs text-emerald-100/90 mt-0.5">
              Kelola seluruh entitas perusahaan, kantor cabang, dan persetujuan akun se-Indonesia.
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 mt-3 border-t border-emerald-700/60 text-xs font-mono">
          <div>
            <span className="text-[10px] text-emerald-200 block">TOTAL PERUSAHAAN</span>
            <span className="text-base font-bold text-white tabular-nums">
              {companies.length} Entitas
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-200 block">KANTOR CABANG</span>
            <span className="text-base font-bold text-white tabular-nums">
              {branches.length} Cabang
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-200 block">ANTREAN APPROVAL</span>
            <span className="text-base font-bold text-amber-200 tabular-nums">
              {pendingUsers.length + pendingCompanies.length} Berkas
            </span>
          </div>
          <div>
            <span className="text-[10px] text-emerald-200 block">PENGGUNA AKTIF</span>
            <span className="text-base font-bold text-emerald-200 tabular-nums">
              {approvedUsers.length} Pengguna
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

      {/* Main Mode Navigation: Queue vs Companies vs All Users */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-200/80 rounded-2xl text-xs font-semibold">
        <button
          onClick={() => setActiveMainTab('queue')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeMainTab === 'queue'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>Antrean Verifikasi ({pendingUsers.length + pendingCompanies.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('companies')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeMainTab === 'companies'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-teal-700" />
          <span>Perusahaan & Cabang ({companies.length})</span>
        </button>

        <button
          onClick={() => setActiveMainTab('users')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeMainTab === 'users'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Semua Pengguna ({users.length})</span>
        </button>
      </div>

      {/* =================================================================== */}
      {/* 1. QUEUE TAB: PENDING COMPANIES & PENDING USERS                     */}
      {/* =================================================================== */}
      {activeMainTab === 'queue' && (
        <div className="space-y-4">
          {/* Section 1A: Pending Company Registrations */}
          {pendingCompanies.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 uppercase font-mono tracking-wide text-amber-800">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  <span>Permohonan Perusahaan Baru ({pendingCompanies.length})</span>
                </h3>
                <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Perlu Verifikasi Perusahaan
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {pendingCompanies.map((comp) => (
                  <div key={comp.id} className="p-4 bg-white border border-amber-300 ring-1 ring-amber-100 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                          ID: {comp.id}
                        </span>
                        <h4 className="font-bold text-stone-900 text-sm mt-1">{comp.name}</h4>
                        <p className="text-xs text-stone-500">{comp.address}, {comp.city}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Pending Review
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600 p-2.5 bg-stone-50 rounded-xl space-y-1">
                      <p>Diajukan oleh: <strong>{comp.registeredByAdminName || 'Admin Cabang'}</strong></p>
                      <p className="text-stone-400 font-mono text-[10px]">Tanggal: {comp.createdAt}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                      <button
                        onClick={() => handleRejectComp(comp)}
                        className="py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Tolak</span>
                      </button>
                      <button
                        onClick={() => handleApproveComp(comp)}
                        className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Building2 className="w-3.5 h-3.5 text-white" />
                        <span>Setujui Perusahaan</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 1B: Pending User Registrations */}
          <div className="space-y-2.5">
            <h3 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 uppercase font-mono tracking-wide text-stone-700">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Permohonan Akun Pengguna ({pendingUsers.length})</span>
            </h3>

            {pendingUsers.length === 0 ? (
              <div className="p-8 text-center bg-white border border-stone-200 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-stone-900">Semua Permohonan Akun Telah Diproses!</p>
                <p className="text-[11px] text-stone-500 mt-0.5">Tidak ada antrean tertunda saat ini.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {pendingUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-4 bg-white border border-amber-300 ring-1 ring-amber-100 rounded-2xl shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-stone-900 text-sm">{user.name}</h4>
                            {getRoleBadge(user.role)}
                          </div>
                          <div className="flex items-center gap-1.5 text-stone-600 text-xs mt-0.5">
                            <Building2 className="w-3.5 h-3.5 text-stone-400" />
                            <span className="font-medium text-stone-800">
                              {user.companyName || user.agencyName}
                              {user.branchName ? ` · ${user.branchName}` : ''}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Review
                        </span>
                        <span className="text-[10px] text-stone-400 block font-mono mt-1">
                          {user.registeredAt}
                        </span>
                      </div>
                    </div>

                    {/* Meta Box */}
                    <div className="p-2.5 bg-stone-50 rounded-xl space-y-1.5 text-xs text-stone-600">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] text-stone-400 block">Company ID:</span>
                          <span className="font-mono font-bold text-emerald-800">{user.companyId || '-'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">Branch ID:</span>
                          <span className="font-mono font-bold text-teal-800">{user.branchId || '-'}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-200/60">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <a href={`tel:${user.phone}`} className="truncate hover:text-stone-900 font-mono">{user.phone}</a>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>

                      {user.notes && (
                        <p className="text-[11px] text-stone-500 italic pt-1 border-t border-stone-200/60">
                          "{user.notes}"
                        </p>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                      <button
                        onClick={() => handleReject(user)}
                        className="py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <UserX className="w-3.5 h-3.5 text-rose-600" />
                        <span>Tolak</span>
                      </button>

                      <button
                        onClick={() => handleApprove(user)}
                        className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-white" />
                        <span>Setujui Akun</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 2. COMPANIES TAB: MULTI-TENANT ORGANIZATIONS & BRANCHES            */}
      {/* =================================================================== */}
      {activeMainTab === 'companies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Direktori Perusahaan & Cabang Terdaftar</h3>
              <p className="text-xs text-stone-500">Masing-masing perusahaan memiliki ekosistem Company ID & Branch ID terisolasi</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              {companies.length} Perusahaan Terdaftar
            </span>
          </div>

          <div className="space-y-4">
            {companies.map((comp) => {
              const compBranches = branches.filter((b) => b.companyId === comp.id);
              const compUsers = users.filter((u) => u.companyId === comp.id);
              const compAdmins = compUsers.filter((u) => u.role === 'admin');
              const compAgents = compUsers.filter((u) => u.role === 'user');

              return (
                <div key={comp.id} className="p-5 bg-white border border-stone-200 rounded-3xl shadow-2xs space-y-4">
                  {/* Company Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                          {comp.id}
                        </span>
                        <h4 className="font-extrabold text-stone-900 text-base">{comp.name}</h4>
                        <span className={`text-[9px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${
                          comp.status === 'approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {comp.status === 'approved' ? 'Aktif' : comp.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{comp.address}, {comp.city}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-mono text-stone-600">
                      <span className="bg-stone-100 px-2.5 py-1 rounded-xl">
                        {compBranches.length} Cabang
                      </span>
                      <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-xl font-bold">
                        {compAdmins.length} Admin
                      </span>
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl font-bold">
                        {compAgents.length} Agen
                      </span>
                    </div>
                  </div>

                  {/* Branches in this company */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-stone-600 uppercase font-mono tracking-wider block">
                      Daftar Kantor Cabang:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {compBranches.map((br) => {
                        const branchAgents = users.filter((u) => u.branchId === br.id);
                        return (
                          <div key={br.id} className="p-3 bg-stone-50 border border-stone-200/90 rounded-2xl space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-stone-900">{br.name}</span>
                              <span className="font-mono text-[9px] font-bold bg-teal-100 text-teal-900 px-1.5 py-0.2 rounded">
                                {br.id}
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-500 truncate">{br.address || br.city}</p>
                            <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[10px] text-stone-500">
                              <span>Kota: <strong>{br.city}</strong></span>
                              <span>{branchAgents.length} Agen</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. ALL USERS TAB                                                    */}
      {/* =================================================================== */}
      {activeMainTab === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama, company ID, branch ID, kota..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-sm shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-sm">{user.name}</h4>
                        {getRoleBadge(user.role)}
                      </div>
                      <p className="text-xs text-stone-600 font-medium">
                        {user.companyName || user.agencyName}
                      </p>
                      {user.branchName && (
                        <p className="text-[11px] text-teal-800 font-mono">
                          {user.branchName} {user.branchId ? `[${user.branchId}]` : ''}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-full ${
                    user.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {user.status}
                  </span>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl text-xs space-y-1 text-stone-600">
                  <div className="flex justify-between">
                    <span className="text-stone-400">Email:</span>
                    <span className="font-mono">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">WhatsApp:</span>
                    <span className="font-mono">{user.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Jabatan:</span>
                    <span>{user.position || '-'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const SuperAdminView = React.memo(SuperAdminViewComponent);
export default SuperAdminView;
