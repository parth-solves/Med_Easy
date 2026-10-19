import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/ui/Badge';
import { BusinessLicence, SupplierDocument } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Building2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  UserCheck,
  Lock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

export const ComplianceView: React.FC = () => {
  const {
    currentUser,
    licences,
    businessAccounts,
    documents,
    reviewBusinessLicence,
    flagInvoice,
    approveInvoice,
    setActiveView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'licences' | 'invoices'>('licences');
  const [selectedLicenceId, setSelectedLicenceId] = useState<string | null>(null);

  // Review modal state
  const [decision, setDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [reasonCode, setReasonCode] = useState('VERIFIED_ACTIVE_PREMISES');
  const [reviewNotes, setReviewNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pendingLicences = licences.filter((l) => l.status === 'Pending' || l.status === 'Unable to Verify');
  const allLicences = licences;

  const flaggedDocuments = documents.filter((d) => d.status === 'Flagged' || d.status === 'Pending Review');

  const selectedLicence = licences.find((l) => l.id === selectedLicenceId) || null;
  const targetBusiness = selectedLicence
    ? businessAccounts.find((b) => b.id === selectedLicence.businessId)
    : null;

  // Anti-self-approval detection
  const isSelfApprovalViolation =
    currentUser?.businessId &&
    selectedLicence &&
    currentUser.businessId === selectedLicence.businessId;

  const handleExecuteLicenceReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!selectedLicence) return;

    const res = reviewBusinessLicence(
      selectedLicence.id,
      decision,
      reasonCode,
      reviewNotes || `Statutory inspection review executed by ${currentUser?.fullName || 'Reviewer'}`
    );

    if (!res.success) {
      setErrorMessage(res.error || 'Compliance review failed.');
    } else {
      setSuccessMessage(
        `Licence ${selectedLicence.licenceNumber} marked as ${decision}. Audit ledger updated.`
      );
      setSelectedLicenceId(null);
      setReviewNotes('');
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Compliance & Document Review Queue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Statutory verification desk for inspecting submitted pharmaceutical registrations, drug licences, and flagged invoices.
          </p>
        </div>

        {/* Current Reviewer Credential */}
        <div className="px-3.5 py-1.5 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs flex items-center gap-2 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-purple-700" />
          <span>
            Acting Reviewer: <strong>{currentUser?.fullName}</strong> ({currentUser?.role.replace(/_/g, ' ')})
          </span>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2 gap-4">
        <button
          onClick={() => setActiveTab('licences')}
          className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'licences'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Drug Licences Queue ({pendingLicences.length} pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          className={`py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'invoices'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Flagged Inward Invoices ({flaggedDocuments.length})</span>
        </button>
      </div>

      {/* TAB 1: DRUG LICENCES REVIEW */}
      {activeTab === 'licences' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Licences List (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Submitted Business Drug Licences
            </h2>

            <div className="divide-y divide-slate-100 max-h-[580px] overflow-y-auto">
              {allLicences.map((lic) => {
                const biz = businessAccounts.find((b) => b.id === lic.businessId);
                const isSelected = selectedLicence?.id === lic.id;
                const isPending = lic.status === 'Pending' || lic.status === 'Unable to Verify';

                return (
                  <div
                    key={lic.id}
                    onClick={() => {
                      setSelectedLicenceId(lic.id);
                      setErrorMessage(null);
                    }}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border border-blue-200 shadow-xs'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-slate-900">
                        {biz?.legalName || 'Registered Entity'}
                      </span>
                      <StatusBadge status={lic.status} />
                    </div>

                    <div className="font-mono text-xs font-bold text-slate-800">
                      Lic: {lic.licenceNumber}
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1">
                      Type: {lic.licenceType} &bull; Valid to: {lic.validTo}
                    </div>

                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Authority: {lic.issuingAuthority}
                    </div>

                    {isPending && (
                      <span className="inline-block mt-2 text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Action Required: Awaiting Review
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inspection & Action Pane (6 cols) */}
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            {selectedLicence && targetBusiness ? (
              <>
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Inspect & Audit Drug Licence
                    </h3>
                    <p className="text-xs text-slate-500">
                      Application ID: {selectedLicence.id}
                    </p>
                  </div>
                  <StatusBadge status={selectedLicence.status} />
                </div>

                {/* ANTI-SELF-APPROVAL VIOLATION WARNING */}
                {isSelfApprovalViolation && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-2 text-rose-800 font-bold text-xs">
                      <Lock className="w-4 h-4 text-rose-600" />
                      <span>Regulatory Anti-Self-Approval Conflict Enforced</span>
                    </div>
                    <p className="text-xs text-rose-700 leading-relaxed">
                      You are affiliated with <strong>{targetBusiness.legalName}</strong>. Under Drugs & Cosmetics Rule 14B and internal regulatory compliance policies, an applicant or affiliated officer cannot approve their own organization’s licence.
                    </p>
                    <p className="text-[11px] text-rose-600 font-semibold">
                      Please switch to an independent compliance reviewer (e.g. Dr. Aris Thorne) in the top navbar to review this application.
                    </p>
                  </div>
                )}

                {/* Submitted Entity Details */}
                <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Legal Business</span>
                      <span className="font-semibold text-slate-800">{targetBusiness.legalName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">GSTIN</span>
                      <span className="font-mono font-semibold text-slate-800">{targetBusiness.gstin}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Licence Number</span>
                      <span className="font-mono font-semibold text-slate-800">{selectedLicence.licenceNumber}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Expiry Date</span>
                      <span className="font-mono text-slate-800">{selectedLicence.validTo}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[11px]">Licensed Physical Premises</span>
                      <span className="text-slate-700">
                        {targetBusiness.addressLine}, {targetBusiness.city}, {targetBusiness.state} - {targetBusiness.pincode}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block text-[11px]">Document Proof Certificate</span>
                      <span className="font-mono text-blue-700 underline text-[11px]">
                        {selectedLicence.documentStorageUrl || 'Application_Certificate.pdf'}
                      </span>
                    </div>
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs">
                    {errorMessage}
                  </div>
                )}

                {/* Review Form */}
                <form onSubmit={handleExecuteLicenceReview} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Review Decision *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-xs text-slate-800 font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="decision"
                          value="Approved"
                          checked={decision === 'Approved'}
                          onChange={() => setDecision('Approved')}
                        />
                        <span>Approve & Mark Verified</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-800 font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="decision"
                          value="Rejected"
                          checked={decision === 'Rejected'}
                          onChange={() => setDecision('Rejected')}
                        />
                        <span>Reject with Reason Code</span>
                      </label>
                    </div>
                  </div>

                  {decision === 'Rejected' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Rejection Statutory Reason Code *
                      </label>
                      <select
                        value={reasonCode}
                        onChange={(e) => setReasonCode(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                      >
                        <option value="EXPIRED_DRUG_LICENCE">Expired Drug Licence Validity</option>
                        <option value="UNAUTHORIZED_PREMISES">Unapproved / Altered Storage Premises</option>
                        <option value="INVALID_PHARMACIST_REG">Unverified Registered Pharmacist Renewal</option>
                        <option value="MISMATCHED_LEGAL_ENTITY">Mismatched Legal Name / GSTIN Identity</option>
                        <option value="SUSPECTED_DOCUMENT_ALTERATION">Suspected Tampering / Incomplete Seal</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Statutory Inspector Notes & Findings *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Enter verification notes recorded in state licensing register..."
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={Boolean(isSelfApprovalViolation)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                  >
                    {isSelfApprovalViolation
                      ? 'Self-Approval Blocked by Compliance Policy'
                      : `Execute ${decision} Decision`}
                  </button>
                </form>
              </>
            ) : (
              <div className="py-16 text-center text-slate-400">
                Select an establishment drug licence from the queue to review.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FLAGGED INVOICES QUEUE */}
      {activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">
            Flagged Supplier Inward Invoices Requiring Review
          </h2>
          <p className="text-xs text-slate-500">
            Inward tax documents that triggered automated OCR discrepancy flags (e.g. expired batches, tax mismatch).
          </p>

          <div className="divide-y divide-slate-100">
            {flaggedDocuments.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No invoices currently flagged for review.
              </div>
            ) : (
              flaggedDocuments.map((doc) => (
                <div key={doc.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900">
                        {doc.invoiceNumber}
                      </span>
                      <StatusBadge status={doc.status} />
                    </div>
                    <p className="text-xs text-slate-700 font-medium">
                      Supplier: {doc.supplierLegalName} (GSTIN: {doc.supplierGstin})
                    </p>
                    {doc.discrepancies && doc.discrepancies.length > 0 && (
                      <div className="text-xs text-rose-700 font-semibold">
                        Discrepancy: {doc.discrepancies.join('; ')}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveView('invoices')}
                    className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold self-start sm:self-auto transition-colors"
                  >
                    Open in Invoices Workspace
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
