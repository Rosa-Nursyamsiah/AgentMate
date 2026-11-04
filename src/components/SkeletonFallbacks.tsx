import React from 'react';

/**
 * Elegant lightweight skeleton fallback for mobile views (Inventory, Pipeline, Contacts, Visits, Admin, Database)
 */
export const ViewSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 pb-20 animate-pulse" aria-busy="true" aria-label="Memuat tampilan...">
      {/* Top Header Placeholder */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="h-5 w-32 bg-stone-200 rounded-md"></div>
          <div className="h-3 w-48 bg-stone-200 rounded-md"></div>
        </div>
        <div className="h-8 w-24 bg-stone-200 rounded-xl shrink-0"></div>
      </div>

      {/* Search Input Placeholder */}
      <div className="h-10 w-full bg-stone-200 rounded-xl"></div>

      {/* Tabs Filter Bar Placeholder */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 rounded-xl">
        <div className="h-7 w-20 bg-stone-300/80 rounded-lg"></div>
        <div className="h-7 w-24 bg-stone-200 rounded-lg"></div>
        <div className="h-7 w-20 bg-stone-200 rounded-lg"></div>
        <div className="h-7 w-20 bg-stone-200 rounded-lg"></div>
      </div>

      {/* Summary / KPI Strip */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-stone-200 rounded-2xl shadow-2xs">
        <div className="space-y-1.5">
          <div className="h-2.5 w-16 bg-stone-200 rounded"></div>
          <div className="h-5 w-24 bg-stone-200 rounded"></div>
        </div>
        <div className="space-y-1.5 border-l border-stone-100 pl-3">
          <div className="h-2.5 w-16 bg-stone-200 rounded"></div>
          <div className="h-5 w-24 bg-stone-200 rounded"></div>
        </div>
      </div>

      {/* Card Items Placeholder */}
      <div className="space-y-3">
        {[1, 2, 3].map((key) => (
          <div
            key={key}
            className="p-4 bg-white border border-stone-200 rounded-2xl shadow-2xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="h-4 w-40 bg-stone-200 rounded"></div>
                <div className="h-3 w-28 bg-stone-200 rounded"></div>
              </div>
              <div className="h-6 w-14 bg-stone-200 rounded-full"></div>
            </div>
            <div className="h-12 bg-stone-50 rounded-xl"></div>
            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-stone-100">
              <div className="h-8 bg-stone-100 rounded-xl"></div>
              <div className="h-8 bg-stone-100 rounded-xl"></div>
              <div className="h-8 bg-stone-100 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Elegant lightweight skeleton fallback for mobile modal dialogs
 */
export const ModalSkeleton: React.FC = () => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4"
      aria-busy="true"
      aria-label="Memuat dialog..."
    >
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
            <div className="h-3 w-48 bg-slate-200 rounded"></div>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-200"></div>
        </div>

        {/* Form Body Placeholder */}
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-slate-200 rounded"></div>
            <div className="h-10 w-full bg-slate-100 rounded-xl"></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="h-3 w-16 bg-slate-200 rounded"></div>
              <div className="h-10 w-full bg-slate-100 rounded-xl"></div>
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-16 bg-slate-200 rounded"></div>
              <div className="h-10 w-full bg-slate-100 rounded-xl"></div>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-24 bg-slate-200 rounded"></div>
            <div className="h-16 w-full bg-slate-100 rounded-xl"></div>
          </div>
        </div>

        {/* Footer Actions Placeholder */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="flex-1 h-10 bg-slate-200 rounded-xl"></div>
          <div className="flex-2 h-10 bg-slate-300 rounded-xl"></div>
        </div>
      </div>
    </div>
  );
};
