import { UserProfile } from '../types/crm';
import { DEFAULT_USERS, SUPER_ADMIN_EMAIL, isSuperAdminEmail, normalizeEmail } from '../data/defaultData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { registerNewCompanyWithBranch, registerNewBranchForExistingCompany } from './companyService';

const STORAGE_KEY = 'agenmate_users_v1';

export const loadLocalUsers = (): UserProfile[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed: UserProfile[] = JSON.parse(saved);
    const hasSuper = parsed.some((u) => isSuperAdminEmail(u.email));
    if (!hasSuper) {
      const superAdmin = DEFAULT_USERS.find((u) => isSuperAdminEmail(u.email)) || DEFAULT_USERS[0];
      const merged = [superAdmin, ...parsed];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading local users:', err);
    return DEFAULT_USERS;
  }
};

export const saveLocalUsers = (users: UserProfile[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('agenmate_users_updated', { detail: users }));
  } catch (err) {
    console.error('Error saving local users:', err);
  }
};

/**
 * Fetches all registered users from the shared server backend or Supabase Cloud.
 * Automatically synchronizes with local storage.
 */
export async function syncUsersFromServer(): Promise<UserProfile[]> {
  // 1. Try Supabase Cloud Database first if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('registered_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mapped: UserProfile[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          email: d.email,
          password: d.password || 'password123',
          phone: d.phone,
          role: d.role,
          status: d.status,
          companyId: d.company_id || d.companyId,
          companyName: d.company_name || d.companyName || d.agency_name || d.agencyName || 'AgenMate Group',
          branchId: d.branch_id || d.branchId,
          branchName: d.branch_name || d.branchName || 'Kantor Cabang',
          position: d.position || (d.role === 'admin' ? 'Admin Cabang' : 'Agen Properti'),
          membershipStatus: d.membership_status || (d.status === 'approved' ? 'active' : d.status),
          inviteCode: d.invite_code || d.inviteCode,
          agencyName: d.agency_name || d.agencyName || d.company_name || 'Independen Broker',
          city: d.city || 'Jakarta',
          licenseNumber: d.license_number || d.licenseNumber,
          registeredAt: d.registered_at ? d.registered_at.split('T')[0] : '2026-11-01',
          reviewedAt: d.reviewed_at ? d.reviewed_at.split('T')[0] : undefined,
          reviewedBy: d.reviewed_by || d.reviewedBy,
          notes: d.notes,
        }));
        saveLocalUsers(mapped);
        return mapped;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage:', err);
    }
  }

  // 2. Fetch from Shared Server API (/api/users)
  try {
    const res = await fetch('/api/users');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.users)) {
        saveLocalUsers(json.users);
        return json.users;
      }
    }
  } catch {
    // API not reachable or static deployment
  }

  // 3. Fallback to LocalStorage
  return loadLocalUsers();
}

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'admin' | 'super_admin';
  // Dynamic Multi-Company & Branch Fields
  companyId?: string;
  companyName?: string;
  branchId?: string;
  branchName?: string;
  position?: string;
  inviteCode?: string;

  // New Company / Branch submission by Admin Cabang
  isNewCompany?: boolean;
  newCompanyName?: string;
  newCompanyAddress?: string;
  newBranchName?: string;
  newBranchAddress?: string;

  // Legacy/Compatibility fields
  agencyName?: string;
  city?: string;
  licenseNumber?: string;
}

/**
 * Registers a new user with Company & Branch relationship and pushes it directly to Supabase/LocalStorage.
 */
export async function registerUserRemote(userData: RegisterUserInput): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  const trimmedEmail = userData.email.trim();
  const isSuper = isSuperAdminEmail(trimmedEmail);

  let finalCompanyId = userData.companyId;
  let finalCompanyName = userData.companyName || userData.agencyName || 'Independen Broker';
  let finalBranchId = userData.branchId;
  let finalBranchName = userData.branchName || 'Kantor Cabang';
  let finalCity = userData.city || 'Jakarta';

  // 1. If Admin Cabang is registering a BRAND NEW company and branch:
  if (userData.role === 'admin' && userData.isNewCompany && userData.newCompanyName && userData.newBranchName) {
    const regRes = await registerNewCompanyWithBranch({
      companyName: userData.newCompanyName,
      companyAddress: userData.newCompanyAddress || 'Alamat Perusahaan',
      companyCity: userData.city || 'Jakarta',
      branchName: userData.newBranchName,
      branchAddress: userData.newBranchAddress || 'Alamat Kantor Cabang',
      registeredByAdminName: userData.name,
      registeredByAdminEmail: trimmedEmail,
    });
    finalCompanyId = regRes.company.id;
    finalCompanyName = regRes.company.name;
    finalBranchId = regRes.branch.id;
    finalBranchName = regRes.branch.name;
    finalCity = regRes.company.city;
  } 
  // 2. If Admin Cabang is adding a new branch to an existing company:
  else if (userData.role === 'admin' && userData.companyId && userData.newBranchName) {
    const branchRes = await registerNewBranchForExistingCompany({
      companyId: userData.companyId,
      companyName: finalCompanyName,
      branchName: userData.newBranchName,
      branchAddress: userData.newBranchAddress || 'Alamat Kantor Cabang',
      branchCity: finalCity,
    });
    finalBranchId = branchRes.id;
    finalBranchName = branchRes.name;
  }

  const assignedRole = isSuper ? 'super_admin' : (userData.role === 'super_admin' ? 'user' : userData.role);
  const assignedStatus = isSuper ? 'approved' : 'pending';
  const assignedMembership = isSuper ? 'active' : 'pending';

  const notesText = isSuper
    ? 'Akun Pemilik Sistem & Super Admin Utama.'
    : userData.role === 'admin'
    ? `Pendaftaran Admin Cabang [${finalCompanyName} - ${finalBranchName}]. Menunggu persetujuan Super Admin (Ocha Syamsiah).`
    : `Permohonan keanggotaan Agen Properti di [${finalCompanyName} - ${finalBranchName}]. Menunggu persetujuan Admin Cabang.`;

  const newId = `user-${Date.now()}`;
  const newUser: UserProfile = {
    id: newId,
    name: userData.name.trim(),
    email: trimmedEmail,
    password: userData.password,
    phone: userData.phone.trim(),
    role: assignedRole,
    status: assignedStatus,
    companyId: finalCompanyId,
    companyName: finalCompanyName,
    branchId: finalBranchId,
    branchName: finalBranchName,
    position: userData.position?.trim() || (userData.role === 'admin' ? 'Admin Cabang' : 'Agen Properti'),
    membershipStatus: assignedMembership,
    inviteCode: userData.inviteCode?.trim(),
    agencyName: `${finalCompanyName} (${finalBranchName})`,
    city: finalCity,
    licenseNumber: userData.licenseNumber?.trim() || 'Dalam Proses Verifikasi AREBI',
    registeredAt: new Date().toISOString().split('T')[0],
    notes: notesText,
  };

  // 1. Try Supabase Cloud Database first if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data: existing } = await supabase
        .from('user_profiles')
        .select('id, email')
        .ilike('email', trimmedEmail);

      if (existing && existing.length > 0) {
        return { success: false, message: 'Alamat email ini sudah terdaftar. Silakan gunakan tab Masuk / Login.' };
      }

      const { error: insertErr } = await supabase.from('user_profiles').insert({
        id: newId,
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        phone: newUser.phone,
        role: newUser.role,
        status: newUser.status,
        company_id: newUser.companyId,
        company_name: newUser.companyName,
        branch_id: newUser.branchId,
        branch_name: newUser.branchName,
        position: newUser.position,
        membership_status: newUser.membershipStatus,
        invite_code: newUser.inviteCode,
        agency_name: newUser.agencyName,
        city: newUser.city,
        license_number: newUser.licenseNumber,
        registered_at: new Date().toISOString(),
        notes: newUser.notes,
      });

      if (!insertErr) {
        const current = loadLocalUsers();
        const updated = [newUser, ...current.filter((u) => u.id !== newUser.id)];
        saveLocalUsers(updated);
        return { success: true, user: newUser };
      } else {
        console.warn('Supabase insert error, falling back:', insertErr);
      }
    } catch (err) {
      console.warn('Supabase register error:', err);
    }
  }

  // 2. Local fallback
  const current = loadLocalUsers();
  const norm = normalizeEmail(trimmedEmail);
  const existing = current.find((u) => normalizeEmail(u.email) === norm);
  if (existing) {
    return { success: false, message: 'Alamat email ini sudah terdaftar. Silakan gunakan tab Masuk / Login.' };
  }

  const updated = [newUser, ...current];
  saveLocalUsers(updated);
  return { success: true, user: newUser };
}

/**
 * Super Admin approves a user (Admin Cabang or Agent) remotely.
 */
export async function approveUserRemote(userId: string, reviewedBy: string): Promise<boolean> {
  // Update Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('user_profiles')
        .update({
          status: 'approved',
          membership_status: 'active',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewedBy,
        })
        .eq('id', userId);
    } catch {
      // ignore
    }
  }

  // Update Local Storage
  const current = loadLocalUsers();
  const updated = current.map((u) =>
    u.id === userId
      ? {
          ...u,
          status: 'approved' as const,
          membershipStatus: 'active' as const,
          reviewedAt: new Date().toISOString().split('T')[0],
          reviewedBy,
        }
      : u
  );
  saveLocalUsers(updated);
  return true;
}

/**
 * Super Admin or Admin Cabang rejects a user.
 */
export async function rejectUserRemote(userId: string, reason?: string, reviewedBy?: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('user_profiles')
        .update({
          status: 'rejected',
          membership_status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewedBy || 'Admin Reviewer',
          notes: reason ? `Ditolak: ${reason}` : undefined,
        })
        .eq('id', userId);
    } catch {
      // ignore
    }
  }

  const current = loadLocalUsers();
  const updated = current.map((u) =>
    u.id === userId
      ? {
          ...u,
          status: 'rejected' as const,
          membershipStatus: 'rejected' as const,
          reviewedAt: new Date().toISOString().split('T')[0],
          reviewedBy: reviewedBy || 'Admin Reviewer',
          notes: reason ? `Ditolak: ${reason}` : u.notes,
        }
      : u
  );
  saveLocalUsers(updated);
  return true;
}

/**
 * Admin Cabang approves an Agent applicant for their specific branch.
 */
export async function approveAgentByBranchAdmin(agentId: string, branchAdmin: UserProfile): Promise<boolean> {
  const reviewerNote = `${branchAdmin.name} (Admin Cabang ${branchAdmin.branchName || ''})`;
  return approveUserRemote(agentId, reviewerNote);
}

/**
 * Admin Cabang rejects an Agent applicant for their specific branch.
 */
export async function rejectAgentByBranchAdmin(agentId: string, reason: string, branchAdmin: UserProfile): Promise<boolean> {
  const reviewerNote = `${branchAdmin.name} (Admin Cabang ${branchAdmin.branchName || ''})`;
  return rejectUserRemote(agentId, reason, reviewerNote);
}

