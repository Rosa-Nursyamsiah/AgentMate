import { UserProfile } from '../types/crm';
import { DEFAULT_USERS, SUPER_ADMIN_EMAIL, isSuperAdminEmail, normalizeEmail } from '../data/defaultData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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
          agencyName: d.agency_name || d.agencyName || 'Independen Broker',
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
      console.warn('Supabase fetch failed, falling back to local server API:', err);
    }
  }

  // 2. Fetch from Shared Server API (/api/users) - works across all devices on the same network/server
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

/**
 * Registers a new user and pushes it directly to the shared backend / Supabase.
 */
export async function registerUserRemote(userData: {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'admin' | 'super_admin';
  agencyName: string;
  city: string;
  licenseNumber?: string;
}): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
  const trimmedEmail = userData.email.trim();
  const isSuper = isSuperAdminEmail(trimmedEmail);

  // 1. Send to Shared Server API
  try {
    const res = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.user) {
        const current = loadLocalUsers();
        const updated = [json.user, ...current.filter((u) => u.id !== json.user.id)];
        saveLocalUsers(updated);

        // Sync to Supabase in parallel if configured
        if (isSupabaseConfigured && supabase) {
          try {
            await supabase.from('user_profiles').insert({
              id: json.user.id,
              name: json.user.name,
              email: json.user.email,
              phone: json.user.phone,
              role: json.user.role,
              status: json.user.status,
              agency_name: json.user.agencyName,
              city: json.user.city,
              license_number: json.user.licenseNumber,
              registered_at: new Date().toISOString(),
              notes: json.user.notes,
            });
          } catch (e) {
            console.error('Supabase async sync error:', e);
          }
        }

        return { success: true, user: json.user };
      }
      return { success: false, message: json.message || 'Pendaftaran gagal di server.' };
    }
  } catch {
    // Network error or offline
  }

  // 2. Offline / Local fallback
  const current = loadLocalUsers();
  const norm = normalizeEmail(trimmedEmail);
  const existing = current.find((u) => normalizeEmail(u.email) === norm);
  if (existing) {
    return { success: false, message: 'Alamat email ini sudah terdaftar. Silakan gunakan tab Masuk / Login.' };
  }

  const newUser: UserProfile = {
    id: `user-${Date.now()}`,
    name: userData.name,
    email: trimmedEmail,
    password: userData.password,
    phone: userData.phone,
    role: isSuper ? 'super_admin' : (userData.role === 'super_admin' ? 'user' : userData.role),
    status: isSuper ? 'approved' : 'pending',
    agencyName: userData.agencyName,
    city: userData.city,
    licenseNumber: userData.licenseNumber || 'Dalam Proses Verifikasi AREBI',
    registeredAt: new Date().toISOString().split('T')[0],
    notes: isSuper
      ? 'Akun Pemilik Sistem & Super Admin Utama.'
      : `Pendaftaran baru via form online sebagai ${userData.role === 'admin' ? 'Admin Cabang' : 'Agen Properti'}. Menunggu persetujuan Super Admin (Ocha Syamsiah).`,
  };

  const updated = [newUser, ...current];
  saveLocalUsers(updated);
  return { success: true, user: newUser };
}

/**
 * Super Admin approves a user remotely.
 */
export async function approveUserRemote(userId: string, reviewedBy: string): Promise<boolean> {
  // Update Shared Server API
  try {
    await fetch('/api/users/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reviewedBy }),
    });
  } catch {
    // ignore
  }

  // Update Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('user_profiles')
        .update({
          status: 'approved',
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
          reviewedAt: new Date().toISOString().split('T')[0],
          reviewedBy,
        }
      : u
  );
  saveLocalUsers(updated);
  return true;
}

/**
 * Super Admin rejects a user remotely.
 */
export async function rejectUserRemote(userId: string, reason?: string, reviewedBy?: string): Promise<boolean> {
  // Update Shared Server API
  try {
    await fetch('/api/users/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reason, reviewedBy }),
    });
  } catch {
    // ignore
  }

  // Update Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('user_profiles')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewedBy || 'Ocha Syamsiah (Super Admin)',
          notes: reason ? `Ditolak: ${reason}` : undefined,
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
          status: 'rejected' as const,
          reviewedAt: new Date().toISOString().split('T')[0],
          reviewedBy: reviewedBy || 'Ocha Syamsiah (Super Admin)',
          notes: reason ? `Ditolak: ${reason}` : u.notes,
        }
      : u
  );
  saveLocalUsers(updated);
  return true;
}
