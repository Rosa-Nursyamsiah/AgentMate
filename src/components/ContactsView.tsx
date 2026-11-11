import React, { useState, useMemo } from 'react';
import { 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  MessageSquare, 
  MapPin, 
  Building, 
  Edit2, 
  Trash2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Client, ClientSegment, Property } from '../types/crm';
import { formatRupiahShort } from '../utils/formatters';

interface ContactsViewProps {
  clients: Client[];
  properties: Property[];
  onOpenAddModal: () => void;
  onOpenEditModal: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onOpenWhatsApp: (client: Client, property?: Property) => void;
}

const SEGMENT_BADGES: Record<ClientSegment, string> = {
  buyer: 'Pembeli',
  tenant: 'Penyewa',
  seller: 'Penjual',
  landlord: 'Pemilik Sewa',
};

const ContactsViewComponent: React.FC<ContactsViewProps> = ({
  clients,
  properties,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteClient,
  onOpenWhatsApp,
}) => {
  const [activeSegment, setActiveSegment] = useState<'all' | ClientSegment>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [matchingClient, setMatchingClient] = useState<Client | null>(null);

  // Normalize search query
  const normalizedSearch = useMemo(() => searchQuery.trim().toLowerCase(), [searchQuery]);

  // Memoized segment counts
  const segmentCounts = useMemo(() => {
    const counts = { all: clients.length, buyer: 0, tenant: 0, seller: 0, landlord: 0 };
    for (const c of clients) {
      if (counts[c.segment] !== undefined) {
        counts[c.segment]++;
      }
    }
    return counts;
  }, [clients]);

  // Memoized filter clients
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSegment = activeSegment === 'all' || c.segment === activeSegment;
      if (!matchesSegment) return false;
      if (!normalizedSearch) return true;

      const locations = c.preferredLocations || [];
      const types = c.preferredTypes || [];

      return (
        c.name.toLowerCase().includes(normalizedSearch) ||
        c.phone.includes(normalizedSearch) ||
        locations.some((loc) => loc.toLowerCase().includes(normalizedSearch)) ||
        types.some((t) => t.toLowerCase().includes(normalizedSearch))
      );
    });
  }, [clients, activeSegment, normalizedSearch]);

  // Precompute matching properties for filtered clients (avoids O(N*M) on every render)
  const clientMatchMap = useMemo(() => {
    const map = new Map<string, Property[]>();
    for (const client of filteredClients) {
      if (client.segment !== 'buyer' && client.segment !== 'tenant') {
        map.set(client.id, []);
        continue;
      }
      const preferredTypesSet = new Set(client.preferredTypes || []);
      const minPrice = (client.budgetMin || 0) * 0.85;
      const maxPrice = (client.budgetMax || 0) * 1.15;
      const hasTypeFilter = preferredTypesSet.size > 0;

      const matching = properties.filter((p) => {
        const withinBudget = p.price >= minPrice && (maxPrice > 0 ? p.price <= maxPrice : true);
        if (!withinBudget) return false;
        return !hasTypeFilter || preferredTypesSet.has(p.propertyType);
      });
      map.set(client.id, matching);
    }
    return map;
  }, [filteredClients, properties]);

  // Memoized matches for the selected client in drawer
  const matchingPropertiesForDrawer = useMemo(() => {
    if (!matchingClient) return [];
    const fromMap = clientMatchMap.get(matchingClient.id);
    if (fromMap) return fromMap;

    const preferredTypesSet = new Set(matchingClient.preferredTypes || []);
    const minPrice = (matchingClient.budgetMin || 0) * 0.85;
    const maxPrice = (matchingClient.budgetMax || 0) * 1.15;
    const hasTypeFilter = preferredTypesSet.size > 0;

    return properties.filter((p) => {
      const withinBudget = p.price >= minPrice && (maxPrice > 0 ? p.price <= maxPrice : true);
      if (!withinBudget) return false;
      return !hasTypeFilter || preferredTypesSet.has(p.propertyType);
    });
  }, [matchingClient, clientMatchMap, properties]);

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header & Search */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Direktori Klien</h2>
          <p className="text-xs text-slate-500">Segmentasi prospek pembeli & pemilik properti</p>
        </div>
        <button
          onClick={onOpenAddModal}
          className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Tambah Klien</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama klien, nomor WhatsApp, atau lokasi..."
          className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 shadow-2xs"
        />
      </div>

      {/* Segment Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl overflow-x-auto text-xs border border-stone-200">
        <button
          onClick={() => setActiveSegment('all')}
          className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeSegment === 'all'
              ? 'bg-white text-emerald-900 shadow-2xs font-semibold border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Semua ({segmentCounts.all})
        </button>
        <button
          onClick={() => setActiveSegment('buyer')}
          className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeSegment === 'buyer'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pembeli ({segmentCounts.buyer})
        </button>
        <button
          onClick={() => setActiveSegment('tenant')}
          className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeSegment === 'tenant'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Penyewa ({segmentCounts.tenant})
        </button>
        <button
          onClick={() => setActiveSegment('seller')}
          className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeSegment === 'seller'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Penjual ({segmentCounts.seller})
        </button>
        <button
          onClick={() => setActiveSegment('landlord')}
          className={`py-1.5 px-3 rounded-lg font-medium whitespace-nowrap transition-colors ${
            activeSegment === 'landlord'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pemilik Sewa ({segmentCounts.landlord})
        </button>
      </div>

      {/* Client List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClients.length === 0 ? (
          <div className="col-span-full p-8 text-center bg-white border border-slate-200 rounded-2xl">
            <p className="text-xs text-slate-500">Tidak ada kontak yang cocok dengan pencarian.</p>
          </div>
        ) : (
          filteredClients.map((client) => {
            const matches = clientMatchMap.get(client.id) || [];
            return (
              <div
                key={client.id}
                className="p-4 bg-white border border-stone-200/90 rounded-2xl shadow-2xs hover:shadow-xs hover:border-emerald-300 transition-all space-y-3 flex flex-col justify-between"
              >
                {/* Client Header Info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{client.name}</h3>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                        {SEGMENT_BADGES[client.segment]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                      <span>{client.phone}</span>
                      {client.email && (
                        <>
                          <span>·</span>
                          <span className="truncate max-w-[140px]">{client.email}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Edit & Delete actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenEditModal(client)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title="Edit Profil Klien"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteClient(client.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Preference Specs */}
                <div className="p-2.5 bg-slate-50 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      {client.segment === 'tenant' ? 'Budget Sewa Bulanan' : 'Budget Pembelian'}:
                    </span>
                    <span className="font-mono text-slate-900 font-semibold tabular-nums text-[11px]">
                      {formatRupiahShort(client.budgetMin)} – {formatRupiahShort(client.budgetMax)}
                    </span>
                  </div>

                  <div className="flex items-start gap-1 text-[11px] text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">
                      {client.preferredLocations.join(', ') || 'Lokasi bebas'}
                    </span>
                  </div>

                  <div className="flex items-start gap-1 text-[11px] text-slate-600">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="truncate">
                      {client.preferredTypes.join(', ') || 'Semua tipe properti'}
                    </span>
                  </div>

                  {client.notes && (
                    <p className="text-[11px] text-slate-500 italic border-t border-slate-200/60 pt-1.5 mt-1.5">
                      "{client.notes}"
                    </p>
                  )}
                </div>

                {/* Match Finder Bar */}
                {matches.length > 0 && (
                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setMatchingClient(client)}
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>{matches.length} Listing Pas Dengan Kriteria Klien</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Direct 1-Tap Action Buttons (WhatsApp / Call / Email) */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100">
                  <button
                    onClick={() => onOpenWhatsApp(client)}
                    className="py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-1.5 border border-emerald-200/80 transition-colors active:scale-95"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    <span>WhatsApp</span>
                  </button>

                  <a
                    href={`tel:${client.phone}`}
                    className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-700" />
                    <span>Telepon</span>
                  </a>

                  <a
                    href={`mailto:${client.email || ''}`}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95 ${
                      client.email
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        : 'bg-slate-50 text-slate-400 pointer-events-none'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Matching Inventory Modal Drawer */}
      {matchingClient && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">Listing Cocok Tersedia</h3>
                  <p className="text-[11px] text-slate-500">Untuk {matchingClient.name}</p>
                </div>
              </div>
              <button
                onClick={() => setMatchingClient(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3">
              {matchingPropertiesForDrawer.map((prop) => (
                <div
                  key={prop.id}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{prop.title}</p>
                    <p className="text-[11px] text-slate-500 truncate">{prop.neighborhood} · {prop.propertyType}</p>
                    <p className="text-xs font-mono font-semibold text-amber-700 mt-1">
                      {formatRupiahShort(prop.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onOpenWhatsApp(matchingClient, prop);
                      setMatchingClient(null);
                    }}
                    className="py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shrink-0 shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Kirim Penawaran</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ContactsView = React.memo(ContactsViewComponent);
export default ContactsView;
