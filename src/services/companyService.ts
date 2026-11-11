import { PropertyCompany, CompanyBranch, CompanyStatus } from '../types/crm';
import { DEFAULT_COMPANIES, DEFAULT_BRANCHES } from '../data/defaultData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const COMPANIES_STORAGE_KEY = 'agenmate_companies_v1';
const BRANCHES_STORAGE_KEY = 'agenmate_branches_v1';

/**
 * Generates an automatic, unique, non-free-text Company ID from the company name.
 * e.g. "Wenakta Residence" -> "CMP-WR482"
 * e.g. "Graha Property Indah" -> "CMP-GPI193"
 */
export function generateCompanyId(companyName: string): string {
  const words = companyName
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  let prefix = '';
  if (words.length >= 2) {
    prefix = words.slice(0, 3).map((w) => w[0].toUpperCase()).join('');
  } else if (words.length === 1) {
    prefix = words[0].slice(0, 3).toUpperCase();
  } else {
    prefix = 'CMP';
  }

  const randomNum = Math.floor(100 + Math.random() * 900);
  return `CMP-${prefix}${randomNum}`;
}

/**
 * Generates an automatic, unique Branch ID linked to the company ID.
 * e.g. ("CMP-WR482", "Garut") -> "CMP-WR482-GRT"
 */
export function generateBranchId(companyId: string, branchName: string): string {
  const words = branchName
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  let branchCode = '';
  if (words.length >= 2) {
    branchCode = words.slice(0, 3).map((w) => w[0].toUpperCase()).join('');
  } else if (words.length === 1) {
    branchCode = words[0].slice(0, 3).toUpperCase();
  } else {
    branchCode = 'BR';
  }

  const randomSuffix = Math.floor(10 + Math.random() * 90);
  return `${companyId}-${branchCode}${randomSuffix}`;
}

// -------------------------------------------------------------
// LOCAL STORAGE MANAGEMENT
// -------------------------------------------------------------

export function loadLocalCompanies(): PropertyCompany[] {
  try {
    const saved = localStorage.getItem(COMPANIES_STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(DEFAULT_COMPANIES));
      return DEFAULT_COMPANIES;
    }
    const parsed: PropertyCompany[] = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(DEFAULT_COMPANIES));
      return DEFAULT_COMPANIES;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading local companies:', err);
    return DEFAULT_COMPANIES;
  }
}

export function saveLocalCompanies(companies: PropertyCompany[]): void {
  try {
    localStorage.setItem(COMPANIES_STORAGE_KEY, JSON.stringify(companies));
    window.dispatchEvent(new CustomEvent('agenmate_companies_updated', { detail: companies }));
  } catch (err) {
    console.error('Error saving local companies:', err);
  }
}

export function loadLocalBranches(): CompanyBranch[] {
  try {
    const saved = localStorage.getItem(BRANCHES_STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(DEFAULT_BRANCHES));
      return DEFAULT_BRANCHES;
    }
    const parsed: CompanyBranch[] = JSON.parse(saved);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(DEFAULT_BRANCHES));
      return DEFAULT_BRANCHES;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading local branches:', err);
    return DEFAULT_BRANCHES;
  }
}

export function saveLocalBranches(branches: CompanyBranch[]): void {
  try {
    localStorage.setItem(BRANCHES_STORAGE_KEY, JSON.stringify(branches));
    window.dispatchEvent(new CustomEvent('agenmate_branches_updated', { detail: branches }));
  } catch (err) {
    console.error('Error saving local branches:', err);
  }
}

// -------------------------------------------------------------
// SERVER / SUPABASE SYNCHRONIZATION
// -------------------------------------------------------------

export async function syncCompaniesFromServer(): Promise<PropertyCompany[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: PropertyCompany[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          address: d.address || '',
          city: d.city || 'Indonesia',
          status: d.status || 'pending',
          registeredByAdminId: d.registered_by_admin_id,
          registeredByAdminName: d.registered_by_admin_name,
          createdAt: d.created_at ? d.created_at.split('T')[0] : '2026-11-01',
          reviewedAt: d.reviewed_at ? d.reviewed_at.split('T')[0] : undefined,
          reviewedBy: d.reviewed_by,
        }));
        saveLocalCompanies(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase companies fetch fallback:', err);
    }
  }

  return loadLocalCompanies();
}

export async function syncBranchesFromServer(): Promise<CompanyBranch[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: CompanyBranch[] = data.map((d: any) => ({
          id: d.id,
          companyId: d.company_id,
          companyName: d.company_name || '',
          name: d.name,
          address: d.address || '',
          city: d.city || '',
          status: d.status || 'pending',
          inviteCode: d.invite_code,
          createdAt: d.created_at ? d.created_at.split('T')[0] : '2026-11-01',
        }));
        saveLocalBranches(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase branches fetch fallback:', err);
    }
  }

  return loadLocalBranches();
}

// -------------------------------------------------------------
// CREATION & APPROVAL WORKFLOW
// -------------------------------------------------------------

export async function registerNewCompanyWithBranch(params: {
  companyName: string;
  companyAddress: string;
  companyCity: string;
  branchName: string;
  branchAddress: string;
  registeredByAdminName: string;
  registeredByAdminEmail: string;
}): Promise<{ company: PropertyCompany; branch: CompanyBranch }> {
  const companyId = generateCompanyId(params.companyName);
  const branchId = generateBranchId(companyId, params.branchName);
  const today = new Date().toISOString().split('T')[0];

  const newCompany: PropertyCompany = {
    id: companyId,
    name: params.companyName.trim(),
    address: params.companyAddress.trim(),
    city: params.companyCity.trim(),
    status: 'pending', // Requires Super Admin review
    registeredByAdminName: params.registeredByAdminName.trim(),
    createdAt: today,
  };

  const newBranch: CompanyBranch = {
    id: branchId,
    companyId: companyId,
    companyName: params.companyName.trim(),
    name: params.branchName.trim(),
    address: params.branchAddress.trim(),
    city: params.companyCity.trim(),
    status: 'pending',
    inviteCode: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: today,
  };

  // 1. Try Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('companies').insert({
        id: newCompany.id,
        name: newCompany.name,
        address: newCompany.address,
        city: newCompany.city,
        status: newCompany.status,
        registered_by_admin_name: newCompany.registeredByAdminName,
        created_at: new Date().toISOString(),
      });

      await supabase.from('branches').insert({
        id: newBranch.id,
        company_id: newBranch.companyId,
        company_name: newBranch.companyName,
        name: newBranch.name,
        address: newBranch.address,
        city: newBranch.city,
        status: newBranch.status,
        invite_code: newBranch.inviteCode,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase company insert warning:', err);
    }
  }

  // 2. Local storage
  const currentCompanies = loadLocalCompanies();
  saveLocalCompanies([newCompany, ...currentCompanies.filter((c) => c.id !== newCompany.id)]);

  const currentBranches = loadLocalBranches();
  saveLocalBranches([newBranch, ...currentBranches.filter((b) => b.id !== newBranch.id)]);

  return { company: newCompany, branch: newBranch };
}

export async function registerNewBranchForExistingCompany(params: {
  companyId: string;
  companyName: string;
  branchName: string;
  branchAddress: string;
  branchCity: string;
}): Promise<CompanyBranch> {
  const branchId = generateBranchId(params.companyId, params.branchName);
  const today = new Date().toISOString().split('T')[0];

  const newBranch: CompanyBranch = {
    id: branchId,
    companyId: params.companyId,
    companyName: params.companyName,
    name: params.branchName.trim(),
    address: params.branchAddress.trim(),
    city: params.branchCity.trim(),
    status: 'pending',
    inviteCode: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: today,
  };

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('branches').insert({
        id: newBranch.id,
        company_id: newBranch.companyId,
        company_name: newBranch.companyName,
        name: newBranch.name,
        address: newBranch.address,
        city: newBranch.city,
        status: newBranch.status,
        invite_code: newBranch.inviteCode,
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.warn('Supabase branch insert warning:', err);
    }
  }

  const currentBranches = loadLocalBranches();
  saveLocalBranches([newBranch, ...currentBranches.filter((b) => b.id !== newBranch.id)]);

  return newBranch;
}

/**
 * Super Admin approves a company and its branches.
 */
export async function approveCompanyBySuperAdmin(companyId: string, reviewedBy: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('companies')
        .update({ status: 'approved', reviewed_at: new Date().toISOString(), reviewed_by: reviewedBy })
        .eq('id', companyId);

      await supabase
        .from('branches')
        .update({ status: 'approved' })
        .eq('company_id', companyId);
    } catch (err) {
      console.warn('Supabase approveCompany error:', err);
    }
  }

  const companies = loadLocalCompanies().map((c) =>
    c.id === companyId ? { ...c, status: 'approved' as const, reviewedAt: today, reviewedBy } : c
  );
  saveLocalCompanies(companies);

  const branches = loadLocalBranches().map((b) =>
    b.companyId === companyId ? { ...b, status: 'approved' as const } : b
  );
  saveLocalBranches(branches);

  return true;
}

/**
 * Super Admin rejects a company.
 */
export async function rejectCompanyBySuperAdmin(companyId: string, reviewedBy: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('companies')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString(), reviewed_by: reviewedBy })
        .eq('id', companyId);

      await supabase
        .from('branches')
        .update({ status: 'rejected' })
        .eq('company_id', companyId);
    } catch (err) {
      console.warn('Supabase rejectCompany error:', err);
    }
  }

  const companies = loadLocalCompanies().map((c) =>
    c.id === companyId ? { ...c, status: 'rejected' as const, reviewedAt: today, reviewedBy } : c
  );
  saveLocalCompanies(companies);

  const branches = loadLocalBranches().map((b) =>
    b.companyId === companyId ? { ...b, status: 'rejected' as const } : b
  );
  saveLocalBranches(branches);

  return true;
}
