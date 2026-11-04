import React, { useState } from 'react';
import { X, TrendingUp, Save } from 'lucide-react';
import { Deal, PipelineStage, Client, Property } from '../types/crm';
import { formatRupiahShort } from '../utils/formatters';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dealData: Omit<Deal, 'id' | 'lastActivityDate'>, existingId?: string) => void;
  clients: Client[];
  properties: Property[];
  initialDeal?: Deal | null;
  defaultStage?: PipelineStage;
}

const STAGES: { id: PipelineStage; label: string }[] = [
  { id: 'new_lead', label: '1. Prospek Baru' },
  { id: 'site_visit', label: '2. Survey Lokasi' },
  { id: 'negotiation', label: '3. Negosiasi' },
  { id: 'booking_fee', label: '4. Tanda Jadi' },
  { id: 'closed_won', label: '5. Akad / Closing' },
];

export const DealModal: React.FC<DealModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  properties,
  initialDeal,
  defaultStage = 'new_lead',
}) => {
  if (!isOpen) return null;

  const [clientId, setClientId] = useState(
    initialDeal?.clientId || clients[0]?.id || ''
  );
  const [propertyId, setPropertyId] = useState(
    initialDeal?.propertyId || properties[0]?.id || ''
  );
  const [stage, setStage] = useState<PipelineStage>(
    initialDeal?.stage || defaultStage
  );
  // Zero-state rule: fallback to 0 instead of hardcoded 5 Miliar
  const [dealValue, setDealValue] = useState<number>(
    initialDeal?.dealValue || properties[0]?.price || 0
  );
  const [commissionRate, setCommissionRate] = useState<number>(
    properties.find((p) => p.id === (initialDeal?.propertyId || properties[0]?.id))?.commissionRate || 2.5
  );
  const [probabilityPercent, setProbabilityPercent] = useState<number>(
    initialDeal?.probabilityPercent || 25
  );
  const [bookingFeeAmount, setBookingFeeAmount] = useState<number>(
    initialDeal?.bookingFeeAmount || 0
  );
  const [paymentMethod, setPaymentMethod] = useState<'KPR Bank' | 'Cash Keras' | 'Cash Bertahap'>(
    initialDeal?.paymentMethod || 'KPR Bank'
  );
  const [targetClosingDate, setTargetClosingDate] = useState(
    initialDeal?.targetClosingDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState(initialDeal?.notes || '');

  const selectedClient = clients.find((c) => c.id === clientId) || clients[0];
  const selectedProp = properties.find((p) => p.id === propertyId) || properties[0];

  const estimatedCommission = Math.round(dealValue * (commissionRate / 100));

  const handlePropertyChange = (newPropId: string) => {
    setPropertyId(newPropId);
    const p = properties.find((item) => item.id === newPropId);
    if (p) {
      setDealValue(p.price);
      setCommissionRate(p.commissionRate || 2.5);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedProp) return;

    const dealTitle = `${selectedClient.name} - ${selectedProp.neighborhood || selectedProp.title}`;

    onSave(
      {
        title: initialDeal?.title || dealTitle,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientPhone: selectedClient.phone,
        propertyId: selectedProp.id,
        propertyTitle: selectedProp.title,
        propertyPrice: selectedProp.price,
        stage,
        dealValue: Number(dealValue),
        estimatedCommission,
        probabilityPercent: Number(probabilityPercent),
        bookingFeeAmount: Number(bookingFeeAmount),
        paymentMethod,
        targetClosingDate,
        notes: notes.trim(),
      },
      initialDeal?.id
    );
    onClose();
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
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {initialDeal ? 'Edit Transaksi Deal' : 'Tambah Deal ke Pipeline'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {clients.length === 0 || properties.length === 0 ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Belum Ada Data Terkait</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Untuk mencatat deal di pipeline, Anda membutuhkan minimal 1 Kontak Klien dan 1 Listing Properti.
              </p>
            </div>
            <button
              onClick={onClose}
              className="py-2 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors"
            >
              Tutup & Tambah Data
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
            {/* Stage Selector */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Tahapan Pipeline</label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1 p-1 bg-stone-100 rounded-xl">
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStage(s.id)}
                    className={`py-1.5 px-1 text-[11px] font-medium text-center truncate rounded-lg transition-all ${
                      stage === s.id
                        ? 'bg-emerald-700 text-white font-bold shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {s.label.split('. ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Client & Property Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Pilih Klien *</label>
                <select
                  required
                  value={clientId || selectedClient?.id || ''}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.segment})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Pilih Unit Properti *</label>
                <select
                  required
                  value={propertyId || selectedProp?.id || ''}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} ({formatRupiahShort(p.price)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Deal Value & Commission */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-medium text-slate-700">Nilai Transaksi (Rp)</label>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {dealValue > 0 ? formatRupiahShort(dealValue) : 'Rp 0'}
                  </span>
                </div>
                <input
                  type="number"
                  required
                  step="10000000"
                  min="0"
                  value={dealValue === 0 ? '' : dealValue}
                  onChange={(e) => setDealValue(Number(e.target.value) || 0)}
                  placeholder="0 (Rp)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-medium text-slate-700">Persentase Komisi</label>
                  <span className="text-emerald-700 font-mono text-[11px] font-semibold">
                    {estimatedCommission > 0 ? formatRupiahShort(estimatedCommission) : 'Rp 0'}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Metode Pembayaran Deal</label>
              <div className="grid grid-cols-3 gap-2">
                {(['KPR Bank', 'Cash Keras', 'Cash Bertahap'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 text-center rounded-xl text-xs font-semibold border transition-all ${
                      paymentMethod === method
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Probability & Booking Fee */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Peluang Closing ({probabilityPercent}%)</label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={probabilityPercent}
                  onChange={(e) => setProbabilityPercent(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tanda Jadi / UTJ (Rp)</label>
                <input
                  type="number"
                  step="5000000"
                  min="0"
                  value={bookingFeeAmount === 0 ? '' : bookingFeeAmount}
                  onChange={(e) => setBookingFeeAmount(Number(e.target.value) || 0)}
                  placeholder="0 (Rp)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Target Closing Date */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Target Tanggal Akad / Closing</label>
              <input
                type="date"
                value={targetClosingDate}
                onChange={(e) => setTargetClosingDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">Catatan Kesepakatan & Syarat Khusus</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Menunggu approval KPR bank, syarat semi-furnished tetap ada..."
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
                <span>{initialDeal ? 'Simpan Deal' : 'Tambahkan ke Pipeline'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DealModal;
