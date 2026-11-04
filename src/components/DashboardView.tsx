import React, { useMemo } from 'react';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp, 
  Phone, 
  MessageSquare, 
  Clock, 
  ChevronRight, 
  Sparkles,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Client, Property, Deal, SiteVisit, FollowUpReminder } from '../types/crm';
import { formatRupiahShort } from '../utils/formatters';

interface DashboardViewProps {
  clients: Client[];
  properties: Property[];
  deals: Deal[];
  visits: SiteVisit[];
  reminders: FollowUpReminder[];
  onOpenContactModal: () => void;
  onOpenPropertyModal: () => void;
  onOpenVisitModal: () => void;
  onOpenDealModal: () => void;
  onOpenWhatsApp: (client: Client, property?: Property) => void;
  onSelectTab: (tab: 'dashboard' | 'contacts' | 'inventory' | 'pipeline' | 'visits' | 'database') => void;
  onToggleReminder: (reminderId: string) => void;
}

const DashboardViewComponent: React.FC<DashboardViewProps> = ({
  clients,
  properties,
  deals,
  visits,
  reminders,
  onOpenContactModal,
  onOpenPropertyModal,
  onOpenVisitModal,
  onOpenDealModal,
  onOpenWhatsApp,
  onSelectTab,
  onToggleReminder,
}) => {
  // Memoized client lookup map
  const clientsMap = useMemo(() => {
    return new Map<string, Client>(clients.map((c) => [c.id, c]));
  }, [clients]);

  // Aggregate real estate KPIs in a single pass
  const { totalPipelineValue, projectedCommission, closedWonRevenue, activeDealsCount } = useMemo(() => {
    let pipeline = 0;
    let commission = 0;
    let closed = 0;
    let activeCount = 0;

    for (const d of deals) {
      if (d.stage === 'closed_won') {
        closed += d.dealValue || 0;
      } else {
        pipeline += d.dealValue || 0;
        commission += d.estimatedCommission || Math.round((d.dealValue || 0) * 0.025);
        activeCount++;
      }
    }

    return {
      totalPipelineValue: pipeline,
      projectedCommission: commission,
      closedWonRevenue: closed,
      activeDealsCount: activeCount,
    };
  }, [deals]);

  const pendingReminders = useMemo(() => {
    return reminders.filter((r) => !r.completed);
  }, [reminders]);

  const isZeroState = clients.length === 0 && properties.length === 0 && deals.length === 0;

  // Memoized match alert: Check if any buyer matches an available property
  const matchAlerts = useMemo(() => {
    const activeBuyers = clients.filter((c) => c.segment === 'buyer' && c.status === 'active');
    const availableProps = properties.filter((p) => p.status === 'available');

    const alerts: { client: Client; property: Property }[] = [];
    for (const client of activeBuyers) {
      const preferredTypesSet = new Set(client.preferredTypes || []);
      const min = (client.budgetMin || 0) * 0.9;
      const max = (client.budgetMax || 0) > 0 ? client.budgetMax * 1.1 : Infinity;

      for (const prop of availableProps) {
        if (prop.price >= min && prop.price <= max) {
          if (preferredTypesSet.size === 0 || preferredTypesSet.has(prop.propertyType)) {
            alerts.push({ client, property: prop });
            if (alerts.length >= 2) return alerts;
          }
        }
      }
    }
    return alerts;
  }, [clients, properties]);

  return (
    <div className="space-y-6 pb-20">
      {/* Agent Welcome & Pipeline Banner - Soft Sage Green Gradient */}
      <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-900 rounded-3xl p-5 text-white shadow-sm relative overflow-hidden">
        {/* Subtle architectural sage pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 pointer-events-none">
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="100" y2="100" stroke="#A7F3D0" strokeWidth="2" />
            <line x1="20" y1="0" x2="100" y2="80" stroke="#A7F3D0" strokeWidth="2" />
            <line x1="40" y1="0" x2="100" y2="60" stroke="#A7F3D0" strokeWidth="2" />
          </svg>
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-emerald-200 text-xs font-semibold tracking-wider uppercase font-mono">
                Pusat Kendali Agen Properti
              </p>
              <h2 className="text-xl font-bold tracking-tight text-white mt-0.5">
                Ringkasan Hari Ini
              </h2>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-emerald-100">Total Pipeline</span>
              <p className="text-lg font-bold font-mono text-white tabular-nums">
                {formatRupiahShort(totalPipelineValue)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-emerald-700/60">
            <div>
              <span className="text-[10px] text-emerald-200 block">Est. Komisi</span>
              <span className="text-sm font-semibold font-mono text-white tabular-nums">
                {formatRupiahShort(projectedCommission)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 block">Deal Berjalan</span>
              <span className="text-sm font-semibold font-mono text-white tabular-nums">
                {activeDealsCount} aktif
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 block">Closing Terwujud</span>
              <span className="text-sm font-semibold font-mono text-emerald-200 tabular-nums">
                {formatRupiahShort(closedWonRevenue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ZERO-STATE ONBOARDING BANNER (Only shows when all counters are zero) */}
      {isZeroState && (
        <div className="p-4 bg-white border border-dashed border-emerald-300 rounded-2xl shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-bold text-stone-900 text-xs">Selamat Datang di AgenMate!</h4>
              <p className="text-[11px] text-stone-500">
                Workspace Anda siap digunakan dan semua metrik dimulai dari nol (0).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onOpenContactModal}
              className="py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Input Klien Pertama</span>
            </button>
            <button
              onClick={onOpenPropertyModal}
              className="py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Input Listing Pertama</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Field Actions (Aksi Cepat) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold text-stone-800 tracking-wide uppercase font-mono">
            Aksi Cepat Mobile
          </h3>
          <span className="text-[11px] text-stone-500">1-Ketukan Instan</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={onOpenContactModal}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all active:scale-95 group text-center min-h-[72px]"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-stone-800 truncate w-full">Tambah Klien</span>
          </button>

          <button
            onClick={onOpenVisitModal}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all active:scale-95 group text-center min-h-[72px]"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-stone-800 truncate w-full">Catat Survey</span>
          </button>

          <button
            onClick={onOpenDealModal}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all active:scale-95 group text-center min-h-[72px]"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-stone-800 truncate w-full">Deal Baru</span>
          </button>

          <button
            onClick={onOpenPropertyModal}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all active:scale-95 group text-center min-h-[72px]"
          >
            <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-700 border border-stone-200 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-stone-800 truncate w-full">Tambah Listing</span>
          </button>
        </div>
      </div>

      {/* High-Priority Follow-Ups */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase font-mono">
              Follow-Up Prioritas ({pendingReminders.length})
            </h3>
          </div>
          <button
            onClick={() => onSelectTab('visits')}
            className="text-[11px] font-medium text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
          >
            <span>Semua Pengingat</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {pendingReminders.length === 0 ? (
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500 shadow-2xs">
              Belum ada tugas follow-up aktif (0). Jadwalkan pengingat setelah survey lokasi.
            </div>
          ) : (
            pendingReminders.slice(0, 3).map((reminder) => {
              const client = clientsMap.get(reminder.clientId);
              return (
                <div
                  key={reminder.id}
                  className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:shadow-xs transition-shadow flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => onToggleReminder(reminder.id)}
                      className="mt-0.5 text-slate-300 hover:text-emerald-600 transition-colors shrink-0"
                      title="Tandai selesai"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs truncate">
                          {reminder.clientName}
                        </span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                          Batas: {reminder.dueDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {reminder.note}
                      </p>
                      {reminder.propertyTitle && (
                        <p className="text-[11px] text-slate-400 mt-1 truncate">
                          Properti: {reminder.propertyTitle}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    {client && (
                      <button
                        onClick={() => onOpenWhatsApp(client)}
                        className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                        title="Kirim WhatsApp Langsung"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                    <a
                      href={`tel:${reminder.clientPhone}`}
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
                      title="Telepon Langsung"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Smart Property Match Alert */}
      {matchAlerts.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-50 via-white to-amber-50/30 border border-amber-200 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wide">
              Peluang Listing Cocok
            </h4>
          </div>
          <p className="text-xs text-slate-600 mb-3">
            Klien <strong className="text-slate-900">{matchAlerts[0].client.name}</strong> memiliki budget yang pas dengan{' '}
            <strong className="text-slate-900">{matchAlerts[0].property.title}</strong>.
          </p>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-amber-800 font-semibold">
              Harga: {formatRupiahShort(matchAlerts[0].property.price)}
            </span>
            <button
              onClick={() => onOpenWhatsApp(matchAlerts[0].client, matchAlerts[0].property)}
              className="py-1.5 px-3 rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Tawarkan via WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Site Visits */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-800 tracking-wide uppercase font-mono">
              Jadwal Survey & Kunjungan Lokasi
            </h3>
          </div>
          <button
            onClick={() => onSelectTab('visits')}
            className="text-[11px] font-medium text-amber-700 hover:text-amber-800 flex items-center gap-0.5"
          >
            <span>Lihat Semua ({visits.length})</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {visits.length === 0 ? (
            <div className="p-4 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500 shadow-2xs">
              Belum ada agenda survey lokasi (0). Tekan "Catat Survey" untuk merekam hasil kunjungan.
            </div>
          ) : (
            visits.slice(0, 3).map((visit) => {
              const client = clientsMap.get(visit.clientId);
              const dateObj = new Date(visit.visitDate);
              const formattedTime = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
              const formattedDate = dateObj.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });

              return (
                <div
                  key={visit.id}
                  className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs truncate">
                        {visit.clientName}
                      </span>
                      <span className="text-[10px] text-slate-400">·</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formattedDate}, {formattedTime}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium truncate mt-0.5">
                      {visit.propertyTitle}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      Langkah Berikut: {visit.agreedNextStep}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {client && (
                      <button
                        onClick={() => onOpenWhatsApp(client)}
                        className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                        title="Kirim WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    )}
                    <a
                      href={`tel:${visit.clientPhone}`}
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
                      title="Telepon"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export const DashboardView = React.memo(DashboardViewComponent);
export default DashboardView;
