import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Building2, CheckCircle2, Clock, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';

export const VerificationPendingView: React.FC = () => {
  const {
    currentBusiness,
    licences,
    verificationChecks,
    logout,
    setActiveView,
    simulateGstCheck,
    simulateLicenceCheck,
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const licence = licences.find((item) => item.businessId === currentBusiness?.id);
  const gstCheck = verificationChecks.find(
    (item) => item.businessId === currentBusiness?.id && item.checkType === 'GSTIN_PORTAL'
  );

  const handleRefresh = async () => {
    if (!currentBusiness) return;
    setIsRefreshing(true);
    setMessage(null);
    try {
      await simulateGstCheck(currentBusiness.gstin);
      await simulateLicenceCheck(
        currentBusiness.drugLicenceNumber,
        currentBusiness.issuingAuthority
      );
      setMessage('Checks refreshed.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const checkRows = [
    {
      label: 'Business tax number',
      status: gstCheck?.status === 'Verified' ? 'Checked' : 'Being checked',
    },
    {
      label: 'Medicine selling licence',
      status: licence?.status === 'Verified' ? 'Checked' : 'Being checked',
    },
  ];

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="rounded-xl bg-amber-100 p-3 text-amber-700">
            <Clock className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">We are checking your business</h1>
            <p className="mt-2 text-sm text-slate-700">
              We check your tax number and medicine licence before you can trade. You can use the app when these checks are done.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing || !currentBusiness}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Checking...' : 'Check again'}
              </button>
              <button
                onClick={() => setActiveView('business')}
                className="inline-flex items-center gap-2 rounded-lg border border-amber-300 px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
              >
                <Building2 className="h-4 w-4" />
                View business details
              </button>
            </div>
            {message && <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p>}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">What is being checked?</h2>
        </div>
        <div className="mt-4 divide-y divide-slate-100">
          {checkRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3 py-3">
              <span className="text-sm text-slate-700">{row.label}</span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {row.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={logout}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </button>
    </section>
  );
};
