import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPinned,
  ShoppingBag,
  Store,
  Building2,
} from 'lucide-react';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  badgeColor?: string;
};

export const Sidebar: React.FC = () => {
  const { activeView, setActiveView } = useApp();

  const menuItems: MenuItem[] = [
    {
      id: 'dashboard', label: 'India marketplace', icon: MapPinned,
    },
    {
      id: 'buy', label: 'Buy medicines', icon: ShoppingBag,
    },
    {
      id: 'sell', label: 'Sell medicines', icon: Store,
    },
    {
      id: 'business', label: 'My business', icon: Building2,
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white text-slate-700 min-h-[calc(100vh-4rem)] flex flex-col">
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-all ${
                isActive
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`rounded-md p-1.5 ${
                    isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="text-sm font-semibold">{item.label}</div>
              </div>
              {item.badge && (
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3 text-center text-[10px] text-slate-400">
        Demo listings across India
      </div>
    </aside>
  );
};
