import React, { useState, useEffect, useMemo, memo } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Building2, 
  MapPin, 
  ShieldCheck, 
  UserPlus, 
  LogIn, 
  Briefcase,
  AlertCircle,
  Search,
  CheckCircle2,
  ChevronRight,
  Info,
  KeyRound,
  Sparkles,
  Building
} from 'lucide-react';
import { PropertyCompany, CompanyBranch } from '../types/crm';
import { RegisterUserInput } from '../services/userService';
import { 
  loadLocalCompanies, 
  loadLocalBranches, 
  syncCompaniesFromServer, 
  syncBranchesFromServer,
  generateCompanyId,
  generateBranchId
} from '../services/companyService';
import { SUPER_ADMIN_EMAIL, isSuperAdminEmail } from '../data/defaultData';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onLogin: (email: string, password?: string) => { success: boolean; message?: string } | Promise<{ success: boolean; message?: string }>;
  onRegister: (userData: RegisterUserInput) => { success: boolean; message?: string } | Promise<{ success: boolean; message?: string }>;
}

export const AuthModal: React.FC<AuthModalProps> = memo(({
  isOpen,
  initialMode = 'login',
  onClose,
  onLogin,
  onRegister,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Companies & Branches Data
  const [companies, setCompanies] = useState<PropertyCompany[]>(loadLocalCompanies);
  const [branches, setBranches] = useState<CompanyBranch[]>(loadLocalBranches);

  useEffect(() => {
    syncCompaniesFromServer().then((c) => {
      if (c && c.length > 0) setCompanies(c);
    });
    syncBranchesFromServer().then((b) => {
      if (b && b.length > 0) setBranches(b);
    });
  }, []);

  // Approved companies list for agents
  const approvedCompanies = useMemo(() => {
    return companies.filter((c) => c.status === 'approved');
  }, [companies]);

  // -----------------------------------------------------------------
  // FORM STATES
  // -----------------------------------------------------------------

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register - Role selection: 'admin' (Admin Cabang) or 'user' (Agen Properti)
  const [role, setRole] = useState<'admin' | 'user' | 'super_admin'>('admin');

  // Register - Personal Info
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [position, setPosition] = useState('');

  // Register - Admin Cabang Company Mode: 'new' (Daftar Baru) | 'existing' (Pilih yang ada)
  const [adminCompanyMode, setAdminCompanyMode] = useState<'new' | 'existing'>('new');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyAddress, setNewCompanyAddress] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [city, setCity] = useState('Jakarta Selatan');

  // Register - Agen Properti Company & Branch Selection
  const [companySearchQuery, setCompanySearchQuery] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [customBranchName, setCustomBranchName] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  // Filtered branches based on selected company
  const availableBranches = useMemo(() => {
    if (!selectedCompanyId || selectedCompanyId === 'custom_company') return [];
    return branches.filter((b) => b.companyId === selectedCompanyId && (b.status === 'approved' || !b.status));
  }, [branches, selectedCompanyId]);

  // Filtered companies based on search input
  const filteredApprovedCompanies = useMemo(() => {
    const q = companySearchQuery.trim().toLowerCase();
    if (!q) return approvedCompanies;
    return approvedCompanies.filter(
      (c) => c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)
    );
  }, [approvedCompanies, companySearchQuery]);

  const isSuperAdminEmailEntered = isSuperAdminEmail(email);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (isSuperAdminEmail(val)) {
      setRole('super_admin');
    } else if (role === 'super_admin') {
      setRole('admin');
    }
  };

  const handleSelectSuperAdmin = () => {
    setEmail('ochasyamsiah16@gmail.com');
    setName((prev) => prev || 'Ocha Syamsiah');
    setRole('super_admin');
    setErrorMessage(null);
  };

  // -----------------------------------------------------------------
  // SUBMISSIONS
  // -----------------------------------------------------------------

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginEmail.trim()) {
      setErrorMessage('Silakan masukkan alamat email Anda.');
      return;
    }
    if (!loginPassword.trim()) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await onLogin(loginEmail.trim(), loginPassword);
      if (!res.success) {
        setErrorMessage(res.message || 'Email atau kata sandi tidak sesuai.');
      } else {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // 1. Personal validations
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      setErrorMessage('Mohon lengkapi seluruh Data Pribadi (Nama, WhatsApp, Email, dan Kata Sandi).');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok. Mohon ketik ulang kata sandi yang sama.');
      return;
    }

    const trimmedEmail = email.trim();
    const isSuper = isSuperAdminEmail(trimmedEmail);

    // 2. Role validations
    if (role === 'admin' && !isSuper) {
      if (adminCompanyMode === 'new') {
        if (!newCompanyName.trim()) {
          setErrorMessage('Mohon masukkan Nama Perusahaan Properti yang ingin didaftarkan.');
          return;
        }
        if (!newBranchName.trim()) {
          setErrorMessage('Mohon masukkan Nama Kantor Cabang yang ingin didaftarkan.');
          return;
        }
      } else {
        if (!selectedCompanyId) {
          setErrorMessage('Silakan pilih Perusahaan Properti yang sudah terdaftar.');
          return;
        }
        if (!newBranchName.trim()) {
          setErrorMessage('Mohon masukkan Nama Cabang Baru yang ingin Anda kelola.');
          return;
        }
      }
    } else if (role === 'user' && !isSuper) {
      // Agent requirements
      if (!selectedCompanyId) {
        setErrorMessage('Sebagai Agen Properti, silakan pilih Perusahaan Properti yang terdaftar atau pilih Ketik Manual.');
        return;
      }
      if (selectedCompanyId === 'custom_company' && !customCompanyName.trim()) {
        setErrorMessage('Mohon masukkan Nama Perusahaan Properti Anda.');
        return;
      }
      if (selectedCompanyId !== 'custom_company' && !selectedBranchId) {
        setErrorMessage('Silakan pilih Kantor Cabang tempat Anda bergabung.');
        return;
      }
      if ((selectedBranchId === 'custom_branch' || selectedCompanyId === 'custom_company') && !customBranchName.trim()) {
        setErrorMessage('Mohon masukkan Nama Kantor Cabang Anda.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const selectedCompanyObj = companies.find((c) => c.id === selectedCompanyId);
      const selectedBranchObj = branches.find((b) => b.id === selectedBranchId);

      const payload: RegisterUserInput = {
        name: name.trim(),
        email: trimmedEmail,
        password: password.trim(),
        phone: phone.trim(),
        role: isSuper ? 'super_admin' : role,
        position: position.trim() || (role === 'admin' ? 'Admin Cabang' : 'Agen Properti'),
        city: city.trim() || 'Jakarta',
      };

      if (role === 'admin' && !isSuper) {
        if (adminCompanyMode === 'new') {
          payload.isNewCompany = true;
          payload.newCompanyName = newCompanyName.trim();
          payload.newCompanyAddress = newCompanyAddress.trim() || 'Alamat Kantor Perusahaan';
          payload.newBranchName = newBranchName.trim();
          payload.newBranchAddress = newBranchAddress.trim() || 'Alamat Kantor Cabang';
          payload.agencyName = `${newCompanyName.trim()} (${newBranchName.trim()})`;
        } else {
          payload.companyId = selectedCompanyId;
          payload.companyName = selectedCompanyObj?.name || 'Perusahaan Properti';
          payload.newBranchName = newBranchName.trim();
          payload.newBranchAddress = newBranchAddress.trim() || 'Alamat Kantor Cabang';
          payload.agencyName = `${selectedCompanyObj?.name} (${newBranchName.trim()})`;
        }
      } else if (role === 'user' && !isSuper) {
        if (selectedCompanyId === 'custom_company') {
          payload.companyName = customCompanyName.trim();
          payload.companyId = generateCompanyId(customCompanyName.trim());
        } else {
          payload.companyId = selectedCompanyId;
          payload.companyName = selectedCompanyObj?.name || 'Perusahaan Properti';
        }

        if (selectedBranchId === 'custom_branch' || selectedCompanyId === 'custom_company') {
          payload.branchName = customBranchName.trim() || 'Kantor Cabang';
          payload.branchId = generateBranchId(payload.companyId!, payload.branchName);
        } else {
          payload.branchId = selectedBranchId;
          payload.branchName = selectedBranchObj?.name || 'Kantor Cabang';
        }

        payload.inviteCode = inviteCode.trim() || undefined;
        payload.agencyName = `${payload.companyName} (${payload.branchName})`;
      } else if (isSuper) {
        payload.companyId = 'CMP-001';
        payload.companyName = 'AgenMate HQ (Principal Owner)';
        payload.branchId = 'BR-001-HQ';
        payload.branchName = 'Kantor Pusat HQ';
        payload.agencyName = 'AgenMate HQ (Principal Owner)';
      }

      const res = await onRegister(payload);
      if (!res.success) {
        setErrorMessage(res.message || 'Pendaftaran gagal.');
      } else {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/50 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header with Switcher Tabs */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-[#FAF8F5]">
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage(null);
              }}
              className={`py-1.5 px-3.5 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk ke Akun Terdaftar</span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-1.5 px-3.5 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                <span>Daftar Akun Baru Sekarang</span>
              </span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ================================================================= */}
        {/* 1. LOGIN FORM                                                     */}
        {/* ================================================================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-5 space-y-4 text-xs overflow-y-auto">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Selamat Datang Kembali</h3>
              <p className="text-stone-500 text-xs mt-0.5">
                Masuk untuk mengakses sistem CRM operasional AgenMate.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Alamat Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Kata Sandi *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Quick Demo Credentials */}
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5 text-[11px] text-stone-600">
              <span className="font-bold text-stone-800 block">Akun Uji Coba Cepat:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 font-mono text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('ochasyamsiah16@gmail.com');
                    setLoginPassword('password123');
                  }}
                  className="p-1.5 text-left bg-white border border-stone-200 rounded hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-stone-800"
                >
                  <strong className="text-emerald-800 block font-sans">Super Admin Utama:</strong>
                  ochasyamsiah16@gmail.com
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('siti.rahma@agenmate.id');
                    setLoginPassword('password123');
                  }}
                  className="p-1.5 text-left bg-white border border-stone-200 rounded hover:border-emerald-400 hover:bg-emerald-50/30 transition-all text-stone-800"
                >
                  <strong className="text-teal-800 block font-sans">Admin Cabang BSD:</strong>
                  siti.rahma@agenmate.id
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/20 transition-all active:scale-[0.98]"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSubmitting ? 'Memverifikasi...' : 'Masuk ke Workspace'}</span>
            </button>

            <p className="text-center text-[11px] text-stone-500 pt-1">
              Belum memiliki akun terdaftar?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                Daftar Akun Baru Sekarang
              </button>
            </p>
          </form>
        )}

        {/* ================================================================= */}
        {/* 2. REGISTRATION FORM (IMPROVED ROLE & RELATIONSHIPS)              */}
        {/* ================================================================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Pendaftaran Akun Baru</h3>
              <p className="text-stone-500 text-xs mt-0.5">
                Pilih jenis akun yang sesuai dengan tanggung jawab Anda di perusahaan properti.
              </p>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* STEP 1: ROLE SELECTION CARDS                                 */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-2">
              <label className="block font-bold text-stone-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Pilih Jenis Akun (Account Role) *</span>
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Langkah 1 dari 2</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option A: Admin Cabang */}
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    role === 'admin'
                      ? 'border-teal-600 bg-teal-50/80 ring-2 ring-teal-600/20 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      role === 'admin' ? 'border-teal-700 bg-teal-600' : 'border-stone-300'
                    }`}>
                      {role === 'admin' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-xs">A. Admin Cabang</h4>
                  <p className="text-[11px] text-teal-900 font-semibold mt-0.5">
                    Pengelola Operasional Kantor / Cabang
                  </p>
                  <p className="text-[10px] text-stone-500 mt-1 leading-relaxed">
                    Daftarkan perusahaan baru, ajukan cabang baru, dan verifikasi permohonan bergabung agen tim.
                  </p>
                </button>

                {/* Option B: Agen Properti */}
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    role === 'user'
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-600/20 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      role === 'user' ? 'border-emerald-700 bg-emerald-600' : 'border-stone-300'
                    }`}>
                      {role === 'user' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <h4 className="font-bold text-stone-900 text-xs">B. Agen Properti</h4>
                  <p className="text-[11px] text-emerald-900 font-semibold mt-0.5">
                    Pemasaran, Listing, & Closing Sales
                  </p>
                  <p className="text-[10px] text-stone-500 mt-1 leading-relaxed">
                    Cari dan pilih perusahaan yang sudah terdaftar untuk mengajukan keanggotaan cabang.
                  </p>
                </button>
              </div>

              {/* Super Admin Unlock trigger if needed */}
              {isSuperAdminEmailEntered && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-950 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Email Super Admin Terdeteksi: <strong>{email}</strong></span>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-emerald-200 px-2 py-0.5 rounded text-emerald-900">
                    Super Admin
                  </span>
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: PERSONAL INFORMATION (INFORMASI PRIBADI)              */}
            {/* ------------------------------------------------------------- */}
            <div className="pt-2 border-t border-stone-100 space-y-3">
              <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 uppercase font-mono tracking-wide text-stone-500">
                <User className="w-3.5 h-3.5 text-emerald-700" />
                <span>1. Informasi Pribadi</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Nama Lengkap *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Lengkap Anda"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Nomor WhatsApp / HP *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+628123456789"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Alamat Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="nama@perusahaan.co.id"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Password (min. 6 karakter) *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Konfirmasi Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* STEP 3A: ADMIN CABANG - INFORMASI PERUSAHAAN & CABANG         */}
            {/* ------------------------------------------------------------- */}
            {role === 'admin' && !isSuperAdminEmailEntered && (
              <div className="pt-2 border-t border-stone-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 uppercase font-mono tracking-wide text-teal-800">
                    <Building2 className="w-3.5 h-3.5 text-teal-700" />
                    <span>2. Informasi Perusahaan & Cabang</span>
                  </h4>
                  <div className="flex items-center gap-1 p-0.5 bg-stone-100 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setAdminCompanyMode('new')}
                      className={`px-2 py-0.5 rounded font-semibold transition-all ${
                        adminCompanyMode === 'new'
                          ? 'bg-white text-teal-800 shadow-2xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Perusahaan Baru
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminCompanyMode('existing')}
                      className={`px-2 py-0.5 rounded font-semibold transition-all ${
                        adminCompanyMode === 'existing'
                          ? 'bg-white text-teal-800 shadow-2xs'
                          : 'text-stone-500 hover:text-stone-800'
                      }`}
                    >
                      Pilih Terdaftar
                    </button>
                  </div>
                </div>

                {/* Mode A.1: Daftarkan Perusahaan Baru */}
                {adminCompanyMode === 'new' ? (
                  <div className="space-y-2.5 p-3.5 bg-teal-50/40 border border-teal-200/80 rounded-2xl">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Nama Perusahaan Properti *</label>
                      <input
                        type="text"
                        required
                        value={newCompanyName}
                        onChange={(e) => setNewCompanyName(e.target.value)}
                        placeholder="Contoh: Wenakta Residence / Graha Property"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Alamat Kantor Perusahaan *</label>
                      <input
                        type="text"
                        value={newCompanyAddress}
                        onChange={(e) => setNewCompanyAddress(e.target.value)}
                        placeholder="Alamat kantor pusat perusahaan"
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Nama Cabang yang Dikelola *</label>
                        <input
                          type="text"
                          required
                          value={newBranchName}
                          onChange={(e) => setNewBranchName(e.target.value)}
                          placeholder="Contoh: Cabang Garut / Cabang BSD"
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Kota Cabang *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Contoh: Garut / Tangerang"
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Alamat Kantor Cabang *</label>
                        <input
                          type="text"
                          value={newBranchAddress}
                          onChange={(e) => setNewBranchAddress(e.target.value)}
                          placeholder="Alamat fisik kantor cabang"
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Jabatan Anda *</label>
                        <input
                          type="text"
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          placeholder="Contoh: Branch Manager / Principal"
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <p>
                        <strong>Persetujuan Super Admin Diperlukan:</strong> Pendaftaran perusahaan baru akan mendapatkan Company ID & Branch ID unik dari sistem, dan harus diverifikasi oleh Super Admin (Ocha Syamsiah) sebelum cabang aktif.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Mode A.2: Pilih Perusahaan yang Sudah Terdaftar & Daftarkan Cabang */
                  <div className="space-y-2.5 p-3.5 bg-stone-50 border border-stone-200 rounded-2xl">
                    <div>
                      <label className="block font-medium text-stone-700 mb-1">Pilih Perusahaan Properti Terdaftar *</label>
                      <select
                        value={selectedCompanyId}
                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 text-xs font-medium"
                      >
                        <option value="">-- Pilih Perusahaan Properti --</option>
                        {approvedCompanies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.id}) - {c.city}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Nama Cabang Baru *</label>
                        <input
                          type="text"
                          required
                          value={newBranchName}
                          onChange={(e) => setNewBranchName(e.target.value)}
                          placeholder="Contoh: Cabang Garut"
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Kota Cabang *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Kota Cabang"
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Alamat Kantor Cabang *</label>
                        <input
                          type="text"
                          value={newBranchAddress}
                          onChange={(e) => setNewBranchAddress(e.target.value)}
                          placeholder="Alamat kantor cabang"
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">Jabatan Anda *</label>
                        <input
                          type="text"
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          placeholder="Branch Manager / Admin Cabang"
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-teal-600/20 focus:border-teal-600 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3B: AGEN PROPERTI - PILIH PERUSAHAAN & CABANG TERDAFTAR  */}
            {/* ------------------------------------------------------------- */}
            {role === 'user' && !isSuperAdminEmailEntered && (
              <div className="pt-2 border-t border-stone-100 space-y-3">
                <h4 className="font-bold text-stone-900 text-xs flex items-center gap-1.5 uppercase font-mono tracking-wide text-emerald-800">
                  <Building className="w-3.5 h-3.5 text-emerald-700" />
                  <span>2. Pilih Keanggotaan Perusahaan & Cabang</span>
                </h4>

                <div className="p-3.5 bg-emerald-50/40 border border-emerald-200/80 rounded-2xl space-y-3">
                  {/* Company Live Search & Dropdown */}
                  <div>
                    <label className="block font-medium text-stone-700 mb-1">
                      Cari & Pilih Perusahaan Properti Terdaftar *
                    </label>
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={companySearchQuery}
                        onChange={(e) => setCompanySearchQuery(e.target.value)}
                        placeholder="Ketik untuk mencari nama perusahaan atau kota..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                      />
                    </div>

                    <select
                      required
                      value={selectedCompanyId}
                      onChange={(e) => {
                        setSelectedCompanyId(e.target.value);
                        setSelectedBranchId('');
                      }}
                      className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs font-medium"
                    >
                      <option value="">-- Pilih Perusahaan Properti --</option>
                      {filteredApprovedCompanies.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} [ID: {c.id}] · {c.city}
                        </option>
                      ))}
                      <option value="custom_company">+ Perusahaan Belum Terdaftar (Ketik Manual)</option>
                    </select>

                    {/* Custom Company Name Input if selected */}
                    {selectedCompanyId === 'custom_company' && (
                      <div className="mt-2.5 animate-fadeIn">
                        <label className="block font-medium text-stone-700 mb-1">
                          Nama Perusahaan Properti Anda *
                        </label>
                        <input
                          type="text"
                          required
                          value={customCompanyName}
                          onChange={(e) => setCustomCompanyName(e.target.value)}
                          placeholder="Contoh: PT Graha Properti Indonesia / Era Jaya"
                          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-600/20 text-xs font-medium"
                        />
                      </div>
                    )}
                  </div>

                  {/* Informative Guidance & Quick Admin Switch */}
                  <div className="p-2.5 bg-white border border-emerald-200/70 rounded-xl text-[11px] text-stone-600 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-900">
                      <Info className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>Kantor atau Perusahaan Anda belum ada di daftar pilihan?</span>
                    </div>
                    <p className="text-[10.5px] leading-relaxed text-stone-500 pl-5">
                      Anda dapat memilih opsi <strong>"Ketik Manual"</strong> di atas, atau jika Anda berwenang mengelola cabang baru, daftarkan kantor Anda secara resmi sebagai <strong>Admin Cabang</strong>:
                    </p>
                    <div className="pt-0.5 pl-5">
                      <button
                        type="button"
                        onClick={() => {
                          setRole('admin');
                          setAdminCompanyMode('new');
                        }}
                        className="inline-flex items-center gap-1.5 text-emerald-800 hover:text-emerald-950 font-bold bg-emerald-100/70 hover:bg-emerald-200/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer text-[11px]"
                      >
                        <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Beralih: Daftarkan Perusahaan & Cabang Baru (Admin Cabang) →</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Branch Selection */}
                  {Boolean(selectedCompanyId) && (
                    <div className="animate-fadeIn space-y-2">
                      <div>
                        <label className="block font-medium text-stone-700 mb-1">
                          Pilih Kantor Cabang Anda *
                        </label>
                        {selectedCompanyId === 'custom_company' ? (
                          <input
                            type="text"
                            required
                            value={customBranchName}
                            onChange={(e) => setCustomBranchName(e.target.value)}
                            placeholder="Contoh: Cabang Pusat / Cabang Garut"
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 text-xs font-medium"
                          />
                        ) : (
                          <>
                            <select
                              required
                              value={selectedBranchId}
                              onChange={(e) => setSelectedBranchId(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs font-medium"
                            >
                              <option value="">-- Pilih Kantor Cabang --</option>
                              {availableBranches.map((b) => (
                                <option key={b.id} value={b.id}>
                                  {b.name} [ID: {b.id}] - {b.city}
                                </option>
                              ))}
                              <option value="custom_branch">+ Kantor Cabang Lainnya (Ketik Manual)</option>
                            </select>

                            {selectedBranchId === 'custom_branch' && (
                              <div className="mt-2 animate-fadeIn">
                                <label className="block font-medium text-stone-700 mb-1">
                                  Nama Kantor Cabang Anda *
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={customBranchName}
                                  onChange={(e) => setCustomBranchName(e.target.value)}
                                  placeholder="Contoh: Cabang Baru / Area Operasional"
                                  className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:ring-2 focus:ring-emerald-600/20 text-xs font-medium"
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-medium text-stone-700 mb-1">Kode Undangan Cabang (Opsional)</label>
                          <div className="relative">
                            <KeyRound className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={inviteCode}
                              onChange={(e) => setInviteCode(e.target.value)}
                              placeholder="Misal: INV-2026"
                              className="w-full pl-8 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 text-xs"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block font-medium text-stone-700 mb-1">Jabatan / Spesialisasi</label>
                          <input
                            type="text"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            placeholder="Contoh: Agen Properti Hunian"
                            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 text-xs"
                          />
                        </div>
                      </div>

                      <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <p>
                          <strong>Menunggu Approval Admin Cabang:</strong> Permohonan bergabung Anda akan dikirimkan kepada Admin Cabang terpilih. Anda baru dapat mengakses workspace setelah disetujui.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/20 transition-all active:scale-[0.98]"
              >
                <UserPlus className="w-4 h-4" />
                <span>
                  {isSubmitting 
                    ? 'Memproses Pendaftaran...' 
                    : role === 'admin' 
                    ? 'Kirim Pendaftaran Admin Cabang' 
                    : 'Kirim Permohonan Bergabung Agen'}
                </span>
              </button>
            </div>

            <p className="text-center text-[11px] text-stone-500 pt-1">
              Sudah memiliki akun terdaftar?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                Masuk ke Akun Terdaftar
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
});

// Helper component for Clock icon inside notification
const Clock: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

AuthModal.displayName = 'AuthModal';
export default AuthModal;
