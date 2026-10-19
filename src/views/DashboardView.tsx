import React from 'react';
import { useApp } from '../context/AppContext';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  CircleDollarSign,
  PackageCheck,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react';

type StatCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
  tone: string;
};

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, note, tone }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <div className={`rounded-lg p-2 ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <div className="mt-3 text-2xl font-bold text-slate-900">{value}</div>
    <p className="mt-1 text-[11px] text-slate-500">{note}</p>
  </div>
);

export const DashboardView: React.FC = () => {
  const { currentUser, documents, batches, setActiveView } = useApp();

  const now = new Date();
  const sellableBatches = batches.filter(
    (batch) => {
      const expiry = new Date(batch.expiryDate);
      return (
        batch.currentStockQuantity > 0 &&
        batch.status !== 'Expired' &&
        batch.status !== 'Quarantined' &&
        !Number.isNaN(expiry.getTime()) &&
        expiry > now
      );
    }
  );
  const approvedInvoices = documents.filter((d) => d.status === 'Approved').length;
  const pendingInvoices = documents.filter(
    (d) => d.status === 'Extracted' || d.status === 'Pending Review'
  ).length;
  const flaggedInvoices = documents.filter((d) => d.status === 'Flagged').length;

  const expiringSoon = sellableBatches.filter((batch) => {
    const exp = new Date(batch.expiryDate);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 90;
  }).length;

  const totalUnits = sellableBatches.reduce((sum, batch) => sum + batch.currentStockQuantity, 0);

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 p-5 text-white shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              Welcome {currentUser?.fullName || 'Medicines Team'}
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
              Easy medicine buying and selling
            </h1>
            <p className="mt-2 max-w-xl text-sm text-emerald-50">
              Buy stock, sell safely, and keep every legal check simple. GST, licence, batch, and expiry checks happen in the background.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveView('invoices')}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              <ShoppingCart className="h-4 w-4" />
              Buy medicines
            </button>
            <button
              onClick={() => setActiveView('batches')}
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <Truck className="h-4 w-4" />
              Sell from stock
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ShoppingCart}
          label="Buy today"
          value={`${documents.length}`}
          note="Supplier invoices in the system"
          tone="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          icon={CircleDollarSign}
          label="Approved"
          value={`${approvedInvoices}`}
          note="Invoices cleared for purchase"
          tone="bg-blue-100 text-blue-700"
        />
        <StatCard
          icon={Boxes}
          label="Stock units"
          value={`${totalUnits}`}
          note="Items ready in medicine stock"
          tone="bg-violet-100 text-violet-700"
        />
        <StatCard
          icon={ShieldCheck}
          label="Safety alerts"
          value={`${expiringSoon}`}
          note="In-stock medicines nearing expiry"
          tone="bg-amber-100 text-amber-700"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Quick actions
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">Simple trading flow</h2>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-5 space-y-3">
            <button
              onClick={() => setActiveView('invoices')}
              className="flex w-full items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-100"
            >
              <div>
                <div className="text-sm font-bold text-slate-900">Buy medicines</div>
                <div className="text-xs text-slate-600">Check supplier invoices and accept stock only after review</div>
              </div>
              <ShoppingCart className="h-5 w-5 text-emerald-700" />
            </button>

            <button
              onClick={() => setActiveView('batches')}
              className="flex w-full items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-100"
            >
              <div>
                <div className="text-sm font-bold text-slate-900">Sell medicines</div>
                <div className="text-xs text-slate-600">Issue stock with expiry check and batch traceability</div>
              </div>
              <Truck className="h-5 w-5 text-blue-700" />
            </button>

            <button
              onClick={() => setActiveView('review')}
              className="flex w-full items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left transition hover:border-amber-300 hover:bg-amber-100"
            >
              <div>
                <div className="text-sm font-bold text-slate-900">Safety and compliance</div>
                <div className="text-xs text-slate-600">Expired or risky stock is paused before any sale</div>
              </div>
              <ShieldCheck className="h-5 w-5 text-amber-700" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-900">Plain English compliance</h2>
          </div>

          <ul className="mt-5 space-y-3 text-sm text-slate-600">
            <li className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
              GST and drug licence are checked before a purchase is accepted.
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
              Each batch is checked for expiry before it reaches the customer.
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
              If something looks wrong, the item is flagged and stopped from quick sale.
            </li>
            <li className="flex gap-3">
              <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-500" />
              Approved medicine movement is always traceable to reduce risk.
            </li>
          </ul>

        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Live stock</p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">Medicine stock ready to sell</h2>
          </div>
          <button
            onClick={() => setActiveView('batches')}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-700"
          >
            Open stock register
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-3 py-3 font-semibold">Medicine</th>
                <th className="px-3 py-3 font-semibold">Batch</th>
                <th className="px-3 py-3 font-semibold">Expiry</th>
                <th className="px-3 py-3 text-right font-semibold">Units</th>
                <th className="px-3 py-3 font-semibold">Supplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sellableBatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-slate-500">
                    No unexpired stock is available. Buy and check new stock to get started.
                  </td>
                </tr>
              ) : sellableBatches.slice(0, 5).map((batch) => {
                const exp = new Date(batch.expiryDate);
                const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const expiryClass =
                  diffDays <= 0
                    ? 'text-red-700'
                    : diffDays <= 90
                    ? 'text-amber-700'
                    : 'text-emerald-700';

                return (
                  <tr key={batch.id} className="hover:bg-slate-50">
                    <td className="px-3 py-3">
                      <div className="font-bold text-slate-900">{batch.medicineName}</div>
                      <div className="text-xs text-slate-500">{batch.dosageForm}</div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-slate-700">{batch.batchNumber}</td>
                    <td className={`px-3 py-3 font-mono text-xs font-semibold ${expiryClass}`}>
                      {batch.expiryDate}
                    </td>
                    <td className="px-3 py-3 text-right font-bold text-slate-900">{batch.currentStockQuantity}</td>
                    <td className="px-3 py-3 text-xs text-slate-600">{batch.supplierLegalName}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {(pendingInvoices > 0 || flaggedInvoices > 0) && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
            <div>
              <div className="font-bold">Needs attention before doing business</div>
              <div className="mt-1">
                {pendingInvoices > 0 && `${pendingInvoices} invoice(s) waiting for review.`}{' '}
                {flaggedInvoices > 0 && `${flaggedInvoices} invoice(s) flagged for checks.`}{' '}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <PackageCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-bold">Stock count</span>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">{sellableBatches.length}</div>
          <div className="text-xs text-slate-500">Unexpired medicine types ready to sell</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold">Expiry watch</span>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">{expiringSoon}</div>
          <div className="text-xs text-slate-500">Items shipping out soon in the 90-day warning window</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-slate-900">
            <Boxes className="h-4 w-4 text-violet-600" />
            <span className="text-sm font-bold">Buy-sell flow</span>
          </div>
          <div className="mt-3 text-2xl font-black text-slate-900">{approvedInvoices}</div>
          <div className="text-xs text-slate-500">Fully cleared entries ready for next business move</div>
        </div>
      </section>
    </div>
  );
};
