import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/ui/Badge';
import {
  QrCode,
  Search,
  Pill,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  History,
  FileText,
  AlertCircle,
  Camera,
} from 'lucide-react';

export const TraceabilityView: React.FC = () => {
  const { batches, documents, qrScans, processQrScan, setActiveView } = useApp();

  const [inputPayload, setInputPayload] = useState('01089011482910291726022810CRD240921991823');
  const [activeScan, setActiveScan] = useState(qrScans[0] || null);

  const presets = [
    {
      label: 'GS1 DataMatrix: Cardipril 5mg (CRD2409)',
      payload: '01089011482910291726022810CRD240921991823',
      description: 'AI 01 GTIN, AI 17 Expiry 2026-02-28, AI 10 Batch CRD2409',
      badge: 'Valid Inward',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'GS1 DataMatrix: Expired AmoxiClav 625 (AMX2201)',
      payload: '01089022561928311723123110AMX220121102948',
      description: 'AI 17 Expiry 2023-12-31 (Past Date) &bull; Quarantined',
      badge: 'Expired Batch Alert',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    {
      label: 'GS1 DataMatrix: Unregistered Lot (UNKNOWN771)',
      payload: '01089099999999991727010110UNKNOWN77121000001',
      description: 'Non-inventory batch code testing external supplier check',
      badge: 'Unregistered Batch',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      label: 'Direct Batch Code (Linear 1D Barcode): PNT2412',
      payload: 'PNT2412',
      description: 'PantoMed 40 Gastro &bull; Cipla Lifecare Labs',
      badge: 'Linear 1D Barcode',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
  ];

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPayload.trim()) return;
    const scanResult = processQrScan(inputPayload.trim());
    setActiveScan(scanResult);
  };

  const handleSelectPreset = (payload: string) => {
    setInputPayload(payload);
    const scanResult = processQrScan(payload);
    setActiveScan(scanResult);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Pharmaceutical Batch Traceability & GS1 Scanner
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify 2D GS1 DataMatrix barcodes and linear 1D codes against inward tax invoice registers and manufacturer release logs.
        </p>
      </div>

      {/* Barcode / GS1 Scanner Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <Camera className="w-4 h-4 text-blue-600" />
          <span>GS1 DataMatrix Scanner & Manual Payload Input</span>
        </h2>

        {/* Form */}
        <form onSubmit={handleScanSubmit} className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <QrCode className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={inputPayload}
              onChange={(e) => setInputPayload(e.target.value)}
              placeholder="Paste raw GS1 DataMatrix string (e.g. 01089011482910291726022810CRD2409...) or batch number..."
              className="w-full pl-9 pr-3 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Parse & Verify Batch</span>
          </button>
        </form>

        {/* 1-Click Test Presets */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <span className="text-[11px] font-semibold text-slate-500 block">
            Click to test real-world pharmaceutical barcode scenarios:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {presets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset.payload)}
                className="p-3 text-left bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-900 truncate">
                    {preset.label.split(':')[0]}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${preset.badgeColor}`}>
                    {preset.badge}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-slate-600 truncate">
                  {preset.payload.slice(0, 24)}...
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {preset.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active Scan Results & Provenance Card */}
      {activeScan && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          {/* Status Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">
                  Barcode Verification Result
                </span>
                <StatusBadge status={activeScan.status} />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {activeScan.notes}
              </p>
            </div>

            <span className="text-[11px] text-slate-400 font-mono">
              Scanned: {new Date(activeScan.scannedAt).toLocaleTimeString()}
            </span>
          </div>

          {/* GS1 Extracted Fields */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Batch / Lot (AI 10)</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {activeScan.batchNumber || 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Expiry Date (AI 17)</span>
              <span className="font-mono font-semibold text-slate-800 text-sm">
                {activeScan.expiryDate || 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">GTIN Code (AI 01)</span>
              <span className="font-mono text-slate-700">
                {activeScan.gtin || 'N/A'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">Serial Number (AI 21)</span>
              <span className="font-mono text-slate-700">
                {activeScan.serialNumber || 'N/A'}
              </span>
            </div>
          </div>

          {/* Matched Batch Inventory Provenance */}
          {activeScan.matchedBatch ? (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Inward Provenance Record</span>
              </h3>

              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-emerald-800/70 block text-[11px]">Medicine Item</span>
                    <span className="font-bold text-emerald-950">
                      {activeScan.matchedBatch.medicineName} ({activeScan.matchedBatch.strength})
                    </span>
                    <span className="text-[10px] text-emerald-800 block">
                      {activeScan.matchedBatch.dosageForm}
                    </span>
                  </div>

                  <div>
                    <span className="text-emerald-800/70 block text-[11px]">Manufacturer</span>
                    <span className="font-semibold text-emerald-950">
                      {activeScan.matchedBatch.manufacturerName}
                    </span>
                    <span className="text-[10px] text-emerald-800 block font-mono">
                      Mfg Date: {activeScan.matchedBatch.manufacturingDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-emerald-800/70 block text-[11px]">Supplier & Inward Invoice</span>
                    <span className="font-semibold text-emerald-950">
                      {activeScan.matchedBatch.supplierLegalName}
                    </span>
                    <span className="text-[10px] text-emerald-800 block font-mono">
                      GSTIN: {activeScan.matchedBatch.supplierGstin} &bull; Inv #{activeScan.matchedBatch.sourceInvoiceNumber}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-900 font-medium">
                    Current balance in pharmacy dispensary: <strong>{activeScan.matchedBatch.currentStockQuantity} units</strong>
                  </span>
                  <button
                    onClick={() => setActiveView('batches')}
                    className="text-emerald-900 font-bold underline flex items-center gap-1"
                  >
                    <span>View in Batch Register</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-900">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                <span>Batch Not Registered in Active Inward Facility Records</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                The barcode was syntactically parsed, but batch <strong>{activeScan.batchNumber || 'code'}</strong> does not match any approved supplier invoice in this facility’s database. Verify physical invoice or check with your distributor.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent QR Scans History */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-blue-600" />
          <span>Recent Barcode Scans ({qrScans.length})</span>
        </h2>

        <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
          {qrScans.map((scan) => (
            <div
              key={scan.id}
              onClick={() => setActiveScan(scan)}
              className="py-2.5 px-3 hover:bg-slate-50 rounded-lg flex items-center justify-between cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-3">
                <QrCode className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="font-mono font-bold text-xs text-slate-800">
                    {scan.batchNumber || 'Raw Barcode'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono truncate max-w-sm">
                    {scan.rawPayload}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={scan.status} />
                <span className="text-[10px] text-slate-400 hidden sm:inline">
                  {new Date(scan.scannedAt).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
