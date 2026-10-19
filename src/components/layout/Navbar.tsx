import React from 'react';
import { useApp } from '../../context/AppContext';
import { LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, logout, setActiveView } = useApp();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-3 text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg font-black text-white">
            M
          </span>
          <span>
            <span className="block text-lg font-black tracking-tight text-slate-900">MedEasy</span>
            <span className="hidden text-xs text-slate-500 sm:block">Medicine buying and selling</span>
          </span>
        </button>

        <div className="flex items-center gap-3">
          {currentUser && (
            <div className="hidden text-right sm:block">
              <div className="text-sm font-semibold text-slate-900">{currentUser.fullName}</div>
              <div className="text-xs text-slate-500">{currentUser.role.replace(/_/g, ' ')}</div>
            </div>
          )}
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};
