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
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-teal-600 text-white flex items-center justify-center font-extrabold shadow-sm shadow-emerald-700/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-stone-900">AgenMate</span>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
                  CRM Pro
                </span>
              </div>
              <p className="text-[10px] text-stone-500 hidden sm:block">Platform CRM Khusus Agen Properti Indonesia</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onToggleLanguage}
              className="h-9 px-3 rounded-xl bg-stone-100 border border-stone-200 hover:bg-stone-200 text-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Ganti Bahasa (ID / EN)"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span className="uppercase font-mono text-xs">{language}</span>
            </button>

            <button
              onClick={onOpenLogin}
              className="h-9 px-4 rounded-xl bg-stone-100 border border-stone-300 hover:bg-stone-200 text-stone-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-700" />
              <span>Masuk</span>
            </button>

            <button
              onClick={onOpenRegister}
              className="h-9 px-4.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-emerald-700/25 transition-all active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section: Differentiated Mobile (Centered) vs Laptop (2-Column with App Showcase) */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20 px-4 lg:px-8">
        {/* Soft Sage & Warm Sand Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-5">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Platform CRM Khusus Agen & Kantor Broker Properti Indonesia</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-stone-900 leading-[1.15]">
                Tutup Lebih Banyak <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700">Closing Properti</span> dalam Satu Ekosistem.
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Dirancang khusus dengan dua antarmuka optimal: <strong>Mode Mobile On-the-Go</strong> untuk survey di lapangan, dan <strong>Mode Laptop / Desktop</strong> dengan sidebar lengkap & papan visual Kanban untuk operasional kantor agen.
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={onOpenRegister}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-700/25 transition-all active:scale-95"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>Daftar Akun Baru Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <LogIn className="w-4 h-4 text-emerald-700" />
                  <span>Masuk ke Akun Terdaftar</span>
                </button>
              </div>

              {/* Key Trust Signals */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-stone-500">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Responsive Laptop & HP</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Multi-Tier Approval Gateway</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-600" />
                  <span>Mata Uang Rupiah (IDR)</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Laptop Mockup Preview (Visible on all screens, especially stunning on desktop) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-5 border border-stone-200/90 shadow-xl relative overflow-hidden group">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                    <span className="text-[11px] font-mono text-stone-400 ml-2">agenmate.app / workspace</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Live Cloud
                  </span>
                </div>

                <div className="pt-4 space-y-3.5">
                  {/* Mockup KPI Top Bar */}
                  <div className="bg-gradient-to-br from-emerald-800 to-teal-800 p-4 rounded-2xl text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-mono text-emerald-200 font-bold">Total Nilai Pipeline</span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">Closing 2.5%</span>
                    </div>
                    <div className="text-xl font-extrabold font-mono text-white">Rp 8.500.000.000</div>
                    <div className="text-[11px] text-emerald-200 mt-1">Est. Komisi: Rp 212.500.000</div>
                  </div>

                  {/* Mockup Mini Kanban Columns */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                      <span className="text-[10px] font-bold text-stone-700 block font-mono">Survey</span>
                      <div className="mt-1 bg-white p-2 rounded-lg border border-stone-200 shadow-2xs">
                        <p className="text-[11px] font-semibold text-stone-800 truncate">Cluster Cendana</p>
                        <p className="text-[10px] font-mono text-emerald-700">Rp 1,4 M</p>
                      </div>
                    </div>
                    <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80">
                      <span className="text-[10px] font-bold text-amber-800 block font-mono">Negosiasi</span>
                      <div className="mt-1 bg-white p-2 rounded-lg border border-amber-200 shadow-2xs">
                        <p className="text-[11px] font-semibold text-stone-800 truncate">Ruko BSD Boulevard</p>
                        <p className="text-[10px] font-mono text-emerald-700">Rp 3,2 M</p>
                      </div>
                    </div>
                    <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-200/80">
                      <span className="text-[10px] font-bold text-emerald-800 block font-mono">Closing</span>
                      <div className="mt-1 bg-white p-2 rounded-lg border border-emerald-200 shadow-2xs">
                        <p className="text-[11px] font-semibold text-stone-800 truncate">Villa Canggu Bali</p>
                        <p className="text-[10px] font-mono text-emerald-700">Rp 3,9 M</p>
                      </div>
                    </div>
                  </div>

                  {/* Mockup Quick Feature Notice */}
                  <div className="p-3 bg-stone-50 rounded-xl flex items-center justify-between text-xs text-stone-600">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      <span>Integrasi WhatsApp Klien & Brosur Otomatis</span>
                    </div>
                    <span className="text-emerald-700 font-bold">1-Klik</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid - Clean White Cards on Soft Sand Surface */}
      <section className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-6 flex-1">
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
