import React, { useMemo } from 'react';
import { 
  Home, 
  Users, 
  Building2, 
  TrendingUp, 
  CalendarCheck, 
  Database,
  ShieldCheck 
} from 'lucide-react';
import { UserRole } from '../types/crm';

export type NavTab = 'dashboard' | 'contacts' | 'inventory' | 'pipeline' | 'visits' | 'database' | 'superadmin';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingRemindersCount?: number;
  userRole: UserRole;
  pendingApprovalsCount?: number;
  isSuperAdmin?: boolean;
}

const BottomNavComponent: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  pendingRemindersCount = 0,
  userRole,
  pendingApprovalsCount = 0,
  isSuperAdmin = false,
}) => {
  const tabs = useMemo(() => {
    if (isSuperAdmin) {
      return [
        { id: 'superadmin' as NavTab, label: 'Approval', icon: ShieldCheck, badge: pendingApprovalsCount },
        { id: 'dashboard' as NavTab, label: 'Beranda', icon: Home },
        { id: 'contacts' as NavTab, label: 'Kontak', icon: Users },
        { id: 'pipeline' as NavTab, label: 'Pipeline', icon: TrendingUp },
        { id: 'inventory' as NavTab, label: 'Listing', icon: Building2 },
        { id: 'database' as NavTab, label: 'Database', icon: Database },
      ];
    }
    return [
      { id: 'dashboard' as NavTab, label: 'Beranda', icon: Home },
      { id: 'contacts' as NavTab, label: 'Kontak', icon: Users },
      { id: 'pipeline' as NavTab, label: 'Pipeline', icon: TrendingUp },
      { id: 'inventory' as NavTab, label: 'Listing', icon: Building2 },
      { id: 'visits' as NavTab, label: 'Survey', icon: CalendarCheck, badge: pendingRemindersCount },
      { id: 'database' as NavTab, label: 'Database', icon: Database },
    ];
  }, [isSuperAdmin, pendingRemindersCount, pendingApprovalsCount]);

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/80 shadow-md">
      <div className="max-w-md mx-auto grid grid-cols-6 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-colors relative group ${
                isActive ? 'text-emerald-700 font-bold' : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-emerald-700 stroke-[2.4]' : 'group-hover:scale-105'
                  }`}
                />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white font-mono text-[9px] font-bold flex items-center justify-center ring-2 ring-white">
                    {tab.badge}
                  </span>
                ) : null}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 truncate ${
                  isActive ? 'text-stone-900 font-semibold' : 'text-stone-500'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export const BottomNav = React.memo(BottomNavComponent);
export default BottomNav;
