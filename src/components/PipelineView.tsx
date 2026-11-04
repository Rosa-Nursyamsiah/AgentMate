import React, { useState, useMemo, useCallback } from 'react';
import { 
  Plus, 
  ArrowRight, 
  ArrowLeft, 
  Calendar, 
  Phone, 
  MessageSquare, 
  Trophy, 
  Sparkles, 
  Edit2, 
  Trash2 
} from 'lucide-react';
import { Deal, PipelineStage, Client, Property } from '../types/crm';
import { formatRupiahShort } from '../utils/formatters';

interface PipelineViewProps {
  deals: Deal[];
  clients: Client[];
  properties: Property[];
  onOpenAddModal: (stage?: PipelineStage) => void;
  onOpenEditModal: (deal: Deal) => void;
  onDeleteDeal: (id: string) => void;
  onMoveStage: (dealId: string, newStage: PipelineStage) => void;
  onOpenWhatsApp: (client: Client, property?: Property) => void;
}

const STAGES: { id: PipelineStage; label: string; color: string; desc: string }[] = [
  { id: 'new_lead', label: 'Prospek Baru', color: 'border-slate-300 text-slate-700', desc: 'Inquiry awal & kualifikasi budget' },
  { id: 'site_visit', label: 'Survey Lokasi', color: 'border-sky-400 text-sky-800', desc: 'Kunjungan unit fisik / show unit' },
  { id: 'negotiation', label: 'Negosiasi', color: 'border-amber-400 text-amber-800', desc: 'Penawaran harga & syarat pembayaran' },
  { id: 'booking_fee', label: 'Tanda Jadi / UTJ', color: 'border-indigo-400 text-indigo-800', desc: 'Uang Tanda Jadi masuk rekening kantor' },
  { id: 'closed_won', label: 'Akad / Closing', color: 'border-emerald-500 text-emerald-800', desc: 'Tanda tangan PPJB/AJB & komisi cair' },
];

const STAGE_ORDER: PipelineStage[] = [
  'new_lead',
  'site_visit',
  'negotiation',
  'booking_fee',
  'closed_won',
];

const PipelineViewComponent: React.FC<PipelineViewProps> = ({
  deals,
  clients,
  properties,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteDeal,
  onMoveStage,
  onOpenWhatsApp,
}) => {
  const [activeFilterStage, setActiveFilterStage] = useState<'all' | PipelineStage>('all');
  const [showCelebration, setShowCelebration] = useState(false);

  // Memoized client and property lookup maps for O(1) deal card rendering
  const clientsMap = useMemo(() => {
    return new Map<string, Client>(clients.map((c) => [c.id, c]));
  }, [clients]);

  const propertiesMap = useMemo(() => {
    return new Map<string, Property>(properties.map((p) => [p.id, p]));
  }, [properties]);

  // Aggregate deal KPIs in a single loop
  const { totalValue, totalClosed, activeDealsCount, closedDealsCount } = useMemo(() => {
    let value = 0;
    let closed = 0;
    let activeCount = 0;
    let closedCount = 0;

    for (const d of deals) {
      const val = d.dealValue || 0;
      if (d.stage === 'closed_won') {
        closed += val;
        closedCount++;
      } else {
        value += val;
        activeCount++;
      }
    }

    return {
      totalValue: value,
      totalClosed: closed,
      activeDealsCount: activeCount,
      closedDealsCount: closedCount,
    };
  }, [deals]);

  // Pre-group deals by stage
  const dealsByStage = useMemo(() => {
    const map: Record<PipelineStage, Deal[]> = {
      new_lead: [],
      site_visit: [],
      negotiation: [],
      booking_fee: [],
      closed_won: [],
    };
    for (const deal of deals) {
      if (map[deal.stage]) {
        map[deal.stage].push(deal);
      } else {
        map.new_lead.push(deal);
      }
    }
    return map;
  }, [deals]);

  // Precompute stage total values
  const stageTotals = useMemo(() => {
    const totals: Record<PipelineStage, number> = {
      new_lead: 0,
      site_visit: 0,
      negotiation: 0,
      booking_fee: 0,
      closed_won: 0,
    };
    for (const stage of STAGE_ORDER) {
      totals[stage] = dealsByStage[stage].reduce((sum, d) => sum + d.dealValue, 0);
    }
    return totals;
  }, [dealsByStage]);

  const handleAdvance = useCallback(
    (deal: Deal) => {
      const currentIndex = STAGE_ORDER.indexOf(deal.stage);
      if (currentIndex < STAGE_ORDER.length - 1) {
        const nextStage = STAGE_ORDER[currentIndex + 1];
        onMoveStage(deal.id, nextStage);
        if (nextStage === 'closed_won') {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 4500);
        }
      }
    },
    [onMoveStage]
  );

  const handleRegress = useCallback(
    (deal: Deal) => {
      const currentIndex = STAGE_ORDER.indexOf(deal.stage);
      if (currentIndex > 0) {
        const prevStage = STAGE_ORDER[currentIndex - 1];
        onMoveStage(deal.id, prevStage);
      }
    },
    [onMoveStage]
  );

  const displayedStages = useMemo(() => {
    return STAGES.filter((st) => activeFilterStage === 'all' || activeFilterStage === st.id);
  }, [activeFilterStage]);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Pipeline Penjualan</h2>
          <p className="text-xs text-slate-500">Papan visual Kanban tahapan closing properti</p>
        </div>
        <button
          onClick={() => onOpenAddModal()}
          className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Deal Baru</span>
        </button>
      </div>

      {/* Celebration Banner if Closed Won */}
      {showCelebration && (
        <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl text-white font-bold text-xs flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-300" />
            <span>🎉 Selamat! Deal Berhasil Closing! Komisi telah aman dan siap dicairkan!</span>
          </div>
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>
      )}

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-stone-200 rounded-2xl shadow-2xs">
        <div>
          <span className="text-[10px] text-stone-400 block font-mono">PIPELINE AKTIF</span>
          <span className="text-base font-bold font-mono text-stone-900 tabular-nums">
            {formatRupiahShort(totalValue)}
          </span>
          <span className="text-[11px] text-stone-500 ml-1">
            ({activeDealsCount} transaksi)
          </span>
        </div>
        <div className="border-l border-stone-100 pl-3">
          <span className="text-[10px] text-stone-400 block font-mono">CLOSING TERWUJUD</span>
          <span className="text-base font-bold font-mono text-emerald-700 tabular-nums">
            {formatRupiahShort(totalClosed)}
          </span>
          <span className="text-[11px] text-stone-500 ml-1">
            ({closedDealsCount} transaksi)
          </span>
        </div>
      </div>

      {/* Stage Filter Switcher for Mobile Rapid View */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl overflow-x-auto text-xs border border-stone-200">
        <button
          onClick={() => setActiveFilterStage('all')}
          className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeFilterStage === 'all'
              ? 'bg-white text-emerald-900 shadow-2xs font-semibold border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Semua ({deals.length})
        </button>
        {STAGES.map((st) => (
          <button
            key={st.id}
            onClick={() => setActiveFilterStage(st.id)}
            className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
              activeFilterStage === st.id
                ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {st.label} ({dealsByStage[st.id]?.length || 0})
          </button>
        ))}
      </div>

      {/* Kanban Board Columns */}
      <div className="space-y-5">
        {displayedStages.map((stageConfig) => {
          const stageDeals = dealsByStage[stageConfig.id] || [];
          const stageTotal = stageTotals[stageConfig.id] || 0;

          return (
            <div key={stageConfig.id} className="space-y-2.5">
              {/* Stage Header */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-slate-900 uppercase font-mono tracking-wide">
                    {stageConfig.label}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 font-semibold bg-slate-200/80 px-2 py-0.5 rounded-full">
                    {stageDeals.length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-700 tabular-nums">
                    {formatRupiahShort(stageTotal)}
                  </span>
                  <button
                    onClick={() => onOpenAddModal(stageConfig.id)}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-800 hover:bg-slate-200/60"
                    title="Tambah transaksi ke tahapan ini"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Cards in this stage */}
              {stageDeals.length === 0 ? (
                <div className="p-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                  Belum ada transaksi di tahapan {stageConfig.label}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stageDeals.map((deal) => {
                    const client = clientsMap.get(deal.clientId);
                    const prop = propertiesMap.get(deal.propertyId);

                    return (
                      <div
                        key={deal.id}
                        className="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow space-y-2.5"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-slate-900 text-xs">{deal.title}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Klien: <strong className="text-slate-700">{deal.clientName}</strong>
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              Properti: {deal.propertyTitle}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => onOpenEditModal(deal)}
                              className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                              title="Edit Deal"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteDeal(deal.id)}
                              className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                              title="Hapus"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Value & Commission Strip */}
                        <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs font-mono">
                          <div>
                            <span className="text-[10px] text-slate-400 block">NILAI DEAL</span>
                            <span className="font-bold text-slate-900">
                              {formatRupiahShort(deal.dealValue)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">EST. KOMISI</span>
                            <span className="font-bold text-amber-700">
                              {formatRupiahShort(deal.estimatedCommission)}
                            </span>
                          </div>
                          {deal.bookingFeeAmount ? (
                            <div className="text-right border-l border-slate-200 pl-2">
                              <span className="text-[10px] text-slate-400 block">TANDA JADI</span>
                              <span className="font-bold text-indigo-700">
                                {formatRupiahShort(deal.bookingFeeAmount)}
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {/* Target Closing & Probability */}
                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Target Akad: {deal.targetClosingDate}</span>
                          </span>
                          <span className="font-mono text-slate-700 font-medium">
                            {deal.probabilityPercent}% Peluang
                          </span>
                        </div>

                        {deal.notes && (
                          <p className="text-[11px] text-slate-500 bg-amber-50/50 p-2 rounded-lg italic">
                            "{deal.notes}"
                          </p>
                        )}

                        {/* Stage Transition & Quick Action Buttons */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                          <div className="flex items-center gap-1">
                            {STAGE_ORDER.indexOf(deal.stage) > 0 && (
                              <button
                                onClick={() => handleRegress(deal)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs flex items-center transition-colors"
                                title="Kembali ke tahapan sebelumnya"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {STAGE_ORDER.indexOf(deal.stage) < STAGE_ORDER.length - 1 && (
                              <button
                                onClick={() => handleAdvance(deal)}
                                className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors active:scale-95 shadow-2xs"
                              >
                                <span>Maju Tahap</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {client && (
                              <button
                                onClick={() => onOpenWhatsApp(client, prop)}
                                className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                                title="Kirim WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <a
                              href={`tel:${deal.clientPhone}`}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                              title="Telepon"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PipelineView = React.memo(PipelineViewComponent);
export default PipelineView;
