import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/ui/Badge';
import { processInvoiceWithOcr, OcrProcessingResult } from '../utils/ocrEngine';
import { InvoiceLineItem, SupplierDocument } from '../types';
import {
  Upload,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Edit2,
  Save,
  X,
  FileCheck2,
  Clock,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

export const InvoicesView: React.FC = () => {
  const {
    documents,
    lineItems,
    uploadSupplierInvoice,
    updateInvoiceLineItems,
    approveInvoice,
    flagInvoice,
    currentBusiness,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(documents[0]?.id || null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Edit Line Items state
  const [isEditing, setIsEditing] = useState(false);
  const [editableItems, setEditableItems] = useState<InvoiceLineItem[]>([]);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0] || null;
  const currentLineItems = selectedDoc
    ? lineItems.filter((item) => item.documentId === selectedDoc.id)
    : [];

  const handleStartEdit = () => {
    setEditableItems(JSON.parse(JSON.stringify(currentLineItems)));
    setIsEditing(true);
  };

  const handleLineItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
    setEditableItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice') {
        const qty = Number(target.quantity) || 0;
        const price = Number(target.unitPrice) || 0;
        const taxable = Math.round(qty * price * 100) / 100;
        const taxRate = Number(target.gstRate) || 12;
        const taxAmt = Math.round(((taxable * taxRate) / 100) * 100) / 100;
        target.taxableValue = taxable;
        target.taxAmount = taxAmt;
        target.totalAmount = Math.round((taxable + taxAmt) * 100) / 100;
      }

      if (field === 'expiryDate') {
        target.isExpired = new Date(value) < new Date();
      }

      copy[index] = target;
      return copy;
    });
  };

  const handleSaveEdits = () => {
    if (!selectedDoc) return;
    updateInvoiceLineItems(selectedDoc.id, editableItems, 'User manually corrected line items in compliance register.');
    setIsEditing(false);
    setActionFeedback('Invoice fields updated and recalculated successfully.');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleSimulatedUpload = async (fileName: string) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const ocrResult = await processInvoiceWithOcr(fileName, 'Simulated INVOICE TAX DOCUMENT PAYLOAD');
      const newDoc = await uploadSupplierInvoice(
        {
          name: fileName,
          sizeBytes: 245760,
          mimeType: 'application/pdf',
        },
        ocrResult
      );
      setSelectedDocId(newDoc.id);
      setActionFeedback(`Invoice ${newDoc.invoiceNumber} uploaded and parsed by OCR.`);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (e) {
      setUploadError('Failed to process invoice OCR.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApprove = (docId: string) => {
    const res = approveInvoice(docId, 'Committed to live inventory ledger.');
    if (res.success) {
      setActionFeedback(`Invoice approved! ${res.batchesCreated} batch record(s) committed to active inventory.`);
      setTimeout(() => setActionFeedback(null), 4000);
    } else {
      alert(res.error || 'Unable to approve invoice.');
    }
  };

  const handleFlag = (docId: string) => {
    const reason = prompt('Enter discrepancy reason for flagging this invoice:');
    if (reason) {
      flagInvoice(docId, [reason], 'Manually flagged by reviewing pharmacist.');
      setActionFeedback('Invoice marked as Flagged. Moved to Compliance Discrepancy Queue.');
      setTimeout(() => setActionFeedback(null), 3500);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.supplierLegalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.supplierGstin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Buy medicines
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add stock from a supplier bill. This demo records sample data; it does not place a real order.
          </p>
        </div>

        {actionFeedback && (
          <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionFeedback}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-600" />
          <span>Add a supplier bill</span>
        </h2>

        <div className="max-w-lg">
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex flex-col items-start space-y-2">
            <FileText className="w-6 h-6 text-slate-400" />
            <div className="text-xs text-slate-600">
              Choose a supplier bill file to record the medicine you received.
            </div>
            <p className="text-xs text-slate-500">PDF, JPG or PNG. Demo only: the file is not sent to a supplier.</p>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const file = e.target.files[0];
                  handleSimulatedUpload(file.name);
                }
              }}
              className="text-xs text-slate-400 file:py-1 file:px-2 file:border-0 file:rounded file:bg-blue-50 file:text-blue-700 file:text-xs"
            />
          </div>
        </div>

        {isUploading && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
            <span>Reading the bill and checking its medicine details...</span>
          </div>
        )}
      </div>

      {/* Main Split: Invoices List on Left, Inspection & Correction on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Document List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Inward Invoices ({filteredDocs.length})
            </h2>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
            >
              <option value="ALL">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Extracted">Extracted</option>
              <option value="Flagged">Flagged</option>
            </select>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search invoice #, supplier..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto">
            {filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    setSelectedDocId(doc.id);
                    setIsEditing(false);
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border border-blue-200 shadow-xs'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {doc.invoiceNumber}
                    </span>
                    <StatusBadge status={doc.status} />
                  </div>
                  <div className="text-xs font-medium text-slate-800 truncate">
                    {doc.supplierLegalName}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                    <span className="font-mono">GSTIN: {doc.supplierGstin}</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ₹{doc.invoiceTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Date: {doc.invoiceDate} &bull; File: {doc.fileName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Inspection, Line Items & Correction Workspace (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          {selectedDoc ? (
            <>
              {/* Document Header & Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-base text-slate-900">
                      {selectedDoc.invoiceNumber}
                    </span>
                    <StatusBadge status={selectedDoc.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Issued: {selectedDoc.invoiceDate} &bull; SHA-256:{' '}
                    <span className="font-mono text-[10px]">
                      {selectedDoc.fileSha256.slice(0, 12)}...
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <button
                      onClick={handleStartEdit}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Edit Extracted Values</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSaveEdits}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-2.5 py-1.5 text-slate-500 hover:text-slate-700 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Discrepancy Warnings if flagged */}
              {selectedDoc.discrepancies && selectedDoc.discrepancies.length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Compliance Discrepancy Flagged</span>
                  </div>
                  {selectedDoc.discrepancies.map((d, idx) => (
                    <p key={idx} className="text-xs text-rose-700 leading-snug pl-5">
                      &bull; {d}
                    </p>
                  ))}
                </div>
              )}

              {/* Extracted Header Details Cards */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Supplier Entity
                  </span>
                  <div className="font-semibold text-slate-900 truncate">
                    {selectedDoc.supplierLegalName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    GSTIN: {selectedDoc.supplierGstin}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Lic: {selectedDoc.supplierDrugLicence}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Customer / Delivery To
                  </span>
                  <div className="font-semibold text-slate-900 truncate">
                    {selectedDoc.buyerName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    GSTIN: {selectedDoc.buyerGstin}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {selectedDoc.buyerAddress}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Extracted Medicine Line Items ({currentLineItems.length})
                  </span>
                  {isEditing && (
                    <span className="text-[11px] text-blue-600 font-medium">
                      Editing mode active &bull; Values recalculate automatically
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold text-[11px]">
                      <tr>
                        <th className="py-2 px-2.5">Item & Manufacturer</th>
                        <th className="py-2 px-2.5">Batch #</th>
                        <th className="py-2 px-2.5">Expiry</th>
                        <th className="py-2 px-2.5 text-right">Qty</th>
                        <th className="py-2 px-2.5 text-right">Rate</th>
                        <th className="py-2 px-2.5 text-right">GST</th>
                        <th className="py-2 px-2.5 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(isEditing ? editableItems : currentLineItems).map((item, idx) => (
                        <tr
                          key={item.id}
                          className={`hover:bg-slate-50/60 ${
                            item.isExpired ? 'bg-rose-50/50' : ''
                          }`}
                        >
                          <td className="py-2.5 px-2.5">
                            {isEditing ? (
                              <input
                                type="text"
                                value={item.medicineName}
                                onChange={(e) =>
                                  handleLineItemChange(idx, 'medicineName', e.target.value)
                                }
                                className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                              />
                            ) : (
                              <div>
                                <span className="font-semibold text-slate-900 block">
                                  {item.medicineName}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {item.manufacturerName}
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-2.5">
                            {isEditing ? (
                              <input
                                type="text"
                                value={item.batchNumber}
                                onChange={(e) =>
                                  handleLineItemChange(idx, 'batchNumber', e.target.value.toUpperCase())
                                }
                                className="w-20 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs uppercase"
                              />
                            ) : (
                              <span className="font-mono font-bold text-slate-800">
                                {item.batchNumber}
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-2.5">
                            {isEditing ? (
                              <input
                                type="date"
                                value={item.expiryDate}
                                onChange={(e) =>
                                  handleLineItemChange(idx, 'expiryDate', e.target.value)
                                }
                                className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono"
                              />
                            ) : (
                              <div className="font-mono">
                                <span
                                  className={
                                    item.isExpired ? 'text-rose-700 font-bold' : 'text-slate-700'
                                  }
                                >
                                  {item.expiryDate}
                                </span>
                                {item.isExpired && (
                                  <span className="block text-[9px] text-rose-600 font-semibold">
                                    EXPIRED
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-2.5 px-2.5 text-right">
                            {isEditing ? (
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleLineItemChange(idx, 'quantity', e.target.value)
                                }
                                className="w-16 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-right font-mono"
                              />
                            ) : (
                              <span className="font-mono">{item.quantity}</span>
                            )}
                          </td>

                          <td className="py-2.5 px-2.5 text-right font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.5"
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleLineItemChange(idx, 'unitPrice', e.target.value)
                                }
                                className="w-20 px-2 py-1 bg-white border border-slate-300 rounded text-xs text-right font-mono"
                              />
                            ) : (
                              `₹${item.unitPrice.toFixed(2)}`
                            )}
                          </td>

                          <td className="py-2.5 px-2.5 text-right font-mono text-slate-500 text-[11px]">
                            {item.gstRate}%
                          </td>

                          <td className="py-2.5 px-2.5 text-right font-mono font-semibold text-slate-900">
                            ₹{item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financial Breakdown & Mathematical Validation */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Tax Breakdown & Math Validated</span>
                    <span className="block text-[11px] text-slate-500">
                      Taxable: ₹{selectedDoc.taxableValue.toFixed(2)} + GST: ₹{selectedDoc.taxAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">
                    Invoice Grand Total
                  </span>
                  <span className="text-base font-bold font-mono text-slate-900">
                    ₹{selectedDoc.invoiceTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Approve / Flag */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
                <div className="text-xs text-slate-500">
                  {selectedDoc.status === 'Approved' ? (
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Approved by {selectedDoc.reviewedBy || 'Reviewer'} on {selectedDoc.reviewedAt?.split('T')[0]}
                    </span>
                  ) : (
                    <span>Review invoice lines and commit to live inventory.</span>
                  )}
                </div>

                {selectedDoc.status !== 'Approved' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFlag(selectedDoc.id)}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Flag Discrepancy</span>
                    </button>

                    <button
                      onClick={() => handleApprove(selectedDoc.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Commit to Stock</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-slate-400">
              Select an invoice from the left register or upload a new file.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
