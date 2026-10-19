import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MedicineBatchRecord } from '../types';
import {
  Boxes,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Building2,
  FileText,
  Calendar,
  CheckCircle2,
  X,
  History,
  QrCode,
  ShieldCheck,
  Tag,
  ArrowRight,
} from 'lucide-react';

export const BatchesView: React.FC = () => {
  const { batches, documents, setActiveView } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [expiryFilter, setExpiryFilter] = useState<string>('ALL');
  const [selectedBatch, setSelectedBatch] = useState<MedicineBatchRecord | null>(null);

  const now = new Date();

  // Helper to categorize expiry
  const getExpiryDetails = (expiryDateStr: string) => {
    const exp = new Date(expiryDateStr);
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return { status: 'EXPIRED', days: diffDays, label: `Expired (${Math.abs(diffDays)}d ago)`, color: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
    if (diffDays <= 30) {
      return { status: 'CRITICAL_30', days: diffDays, label: `Expiring Soon (${diffDays}d)`, color: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
    if (diffDays <= 60) {
      return { status: 'SOON_60', days: diffDays, label: `Expiring Soon (${diffDays}d)`, color: 'bg-amber-100 text-amber-800 border-amber-300' };
    }
    if (diffDays <= 90) {
      return { status: 'SOON_90', days: diffDays, label: `Expiring in ${diffDays}d`, color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { status: 'VALID', days: diffDays, label: `Valid (${diffDays}d)`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const filteredBatches = batches.filter((b) => {
    const expiryDate = new Date(b.expiryDate);
    if (
      b.currentStockQuantity <= 0 ||
      b.status === 'Expired' ||
      b.status === 'Quarantined' ||
      Number.isNaN(expiryDate.getTime()) ||
      expiryDate <= now
    ) {
      return false;
    }

    const matchesSearch =
      b.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.supplierLegalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.manufacturerName.toLowerCase().includes(searchTerm.toLowerCase());

    const { days } = getExpiryDetails(b.expiryDate);

    let matchesExpiry = true;
    if (expiryFilter === 'EXPIRING_90') matchesExpiry = days > 0 && days <= 90;
    if (expiryFilter === 'EXPIRING_60') matchesExpiry = days > 0 && days <= 60;
    if (expiryFilter === 'EXPIRING_30') matchesExpiry = days > 0 && days <= 30;
    if (expiryFilter === 'VALID') matchesExpiry = days > 90;

    return matchesSearch && matchesExpiry;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Sell medicines
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Only in-stock medicines that have not expired appear here.
          </p>
        </div>

        <button
          onClick={() => setActiveView('traceability')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Scan GS1 Barcode</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by medicine name, batch number, manufacturer, or supplier..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="ALL">All available medicines</option>
              <option value="EXPIRING_30">Expires within 30 days</option>
              <option value="EXPIRING_60">Expires within 60 days</option>
              <option value="EXPIRING_90">Expires within 90 days</option>
              <option value="VALID">Expires after 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Batches Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-3 px-4">Medicine & Formulation</th>
                <th className="py-3 px-4">Batch Code</th>
                <th className="py-3 px-4">Manufacturer</th>
                <th className="py-3 px-4">Dates (Mfg / Exp)</th>
                <th className="py-3 px-4 text-right">In Stock</th>
                <th className="py-3 px-4">Supplier Inward</th>
                <th className="py-3 px-4">Expiry Status</th>
                <th className="py-3 px-4 text-right">Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No unexpired medicines are available for sale.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((b) => {
                  const expiryInfo = getExpiryDetails(b.expiryDate);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{b.medicineName}</div>
                        <div className="text-[11px] text-slate-500 font-normal">
                          {b.strength} &bull; {b.dosageForm}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {b.batchNumber}
                      </td>

                      <td className="py-3 px-4 text-slate-700">
                        {b.manufacturerName}
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px]">
                        <span className="text-slate-400 text-[10px] block">
                          Mfg: {b.manufacturingDate}
                        </span>
                        <span className="font-semibold text-slate-800">
                          Exp: {b.expiryDate}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                        {b.currentStockQuantity} units
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800 truncate max-w-[170px]">
                          {b.supplierLegalName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Inv #{b.sourceInvoiceNumber}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${expiryInfo.color}`}
                        >
                          {expiryInfo.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedBatch(b)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          Trace History
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Batch Provenance Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Batch Provenance & Lifecycle Traceability
                </h3>
              </div>
              <button
                onClick={() => setSelectedBatch(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Batch Banner */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    Pharmaceutical Batch Identification
                  </span>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    {selectedBatch.batchNumber}
                  </div>
                  <div className="text-xs text-slate-700 font-medium">
                    {selectedBatch.medicineName} ({selectedBatch.strength}) &bull; {selectedBatch.dosageForm}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Current Balance
                  </span>
                  <span className="text-base font-bold font-mono text-slate-900">
                    {selectedBatch.currentStockQuantity} units
                  </span>
                </div>
              </div>

              {/* Provenance Milestone Timeline */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Regulatory Supply Chain Timeline
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {/* Step 1: Manufacturing Release */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white flex items-center justify-center text-white text-[9px] font-bold">
                      1
                    </div>
                    <div className="text-xs font-semibold text-slate-900">
                      Manufacturer Formulation & Batch Release
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Manufactured by <strong>{selectedBatch.manufacturerName}</strong> on {selectedBatch.manufacturingDate}. Formulated under CDSCO GMP certification. Expiry fixed at {selectedBatch.expiryDate}.
                    </p>
                  </div>

                  {/* Step 2: Wholesale Inward Dispatch */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-white flex items-center justify-center text-white text-[9px] font-bold">
                      2
                    </div>
                    <div className="text-xs font-semibold text-slate-900">
                      Wholesale Inward Dispatch & Tax Invoice Generation
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Supplied by <strong>{selectedBatch.supplierLegalName}</strong> (GSTIN: {selectedBatch.supplierGstin}). Recorded under Tax Invoice #{selectedBatch.sourceInvoiceNumber}.
                    </p>
                  </div>

                  {/* Step 3: Facility Receipt & Inward OCR Ingestion */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-600 ring-4 ring-white flex items-center justify-center text-white text-[9px] font-bold">
                      3
                    </div>
                    <div className="text-xs font-semibold text-slate-900">
                      Inward Verification & Inventory Ledger Entry
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Received on {selectedBatch.createdAt.split('T')[0]}. Line items extracted and checked for mathematical accuracy. Committed into dispensing inventory.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/70 flex justify-end">
              <button
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Close Provenance View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
