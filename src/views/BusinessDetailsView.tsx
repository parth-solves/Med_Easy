import React from 'react';
import { useApp } from '../context/AppContext';
import { Building2, ShieldCheck } from 'lucide-react';

export const BusinessDetailsView: React.FC = () => {
  const { currentBusiness, licences } = useApp();

  if (!currentBusiness) {
    return (
      <section className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <Building2 className="mx-auto h-8 w-8 text-slate-400" />
        <h1 className="mt-3 text-xl font-bold text-slate-900">No business details</h1>
        <p className="mt-2 text-sm text-slate-600">
          This account is not linked to a medicine business.
        </p>
      </section>
    );
  }

  const licence = licences.find((item) => item.businessId === currentBusiness.id);

  const detailRows = [
    ['Business name', currentBusiness.tradeName],
    ['Registered name', currentBusiness.legalName],
    ['Business type', currentBusiness.businessType],
    ['GST number', currentBusiness.gstin],
    ['Drug licence number', currentBusiness.drugLicenceNumber],
    ['Licence expiry', currentBusiness.licenceExpiryDate],
    ['Contact person', currentBusiness.contactPerson],
    ['Email', currentBusiness.contactEmail],
    ['Phone', currentBusiness.contactPhone],
    [
      'Address',
      `${currentBusiness.addressLine}, ${currentBusiness.city}, ${currentBusiness.state} ${currentBusiness.pincode}`,
    ],
  ];

  return (
    <section className="mx-auto max-w-3xl space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">Account</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Business details</h1>
        <p className="mt-1 text-sm text-slate-600">
          Your business and licence information, kept here when you need it.
        </p>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 p-5">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-bold text-slate-900">{currentBusiness.tradeName}</h2>
            <p className="text-xs text-slate-500">{currentBusiness.businessType}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              currentBusiness.verificationStatus === 'Verified'
                ? 'bg-emerald-50 text-emerald-700'
                : currentBusiness.verificationStatus === 'Pending'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-rose-50 text-rose-700'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {currentBusiness.verificationStatus === 'Verified'
              ? 'Checked'
              : currentBusiness.verificationStatus === 'Pending'
                ? 'Being checked'
                : currentBusiness.verificationStatus}
          </span>
        </div>

        <dl className="divide-y divide-slate-100 px-5">
          {detailRows.map(([label, value]) => (
            <div key={label} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="break-words text-sm font-medium text-slate-900">{value}</dd>
            </div>
          ))}
          {licence && (
            <div className="grid gap-1 py-3 sm:grid-cols-[180px_1fr] sm:gap-4">
              <dt className="text-xs text-slate-500">Licence check</dt>
              <dd className="text-sm font-medium text-slate-900">
                {licence.status === 'Verified' ? 'Checked' : licence.status}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </section>
  );
};
