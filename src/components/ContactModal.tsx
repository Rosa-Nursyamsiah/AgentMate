import React, { useState } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { Client, ClientSegment, PropertyType } from '../types/crm';
import { formatRupiahShort } from '../utils/formatters';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id' | 'createdAt'>, existingId?: string) => void;
  initialClient?: Client | null;
}

const AVAILABLE_TYPES: PropertyType[] = [
  'Rumah Tapak / Cluster',
  'Apartemen / Kondominium',
  'Ruko / Komersial',
  'Villa Tropis',
  'Tanah / Kavling',
  'Gudang / Industri'
];

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialClient,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(initialClient?.name || '');
  const [phone, setPhone] = useState(initialClient?.phone || '');
  const [email, setEmail] = useState(initialClient?.email || '');
  const [segment, setSegment] = useState<ClientSegment>(initialClient?.segment || 'buyer');
  const [status, setStatus] = useState<'active' | 'nurturing' | 'inactive'>(initialClient?.status || 'active');
  // Zero-state rule: starts at 0 if no initial client
  const [budgetMin, setBudgetMin] = useState<number>(initialClient?.budgetMin || 0);
  const [budgetMax, setBudgetMax] = useState<number>(initialClient?.budgetMax || 0);
  const [paymentPreference, setPaymentPreference] = useState<'KPR Bank' | 'Cash Keras' | 'Cash Bertahap'>(
    initialClient?.paymentPreference || 'KPR Bank'
  );
  const [locationsInput, setLocationsInput] = useState<string>(
    initialClient?.preferredLocations.join(', ') || ''
  );
  const [selectedTypes, setSelectedTypes] = useState<PropertyType[]>(
    initialClient?.preferredTypes || ['Rumah Tapak / Cluster']
  );
  const [source, setSource] = useState<Client['source']>(initialClient?.source || 'WhatsApp');
  const [notes, setNotes] = useState(initialClient?.notes || '');

  const toggleType = (t: PropertyType) => {
    if (selectedTypes.includes(t)) {
      setSelectedTypes(selectedTypes.filter((item) => item !== t));
    } else {
      setSelectedTypes([...selectedTypes, t]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const preferredLocations = locationsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    onSave(
      {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        segment,
        status,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        paymentPreference,
        preferredLocations: preferredLocations.length > 0 ? preferredLocations : ['Jakarta'],
        preferredTypes: selectedTypes.length > 0 ? selectedTypes : ['Rumah Tapak / Cluster'],
        source,
        notes: notes.trim(),
        lastContactedAt: new Date().toISOString().split('T')[0],
      },
      initialClient?.id
    );
    onClose();
  };

  const getSegmentLabel = (seg: ClientSegment) => {
    switch (seg) {
      case 'buyer':
        return 'Pembeli';
      case 'tenant':
        return 'Penyewa';
      case 'seller':
        return 'Penjual';
      case 'landlord':
        return 'Pemilik Sewa';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200/80 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {initialClient ? 'Edit Profil Klien' : 'Tambah Kontak / Prospek Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Segment Selector */}
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">Kategori / Segmen Klien</label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-100 rounded-xl">
              {(['buyer', 'tenant', 'seller', 'landlord'] as ClientSegment[]).map((seg) => (
                <button
                  key={seg}
                  type="button"
                  onClick={() => setSegment(seg)}
                  className={`py-2 text-[11px] font-medium rounded-lg transition-all ${
                    segment === seg
                      ? 'bg-emerald-700 text-white shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {getSegmentLabel(seg)}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Bapak Alexander Wiratama"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nomor WhatsApp / HP *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+6281298765432"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Email & Lead Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Alamat Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="klien@perusahaan.co.id"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Sumber Prospek (Lead Source)</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value as Client['source'])}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                <option value="WhatsApp">Pesan Masuk WhatsApp</option>
                <option value="Instagram">Iklan Instagram / Media Sosial</option>
                <option value="Referral">Rekomendasi / Teman (Referral)</option>
                <option value="Walk-in">Walk-in / Open House</option>
                <option value="Portal Properti">Portal Properti (Rumah123/OLX/Lamudi)</option>
                <option value="Spanduk / Banner">Spanduk / Banner Lapangan</option>
              </select>
            </div>
          </div>

          {/* Budget Range & Payment Method */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-medium text-slate-700">
                {segment === 'tenant' ? 'Rentang Budget Sewa Bulanan (Rp)' : 'Rentang Budget Beli (Rp)'}
              </label>
              <span className="text-slate-500 font-mono text-[11px] tabular-nums">
                {budgetMin > 0 || budgetMax > 0
                  ? `${formatRupiahShort(budgetMin)} – ${formatRupiahShort(budgetMax)}`
                  : 'Rp 0'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="number"
                  step="10000000"
                  min="0"
                  value={budgetMin === 0 ? '' : budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value) || 0)}
                  placeholder="Budget Min (0)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="10000000"
                  min="0"
                  value={budgetMax === 0 ? '' : budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value) || 0)}
                  placeholder="Budget Max (0)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Preference */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Preferensi Metode Pembayaran Klien</label>
            <div className="grid grid-cols-3 gap-2">
              {(['KPR Bank', 'Cash Keras', 'Cash Bertahap'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentPreference(method)}
                  className={`py-2 text-center rounded-xl text-xs font-semibold border transition-all ${
                    paymentPreference === method
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Locations */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Wilayah / Kawasan Pilihan (pisahkan dengan koma)</label>
            <input
              type="text"
              value={locationsInput}
              onChange={(e) => setLocationsInput(e.target.value)}
              placeholder="Contoh: BSD City, Gading Serpong, SCBD"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Property Types Interested */}
          <div>
            <label className="block font-medium text-slate-700 mb-1.5">Tipe Properti Yang Diminati</label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TYPES.map((type) => {
                const isSelected = selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleType(type)}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors ${
                      isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Specific Agent Notes */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Catatan Kriteria Khusus & Finansial</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Kebutuhan khusus, kondisi KPR bank, waktu pindah..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-700 font-medium hover:bg-stone-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{initialClient ? 'Simpan Perubahan' : 'Buat Kontak Baru'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
