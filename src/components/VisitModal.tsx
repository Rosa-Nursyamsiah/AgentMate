import React, { useState } from 'react';
import { X, CalendarCheck, Star, Save } from 'lucide-react';
import { SiteVisit, Client, Property } from '../types/crm';

interface VisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (visitData: Omit<SiteVisit, 'id'>, existingId?: string) => void;
  clients: Client[];
  properties: Property[];
  initialVisit?: SiteVisit | null;
  defaultClientId?: string;
  defaultPropertyId?: string;
}

const QUICK_TAGS = [
  'Siap Ajukan Penawaran',
  'Minat Sangat Tinggi',
  'Persetujuan Pasangan',
  'Pertimbangan Renovasi',
  'Suka Tata Ruang',
  'Negosiasi Harga',
  'Perlu Survey Kedua'
];

export const VisitModal: React.FC<VisitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  properties,
  initialVisit,
  defaultClientId,
  defaultPropertyId,
}) => {
  if (!isOpen) return null;

  const [clientId, setClientId] = useState(
    initialVisit?.clientId || defaultClientId || clients[0]?.id || ''
  );
  const [propertyId, setPropertyId] = useState(
    initialVisit?.propertyId || defaultPropertyId || properties[0]?.id || ''
  );
  const [visitDate, setVisitDate] = useState(
    initialVisit?.visitDate || new Date().toISOString().slice(0, 16)
  );
  const [status, setStatus] = useState<SiteVisit['status']>(initialVisit?.status || 'completed');
  const [interestScore, setInterestScore] = useState<1 | 2 | 3 | 4 | 5>(
    initialVisit?.interestScore || 4
  );
  const [feedback, setFeedback] = useState(initialVisit?.feedback || '');
  const [agreedNextStep, setAgreedNextStep] = useState(initialVisit?.agreedNextStep || '');
  const [nextFollowUpDate, setNextFollowUpDate] = useState(
    initialVisit?.nextFollowUpDate ||
      new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialVisit?.tags || ['Siap Ajukan Penawaran']
  );

  const toggleTag = (t: string) => {
    if (selectedTags.includes(t)) {
      setSelectedTags(selectedTags.filter((tag) => tag !== t));
    } else {
      setSelectedTags([...selectedTags, t]);
    }
  };

  const selectedClient = clients.find((c) => c.id === clientId) || clients[0];
  const selectedProp = properties.find((p) => p.id === propertyId) || properties[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient || !selectedProp) return;

    onSave(
      {
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientPhone: selectedClient.phone,
        propertyId: selectedProp.id,
        propertyTitle: selectedProp.title,
        visitDate,
        status,
        interestScore,
        feedback: feedback.trim() || 'Survey lokasi berjalan lancar. Klien telah melihat seluruh sudut ruangan unit.',
        agreedNextStep: agreedNextStep.trim() || 'Follow up draf surat penawaran harga dan legalitas unit.',
        nextFollowUpDate,
        tags: selectedTags,
      },
      initialVisit?.id
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
              <CalendarCheck className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {initialVisit ? 'Edit Catatan Survey' : 'Catat Hasil Survey Lapangan'}
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
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Belum Ada Kontak atau Listing</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Untuk mencatat hasil survey lokasi, Anda memerlukan minimal 1 Kontak Klien dan 1 Listing Properti.
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
            {/* Client & Property Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Klien Yang Berkunjung *</label>
                <select
                  required
                  value={clientId || selectedClient?.id || ''}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.segment})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Unit Properti Yang Ditinjau *</label>
                <select
                  required
                  value={propertyId || selectedProp?.id || ''}
                  onChange={(e) => setPropertyId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date & Visit Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Waktu Kunjungan Survey</label>
                <input
                  type="datetime-local"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Status Survey</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as SiteVisit['status'])}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="completed">Survey Selesai</option>
                  <option value="scheduled">Jadwal Mendatang</option>
                  <option value="rescheduled">Dijadwal Ulang</option>
                  <option value="cancelled">Dibatalkan</option>
                </select>
              </div>
            </div>

            {/* Client Interest Score (1-5 Stars) */}
            <div className="p-3 bg-[#FDFBF7] border border-stone-200 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <label className="font-semibold text-slate-800">Tingkat Ketertarikan Klien</label>
                <span className="font-mono text-emerald-700 font-bold">
                  {interestScore} dari 5 Bintang
                </span>
              </div>
              <div className="flex items-center gap-2">
                {([1, 2, 3, 4, 5] as const).map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setInterestScore(star)}
                    className="p-1 rounded-lg hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= interestScore
                          ? 'text-amber-500 fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-slate-500 text-[11px] ml-2">
                  {interestScore === 5 && '🔥 Sangat suka, siap booking'}
                  {interestScore === 4 && '✨ Minat tinggi & antusias'}
                  {interestScore === 3 && '⚖️ Sedang membandingkan'}
                  {interestScore === 2 && '❄️ Ada keraguan'}
                  {interestScore === 1 && '❌ Tidak sesuai kriteria'}
                </span>
              </div>
            </div>

            {/* Quick Reaction Tags */}
            <div>
              <label className="block font-medium text-slate-700 mb-1.5">Tag Respon Cepat</label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors ${
                        isSelected
                          ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Feedback & Client Reaction */}
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Tanggapan Klien, Keberatan, atau Poin Favorit *
              </label>
              <textarea
                rows={2}
                required
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Contoh: Sangat suka tata ruang dan taman belakang; menanyakan kelengkapan sertifikat..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none"
              />
            </div>

            {/* Agreed Next Step & Reminder Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Langkah Berikut Yang Disepakati</label>
                <input
                  type="text"
                  value={agreedNextStep}
                  onChange={(e) => setAgreedNextStep(e.target.value)}
                  placeholder="Contoh: Kirim draf SPH penawaran malam ini"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tanggal Follow-Up Berikutnya</label>
                <input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
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
                <span>{initialVisit ? 'Simpan Perubahan' : 'Simpan Catatan Survey'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default VisitModal;
