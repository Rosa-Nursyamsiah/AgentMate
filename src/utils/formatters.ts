/**
 * Format mata uang Rupiah untuk konteks industri properti Indonesia (IDR / Rp)
 */
export function formatRupiahShort(amount: number | null | undefined): string {
  if (!amount || amount === 0) return 'Rp 0';
  
  if (amount >= 1000000000) {
    const val = amount / 1000000000;
    return `Rp ${val % 1 === 0 ? val.toFixed(0) : val.toFixed(2).replace('.', ',')} Miliar`;
  }
  if (amount >= 1000000) {
    const val = amount / 1000000;
    return `Rp ${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace('.', ',')} Juta`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function formatRupiahCompact(amount: number | null | undefined): string {
  if (!amount || amount === 0) return 'Rp 0';
  
  if (amount >= 1000000000) {
    const val = amount / 1000000000;
    return `Rp ${val % 1 === 0 ? val.toFixed(0) : val.toFixed(2).replace('.', ',')} M`;
  }
  if (amount >= 1000000) {
    const val = amount / 1000000;
    return `Rp ${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1).replace('.', ',')} Jt`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

export function formatRupiahFull(amount: number | null | undefined): string {
  if (!amount || amount === 0) return 'Rp 0';
  return `Rp ${amount.toLocaleString('id-ID')}`;
}
