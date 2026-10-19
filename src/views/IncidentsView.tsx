import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IncidentType, IncidentStatus } from '../types';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  Search,
  MessageSquare,
  X,
  Filter,
  ShieldAlert,
  FileText,
  Boxes,
} from 'lucide-react';

export const IncidentsView: React.FC = () => {
  const { incidents, reportIncident, resolveIncident, batches } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  // Form Fields
  const [incidentCategory, setIncidentCategory] = useState<IncidentType>('EXPIRY_VIOLATION');
  const [batchNumber, setBatchNumber] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');

  // Status update modal
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<IncidentStatus>('RESOLVED');
  const [reviewerNote, setReviewerNote] = useState('');

  const incidentOptions: { type: IncidentType; label: string; desc: string }[] = [
    {
      type: 'EXPIRY_VIOLATION',
      label: 'Expired or Altered Expiry Batch',
      desc: 'Batch expiry date is in the past, obscured, or conflicting with invoice.',
    },
    {
      type: 'BATCH_MISMATCH',
      label: 'Batch Identification Mismatch',
      desc: 'Outer carton label does not match inward tax invoice dispatch records.',
    },
    {
      type: 'SUSPECTED_PACKAGING_DEFECT',
      label: 'Damaged Packaging / Broken Tamper Seal',
      desc: 'Vials, blister foil, or tamper-evident seal compromised in transit.',
    },
    {
      type: 'UNAUTHORIZED_SUPPLIER',
      label: 'Unlicensed / Unverified Supplier Inward',
      desc: 'Consignment received without verifiable Form 20B/21B wholesale licence.',
    },
    {
      type: 'DOCUMENTATION_DISCREPANCY',
      label: 'Tax Invoice & Statutory Documentation Mismatch',
      desc: 'GST calculation discrepancy, missing HSN codes, or quantity variances.',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchNumber.trim() || !description.trim()) {
      alert('Please enter a batch number and a detailed description.');
      return;
    }

    reportIncident({
      incidentType: incidentCategory,
      batchNumber: batchNumber.trim(),
      medicineName: medicineName.trim() || 'Pharmaceutical Item',
      description: description.trim(),
      severity,
    });

    setIsModalOpen(false);
    setBatchNumber('');
    setMedicineName('');
    setDescription('');
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;

    resolveIncident(selectedIncident.id, newStatus, reviewerNote);
    setSelectedIncident(null);
    setReviewerNote('');
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.medicineName && inc.medicineName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      inc.description.toLowerCase().includes(searchTerm.toLowerCase());

    const isResolved = inc.status === 'RESOLVED' || inc.status === 'DISMISSED';
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'OPEN' && !isResolved) ||
      (statusFilter === 'RESOLVED' && isResolved);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Quality Discrepancies & Incident Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log, track, and remediate pharmaceutical packaging defects, expired batch receipts, and invoice discrepancies.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Report Quality Discrepancy</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by batch number, medicine name, or description..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Reports</option>
            <option value="OPEN">Open & Under Review</option>
            <option value="RESOLVED">Resolved / Remediated</option>
          </select>
        </div>
      </div>

      {/* Incidents Cards / List */}
      <div className="space-y-3">
        {filteredIncidents.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            No quality discrepancy reports found matching criteria.
          </div>
        ) : (
          filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    Batch: {inc.batchNumber}
                  </span>
                  <span className="font-semibold text-xs text-slate-800">
                    {inc.medicineName}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      inc.severity === 'CRITICAL' || inc.severity === 'HIGH'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inc.severity} SEVERITY
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      inc.status === 'RESOLVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {inc.status}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedIncident(inc);
                      setNewStatus(inc.status === 'RESOLVED' ? 'IN_REVIEW' : 'RESOLVED');
                      setReviewerNote(inc.reviewerNotes || '');
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Update Status
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed">
                <strong>Discrepancy Category:</strong> {inc.incidentType.replace(/_/g, ' ')}
                <p className="mt-1 text-slate-600">{inc.description}</p>
              </div>

              {inc.reviewerNotes && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>CAPA Resolution Notes:</span>
                  </span>
                  <p className="text-slate-600 pl-5">{inc.reviewerNotes}</p>
                </div>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Reported by: {inc.reporterName} ({inc.reporterRole})</span>
                <span>Date: {inc.createdAt.split('T')[0]}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Incident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Report Quality Discrepancy
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Discrepancy Classification *
                </label>
                <select
                  value={incidentCategory}
                  onChange={(e) => setIncidentCategory(e.target.value as IncidentType)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  {incidentOptions.map((opt) => (
                    <option key={opt.type} value={opt.type}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. AMX2201"
                    className="w-full px-3 py-2 font-mono bg-slate-50 border border-slate-200 rounded-lg uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Medicine Name
                  </label>
                  <input
                    type="text"
                    value={medicineName}
                    onChange={(e) => setMedicineName(e.target.value)}
                    placeholder="e.g. Cardipril 5mg"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Severity Level *
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="CRITICAL">Critical (Patient Safety / Contamination Risk)</option>
                  <option value="HIGH">High (Expired Batch / Broken Security Seal)</option>
                  <option value="MEDIUM">Medium (Label / Documentation Discrepancy)</option>
                  <option value="LOW">Low (Minor Box Scuff / Packaging Variance)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Detailed Findings & Physical Inspection Observations *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe observations, barcode mismatches, or supplier communication..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                >
                  Submit Incident Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <h3 className="font-bold text-slate-900 text-sm">
                Update Quality Report Status
              </h3>
              <button onClick={() => setSelectedIncident(null)} className="text-slate-400 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as IncidentStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="IN_REVIEW">In Review (Quality Check Underway)</option>
                  <option value="RESOLVED">Resolved (Remediation / Quarantined Complete)</option>
                  <option value="DISMISSED">Dismissed (False Alarm)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Remediation & Reviewer Notes
                </label>
                <textarea
                  rows={3}
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                  placeholder="Record supplier credit note, batch return authorization, or manufacturer clarification..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIncident(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
