import React, { useState, memo } from 'react';
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
  FileText,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types/crm';
import { SUPER_ADMIN_EMAIL, isSuperAdminEmail } from '../data/defaultData';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'register';
  onClose: () => void;
  onLogin: (email: string, password?: string) => { success: boolean; message?: string } | Promise<{ success: boolean; message?: string }>;
  onRegister: (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'user' | 'admin' | 'super_admin';
    agencyName: string;
    city: string;
    licenseNumber?: string;
  }) => { success: boolean; message?: string } | Promise<{ success: boolean; message?: string }>;
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

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'super_admin'>('user');
  const [agencyName, setAgencyName] = useState('');
  const [city, setCity] = useState('Jakarta Selatan');
  const [licenseNumber, setLicenseNumber] = useState('');

  const isSuperAdminEmailEntered = isSuperAdminEmail(email);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (isSuperAdminEmail(val)) {
      setRole('super_admin');
    } else if (role === 'super_admin') {
      setRole('user');
    }
  };

  const handleSelectSuperAdminRole = () => {
    if (isSuperAdminEmail(email)) {
      setRole('super_admin');
      return;
    }
    if (!email.trim()) {
      setEmail('ocha.syamsiah16@gmail.com');
      setName((prev) => prev || 'Ocha Syamsiah');
      setRole('super_admin');
      setErrorMessage(null);
    } else {
      setErrorMessage('Peran Super Admin dikunci khusus untuk ochasyamsiah16@gmail.com atau ocha.syamsiah16@gmail.com.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Silakan masukkan alamat email Anda.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      return;
    }

    const res = await onLogin(email.trim(), password);
    if (!res.success) {
      setErrorMessage(res.message || 'Email atau kata sandi tidak sesuai.');
    } else {
      onClose();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Mohon lengkapi Nama, Email, dan Kata Sandi.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }

    // Role Security: Any attempt to register as Super Admin from non-Ocha email is blocked
    const trimmedEmail = email.trim();
    const isSuper = isSuperAdminEmail(trimmedEmail);
    if (!isSuper && role === 'super_admin') {
      setErrorMessage('Akses Ditolak: Peran Super Admin dikunci khusus untuk ochasyamsiah16@gmail.com atau ocha.syamsiah16@gmail.com.');
      return;
    }

    const res = await onRegister({
      name: name.trim(),
      email: trimmedEmail,
      password: password.trim(),
      phone: phone.trim() || '+6281234567890',
      role: isSuper ? 'super_admin' : role,
      agencyName: agencyName.trim() || (isSuper ? 'AgenMate HQ (Principal Owner)' : 'Independen Broker'),
      city: city.trim() || 'Jakarta',
      licenseNumber: licenseNumber.trim() || undefined,
    });

    if (!res.success) {
      setErrorMessage(res.message || 'Pendaftaran gagal.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-950/40 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
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
              className={`py-1.5 px-3 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Masuk / Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`py-1.5 px-3 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Daftar / Sign Up
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Masuk ke Workspace AgenMate</h3>
              <p className="text-stone-500 text-xs mt-0.5">
                Gunakan email dan kata sandi terdaftar untuk mengakses platform CRM properti Anda.
              </p>
            </div>

            <div>
              <label className="block font-medium text-stone-700 mb-1">Alamat Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@agenmate.id atau email terdaftar"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs"
                />
              </div>
            </div>

            {/* Super Admin Detection Card in Login */}
            {isSuperAdminEmail(email) && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Akun Super Admin (Ocha Syamsiah) Dikenali</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Akses langsung ke Dashboard Approval antrean pengguna. Silakan gunakan kata sandi Anda atau kata sandi bawaan (<code>password123</code>).
                </p>
                {!password && (
                  <button
                    type="button"
                    onClick={() => setPassword('password123')}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline block"
                  >
                    Gunakan kata sandi bawaan (password123)
                  </button>
                )}
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/20 transition-all active:scale-[0.98]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk ke Workspace</span>
              </button>
            </div>

            <p className="text-center text-[11px] text-stone-500 pt-1">
              Belum memiliki akun?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                Daftar Sekarang
              </button>
            </p>
          </form>
        )}

        {/* REGISTRATION FORM */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-5 overflow-y-auto space-y-3.5 text-xs">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Pendaftaran Akun Baru</h3>
              <p className="text-stone-500 text-xs mt-0.5">
                Permohonan akun akan masuk ke Antrean Verifikasi Super Admin (Ocha Syamsiah).
              </p>
            </div>

            {/* SECURE ROLE SELECTION: USER vs ADMIN vs LOCKED SUPER ADMIN */}
            <div>
              <label className="block font-bold text-stone-800 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Pilih Peran Akun (Role Selection) *</span>
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Multi-tier Role</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* Option 1: User / Agen Properti */}
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    role === 'user'
                      ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 shadow-2xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900 text-xs">User / Agen</span>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      role === 'user' ? 'border-emerald-700 bg-emerald-600' : 'border-stone-300'
                    }`}>
                      {role === 'user' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-medium">Agen Lapangan</p>
                  <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">
                    Kelola kontak & listing closing.
                  </p>
                </button>

                {/* Option 2: Admin Cabang */}
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    role === 'admin'
                      ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600/20 shadow-2xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-stone-900 text-xs">Admin Cabang</span>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      role === 'admin' ? 'border-teal-700 bg-teal-600' : 'border-stone-300'
                    }`}>
                      {role === 'admin' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 font-medium">Admin Kantor</p>
                  <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">
                    Supervisi listing cabang & tim.
                  </p>
                </button>

                {/* Option 3: Super Admin - Interactive & Dynamic Unlock for Ocha Syamsiah */}
                <button
                  type="button"
                  onClick={handleSelectSuperAdminRole}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    isSuperAdminEmailEntered
                      ? (role === 'super_admin'
                          ? 'border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-600/20 shadow-2xs'
                          : 'border-emerald-300 bg-emerald-50/40 hover:border-emerald-500 cursor-pointer')
                      : 'border-dashed border-stone-300 bg-stone-50 hover:bg-stone-100/80 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs flex items-center gap-1 ${
                      isSuperAdminEmailEntered ? 'text-emerald-950' : 'text-stone-700'
                    }`}>
                      {isSuperAdminEmailEntered ? (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                      ) : (
                        <Lock className="w-3 h-3 text-stone-400" />
                      )}
                      <span>Super Admin</span>
                    </span>
                    <span className={`text-[8px] font-bold font-mono px-1 py-0.5 rounded uppercase ${
                      isSuperAdminEmailEntered
                        ? 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                        : 'bg-stone-200 text-stone-600'
                    }`}>
                      {isSuperAdminEmailEntered ? 'Terbuka' : 'Terkunci'}
                    </span>
                  </div>
                  <p className={`text-[10px] font-semibold mt-0.5 leading-tight ${
                    isSuperAdminEmailEntered ? 'text-emerald-800' : 'text-stone-600'
                  }`}>
                    {isSuperAdminEmailEntered ? 'Ocha Syamsiah (Aktif)' : 'Khusus Ocha Syamsiah'}
                  </p>
                  <p className="text-[9px] text-stone-400 mt-0.5 leading-tight">
                    {isSuperAdminEmailEntered
                      ? 'Hak akses penuh antrean verifikasi.'
                      : 'Klik untuk mengaktifkan email Super Admin.'}
                  </p>
                </button>
              </div>

              {/* Informative banner if Super Admin email is detected */}
              {isSuperAdminEmailEntered && (
                <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1.5 animate-fadeIn">
                  <div className="flex items-center gap-2 font-bold text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Akun Super Admin Ocha Syamsiah Terdeteksi!</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Email <strong>{email}</strong> dikenali sebagai Super Admin pemilik sistem. Akun ini sudah aktif secara bawaan. Anda dapat langsung masuk melalui tab <strong>Masuk / Login</strong> dengan kata sandi <code>password123</code>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                    }}
                    className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Beralih ke Masuk / Login Sekarang</span>
                  </button>
                </div>
              )}
            </div>

            {/* Full Name & Phone */}
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
                    placeholder="Contoh: Hendra Kusuma, S.T."
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
                    placeholder="+6281298765432"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Alamat Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="ocha.syamsiah16@gmail.com atau email Anda"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Kata Sandi (min. 6 karakter) *</label>
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
            </div>

            {/* Agency Name & Operational City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Kantor Broker / Agency</label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="Contoh: ERA Star / Ray White / Mandiri"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium text-stone-700 mb-1">Kota Operasional</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Contoh: Jakarta Selatan, Surabaya"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* License Number (AREBI / SIUP-PRO) */}
            <div>
              <label className="block font-medium text-stone-700 mb-1">Nomor Registrasi AREBI / SIUP-PRO (Opsional)</label>
              <div className="relative">
                <FileText className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="Contoh: AREBI-2026-JKT"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 text-xs"
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-[11px] text-emerald-950 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p>
                <strong>Status Approval Wajib:</strong> Setelah pendaftaran dikirimkan, akun Anda berstatus <em>Pending Approval</em> dan harus disetujui langsung oleh Super Admin (ochasyamsiah16@gmail.com) sebelum workspace CRM aktif.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-emerald-700/20 transition-all active:scale-[0.98]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Kirim Permohonan Pendaftaran</span>
              </button>
            </div>

            <p className="text-center text-[11px] text-stone-500 pt-1">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                Masuk di Sini
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
});

AuthModal.displayName = 'AuthModal';
export default AuthModal;
