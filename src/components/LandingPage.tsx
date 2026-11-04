import React, { memo } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  CalendarCheck, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  Coins, 
  Globe,
  Compass,
  CheckCircle,
  FileCheck2
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../utils/translations';

interface LandingPageProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  language: Language;
  onToggleLanguage: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = memo(({
  onOpenLogin,
  onOpenRegister,
  language,
  onToggleLanguage,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 flex flex-col antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar - Clean Warm Cream Surface */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-2xs">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center font-extrabold shadow-sm shadow-emerald-700/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-stone-900">AgenMate</span>
                <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  CRM Pro
                </span>
              </div>
              <p className="text-[10px] text-stone-500 hidden sm:block">Mobile Real Estate Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLanguage}
              className="h-8 px-2.5 rounded-lg bg-stone-100 border border-stone-200 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Ganti Bahasa (ID / EN)"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span className="uppercase font-mono text-[11px]">{language}</span>
            </button>

            <button
              onClick={onOpenLogin}
              className="h-8 px-3 rounded-xl bg-stone-100 border border-stone-300 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-700" />
              <span>Masuk</span>
            </button>

            <button
              onClick={onOpenRegister}
              className="h-8 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-700/25 transition-all active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section with Warm Cream & Soft Sage Ambient Accents */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20 px-4">
        {/* Soft Sage & Warm Sand Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center relative z-10 space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Platform CRM Khusus Agen & Kantor Broker Properti Indonesia</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight">
            Tutup Lebih Banyak <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700">Closing Properti</span> dalam Satu Genggaman.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto leading-relaxed">
            Kelola listing rumah & apartemen dalam Rupiah (IDR), kelola kontak klien, jadwal survey lokasi, dan alur persetujuan bertingkat (*Multi-Tier Role Approval*) untuk Principal, Admin, dan Agen.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenRegister}
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/25 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>Daftar Akun Baru Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto py-3 px-6 rounded-2xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
            >
              <LogIn className="w-4 h-4 text-emerald-700" />
              <span>Masuk ke Akun Terdaftar</span>
            </button>
          </div>

          {/* Key Trust Signals */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero-State Bersih (0 Data Awal)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Verifikasi Super Admin AREBI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>Mata Uang Rupiah Indonesia (IDR)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid - Clean White Cards on Soft Sand Surface */}
      <section className="max-w-4xl mx-auto px-4 py-8 space-y-6 flex-1">
        <div className="text-center space-y-1">
          <h2 className="text-lg sm:text-xl font-bold text-stone-900 tracking-tight">
            Dirancang Khusus untuk Alur Kerja Properti Indonesia
          </h2>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Semua yang Anda butuhkan dari prospek pertama di WhatsApp hingga closing akta di kantor notaris.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Feature 1 */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-200 space-y-2.5 shadow-xs transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Multi-Tier Role & Approval Gateway</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Pendaftaran agen dan admin kantor cabang diverifikasi langsung oleh Super Admin (Ocha Syamsiah) sebelum workspace aktif, menjaga integritas data listing.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-200 space-y-2.5 shadow-xs transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Visual Kanban Sales Pipeline</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Pantau 5 tahapan deal (Prospek Baru, Survey Lokasi, Negosiasi, Tanda Jadi UTJ, dan Akad Closing) lengkap dengan estimasi komisi dalam Rupiah.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-200 space-y-2.5 shadow-xs transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Brosur & WhatsApp 1-Ketukan</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Bagikan spesifikasi unit, sertifikat (SHM/HGB), dan draf pesan follow-up survey langsung ke WhatsApp klien dengan nomor Indonesia (+62) secara instan.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-200 space-y-2.5 shadow-xs transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Segmentasi Prospek Cerdas</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Kelola pembeli, penyewa, penjual, dan pemilik sewa. Sistem otomatis mencocokkan listing yang pas dengan rentang budget klien secara real-time.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-200 space-y-2.5 shadow-xs transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Hasil Survey & Follow-Up</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Catat tingkat minat klien (1-5 bintang), masukan survey, dan buat jadwal pengingat tugas follow-up agar tidak ada prospek closing yang terlewat.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-emerald-200 space-y-2.5 shadow-xs transition-all">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 text-sm">Preset SVG Dinamis & Offline-First</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Visual denah arsitektur SVG dinamis untuk apartemen, villa, ruko, dan townhouse. Berjalan lancar saat offline di basement gedung atau lokasi proyek.
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Warm Sand Tonal */}
      <footer className="border-t border-stone-200 bg-white py-6 px-4 text-center text-xs text-stone-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">AgenMate CRM Properti Mobile</span>
            <span>·</span>
            <span className="text-emerald-700 font-medium">Sage & Warm Sand Edition</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onOpenLogin} className="hover:text-emerald-700 transition-colors">Masuk</button>
            <span>·</span>
            <button onClick={onOpenRegister} className="hover:text-emerald-700 transition-colors">Daftar Akun Baru</button>
            <span>·</span>
            <button onClick={onToggleLanguage} className="hover:text-emerald-700 uppercase font-mono">{language}</button>
          </div>
        </div>
      </footer>
    </div>
  );
});

LandingPage.displayName = 'LandingPage';
export default LandingPage;
