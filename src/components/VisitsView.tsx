import React, { useState, useMemo } from 'react';
import { 
  CalendarCheck, 
  Clock, 
  Star, 
  Plus, 
  MessageSquare, 
  Phone, 
  CheckCircle2, 
  Circle,
  Tag,
  Edit2,
  Trash2
} from 'lucide-react';
import { SiteVisit, FollowUpReminder, Client, Property } from '../types/crm';

interface VisitsViewProps {
  visits: SiteVisit[];
  reminders: FollowUpReminder[];
  clients: Client[];
  properties: Property[];
  onOpenAddVisitModal: () => void;
  onOpenEditVisitModal: (visit: SiteVisit) => void;
  onDeleteVisit: (id: string) => void;
  onToggleReminder: (reminderId: string) => void;
  onAddReminder: (reminder: Omit<FollowUpReminder, 'id' | 'completed'>) => void;
  onOpenWhatsApp: (client: Client, property?: Property) => void;
}

const VisitsViewComponent: React.FC<VisitsViewProps> = ({
  visits,
  reminders,
  clients,
  properties,
  onOpenAddVisitModal,
  onOpenEditVisitModal,
  onDeleteVisit,
  onToggleReminder,
  onAddReminder,
  onOpenWhatsApp,
}) => {
  const [subTab, setSubTab] = useState<'visits' | 'reminders'>('visits');
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [newReminderClientId, setNewReminderClientId] = useState(clients[0]?.id || '');
  const [newReminderDate, setNewReminderDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [newReminderNote, setNewReminderNote] = useState('');
  const [newReminderPriority, setNewReminderPriority] = useState<FollowUpReminder['priority']>('high');

  const clientsMap = useMemo(() => {
    return new Map<string, Client>(clients.map((c) => [c.id, c]));
  }, [clients]);

  const propertiesMap = useMemo(() => {
    return new Map<string, Property>(properties.map((p) => [p.id, p]));
  }, [properties]);

  const { pendingReminders, completedReminders } = useMemo(() => {
    const pending: FollowUpReminder[] = [];
    const completed: FollowUpReminder[] = [];
    for (const r of reminders) {
      if (r.completed) completed.push(r);
      else pending.push(r);
    }
    return { pendingReminders: pending, completedReminders: completed };
  }, [reminders]);

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveClientId = newReminderClientId || clients[0]?.id || '';
    const c = clientsMap.get(effectiveClientId);
    if (!c || !newReminderNote.trim()) return;

    onAddReminder({
      clientId: c.id,
      clientName: c.name,
      clientPhone: c.phone,
      dueDate: newReminderDate,
      priority: newReminderPriority,
      note: newReminderNote.trim(),
      type: 'whatsapp',
    });
    setNewReminderNote('');
    setIsAddingReminder(false);
  };

  const getStatusBadge = (status: SiteVisit['status']) => {
    switch (status) {
      case 'completed':
        return 'Selesai';
      case 'scheduled':
        return 'Terjadwal';
      case 'rescheduled':
        return 'Dijadwal Ulang';
      case 'cancelled':
        return 'Dibatalkan';
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Survey & Follow-Up</h2>
          <p className="text-xs text-slate-500">Catatan survey lapangan & pengingat tugas otomatis</p>
        </div>
        <button
          onClick={onOpenAddVisitModal}
          className="py-2 px-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Catat Survey</span>
        </button>
      </div>

      {/* Sub-tab Switcher */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-stone-200/70 rounded-xl text-xs font-medium">
        <button
          onClick={() => setSubTab('visits')}
          className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            subTab === 'visits'
              ? 'bg-white text-stone-900 shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4 text-emerald-700" />
          <span>Catatan Survey ({visits.length})</span>
        </button>
        <button
          onClick={() => setSubTab('reminders')}
          className={`py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            subTab === 'reminders'
              ? 'bg-white text-stone-900 shadow-2xs font-semibold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Clock className="w-4 h-4 text-emerald-700" />
          <span>Pengingat Follow-Up ({pendingReminders.length})</span>
        </button>
      </div>

      {/* VISITS TAB */}
      {subTab === 'visits' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {visits.length === 0 ? (
            <div className="col-span-full p-8 text-center bg-white border border-slate-200 rounded-2xl">
              <p className="text-xs text-slate-500">Belum ada catatan survey lokasi.</p>
            </div>
          ) : (
            visits.map((visit) => {
              const client = clientsMap.get(visit.clientId);
              const prop = propertiesMap.get(visit.propertyId);
              const visitDate = new Date(visit.visitDate);
              const formattedDate = visitDate.toLocaleDateString('id-ID', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });
              const formattedTime = visitDate.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
              }) + ' WIB';

              return (
                <div
                  key={visit.id}
                  className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs hover:shadow-xs transition-shadow space-y-3"
                >
                  {/* Visit Top Meta */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {visit.clientName}
                        </span>
                        <span className="text-[10px] text-slate-400">·</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {formattedDate}, {formattedTime}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {visit.propertyTitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onOpenEditVisitModal(visit)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                        title="Edit Catatan Survey"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteVisit(visit.id)}
                        className="p-1 rounded text-slate-300 hover:text-rose-600 hover:bg-rose-50"
                        title="Hapus"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Rating Stars & Status */}
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-xl text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] text-slate-500 mr-1">Tingkat Minat:</span>
                      {([1, 2, 3, 4, 5] as const).map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= visit.interestScore
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium uppercase font-mono px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                      {getStatusBadge(visit.status)}
                    </span>
                  </div>

                  {/* Reaction & Notes */}
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block font-mono">
                        REAKSI KLIEN & PERTIMBANGAN
                      </span>
                      <p className="text-slate-800 mt-0.5 leading-relaxed bg-[#FDFBF7] p-2.5 rounded-xl border border-emerald-100">
                        "{visit.feedback}"
                      </p>
                    </div>

                    <div className="pt-1">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block font-mono">
                        LANGKAH BERIKUT YANG DISEPAKATI
                      </span>
                      <p className="text-slate-700 font-medium mt-0.5">
                        👉 {visit.agreedNextStep}
                      </p>
                    </div>
                  </div>

                  {/* Tags */}
                  {visit.tags && visit.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {visit.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-400" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    {visit.nextFollowUpDate && (
                      <span className="text-[11px] text-emerald-800 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-600" />
                        <span>Follow-up: {visit.nextFollowUpDate}</span>
                      </span>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      {client && (
                        <button
                          onClick={() => onOpenWhatsApp(client, prop)}
                          className="py-1.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 border border-emerald-200/80 transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp Klien</span>
                        </button>
                      )}
                      <a
                        href={`tel:${visit.clientPhone}`}
                        className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-slate-700" />
                        <span>Telepon</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* REMINDERS TAB */}
      {subTab === 'reminders' && (
        <div className="space-y-4">
          {/* Quick Add Reminder Bar */}
          {!isAddingReminder ? (
            <button
              onClick={() => setIsAddingReminder(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-stone-300 hover:border-emerald-600 bg-white hover:bg-emerald-50/40 text-xs font-semibold text-stone-700 flex items-center justify-center gap-2 transition-all shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-700" />
              <span>Jadwalkan Tugas Follow-Up Baru</span>
            </button>
          ) : (
            <form
              onSubmit={handleCreateReminder}
              className="p-4 bg-white border border-emerald-200 rounded-2xl shadow-xs space-y-3 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Pengingat Follow-Up Baru</span>
                <button
                  type="button"
                  onClick={() => setIsAddingReminder(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Pilih Klien</label>
                <select
                  value={newReminderClientId || clients[0]?.id || ''}
                  onChange={(e) => setNewReminderClientId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Tugas / Catatan Follow-Up *</label>
                <input
                  type="text"
                  required
                  value={newReminderNote}
                  onChange={(e) => setNewReminderNote(e.target.value)}
                  placeholder="Contoh: Telepon konfirmasi jadwal tanda tangan SPH di kantor notaris"
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-600 mb-1">Batas Waktu</label>
                  <input
                    type="date"
                    value={newReminderDate}
                    onChange={(e) => setNewReminderDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Prioritas</label>
                  <select
                    value={newReminderPriority}
                    onChange={(e) =>
                      setNewReminderPriority(e.target.value as FollowUpReminder['priority'])
                    }
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="high">Prioritas Tinggi</option>
                    <option value="medium">Prioritas Sedang</option>
                    <option value="low">Prioritas Rendah</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingReminder(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold transition-colors"
                >
                  Simpan Pengingat
                </button>
              </div>
            </form>
          )}

          {/* Pending Reminders List */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wide px-1">
              Follow-Up Aktif ({pendingReminders.length})
            </h3>
            {pendingReminders.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-xl">
                Semua tugas follow-up telah selesai! Kerja bagus menjaga hubungan klien.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {pendingReminders.map((reminder) => {
                  const client = clientsMap.get(reminder.clientId);

                  return (
                    <div
                      key={reminder.id}
                      className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex items-start justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <button
                          onClick={() => onToggleReminder(reminder.id)}
                          className="mt-0.5 text-slate-300 hover:text-emerald-600 transition-colors shrink-0"
                        >
                          <Circle className="w-5 h-5" />
                        </button>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">
                              {reminder.clientName}
                            </span>
                            <span className="text-[10px] text-slate-400">·</span>
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                                reminder.priority === 'high'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-700'
                              }`}
                            >
                              Batas: {reminder.dueDate}
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1 leading-snug">
                            {reminder.note}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-center">
                        {client && (
                          <button
                            onClick={() => onOpenWhatsApp(client)}
                            className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                            title="WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}
                        <a
                          href={`tel:${reminder.clientPhone}`}
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
                          title="Telepon"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Completed Reminders */}
          {completedReminders.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase font-mono tracking-wide px-1">
                Selesai Dilakukan ({completedReminders.length})
              </h4>
              <div className="space-y-1.5 opacity-60">
                {completedReminders.map((r) => (
                  <div
                    key={r.id}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs line-through text-slate-500"
                  >
                    <span>{r.clientName}: {r.note}</span>
                    <button
                      onClick={() => onToggleReminder(r.id)}
                      className="text-emerald-600 hover:text-slate-400"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const VisitsView = React.memo(VisitsViewComponent);
export default VisitsView;
