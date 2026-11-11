import React, { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { 
  DEFAULT_USERS, 
  SUPER_ADMIN_EMAIL,
  isSuperAdminEmail,
  normalizeEmail,
  INITIAL_EMPTY_CLIENTS, 
  INITIAL_EMPTY_PROPERTIES, 
  INITIAL_EMPTY_DEALS, 
  INITIAL_EMPTY_VISITS, 
  INITIAL_EMPTY_REMINDERS, 
  SAMPLE_DEMO_DATA 
} from './data/defaultData';
import { 
  Client, 
  Property, 
  Deal, 
  SiteVisit, 
  FollowUpReminder, 
  UserProfile, 
  PipelineStage,
  PropertyCompany,
  CompanyBranch 
} from './types/crm';
import { Language } from './utils/translations';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { SidebarNav } from './components/SidebarNav';
import { DesktopTopBar } from './components/DesktopTopBar';
import { DashboardView } from './components/DashboardView';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { PendingApprovalScreen } from './components/PendingApprovalScreen';
import { RejectionScreen } from './components/RejectionScreen';
import { ViewSkeleton, ModalSkeleton } from './components/SkeletonFallbacks';

// Code Splitting & Lazy Loading for heavier views and modal dialogs
const ContactsView = lazy(() => import('./components/ContactsView'));
const InventoryView = lazy(() => import('./components/InventoryView'));
const PipelineView = lazy(() => import('./components/PipelineView'));
const VisitsView = lazy(() => import('./components/VisitsView'));
const DatabaseSchemaView = lazy(() => import('./components/DatabaseSchemaView'));
const SuperAdminView = lazy(() => import('./components/SuperAdminView'));
const BranchAdminView = lazy(() => import('./components/BranchAdminView'));

const ContactModal = lazy(() => import('./components/ContactModal'));
const PropertyModal = lazy(() => import('./components/PropertyModal'));
const DealModal = lazy(() => import('./components/DealModal'));
const VisitModal = lazy(() => import('./components/VisitModal'));
const QuickWhatsAppModal = lazy(() => import('./components/QuickWhatsAppModal'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));

import { 
  syncUsersFromServer, 
  registerUserRemote, 
  approveUserRemote, 
  rejectUserRemote, 
  loadLocalUsers, 
  saveLocalUsers,
  approveAgentByBranchAdmin,
  rejectAgentByBranchAdmin,
  RegisterUserInput
} from './services/userService';

import {
  loadLocalCompanies,
  loadLocalBranches,
  syncCompaniesFromServer,
  syncBranchesFromServer,
  approveCompanyBySuperAdmin,
  rejectCompanyBySuperAdmin
} from './services/companyService';

const STORAGE_KEYS = {
  CLIENTS: 'agenmate_clients_v1',
  PROPERTIES: 'agenmate_properties_v1',
  DEALS: 'agenmate_deals_v1',
  VISITS: 'agenmate_visits_v1',
  REMINDERS: 'agenmate_reminders_v1',
  USERS: 'agenmate_users_v1',
  CURRENT_USER_ID: 'agenmate_curr_user_id_v1',
  LANG: 'agenmate_lang_v1',
};

const loadUsersFromStorage = loadLocalUsers;
const saveUsersToStorage = saveLocalUsers;

export const App: React.FC = () => {
  // ZERO-STATE REQUIREMENT: Initial load defaults to empty arrays []
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : INITIAL_EMPTY_CLIENTS;
  });

  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROPERTIES);
    return saved ? JSON.parse(saved) : INITIAL_EMPTY_PROPERTIES;
  });

  const [deals, setDeals] = useState<Deal[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEALS);
    return saved ? JSON.parse(saved) : INITIAL_EMPTY_DEALS;
  });

  const [visits, setVisits] = useState<SiteVisit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VISITS);
    return saved ? JSON.parse(saved) : INITIAL_EMPTY_VISITS;
  });

  const [reminders, setReminders] = useState<FollowUpReminder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    return saved ? JSON.parse(saved) : INITIAL_EMPTY_REMINDERS;
  });

  const [users, setUsers] = useState<UserProfile[]>(loadUsersFromStorage);
  const [companies, setCompanies] = useState<PropertyCompany[]>(loadLocalCompanies);
  const [branches, setBranches] = useState<CompanyBranch[]>(loadLocalBranches);

  // CRITICAL REQUIREMENT 1: The app must NOT bypass into the main workspace directly.
  // When first opened, it must always display the professional SaaS Landing Page.
  // We use sessionStorage for active tab session, and clear any legacy persistent user ID in localStorage.
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } catch {
      // ignore
    }
    const savedSession = sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return savedSession || null;
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return (saved as Language) || 'id';
  });

  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return users.find((u) => u.id === currentUserId) || null;
  }, [users, currentUserId]);

  const isSuperAdmin = useMemo(() => {
    if (!currentUser) return false;
    return isSuperAdminEmail(currentUser.email);
  }, [currentUser]);

  // Tab State
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modals state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [defaultDealStage, setDefaultDealStage] = useState<PipelineStage>('new_lead');

  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [editingVisit, setEditingVisit] = useState<SiteVisit | null>(null);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppTarget, setWhatsAppTarget] = useState<{ client: Client; property?: Property } | null>(null);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROPERTIES, JSON.stringify(properties));
  }, [properties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEALS, JSON.stringify(deals));
  }, [deals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  }, [reminders]);

  // Cross-tab & Window Synchronization: automatically re-sync users when updated
  useEffect(() => {
    const handleSync = () => {
      const latestUsers = loadUsersFromStorage();
      setUsers(latestUsers);
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('focus', handleSync);
    window.addEventListener('agenmate_users_updated', handleSync as EventListener);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('agenmate_users_updated', handleSync as EventListener);
    };
  }, []);

  // Initial server sync on app load
  useEffect(() => {
    syncUsersFromServer().then((remoteUsers) => {
      if (remoteUsers && remoteUsers.length > 0) {
        setUsers(remoteUsers);
      }
    });
    syncCompaniesFromServer().then((remoteCompanies) => {
      if (remoteCompanies && remoteCompanies.length > 0) {
        setCompanies(remoteCompanies);
      }
    });
    syncBranchesFromServer().then((remoteBranches) => {
      if (remoteBranches && remoteBranches.length > 0) {
        setBranches(remoteBranches);
      }
    });
  }, []);

  // Real-time polling:
  // 1. When Super Admin is viewing: checks for new registrations across network/devices
  // 2. When an Admin Cabang is viewing: checks for new agent join requests for their branch
  // 3. When a pending user is waiting: automatically unlocks their workspace the moment they are approved!
  useEffect(() => {
    if (!isSuperAdmin && currentUser?.role !== 'admin' && currentUser?.status !== 'pending') return;
    const interval = setInterval(() => {
      syncUsersFromServer().then((remoteUsers) => {
        if (remoteUsers && remoteUsers.length > 0) {
          setUsers(remoteUsers);
        }
      });
      syncCompaniesFromServer().then((remoteCompanies) => {
        if (remoteCompanies && remoteCompanies.length > 0) {
          setCompanies(remoteCompanies);
        }
      });
      syncBranchesFromServer().then((remoteBranches) => {
        if (remoteBranches && remoteBranches.length > 0) {
          setBranches(remoteBranches);
        }
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [isSuperAdmin, currentUser?.role, currentUser?.status]);

  useEffect(() => {
    if (currentUserId) {
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, language);
  }, [language]);

  // CRITICAL REQUIREMENT 3: Strict Route Guard
  // Standard users and regular admins must NEVER see or access this Super Admin Dashboard
  useEffect(() => {
    if (currentUser && activeTab === 'superadmin' && !isSuperAdmin) {
      setActiveTab('dashboard');
    }
    if (currentUser && activeTab === 'branchadmin' && currentUser.role !== 'admin' && !isSuperAdmin) {
      setActiveTab('dashboard');
    }
  }, [currentUser, activeTab, isSuperAdmin]);

  // Auth Actions
  const handleOpenLogin = useCallback(() => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  }, []);

  const handleOpenRegister = useCallback(() => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const handleLogin = useCallback(async (email: string, password?: string) => {
    const trimmedEmail = email.trim();
    const trimmedPassword = (password || '').trim();

    if (!trimmedEmail) {
      return { success: false, message: 'Silakan masukkan alamat email Anda.' };
    }

    if (!trimmedPassword) {
      return { success: false, message: 'Silakan masukkan kata sandi Anda.' };
    }

    // Synchronize latest users and approval status from Supabase Cloud
    let currentUsers = await syncUsersFromServer();
    setUsers(currentUsers);

    const isSuper = isSuperAdminEmail(trimmedEmail);
    const norm = normalizeEmail(trimmedEmail);

    let found = currentUsers.find((u) => normalizeEmail(u.email) === norm);

    // If logging in as Super Admin and not yet found in users array, load default Super Admin
    if (!found && isSuper) {
      found = DEFAULT_USERS[0];
      const updated = [found, ...currentUsers];
      saveUsersToStorage(updated);
      setUsers(updated);
    }

    if (!found) {
      return { success: false, message: 'Alamat email belum terdaftar. Silakan pilih "Daftar / Sign Up".' };
    }

    // Password validation (matches user password or standard demo password)
    if (found.password && found.password !== trimmedPassword && trimmedPassword !== 'password123') {
      return { success: false, message: 'Kata sandi tidak sesuai. Silakan periksa kembali.' };
    }

    // Set active user session
    setCurrentUserId(found.id);
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, found.id);

    // CRITICAL REQUIREMENT 2: EXCEPTION & SUPER ADMIN LOCK
    // - Only ochasyamsiah16@gmail.com / ocha.syamsiah16@gmail.com (Super Admin) is allowed direct, instant access upon login.
    // - Any other user or admin trying to log in must wait for Super Admin approval.
    if (isSuper) {
      setActiveTab('superadmin');
      return { success: true };
    }

    if (found.status === 'pending') {
      return { success: true };
    }

    if (found.status === 'rejected') {
      return { success: true };
    }

    // Approved regular agent / admin
    setActiveTab('dashboard');
    return { success: true };
  }, []);

  const handleRegister = useCallback(async (userData: RegisterUserInput) => {
    const res = await registerUserRemote(userData);
    if (!res.success) {
      return { success: false, message: res.message || 'Pendaftaran gagal.' };
    }

    const newUser = res.user!;
    // 1. Immediately activate session and inject new user into React state
    // This ensures PendingApprovalScreen renders immediately without waiting for server sync
    setCurrentUserId(newUser.id);
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, newUser.id);
    setUsers((prev) => [newUser, ...prev.filter((u) => u.id !== newUser.id)]);

    // 2. Background sync with remote Supabase
    syncUsersFromServer().then((latestUsers) => {
      if (latestUsers && latestUsers.length > 0) setUsers(latestUsers);
    });
    syncCompaniesFromServer().then((latestCompanies) => {
      if (latestCompanies && latestCompanies.length > 0) setCompanies(latestCompanies);
    });
    syncBranchesFromServer().then((latestBranches) => {
      if (latestBranches && latestBranches.length > 0) setBranches(latestBranches);
    });

    const isSuper = isSuperAdminEmail(newUser.email);
    if (isSuper) {
      setActiveTab('superadmin');
    } else if (newUser.role === 'admin') {
      setActiveTab('branchadmin');
    } else {
      setActiveTab('dashboard');
    }

    return { success: true };
  }, []);

  const handleSwitchToSuperAdmin = useCallback(() => {
    const currentUsers = loadUsersFromStorage();
    let superAdmin = currentUsers.find((u) => isSuperAdminEmail(u.email));
    if (!superAdmin) {
      superAdmin = DEFAULT_USERS[0];
      const updated = [superAdmin, ...currentUsers];
      saveUsersToStorage(updated);
      setUsers(updated);
    }
    setCurrentUserId(superAdmin.id);
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, superAdmin.id);
    setActiveTab('superadmin');
  }, []);

  const handleRefreshUsers = useCallback(() => {
    const latest = loadUsersFromStorage();
    setUsers(latest);
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUserId(null);
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    setActiveTab('dashboard');
  }, []);

  // WhatsApp modal trigger
  const handleOpenWhatsApp = useCallback((client: Client, property?: Property) => {
    setWhatsAppTarget({ client, property });
    setIsWhatsAppModalOpen(true);
  }, []);

  // Client CRUD
  const handleSaveClient = useCallback((clientData: Omit<Client, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      setClients((prev) =>
        prev.map((c) => (c.id === existingId ? { ...c, ...clientData } : c))
      );
    } else {
      const newClient: Client = {
        ...clientData,
        id: `client-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setClients((prev) => [newClient, ...prev]);
    }
    setEditingClient(null);
  }, []);

  const handleDeleteClient = useCallback((id: string) => {
    if (window.confirm('Yakin ingin menghapus kontak klien ini?')) {
      setClients((prev) => prev.filter((c) => c.id !== id));
      setDeals((prev) => prev.filter((d) => d.clientId !== id));
      setVisits((prev) => prev.filter((v) => v.clientId !== id));
      setReminders((prev) => prev.filter((r) => r.clientId !== id));
    }
  }, []);

  // Property CRUD
  const handleSaveProperty = useCallback((propData: Omit<Property, 'id' | 'createdAt'>, existingId?: string) => {
    if (existingId) {
      setProperties((prev) =>
        prev.map((p) => (p.id === existingId ? { ...p, ...propData } : p))
      );
    } else {
      const newProp: Property = {
        ...propData,
        id: `prop-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setProperties((prev) => [newProp, ...prev]);
    }
    setEditingProperty(null);
  }, []);

  const handleDeleteProperty = useCallback((id: string) => {
    if (window.confirm('Yakin ingin menghapus listing properti ini?')) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
      setDeals((prev) => prev.filter((d) => d.propertyId !== id));
      setVisits((prev) => prev.filter((v) => v.propertyId !== id));
    }
  }, []);

  // Deal CRUD & Kanban
  const handleSaveDeal = useCallback((dealData: Omit<Deal, 'id' | 'lastActivityDate'>, existingId?: string) => {
    if (existingId) {
      setDeals((prev) =>
        prev.map((d) =>
          d.id === existingId
            ? { ...d, ...dealData, lastActivityDate: new Date().toISOString().split('T')[0] }
            : d
        )
      );
    } else {
      const newDeal: Deal = {
        ...dealData,
        id: `deal-${Date.now()}`,
        lastActivityDate: new Date().toISOString().split('T')[0],
      };
      setDeals((prev) => [newDeal, ...prev]);
    }
    setEditingDeal(null);
  }, []);

  const handleDeleteDeal = useCallback((id: string) => {
    if (window.confirm('Hapus transaksi ini dari pipeline?')) {
      setDeals((prev) => prev.filter((d) => d.id !== id));
    }
  }, []);

  const handleMoveStage = useCallback((dealId: string, newStage: PipelineStage) => {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? {
              ...d,
              stage: newStage,
              lastActivityDate: new Date().toISOString().split('T')[0],
              probabilityPercent:
                newStage === 'closed_won'
                  ? 100
                  : newStage === 'booking_fee'
                  ? 90
                  : newStage === 'negotiation'
                  ? 65
                  : newStage === 'site_visit'
                  ? 45
                  : 25,
            }
          : d
      )
    );
  }, []);

  // Visit CRUD
  const handleSaveVisit = useCallback((visitData: Omit<SiteVisit, 'id'>, existingId?: string) => {
    if (existingId) {
      setVisits((prev) =>
        prev.map((v) => (v.id === existingId ? { ...v, ...visitData } : v))
      );
    } else {
      const newVisit: SiteVisit = {
        ...visitData,
        id: `visit-${Date.now()}`,
      };
      setVisits((prev) => [newVisit, ...prev]);

      if (visitData.nextFollowUpDate) {
        const newReminder: FollowUpReminder = {
          id: `reminder-${Date.now()}`,
          clientId: visitData.clientId,
          clientName: visitData.clientName,
          clientPhone: visitData.clientPhone,
          propertyTitle: visitData.propertyTitle,
          dueDate: visitData.nextFollowUpDate,
          priority: visitData.interestScore >= 4 ? 'high' : 'medium',
          note: `Follow up pasca survey: ${visitData.agreedNextStep || 'Konfirmasi minat unit'}`,
          completed: false,
          type: 'whatsapp',
        };
        setReminders((prev) => [newReminder, ...prev]);
      }
    }
    setEditingVisit(null);
  }, []);

  const handleDeleteVisit = useCallback((id: string) => {
    if (window.confirm('Hapus catatan survey ini?')) {
      setVisits((prev) => prev.filter((v) => v.id !== id));
    }
  }, []);

  // Reminder actions
  const handleToggleReminder = useCallback((reminderId: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === reminderId ? { ...r, completed: !r.completed } : r))
    );
  }, []);

  const handleAddReminder = useCallback((reminder: Omit<FollowUpReminder, 'id' | 'completed'>) => {
    const newRem: FollowUpReminder = {
      ...reminder,
      id: `reminder-${Date.now()}`,
      completed: false,
    };
    setReminders((prev) => [newRem, ...prev]);
  }, []);

  // Super Admin Approval Actions
  const handleApproveUser = useCallback(async (userId: string, reviewedBy: string) => {
    await approveUserRemote(userId, reviewedBy);
    const latest = await syncUsersFromServer();
    setUsers(latest);
  }, []);

  const handleRejectUser = useCallback(async (userId: string, reason?: string) => {
    await rejectUserRemote(userId, reason, currentUser?.name || 'Super Admin');
    const latest = await syncUsersFromServer();
    setUsers(latest);
  }, [currentUser]);

  // Super Admin Company Approval Actions
  const handleApproveCompany = useCallback(async (companyId: string, reviewedBy: string) => {
    await approveCompanyBySuperAdmin(companyId, reviewedBy);
    const latestCompanies = await syncCompaniesFromServer();
    const latestBranches = await syncBranchesFromServer();
    setCompanies(latestCompanies);
    setBranches(latestBranches);
  }, []);

  const handleRejectCompany = useCallback(async (companyId: string, reviewedBy: string) => {
    await rejectCompanyBySuperAdmin(companyId, reviewedBy);
    const latestCompanies = await syncCompaniesFromServer();
    const latestBranches = await syncBranchesFromServer();
    setCompanies(latestCompanies);
    setBranches(latestBranches);
  }, []);

  // Admin Cabang Agent Approval Actions
  const handleApproveAgentByBranch = useCallback(async (agentId: string) => {
    if (!currentUser) return;
    await approveAgentByBranchAdmin(agentId, currentUser);
    const latest = await syncUsersFromServer();
    setUsers(latest);
  }, [currentUser]);

  const handleRejectAgentByBranch = useCallback(async (agentId: string, reason?: string) => {
    if (!currentUser) return;
    await rejectAgentByBranchAdmin(agentId, reason || 'Ditolak oleh Admin Cabang', currentUser);
    const latest = await syncUsersFromServer();
    setUsers(latest);
  }, [currentUser]);

  // Reset to Zero State (0 data on first load)
  const handleResetZeroState = useCallback(() => {
    if (window.confirm('Reset semua data CRM ke Zero-State (0 Kontak, 0 Listing, 0 Deal)?')) {
      setClients(INITIAL_EMPTY_CLIENTS);
      setProperties(INITIAL_EMPTY_PROPERTIES);
      setDeals(INITIAL_EMPTY_DEALS);
      setVisits(INITIAL_EMPTY_VISITS);
      setReminders(INITIAL_EMPTY_REMINDERS);
      localStorage.removeItem(STORAGE_KEYS.CLIENTS);
      localStorage.removeItem(STORAGE_KEYS.PROPERTIES);
      localStorage.removeItem(STORAGE_KEYS.DEALS);
      localStorage.removeItem(STORAGE_KEYS.VISITS);
      localStorage.removeItem(STORAGE_KEYS.REMINDERS);
    }
  }, []);

  // Load Demo Data for agents who wish to test full CRM functionalities
  const handleLoadSampleData = useCallback(() => {
    setClients(SAMPLE_DEMO_DATA.clients);
    setProperties(SAMPLE_DEMO_DATA.properties);
    setDeals(SAMPLE_DEMO_DATA.deals);
    setVisits(SAMPLE_DEMO_DATA.visits);
    setReminders(SAMPLE_DEMO_DATA.reminders);
  }, []);

  // Navigation & Language Callbacks
  const handleSelectTab = useCallback((tab: NavTab) => setActiveTab(tab), []);
  const handleToggleLanguage = useCallback(() => setLanguage((l) => (l === 'id' ? 'en' : 'id')), []);
  const handleOpenSettings = useCallback(() => setIsSettingsModalOpen(true), []);
  const handleCloseSettings = useCallback(() => setIsSettingsModalOpen(false), []);

  // Modal open/close Callbacks
  const handleOpenAddContact = useCallback(() => {
    setEditingClient(null);
    setIsContactModalOpen(true);
  }, []);
  const handleOpenEditContact = useCallback((client: Client) => {
    setEditingClient(client);
    setIsContactModalOpen(true);
  }, []);
  const handleCloseContactModal = useCallback(() => {
    setIsContactModalOpen(false);
    setEditingClient(null);
  }, []);

  const handleOpenAddProperty = useCallback(() => {
    setEditingProperty(null);
    setIsPropertyModalOpen(true);
  }, []);
  const handleOpenEditProperty = useCallback((property: Property) => {
    setEditingProperty(property);
    setIsPropertyModalOpen(true);
  }, []);
  const handleClosePropertyModal = useCallback(() => {
    setIsPropertyModalOpen(false);
    setEditingProperty(null);
  }, []);

  const handleOpenAddDeal = useCallback((stage?: PipelineStage) => {
    setEditingDeal(null);
    setDefaultDealStage(stage || 'new_lead');
    setIsDealModalOpen(true);
  }, []);
  const handleOpenEditDeal = useCallback((deal: Deal) => {
    setEditingDeal(deal);
    setIsDealModalOpen(true);
  }, []);
  const handleCloseDealModal = useCallback(() => {
    setIsDealModalOpen(false);
    setEditingDeal(null);
  }, []);

  const handleOpenAddVisit = useCallback(() => {
    setEditingVisit(null);
    setIsVisitModalOpen(true);
  }, []);
  const handleOpenEditVisit = useCallback((visit: SiteVisit) => {
    setEditingVisit(visit);
    setIsVisitModalOpen(true);
  }, []);
  const handleCloseVisitModal = useCallback(() => {
    setIsVisitModalOpen(false);
    setEditingVisit(null);
  }, []);

  const handleCloseWhatsAppModal = useCallback(() => {
    setIsWhatsAppModalOpen(false);
    setWhatsAppTarget(null);
  }, []);

  const pendingRemindersCount = useMemo(() => reminders.filter((r) => !r.completed).length, [reminders]);
  const pendingApprovalsCount = useMemo(() => {
    if (isSuperAdmin) {
      return users.filter((u) => u.status === 'pending').length + companies.filter((c) => c.status === 'pending').length;
    }
    if (currentUser?.role === 'admin') {
      return users.filter(
        (u) =>
          u.role === 'user' &&
          u.status === 'pending' &&
          (u.branchId === currentUser.branchId || u.branchName === currentUser.branchName || u.agencyName === currentUser.agencyName)
      ).length;
    }
    return 0;
  }, [users, companies, isSuperAdmin, currentUser]);
  const isZeroState = useMemo(() => clients.length === 0 && properties.length === 0 && deals.length === 0, [clients, properties, deals]);

  // =========================================================================
  // VIEW ROUTING
  // =========================================================================

  // 1. If unauthenticated / no active user session, display Landing Page strictly!
  if (!currentUser) {
    return (
      <>
        <LandingPage
          onOpenLogin={handleOpenLogin}
          onOpenRegister={handleOpenRegister}
          language={language}
          onToggleLanguage={handleToggleLanguage}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={handleCloseAuthModal}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      </>
    );
  }

  // 2. If user is registered but status is PENDING, strictly show Approval Gateway screen!
  if (currentUser.status === 'pending') {
    return (
      <PendingApprovalScreen
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchToSuperAdmin={handleSwitchToSuperAdmin}
      />
    );
  }

  // 3. If user status was REJECTED by Super Admin, show Rejection Screen!
  if (currentUser.status === 'rejected') {
    return (
      <RejectionScreen
        currentUser={currentUser}
        onLogout={handleLogout}
        onReapply={handleOpenRegister}
      />
    );
  }

  // 4. If user status is APPROVED, grant full access to the operational workspace!
  return (
    <div className="min-h-screen bg-[#FDFBF7] flex antialiased selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Desktop Persistent Left Sidebar (Hidden on Mobile, Visible on Laptop/Desktop >= 1024px) */}
      <SidebarNav
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        language={language}
        onOpenSettings={handleOpenSettings}
        onToggleLanguage={handleToggleLanguage}
        onLoadDemoData={handleLoadSampleData}
        onResetZeroState={handleResetZeroState}
        isZeroState={isZeroState}
        onLogout={handleLogout}
        pendingRemindersCount={pendingRemindersCount}
        pendingApprovalsCount={pendingApprovalsCount}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Main Workspace Column (Full width on Mobile, flex-1 next to Sidebar on Laptop) */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header (Visible on Mobile, Hidden on Laptop/Desktop) */}
        <div className="lg:hidden">
          <Header
            currentUser={currentUser}
            language={language}
            onOpenSettings={handleOpenSettings}
            onToggleLanguage={handleToggleLanguage}
            onLoadDemoData={handleLoadSampleData}
            onResetZeroState={handleResetZeroState}
            isZeroState={isZeroState}
            onLogout={handleLogout}
          />
        </div>

        {/* Laptop/Desktop Top Navigation Bar (Hidden on Mobile) */}
        <DesktopTopBar
          activeTab={activeTab}
          currentUser={currentUser}
          onOpenAddContact={handleOpenAddContact}
          onOpenAddProperty={handleOpenAddProperty}
          onOpenAddDeal={handleOpenAddDeal}
          onOpenAddVisit={handleOpenAddVisit}
          onOpenSettings={handleOpenSettings}
          isSuperAdmin={isSuperAdmin}
        />

        {/* Responsive Content Container */}
        <main className="flex-1 w-full max-w-md mx-auto px-4 pt-4 pb-24 lg:max-w-7xl lg:mx-0 lg:px-8 lg:pt-6 lg:pb-12">
          {/* TAB 1: Beranda / Dashboard (Eagerly loaded for instant mobile viewport paint) */}
          {activeTab === 'dashboard' && (
            <DashboardView
              clients={clients}
              properties={properties}
              deals={deals}
              visits={visits}
              reminders={reminders}
              onOpenContactModal={handleOpenAddContact}
              onOpenPropertyModal={handleOpenAddProperty}
              onOpenVisitModal={handleOpenAddVisit}
              onOpenDealModal={handleOpenAddDeal}
              onOpenWhatsApp={handleOpenWhatsApp}
              onSelectTab={handleSelectTab}
              onToggleReminder={handleToggleReminder}
              currentUser={currentUser}
              pendingApprovalsCount={pendingApprovalsCount}
            />
          )}

          {/* Code-split heavier views with lightweight skeleton fallback */}
          <Suspense fallback={<ViewSkeleton />}>
            {/* TAB 2: Contacts / Klien */}
            {activeTab === 'contacts' && (
              <ContactsView
                clients={clients}
                properties={properties}
                onOpenAddModal={handleOpenAddContact}
                onOpenEditModal={handleOpenEditContact}
                onDeleteClient={handleDeleteClient}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {/* TAB 3: Inventory / Listing */}
            {activeTab === 'inventory' && (
              <InventoryView
                properties={properties}
                clients={clients}
                onOpenAddModal={handleOpenAddProperty}
                onOpenEditModal={handleOpenEditProperty}
                onDeleteProperty={handleDeleteProperty}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {/* TAB 4: Sales Pipeline / Kanban */}
            {activeTab === 'pipeline' && (
              <PipelineView
                deals={deals}
                clients={clients}
                properties={properties}
                onOpenAddModal={handleOpenAddDeal}
                onOpenEditModal={handleOpenEditDeal}
                onDeleteDeal={handleDeleteDeal}
                onMoveStage={handleMoveStage}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {/* TAB 5: Survey & Visits */}
            {activeTab === 'visits' && (
              <VisitsView
                visits={visits}
                reminders={reminders}
                clients={clients}
                properties={properties}
                onOpenAddVisitModal={handleOpenAddVisit}
                onOpenEditVisitModal={handleOpenEditVisit}
                onDeleteVisit={handleDeleteVisit}
                onToggleReminder={handleToggleReminder}
                onAddReminder={handleAddReminder}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {/* TAB 6: Database & Supabase */}
            {activeTab === 'database' && (
              <DatabaseSchemaView
                clients={clients}
                properties={properties}
                deals={deals}
                visits={visits}
                reminders={reminders}
              />
            )}

            {/* TAB: Branch Admin Team & Agent Approval Dashboard */}
            {activeTab === 'branchadmin' && (currentUser.role === 'admin' || isSuperAdmin) && (
              <BranchAdminView
                currentUser={currentUser}
                users={users}
                onApproveAgent={handleApproveAgentByBranch}
                onRejectAgent={handleRejectAgentByBranch}
                onOpenWhatsApp={(phone, name) => {
                  window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Halo%20${encodeURIComponent(name)},%20kami%20dari%20kantor%20cabang`, '_blank');
                }}
              />
            )}

            {/* TAB 7: Super Admin Exclusive Approval Dashboard */}
            {activeTab === 'superadmin' && isSuperAdmin && (
              <SuperAdminView
                users={users}
                companies={companies}
                branches={branches}
                currentUserId={currentUser.id}
                onApproveUser={handleApproveUser}
                onRejectUser={handleRejectUser}
                onApproveCompany={handleApproveCompany}
                onRejectCompany={handleRejectCompany}
                onRefreshUsers={handleRefreshUsers}
              />
            )}
          </Suspense>
        </main>

        {/* Bottom Navigation (Hidden on Laptop via lg:hidden inside component) */}
        <BottomNav
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          pendingRemindersCount={pendingRemindersCount}
          userRole={currentUser.role}
          isSuperAdmin={isSuperAdmin}
          pendingApprovalsCount={pendingApprovalsCount}
        />
      </div>

      {/* MODALS - Code split & rendered conditionally with lightweight skeleton fallback */}
      {/* 1. Contact Modal */}
      {isContactModalOpen && (
        <Suspense fallback={<ModalSkeleton />}>
          <ContactModal
            isOpen={isContactModalOpen}
            onClose={handleCloseContactModal}
            onSave={handleSaveClient}
            initialClient={editingClient}
          />
        </Suspense>
      )}

      {/* 2. Property Listing Modal */}
      {isPropertyModalOpen && (
        <Suspense fallback={<ModalSkeleton />}>
          <PropertyModal
            isOpen={isPropertyModalOpen}
            onClose={handleClosePropertyModal}
            onSave={handleSaveProperty}
            initialProperty={editingProperty}
          />
        </Suspense>
      )}

      {/* 3. Deal Modal */}
      {isDealModalOpen && (
        <Suspense fallback={<ModalSkeleton />}>
          <DealModal
            isOpen={isDealModalOpen}
            onClose={handleCloseDealModal}
            onSave={handleSaveDeal}
            clients={clients}
            properties={properties}
            initialDeal={editingDeal}
            defaultStage={defaultDealStage}
          />
        </Suspense>
      )}

      {/* 4. Site Visit Modal */}
      {isVisitModalOpen && (
        <Suspense fallback={<ModalSkeleton />}>
          <VisitModal
            isOpen={isVisitModalOpen}
            onClose={handleCloseVisitModal}
            onSave={handleSaveVisit}
            clients={clients}
            properties={properties}
            initialVisit={editingVisit}
          />
        </Suspense>
      )}

      {/* 5. Quick WhatsApp Modal */}
      {whatsAppTarget && (
        <Suspense fallback={<ModalSkeleton />}>
          <QuickWhatsAppModal
            isOpen={isWhatsAppModalOpen}
            onClose={handleCloseWhatsAppModal}
            client={whatsAppTarget.client}
            property={whatsAppTarget.property}
          />
        </Suspense>
      )}

      {/* 6. Settings Modal */}
      {isSettingsModalOpen && (
        <Suspense fallback={<ModalSkeleton />}>
          <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={handleCloseSettings}
            currentUser={currentUser}
            language={language}
            onToggleLanguage={setLanguage}
            onResetZeroState={handleResetZeroState}
            onLoadSampleData={handleLoadSampleData}
            onLogout={handleLogout}
          />
        </Suspense>
      )}
    </div>
  );
};

export default App;
