import React, { useState } from 'react';
import { X, Send, Copy, Check, MessageSquare, Sparkles } from 'lucide-react';
import { Client, Property } from '../types/crm';
import { formatRupiahShort } from '../utils/formatters';

interface QuickWhatsAppModalProps {
  client: Client;
  property?: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickWhatsAppModal: React.FC<QuickWhatsAppModalProps> = ({
  client,
  property,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const defaultTemplates = [
    {
      id: 'tour_followup',
      title: 'Follow-Up Pasca Survey',
      text: `Halo ${client.name}, terima kasih banyak sudah meluangkan waktu untuk survey unit ${property ? property.title : 'properti'} bersama saya hari ini. Bagaimana kesan Bapak/Ibu dan keluarga mengenai tata ruang dan lingkungannya? Jika berkenan, saya siap membantu untuk proses pengajuan surat penawaran harga atau jadwalkan survey lanjutan.`,
    },
    {
      id: 'new_match',
      title: 'Listing Baru Yang Pas',
      text: `Halo ${client.name}! Baru saja masuk unit baru tipe ${property ? property.propertyType : 'properti'} di area ${property ? property.neighborhood : client.preferredLocations[0] || 'lokasi idaman'}${property ? ` dengan harga ${formatRupiahShort(property.price)}` : ''}. Sangat cocok dengan kriteria dan budget Bapak/Ibu. Apakah ada waktu luang minggu ini untuk kita jadwalkan survey unit?`,
    },
    {
      id: 'negotiation_update',
      title: 'Update Negosiasi Harga',
      text: `Halo ${client.name}, saya baru saja selesai berdiskusi dengan pihak pemilik ${property ? property.title : 'unit properti'}. Pihak penjual menyambut positif penawaran kita dan bersedia bernegosiasi untuk mencapai titik temu. Saya akan segera kabari draf kesepakatan resminya ya Pak/Bu.`,
    },
    {
      id: 'general_checkin',
      title: 'Sapaan & Update Listing',
      text: `Selamat siang ${client.name}, semoga kabarnya sehat selalu. Kebetulan minggu ini ada beberapa listing off-market menarik di area ${client.preferredLocations.join(', ') || 'kawasan premium'}. Apakah ada waktu 5 menit untuk diskusi singkat melalui telepon?`,
    },
  ];

  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [customMessage, setCustomMessage] = useState(defaultTemplates[0].text);
  const [copied, setCopied] = useState(false);

  const handleSelectTemplate = (idx: number) => {
    setSelectedTemplateIndex(idx);
    setCustomMessage(defaultTemplates[idx].text);
  };

  const digitsOnly = client.phone.replace(/[^0-9]/g, '');
  const cleanPhone = digitsOnly.startsWith('0') ? '62' + digitsOnly.slice(1) : digitsOnly;

  const handleSendWhatsApp = () => {
    const encoded = encodeURIComponent(customMessage);
    const waUrl = `https://wa.me/${cleanPhone}?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    onClose();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200/80 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Pesan WhatsApp Langsung</h3>
              <p className="text-xs text-slate-500">Kepada {client.name} · {client.phone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Quick Real Estate Templates */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Pilih Template Pesan Properti</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {defaultTemplates.map((t, idx) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTemplate(idx)}
                  className={`p-2.5 rounded-xl text-left border text-xs transition-all ${
                    selectedTemplateIndex === idx
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-medium shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <p className="truncate font-semibold">{t.title}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{t.text}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Editable Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700">Draf Pesan WhatsApp</label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin Pesan'}</span>
              </button>
            </div>
            <textarea
              rows={5}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
              placeholder="Tulis pesan personalisasi untuk klien..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="flex-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Kirim ke WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickWhatsAppModal;
