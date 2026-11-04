import React, { useState } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { Property, PropertyType, LegalCertificate, PropertyStatus } from '../types/crm';
import { formatRupiahShort } from '../utils/formatters';

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (propData: Omit<Property, 'id' | 'createdAt'>, existingId?: string) => void;
  initialProperty?: Property | null;
}

const PROPERTY_TYPES: PropertyType[] = [
  'Rumah Tapak / Cluster',
  'Apartemen / Kondominium',
  'Ruko / Komersial',
  'Villa Tropis',
  'Tanah / Kavling',
  'Gudang / Industri',
];

const CERTIFICATES: LegalCertificate[] = [
  'SHM (Sertifikat Hak Milik)',
  'HGB (Hak Guna Bangunan)',
  'Strata Title',
  'Girik / AJB',
  'PPJB Lunas',
];

export const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProperty,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(initialProperty?.title || '');
  const [address, setAddress] = useState(initialProperty?.address || '');
  const [city, setCity] = useState(initialProperty?.city || 'Tangerang Selatan');
  const [neighborhood, setNeighborhood] = useState(initialProperty?.neighborhood || 'BSD City');
  const [propertyType, setPropertyType] = useState<PropertyType>(
    initialProperty?.propertyType || 'Rumah Tapak / Cluster'
  );
  const [certificateType, setCertificateType] = useState<LegalCertificate>(
    initialProperty?.certificateType || 'SHM (Sertifikat Hak Milik)'
  );
  const [price, setPrice] = useState<number>(initialProperty?.price || 0);
  const [listingType, setListingType] = useState<'sale' | 'rent'>(
    initialProperty?.listingType || 'sale'
  );
  const [status, setStatus] = useState<PropertyStatus>(
    initialProperty?.status || 'available'
  );
  const [bedrooms, setBedrooms] = useState<number>(initialProperty?.bedrooms || 3);
  const [bathrooms, setBathrooms] = useState<number>(initialProperty?.bathrooms || 2);
  const [areaLandSqft, setAreaLandSqft] = useState<number>(initialProperty?.areaLandSqft || 120);
  const [areaBuildingSqft, setAreaBuildingSqft] = useState<number>(initialProperty?.areaBuildingSqft || 90);
  const [commissionRate, setCommissionRate] = useState<number>(initialProperty?.commissionRate || 2.5);
  const [description, setDescription] = useState(initialProperty?.description || '');
  const [featuresInput, setFeaturesInput] = useState(
    initialProperty?.features?.join(', ') || 'SHM Lengkap, Carport 2 Mobil, Keamanan 24 Jam'
  );
  const [svgPreset, setSvgPreset] = useState<'condo' | 'villa' | 'townhouse' | 'penthouse'>(
    initialProperty?.svgPreset || 'townhouse'
  );
  const [sellerName, setSellerName] = useState(initialProperty?.sellerName || '');
  const [imageUrl, setImageUrl] = useState(initialProperty?.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || price <= 0) return;

    const features = featuresInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    onSave(
      {
        title: title.trim(),
        address: address.trim() || 'Jl. Utama No. 1',
        city: city.trim() || 'Jakarta',
        neighborhood: neighborhood.trim() || 'Pusat Kota',
        propertyType,
        certificateType,
        price: Number(price),
        listingType,
        status,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        areaLandSqft: Number(areaLandSqft),
        areaBuildingSqft: Number(areaBuildingSqft),
        commissionRate: Number(commissionRate),
        description: description.trim() || 'Unit listing berkualitas dengan lokasi strategis.',
        features: features.length > 0 ? features : ['Siap Huni', 'Sertifikat Lengkap'],
        svgPreset,
        sellerName: sellerName.trim() || 'Pemilik Langsung',
        imageUrl: imageUrl.trim() || undefined,
      },
      initialProperty?.id
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
              <Building2 className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-900 text-sm">
              {initialProperty ? 'Edit Listing Properti' : 'Tambah Listing Baru'}
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
          {/* Title */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Judul Listing *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Cluster Navapark Luxury Villa"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Type & Certificate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Tipe Properti</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Legalitas / Sertifikat</label>
              <select
                value={certificateType}
                onChange={(e) => setCertificateType(e.target.value as LegalCertificate)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              >
                {CERTIFICATES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Commission */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-medium text-slate-700">Harga Jual / Sewa *</label>
                <span className="text-slate-500 font-mono text-[11px] tabular-nums">
                  {price > 0 ? formatRupiahShort(price) : 'Rp 0'}
                </span>
              </div>
              <input
                type="number"
                required
                step="10000000"
                min="0"
                value={price === 0 ? '' : price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                placeholder="Harga dalam Rupiah"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Komisi Agen (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={commissionRate}
                onChange={(e) => setCommissionRate(Number(e.target.value) || 0)}
                placeholder="2.5"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Location: Address, Neighborhood, City */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Alamat Unit</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Jl. Boulevard No. 10"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Kawasan / Cluster</label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="BSD City"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Kota / Kabupaten</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Tangerang Selatan"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Specs: KT, KM, LT, LB */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Kamar Tidur</label>
              <input
                type="number"
                min="0"
                value={bedrooms}
                onChange={(e) => setBedrooms(Number(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-center text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Kamar Mandi</label>
              <input
                type="number"
                min="0"
                value={bathrooms}
                onChange={(e) => setBathrooms(Number(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-center text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">LT (m²)</label>
              <input
                type="number"
                min="0"
                value={areaLandSqft}
                onChange={(e) => setAreaLandSqft(Number(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-center text-slate-900"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">LB (m²)</label>
              <input
                type="number"
                min="0"
                value={areaBuildingSqft}
                onChange={(e) => setAreaBuildingSqft(Number(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-center text-slate-900"
              />
            </div>
          </div>

          {/* SVG Visual Blueprint Preset */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Preset Tampilan Arsitektur SVG</label>
            <div className="grid grid-cols-4 gap-2">
              {(['townhouse', 'condo', 'villa', 'penthouse'] as const).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSvgPreset(preset)}
                  className={`py-1.5 px-2 rounded-xl text-center text-xs font-semibold capitalize border transition-all ${
                    svgPreset === preset
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Fasilitas Unggulan (pisahkan koma)</label>
            <input
              type="text"
              value={featuresInput}
              onChange={(e) => setFeaturesInput(e.target.value)}
              placeholder="Contoh: Kolam Renang Privat, View Danau, Smart Lock"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          {/* Seller Name & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Nama Pemilik / Vendor</label>
              <input
                type="text"
                value={sellerName}
                onChange={(e) => setSellerName(e.target.value)}
                placeholder="Contoh: Ibu Ratna Paramitha"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">URL Gambar (Opsional)</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Deskripsi Listing</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Deskripsi keunggulan unit, tata ruang, potensi investasi..."
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
              <span>{initialProperty ? 'Simpan Listing' : 'Tambah ke Inventaris'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyModal;
