import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { RegulatoryBanner } from './components/layout/RegulatoryBanner';
import { AuthView } from './views/AuthView';
import { VerificationPendingView } from './views/VerificationPendingView';
import { BusinessDetailsView } from './views/BusinessDetailsView';
import { MarketplaceView } from './views/MarketplaceView';

const MainContent: React.FC = () => {
  const { activeView, currentUser, currentBusiness, setActiveView } = useApp();

  // If unauthenticated, show AuthView
  if (!currentUser || activeView === 'login' || activeView === 'register') {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
        <AuthView />
      </div>
    );
  }

  // If business verification is pending and activeView is 'pending'
  if (activeView === 'pending') {
    return (
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto">
          <VerificationPendingView />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="max-w-7xl mx-auto">
        {/* If user is inside a pending business, show a polite persistent notice */}
        {currentBusiness && currentBusiness.verificationStatus === 'Pending' && activeView !== 'pending' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <span>
              <strong>Business checks are still in progress.</strong> Some buying and selling actions will stay paused until they are complete.
            </span>
            <button
              onClick={() => setActiveView('pending')}
              className="text-amber-900 font-bold underline shrink-0 ml-2"
            >
              View status
            </button>
          </div>
        )}

        {['dashboard', 'buy', 'sell'].includes(activeView) && <MarketplaceView />}
        {activeView === 'business' && <BusinessDetailsView />}
      </div>
    </div>
  );
};

const AppShell: React.FC = () => {
  const { currentUser, activeView } = useApp();
  const isAuthScreen = !currentUser || activeView === 'login' || activeView === 'register';

  if (isAuthScreen) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        <AuthView />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased">
      <RegulatoryBanner />
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
