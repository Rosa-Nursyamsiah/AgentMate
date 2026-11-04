import React, { useState, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  Share2, 
  Users, 
  Edit2, 
  Trash2,
  Check,
  MessageSquare
} from 'lucide-react';
import { Property, PropertyStatus, Client } from '../types/crm';
import { PropertyImage } from './PropertyImage';
import { formatRupiahShort, formatRupiahFull } from '../utils/formatters';

interface InventoryViewProps {
  properties: Property[];
  clients: Client[];
  onOpenAddModal: () => void;
  onOpenEditModal: (property: Property) => void;
  onDeleteProperty: (id: string) => void;
  onOpenWhatsApp: (client: Client, property?: Property) => void;
}

const STATUS_LABELS: Record<PropertyStatus, string> = {
  available: 'Tersedia',
  under_offer: 'Dalam Penawaran',
  sold: 'Terjual',
  rented: 'Tersewa',
};

const InventoryViewComponent: React.FC<InventoryViewProps> = ({
  properties,
  clients,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteProperty,
  onOpenWhatsApp,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | PropertyStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPropertyForBuyers, setSelectedPropertyForBuyers] = useState<Property | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

  // Normalize search query
  const normalizedSearch = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  // Memoized status counts
  const statusCounts = useMemo(() => {
    const counts = { all: properties.length, available: 0, under_offer: 0, sold: 0, rented: 0 };
    for (const p of properties) {
      if (counts[p.status] !== undefined) {
        counts[p.status]++;
      }
    }
    return counts;
  }, [properties]);

  // Memoized filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      if (!matchesStatus) return false;
      if (!normalizedSearch) return true;

      return (
        p.title.toLowerCase().includes(normalizedSearch) ||
        (p.address || '').toLowerCase().includes(normalizedSearch) ||
        (p.neighborhood || '').toLowerCase().includes(normalizedSearch) ||
        (p.propertyType || '').toLowerCase().includes(normalizedSearch)
      );
    });
  }, [properties, statusFilter, normalizedSearch]);

  // Precompute matching buyers for filtered properties
  const propertyMatchingBuyersMap = useMemo(() => {
    const map = new Map<string, Client[]>();
    const prospectiveClients = clients.filter(
      (c) => c.segment === 'buyer' || c.segment === 'tenant'
    );

    for (const prop of filteredProperties) {
      const matching = prospectiveClients.filter((c) => {
        const withinBudget =
          prop.price >= (c.budgetMin || 0) * 0.85 &&
          ((c.budgetMax || 0) > 0 ? prop.price <= c.budgetMax * 1.15 : true);
        if (!withinBudget) return false;
        return (
          !c.preferredTypes ||
          c.preferredTypes.length === 0 ||
          c.preferredTypes.includes(prop.propertyType)
        );
      });
      map.set(prop.id, matching);
    }
    return map;
  }, [filteredProperties, clients]);

  // Memoized matching buyers for drawer modal
  const drawerMatchingBuyers = useMemo(() => {
    if (!selectedPropertyForBuyers) return [];
    const fromMap = propertyMatchingBuyersMap.get(selectedPropertyForBuyers.id);
    if (fromMap) return fromMap;

    const prospectiveClients = clients.filter(
      (c) => c.segment === 'buyer' || c.segment === 'tenant'
    );
    return prospectiveClients.filter((c) => {
      const withinBudget =
        selectedPropertyForBuyers.price >= (c.budgetMin || 0) * 0.85 &&
        ((c.budgetMax || 0) > 0
          ? selectedPropertyForBuyers.price <= c.budgetMax * 1.15
          : true);
      if (!withinBudget) return false;
      return (
        !c.preferredTypes ||
        c.preferredTypes.length === 0 ||
        c.preferredTypes.includes(selectedPropertyForBuyers.propertyType)
      );
    });
  }, [selectedPropertyForBuyers, propertyMatchingBuyersMap, clients]);

  const handleShareFlyer = useCallback((prop: Property) => {
    const featuresText = (prop.features || []).slice(0, 4).join(', ');
    const flyerText = `🏛️ *DIJUAL: ${prop.title}*
📍 Lokasi: ${prop.address}, ${prop.neighborhood} (${prop.city})
💰 Harga: ${formatRupiahFull(prop.price)}
📜 Sertifikat: ${prop.certificateType || 'SHM'}
📐 Spesifikasi: ${prop.bedrooms} KT · ${prop.bathrooms} KM
🌱 Luas: LT ${prop.areaLandSqft || '-'} m² · LB ${prop.areaBuildingSqft || '-'} m²
✨ Fasilitas: ${featuresText || 'Siap Huni'}

Berminat survey unit fisik atau simulasi perhitungan KPR? Hubungi saya untuk jadwalkan waktu survey.`;

    navigator.clipboard.writeText(flyerText);
    setCopiedShareId(prop.id);
    setTimeout(() => setCopiedShareId(null), 2500);
  }, []);

  return (
    <div className="space-y-4 pb-20">
      {/* Header & Add Button */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Inventaris Listing</h2>
          <p className="text-xs text-slate-500">Katalog properti & unit aktif agen</p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Listing</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari listing berdasarkan judul, area, alamat..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 shadow-2xs"
        />
      </div>

      {/* Status Segment Filters */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl overflow-x-auto text-xs border border-stone-200">
        <button
          onClick={() => setStatusFilter('all')}
          className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'all'
              ? 'bg-white text-emerald-900 shadow-2xs font-semibold border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Semua ({statusCounts.all})
        </button>
        <button
          onClick={() => setStatusFilter('available')}
          className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'available'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Tersedia ({statusCounts.available})
        </button>
        <button
          onClick={() => setStatusFilter('under_offer')}
          className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'under_offer'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Dalam Penawaran ({statusCounts.under_offer})
        </button>
        <button
          onClick={() => setStatusFilter('sold')}
          className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
            statusFilter === 'sold'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Terjual ({statusCounts.sold})
        </button>
      </div>

      {/* Property Cards */}
      <div className="space-y-4">
        {filteredProperties.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
            <p className="text-xs text-slate-500">Tidak ada listing yang ditemukan.</p>
          </div>
        ) : (
          filteredProperties.map((prop) => {
            const matchingBuyers = propertyMatchingBuyersMap.get(prop.id) || [];
            const estCommission = Math.round(prop.price * (prop.commissionRate / 100));

            return (
              <div
                key={prop.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xs transition-shadow"
              >
                {/* Visual Architectural Banner */}
                <PropertyImage
                  type={prop.propertyType}
                  preset={prop.svgPreset}
                  imageUrl={prop.imageUrl}
                  title={prop.title}
                  className="h-40 w-full"
                />

                <div className="p-4 space-y-3">
                  {/* Price & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold font-mono text-slate-900 tabular-nums">
                          {formatRupiahShort(prop.price)}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          ({prop.commissionRate}% · {formatRupiahShort(estCommission)} komisi)
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5 leading-snug">
                        {prop.title}
                      </h3>
                      <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{prop.address}, {prop.neighborhood}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onOpenEditModal(prop)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Edit Listing"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteProperty(prop.id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Certificate & Specs Bar (KT, KM, LT, LB) */}
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-800 border border-amber-500/30 font-semibold text-[10px]">
                      {prop.certificateType ? prop.certificateType.split(' ')[0] : 'SHM'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[10px]">
                      {prop.propertyType}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-normal text-[10px]">
                      {STATUS_LABELS[prop.status] || prop.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 p-2 bg-slate-50 rounded-xl text-center text-xs text-slate-700 font-medium">
                    <div className="border-r border-slate-200/60 pr-1">
                      <span className="text-[10px] text-slate-400 block font-normal">K.Tidur</span>
                      <span className="font-bold text-slate-900">{prop.bedrooms} KT</span>
                    </div>
                    <div className="border-r border-slate-200/60 pr-1">
                      <span className="text-[10px] text-slate-400 block font-normal">K.Mandi</span>
                      <span className="font-bold text-slate-900">{prop.bathrooms} KM</span>
                    </div>
                    <div className="border-r border-slate-200/60 pr-1">
                      <span className="text-[10px] text-slate-400 block font-normal">LT (m²)</span>
                      <span className="font-bold text-slate-900">{prop.areaLandSqft || '-'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-normal">LB (m²)</span>
                      <span className="font-bold text-slate-900">{prop.areaBuildingSqft || '-'}</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1">
                    {(prop.features || []).slice(0, 4).map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                      >
                        {f}
                      </span>
                    ))}
                  </div>

                  {/* Actions Bar */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedPropertyForBuyers(prop)}
                      className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                    >
                      <Users className="w-3.5 h-3.5 text-amber-600" />
                      <span>{matchingBuyers.length} Calon Pembeli</span>
                    </button>

                    <button
                      onClick={() => handleShareFlyer(prop)}
                      className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                    >
                      {copiedShareId === prop.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Brosur Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Brosur WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Matching Buyers Drawer */}
      {selectedPropertyForBuyers && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Pembeli Potensial Cocok</h3>
                  <p className="text-[11px] text-slate-500">Untuk {selectedPropertyForBuyers.title}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPropertyForBuyers(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {drawerMatchingBuyers.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  Belum ada calon pembeli aktif dengan rentang budget untuk unit ini.
                </div>
              ) : (
                drawerMatchingBuyers.map((client) => (
                  <div
                    key={client.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900">{client.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Budget: {formatRupiahShort(client.budgetMin)} – {formatRupiahShort(client.budgetMax)}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        Pilihan Area: {client.preferredLocations.join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        onOpenWhatsApp(client, selectedPropertyForBuyers);
                        setSelectedPropertyForBuyers(null);
                      }}
                      className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0 shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Kirim WhatsApp</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const InventoryView = React.memo(InventoryViewComponent);
export default InventoryView;
