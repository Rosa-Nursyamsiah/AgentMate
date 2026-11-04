import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  ShieldCheck, 
  Server, 
  Download, 
  Terminal,
  Layers
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, VERCEL_DEPLOY_GUIDE } from '../data/supabaseSchema';
import { Client, Property, Deal, SiteVisit, FollowUpReminder } from '../types/crm';

interface DatabaseSchemaViewProps {
  clients: Client[];
  properties: Property[];
  deals: Deal[];
  visits: SiteVisit[];
  reminders: FollowUpReminder[];
}

const DatabaseSchemaViewComponent: React.FC<DatabaseSchemaViewProps> = ({
  clients,
  properties,
  deals,
  visits,
  reminders,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedVercel, setCopiedVercel] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'schema' | 'vercel'>('sql');

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyVercel = () => {
    navigator.clipboard.writeText(VERCEL_DEPLOY_GUIDE);
    setCopiedVercel(true);
    setTimeout(() => setCopiedVercel(false), 2500);
  };

  const handleExportData = () => {
    const backup = {
      clients,
      properties,
      deals,
      visits,
      reminders,
      exportedAt: new Date().toISOString(),
      version: '1.0.0-agenmate-id',
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agenmate_cadangan_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Database & Backend</h2>
          <p className="text-xs text-slate-500">Skema PostgreSQL Supabase & Hosting 24/7 Vercel</p>
        </div>
        <button
          onClick={handleExportData}
          className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Ekspor JSON</span>
        </button>
      </div>

      {/* Live Entity Table Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-mono text-slate-400 block">KLIEN AKTIF</span>
          <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
            {clients.length}
          </span>
          <span className="text-[10px] text-slate-500 block truncate">public.clients</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-mono text-slate-400 block">LISTING</span>
          <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
            {properties.length}
          </span>
          <span className="text-[10px] text-slate-500 block truncate">public.properties</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-mono text-slate-400 block">TRANSAKSI DEAL</span>
          <span className="text-base font-bold font-mono text-emerald-700 tabular-nums">
            {deals.length}
          </span>
          <span className="text-[10px] text-slate-500 block truncate">public.deals</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-mono text-slate-400 block">SURVEY LOKASI</span>
          <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
            {visits.length}
          </span>
          <span className="text-[10px] text-slate-500 block truncate">public.site_visits</span>
        </div>
        <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs">
          <span className="text-[10px] font-mono text-slate-400 block">PENGINGAT</span>
          <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
            {reminders.length}
          </span>
          <span className="text-[10px] text-slate-500 block truncate">public.follow_ups</span>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-200/70 rounded-xl text-xs font-medium">
        <button
          onClick={() => setActiveTab('sql')}
          className={`py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'sql'
              ? 'bg-white text-stone-900 shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-emerald-700" />
          <span>Migrasi SQL Supabase</span>
        </button>
        <button
          onClick={() => setActiveTab('schema')}
          className={`py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'schema'
              ? 'bg-white text-stone-900 shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-emerald-700" />
          <span>Arsitektur & Keamanan RLS</span>
        </button>
        <button
          onClick={() => setActiveTab('vercel')}
          className={`py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'vercel'
              ? 'bg-white text-stone-900 shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Server className="w-3.5 h-3.5 text-emerald-700" />
          <span>Hosting Vercel 24/7</span>
        </button>
      </div>

      {/* TAB 1: Supabase SQL Code */}
      {activeTab === 'sql' && (
        <div className="bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-md">
          <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-semibold text-slate-300">
                supabase/migrations/20261102_initial_schema.sql
              </span>
            </div>
            <button
              onClick={handleCopySql}
              className="py-1 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-all"
            >
              {copiedSql ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin SQL</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-4 text-[11px] font-mono leading-relaxed overflow-x-auto text-slate-300 max-h-[460px]">
            {SUPABASE_SQL_SCHEMA}
          </pre>
        </div>
      )}

      {/* TAB 2: Architecture & RLS Security Rules */}
      {activeTab === 'schema' && (
        <div className="space-y-3">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Keamanan Multi-Tenant Row Level Security (RLS)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              AgenMate menerapkan proteksi Row Level Security (RLS) di level database PostgreSQL. Setiap agen
              properti independen hanya memiliki akses terhadap daftar listing, nomor telepon klien, dan komisi mereka
              sendiri melalui aturan
              <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-800 font-mono text-[11px] mx-1">
                auth.uid() = agent_id
              </code>.
              Data privasi klien Anda tidak dapat dibaca oleh agen lain dalam satu kantor broker.
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 text-sm">Contoh Integrasi Klien Supabase di Frontend</h4>
            <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
{`import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Ambil data transaksi aktif agen yang sedang login:
export async function getPipelineAgen() {
  const { data, error } = await supabase
    .from('deals')
    .select('*, clients(*), properties(*)')
    .order('last_activity_at', { ascending: false });
  return data;
}`}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Vercel Deployment Checklist */}
      {activeTab === 'vercel' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">Panduan Deployment Vercel 24/7</h3>
            </div>
            <button
              onClick={handleCopyVercel}
              className="py-1 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-medium flex items-center gap-1"
            >
              {copiedVercel ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedVercel ? 'Panduan Tersalin' : 'Salin Panduan'}</span>
            </button>
          </div>

          <ol className="space-y-3 list-decimal list-inside text-slate-700 leading-relaxed">
            <li>
              <strong>Deploy 1-Klik ke Vercel</strong>: Hubungkan repositori GitHub Anda ke akun Vercel. Konfigurasi Vite otomatis terdeteksi tanpa setup manual.
            </li>
            <li>
              <strong>Atur Environment Variables di Vercel</strong>:
              <div className="mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px]">
                VITE_SUPABASE_URL = "https://[id-projek-anda].supabase.co"<br />
                VITE_SUPABASE_ANON_KEY = "eyJhbGciOi..."
              </div>
            </li>
            <li>
              <strong>Dukungan PWA & Pasang di Layar Utama HP</strong>: AgenMate dirancang dengan touch targets ergonomis (minimal 44x44px). Agen dapat langsung memilih "Add to Home Screen" di Safari iOS atau Chrome Android.
            </li>
            <li>
              <strong>Dukungan Mode Offline / Lapangan</strong>: Semua data kontak dan catatan survey tersimpan di penyimpanan lokal perangkat, sehingga aplikasi tetap lancar saat berada di basement atau lift gedung bertingkat.
            </li>
          </ol>
        </div>
      )}
    </div>
  );
};

export const DatabaseSchemaView = React.memo(DatabaseSchemaViewComponent);
export default DatabaseSchemaView;
