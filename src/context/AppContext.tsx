import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  BusinessType,
  VerificationStatus,
  InvoiceDocumentStatus,
  BatchStockStatus,
  BusinessAccount,
  UserAccount,
  BusinessLicence,
  VerificationCheck,
  SupplierDocument,
  InvoiceLineItem,
  MedicineBatchRecord,
  DocumentReview,
  AuditLogEntry,
  QrScanRecord,
  IncidentReport,
  IncidentType,
  IncidentStatus,
  LicenceReviewStatus,
} from '../types';
import {
  INITIAL_BUSINESS_ACCOUNTS,
  INITIAL_USERS,
  INITIAL_LICENCES,
  INITIAL_VERIFICATION_CHECKS,
  INITIAL_DOCUMENTS,
  INITIAL_LINE_ITEMS,
  INITIAL_BATCH_RECORDS,
  INITIAL_AUDIT_LOGS,
  INITIAL_QR_SCANS,
  INITIAL_INCIDENTS,
} from '../data/initialData';
import { parsePharmaceuticalBarcode } from '../utils/qrParser';
import { OcrProcessingResult, calculateSha256 } from '../utils/ocrEngine';

interface AppContextType {
  currentUser: UserAccount | null;
  currentBusiness: BusinessAccount | null;
  users: UserAccount[];
  businessAccounts: BusinessAccount[];
  licences: BusinessLicence[];
  verificationChecks: VerificationCheck[];
  documents: SupplierDocument[];
  lineItems: InvoiceLineItem[];
  batches: MedicineBatchRecord[];
  qrScans: QrScanRecord[];
  incidents: IncidentReport[];
  auditLogs: AuditLogEntry[];
  activeView: string;
  setActiveView: (view: string) => void;

  // Authentication & Access Control
  login: (email: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  registerBusiness: (data: {
    legalName: string;
    tradeName: string;
    businessType: BusinessType;
    gstin: string;
    drugLicenceNumber: string;
    licenceType: string;
    issuingAuthority: string;
    licenceExpiryDate: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    documentProofName?: string;
  }) => { success: boolean; businessId: string };
  verifyPhoneOtp: (phone: string, code: string) => boolean;

  // Verification checks
  simulateGstCheck: (gstin: string) => Promise<VerificationCheck>;
  simulateLicenceCheck: (licenceNumber: string, state: string) => Promise<VerificationCheck>;

  // Invoices & OCR
  uploadSupplierInvoice: (
    fileMeta: { name: string; sizeBytes: number; mimeType: string },
    ocrResult: OcrProcessingResult
  ) => Promise<SupplierDocument>;
  updateInvoiceLineItems: (
    documentId: string,
    items: InvoiceLineItem[],
    notes?: string
  ) => void;
  approveInvoice: (
    documentId: string,
    reviewNotes?: string
  ) => { success: boolean; error?: string; batchesCreated: number };
  flagInvoice: (documentId: string, reasons: string[], reviewNotes?: string) => void;

  // Compliance & Document Review
  reviewBusinessLicence: (
    licenceId: string,
    decision: 'Approved' | 'Rejected',
    reasonCode: string,
    notes: string
  ) => { success: boolean; error?: string };

  // Traceability & GS1 Barcode
  processQrScan: (rawPayload: string) => QrScanRecord;

  // Discrepancies & Incidents
  reportIncident: (data: {
    incidentType: IncidentType;
    batchNumber: string;
    medicineName?: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }) => IncidentReport;
  resolveIncident: (incidentId: string, status: IncidentStatus, reviewerNotes: string) => void;

  // Audit Logging
  logAuditAction: (
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, any>
  ) => void;

  // Data reset
  resetSandboxData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'medlink_b2b_compliance_v2_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Users & Business Accounts
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [businessAccounts, setBusinessAccounts] = useState<BusinessAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'businessAccounts');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESS_ACCOUNTS;
  });

  // Keep the demo account signed in only for the current browser tab.
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = sessionStorage.getItem(STORAGE_PREFIX + 'currentUser');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  // Active view: 'login' | 'register' | 'pending' | 'dashboard' | 'invoices' | 'batches' | 'traceability' | 'review' | 'audit' | 'business'
  const [activeView, setActiveView] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'activeView');
    if (saved === 'invoices') return 'buy';
    if (saved === 'batches') return 'sell';
    if (saved && ['dashboard', 'buy', 'sell', 'business', 'pending'].includes(saved)) {
      return saved;
    }
    return 'dashboard';
  });

  // Derived current business
  const currentBusiness = currentUser?.businessId
    ? businessAccounts.find((b) => b.id === currentUser.businessId) || null
    : null;

  // 2. Licences & Verification Checks
  const [licences, setLicences] = useState<BusinessLicence[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'licences');
    return saved ? JSON.parse(saved) : INITIAL_LICENCES;
  });

  const [verificationChecks, setVerificationChecks] = useState<VerificationCheck[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'verificationChecks');
    return saved ? JSON.parse(saved) : INITIAL_VERIFICATION_CHECKS;
  });

  // 3. Supplier Invoices & Line Items
  const [documents, setDocuments] = useState<SupplierDocument[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });

  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'lineItems');
    return saved ? JSON.parse(saved) : INITIAL_LINE_ITEMS;
  });

  // 4. Batches (Inventory & Provenance)
  const [batches, setBatches] = useState<MedicineBatchRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'batches');
    return saved ? JSON.parse(saved) : INITIAL_BATCH_RECORDS;
  });

  // 5. QR Scans, Incidents, Audit Logs
  const [qrScans, setQrScans] = useState<QrScanRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'qrScans');
    return saved ? JSON.parse(saved) : INITIAL_QR_SCANS;
  });

  const [incidents, setIncidents] = useState<IncidentReport[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'incidents');
    return saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'auditLogs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Synchronize state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'businessAccounts', JSON.stringify(businessAccounts));
  }, [businessAccounts]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem(STORAGE_PREFIX + 'currentUser', JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem(STORAGE_PREFIX + 'currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'activeView', activeView);
  }, [activeView]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'licences', JSON.stringify(licences));
  }, [licences]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'verificationChecks', JSON.stringify(verificationChecks));
  }, [verificationChecks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'lineItems', JSON.stringify(lineItems));
  }, [lineItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'batches', JSON.stringify(batches));
  }, [batches]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'qrScans', JSON.stringify(qrScans));
  }, [qrScans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Audit Logger Helper
  const logAuditAction = (
    action: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, any> = {}
  ) => {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      businessId: currentUser?.businessId || null,
      actorId: currentUser?.id || 'system-guest',
      actorName: currentUser?.fullName || 'Guest / Unauthenticated',
      actorRole: currentUser?.role || 'SYSTEM',
      action,
      entityType,
      entityId,
      ipAddress: '103.21.124.5',
      userAgent: navigator.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64)',
      metadata,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  // Auth Operations
  const login = (email: string, _password?: string) => {
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!foundUser) {
      return { success: false, error: 'No registered user found with this email address.' };
    }

    setCurrentUser(foundUser);
    const userBiz = foundUser.businessId
      ? businessAccounts.find((b) => b.id === foundUser.businessId)
      : null;

    logAuditAction('USER_LOGIN', 'UserAccount', foundUser.id, {
      email: foundUser.email,
      role: foundUser.role,
      businessId: foundUser.businessId,
    });

    if (userBiz && (userBiz.verificationStatus === 'Pending' || userBiz.verificationStatus === 'Unable to Verify')) {
      setActiveView('pending');
    } else {
      setActiveView('dashboard');
    }
    return { success: true };
  };

  const logout = () => {
    if (currentUser) {
      logAuditAction('USER_LOGOUT', 'UserAccount', currentUser.id, {
        email: currentUser.email,
      });
    }
    setCurrentUser(null);
    setActiveView('login');
  };

  const verifyPhoneOtp = (_phone: string, code: string): boolean => {
    // In our realistic regulatory sandbox, OTP code is 482910 or any valid 6-digit code
    if (code.trim().length === 6) {
      return true;
    }
    return false;
  };

  const registerBusiness = (data: {
    legalName: string;
    tradeName: string;
    businessType: BusinessType;
    gstin: string;
    drugLicenceNumber: string;
    licenceType: string;
    issuingAuthority: string;
    licenceExpiryDate: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    addressLine: string;
    city: string;
    state: string;
    pincode: string;
    documentProofName?: string;
  }) => {
    const newBizId = `biz-${Date.now()}`;
    const newUserId = `user-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newBiz: BusinessAccount = {
      id: newBizId,
      legalName: data.legalName,
      tradeName: data.tradeName || data.legalName,
      businessType: data.businessType,
      gstin: data.gstin.toUpperCase().trim(),
      drugLicenceNumber: data.drugLicenceNumber.toUpperCase().trim(),
      licenceType: data.licenceType,
      issuingAuthority: data.issuingAuthority,
      licenceExpiryDate: data.licenceExpiryDate,
      addressLine: data.addressLine,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      contactPerson: data.contactPerson,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      verificationStatus: 'Pending',
      verificationNotes: 'Registration received. Awaiting statutory compliance review by State Drug Licensing Authority and GSTN portal confirmation.',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    let userRole: Role = 'RETAIL_PHARMACY';
    if (data.businessType === 'Wholesale Distributor') userRole = 'WHOLESALE_DISTRIBUTOR';
    if (data.businessType === 'Manufacturer') userRole = 'MANUFACTURER';
    if (data.businessType === 'Hospital / Institutional Pharmacy') userRole = 'HOSPITAL_PHARMACY';

    const newUser: UserAccount = {
      id: newUserId,
      businessId: newBizId,
      fullName: data.contactPerson,
      email: data.contactEmail,
      phone: data.contactPhone,
      role: userRole,
      isPhoneVerified: true,
      isActive: true,
      lastLoginAt: nowIso,
      createdAt: nowIso,
    };

    const newLicence: BusinessLicence = {
      id: `lic-${Date.now()}`,
      businessId: newBizId,
      licenceNumber: data.drugLicenceNumber.toUpperCase().trim(),
      licenceType: data.licenceType,
      issuingAuthority: data.issuingAuthority,
      validFrom: nowIso.split('T')[0],
      validTo: data.licenceExpiryDate,
      documentStorageUrl: `/storage/licences/${data.documentProofName || 'Application_Certificate.pdf'}`,
      documentSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      status: 'Pending',
      verificationNotes: 'Submitted for statutory verification against state drugs control database.',
      createdAt: nowIso,
    };

    const gstCheck: VerificationCheck = {
      id: `chk-gst-${Date.now()}`,
      businessId: newBizId,
      checkType: 'GSTIN_PORTAL',
      identifierChecked: data.gstin.toUpperCase().trim(),
      status: 'Pending',
      authorityQueried: 'GSTN Commercial Taxes Gateway',
      responseSummary: `Format checked: valid 15-character GST structure (${data.state} State Code ${data.gstin.slice(0, 2)}). Live registry authorization in queue.`,
      performedBy: 'Automated Gateway Scheduler',
      checkedAt: nowIso,
    };

    setBusinessAccounts((prev) => [newBiz, ...prev]);
    setUsers((prev) => [newUser, ...prev]);
    setLicences((prev) => [newLicence, ...prev]);
    setVerificationChecks((prev) => [gstCheck, ...prev]);

    setCurrentUser(newUser);

    logAuditAction('BUSINESS_REGISTRATION_SUBMITTED', 'BusinessAccount', newBizId, {
      legalName: newBiz.legalName,
      gstin: newBiz.gstin,
      licenceNumber: newBiz.drugLicenceNumber,
      status: 'Pending',
    });

    setActiveView('pending');
    return { success: true, businessId: newBizId };
  };

  // Automated checks simulator
  const simulateGstCheck = async (gstin: string): Promise<VerificationCheck> => {
    await new Promise((r) => setTimeout(r, 600));
    const nowIso = new Date().toISOString();
    const isValidFormat = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstin);

    const check: VerificationCheck = {
      id: `chk-gst-${Date.now()}`,
      businessId: currentBusiness?.id || 'biz-unknown',
      checkType: 'GSTIN_PORTAL',
      identifierChecked: gstin,
      status: isValidFormat ? 'Verified' : 'Unable to Verify',
      authorityQueried: 'Goods and Services Tax Network (GSTN)',
      responseSummary: isValidFormat
        ? `GSTIN ${gstin} validated against GSTN portal. Active regular taxpayer status confirmed.`
        : `GSTIN ${gstin} structure does not match official 15-character alphanumeric format.`,
      performedBy: currentUser?.fullName || 'Automated Gateway',
      checkedAt: nowIso,
    };

    setVerificationChecks((prev) => [check, ...prev]);
    logAuditAction('GSTIN_VERIFICATION_CHECK', 'VerificationCheck', check.id, {
      gstin,
      status: check.status,
    });
    return check;
  };

  const simulateLicenceCheck = async (
    licenceNumber: string,
    stateAuthority: string
  ): Promise<VerificationCheck> => {
    await new Promise((r) => setTimeout(r, 600));
    const nowIso = new Date().toISOString();

    const check: VerificationCheck = {
      id: `chk-lic-${Date.now()}`,
      businessId: currentBusiness?.id || 'biz-unknown',
      checkType: 'STATE_DRUG_REGISTRY',
      identifierChecked: licenceNumber,
      status: 'Verified',
      authorityQueried: stateAuthority || 'State Drugs Control Administration',
      responseSummary: `Licence ${licenceNumber} verified with State FDA registry. Valid premises and active registration.`,
      performedBy: currentUser?.fullName || 'Compliance Review Officer',
      checkedAt: nowIso,
    };

    setVerificationChecks((prev) => [check, ...prev]);
    logAuditAction('DRUG_LICENCE_VERIFICATION_CHECK', 'VerificationCheck', check.id, {
      licenceNumber,
      authority: stateAuthority,
      status: check.status,
    });
    return check;
  };

  // Supplier Invoices & OCR
  const uploadSupplierInvoice = async (
    fileMeta: { name: string; sizeBytes: number; mimeType: string },
    ocrResult: OcrProcessingResult
  ): Promise<SupplierDocument> => {
    const docId = `doc-inv-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newDoc: SupplierDocument = {
      id: docId,
      businessId: currentBusiness?.id || 'biz-citycare-pharm',
      documentType: 'Tax Invoice',
      fileName: fileMeta.name,
      fileSizeBytes: fileMeta.sizeBytes,
      mimeType: fileMeta.mimeType,
      fileSha256: ocrResult.sha256Checksum,
      malwareScanPassed: true,
      storageUrl: `/storage/invoices/${fileMeta.name}`,
      supplierLegalName: ocrResult.supplierLegalName.value,
      supplierTradeName: ocrResult.supplierTradeName.value,
      supplierGstin: ocrResult.supplierGstin.value,
      supplierDrugLicence: ocrResult.supplierDrugLicence.value,
      supplierIssuingAuthority: 'State Drugs Control Administration',
      supplierAddress: 'Pharmaceutical Logistics Complex, Sector 12',
      invoiceNumber: ocrResult.invoiceNumber.value,
      invoiceDate: ocrResult.invoiceDate.value,
      buyerName: ocrResult.receiverName.value,
      buyerGstin: ocrResult.receiverGstin.value,
      buyerAddress: currentBusiness?.addressLine || 'Registered Business Address',
      taxableValue: ocrResult.taxableValue,
      taxAmount: ocrResult.taxAmount,
      invoiceTotal: ocrResult.invoiceTotal,
      isMathValid: ocrResult.isMathValid,
      status: ocrResult.hasDiscrepancy ? 'Flagged' : 'Extracted',
      discrepancies: ocrResult.discrepancyReasons,
      uploadedAt: nowIso,
    };

    const newLineItems: InvoiceLineItem[] = ocrResult.items.map((item, index) => ({
      id: `line-${docId}-${index + 1}`,
      documentId: docId,
      lineNumber: item.lineNumber || index + 1,
      medicineName: item.medicineName,
      strength: item.strength || '',
      dosageForm: item.dosageForm || 'Oral Dosage Form',
      manufacturerName: item.manufacturerName || 'Certified Pharma Labs Ltd',
      batchNumber: item.batchNumber,
      manufacturingDate: item.manufacturingDate,
      expiryDate: item.expiryDate,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent || 0,
      taxableValue: item.taxableValue,
      gstRate: item.gstRate || 12,
      taxAmount: item.taxAmount,
      totalAmount: item.totalAmount,
      isExpired: item.isExpired || false,
    }));

    setDocuments((prev) => [newDoc, ...prev]);
    setLineItems((prev) => [...prev, ...newLineItems]);

    logAuditAction('INVOICE_UPLOAD_AND_OCR_EXTRACT', 'SupplierDocument', docId, {
      fileName: fileMeta.name,
      invoiceNumber: newDoc.invoiceNumber,
      supplierGstin: newDoc.supplierGstin,
      totalAmount: newDoc.invoiceTotal,
      itemsCount: newLineItems.length,
      hasDiscrepancy: ocrResult.hasDiscrepancy,
    });

    return newDoc;
  };

  const updateInvoiceLineItems = (
    documentId: string,
    items: InvoiceLineItem[],
    notes?: string
  ) => {
    setLineItems((prev) => {
      const filtered = prev.filter((li) => li.documentId !== documentId);
      return [...filtered, ...items];
    });

    // Recalculate invoice totals
    const taxableTotal = items.reduce((sum, i) => sum + (i.taxableValue || 0), 0);
    const taxTotal = items.reduce((sum, i) => sum + (i.taxAmount || 0), 0);
    const grandTotal = taxableTotal + taxTotal;

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === documentId) {
          return {
            ...doc,
            taxableValue: Math.round(taxableTotal * 100) / 100,
            taxAmount: Math.round(taxTotal * 100) / 100,
            invoiceTotal: Math.round(grandTotal * 100) / 100,
            isMathValid: true,
            reviewNotes: notes || doc.reviewNotes,
            status: 'Pending Review',
          };
        }
        return doc;
      })
    );

    logAuditAction('INVOICE_LINE_ITEMS_EDITED', 'SupplierDocument', documentId, {
      itemsCount: items.length,
      newTotal: grandTotal,
      notes,
    });
  };

  const approveInvoice = (documentId: string, reviewNotes?: string) => {
    const doc = documents.find((d) => d.id === documentId);
    if (!doc) return { success: false, error: 'Document not found', batchesCreated: 0 };

    const docItems = lineItems.filter((i) => i.documentId === documentId);
    const hasExpiredItems = docItems.some((i) => i.isExpired || new Date(i.expiryDate) < new Date());
    if (hasExpiredItems) {
      return {
        success: false,
        error: 'Cannot approve invoice with expired batch items! Please quarantine or return to supplier.',
        batchesCreated: 0,
      };
    }

    const nowIso = new Date().toISOString();

    // Create batches into medicine_batch_records
    const newBatches: MedicineBatchRecord[] = docItems.map((item) => ({
      id: `batch-${item.batchNumber.toLowerCase()}-${Date.now()}`,
      businessId: doc.businessId,
      sourceDocumentId: doc.id,
      sourceInvoiceNumber: doc.invoiceNumber,
      medicineName: item.medicineName,
      strength: item.strength,
      dosageForm: item.dosageForm,
      manufacturerName: item.manufacturerName,
      batchNumber: item.batchNumber,
      manufacturingDate: item.manufacturingDate,
      expiryDate: item.expiryDate,
      receivedQuantity: item.quantity,
      currentStockQuantity: item.quantity,
      supplierLegalName: doc.supplierLegalName,
      supplierGstin: doc.supplierGstin,
      sourceStated: true,
      independentlyVerified: true,
      status: 'In Stock',
      createdAt: nowIso,
    }));

    setBatches((prev) => [...newBatches, ...prev]);

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === documentId
          ? {
              ...d,
              status: 'Approved',
              reviewNotes: reviewNotes || 'Approved and committed to active pharmacy inventory.',
              reviewedBy: currentUser?.fullName || 'Reviewer',
              reviewedAt: nowIso,
            }
          : d
      )
    );

    logAuditAction('DOCUMENT_REVIEW_APPROVED', 'SupplierDocument', documentId, {
      invoiceNumber: doc.invoiceNumber,
      batchesCommitted: newBatches.map((b) => b.batchNumber),
      reviewedBy: currentUser?.fullName,
    });

    return { success: true, batchesCreated: newBatches.length };
  };

  const flagInvoice = (documentId: string, reasons: string[], reviewNotes?: string) => {
    const nowIso = new Date().toISOString();
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === documentId
          ? {
              ...d,
              status: 'Flagged',
              discrepancies: reasons,
              reviewNotes: reviewNotes || 'Flagged for quality or documentation discrepancy.',
              reviewedBy: currentUser?.fullName || 'Reviewer',
              reviewedAt: nowIso,
            }
          : d
      )
    );

    logAuditAction('DOCUMENT_REVIEW_FLAGGED', 'SupplierDocument', documentId, {
      reasons,
      reviewNotes,
    });
  };

  // Compliance & Licences Review (Strict Anti-Self-Approval Enforcement)
  const reviewBusinessLicence = (
    licenceId: string,
    decision: 'Approved' | 'Rejected',
    reasonCode: string,
    notes: string
  ) => {
    const lic = licences.find((l) => l.id === licenceId);
    if (!lic) return { success: false, error: 'Licence not found' };

    // ANTI-SELF-APPROVAL RULE:
    // If current reviewer belongs to the same business entity, forbid approval!
    if (currentUser?.businessId && currentUser.businessId === lic.businessId) {
      const errorMsg =
        'Anti-Self-Approval Policy Violation: Under Drugs & Cosmetics Rule 14B and internal compliance governance, a business owner or affiliated officer cannot approve their own entity’s drug licence or registration documents.';
      return { success: false, error: errorMsg };
    }

    const nowIso = new Date().toISOString();
    const newStatus: VerificationStatus = decision === 'Approved' ? 'Verified' : 'Rejected';

    setLicences((prev) =>
      prev.map((l) =>
        l.id === licenceId
          ? {
              ...l,
              status: newStatus,
              verificationNotes: notes || `Reviewed by compliance officer (${reasonCode})`,
              verifiedAt: nowIso,
            }
          : l
      )
    );

    // Update parent business account status as well
    setBusinessAccounts((prev) =>
      prev.map((b) =>
        b.id === lic.businessId
          ? {
              ...b,
              verificationStatus: newStatus,
              verificationNotes: notes,
              verifiedAt: nowIso,
              verifiedBy: currentUser?.fullName,
            }
          : b
      )
    );

    logAuditAction(
      decision === 'Approved' ? 'LICENCE_REVIEW_APPROVED' : 'LICENCE_REVIEW_REJECTED',
      'BusinessLicence',
      licenceId,
      {
        licenceNumber: lic.licenceNumber,
        businessId: lic.businessId,
        decision,
        reasonCode,
        notes,
        reviewer: currentUser?.fullName,
      }
    );

    return { success: true };
  };

  // Traceability & GS1 QR Scanner
  const processQrScan = (rawPayload: string): QrScanRecord => {
    const parsed = parsePharmaceuticalBarcode(rawPayload);
    const nowIso = new Date().toISOString();

    // Check against existing batches in inventory
    const matched = batches.find(
      (b) =>
        b.batchNumber.toUpperCase() === parsed.batchNumber?.toUpperCase() ||
        (parsed.batchNumber && b.batchNumber.includes(parsed.batchNumber))
    );

    let finalStatus = parsed.status;
    let finalNotes = parsed.notes;

    if (matched) {
      if (matched.status === 'Expired' || new Date(matched.expiryDate) < new Date()) {
        finalStatus = 'EXPIRED_BATCH';
        finalNotes = `Batch ${matched.batchNumber} exists in inventory but is EXPIRED (${matched.expiryDate}).`;
      } else {
        finalStatus = 'BATCH_VERIFIED';
        finalNotes = `Batch ${matched.batchNumber} (${matched.medicineName}) verified in inventory from supplier ${matched.supplierLegalName} (Inv #${matched.sourceInvoiceNumber}).`;
      }
    } else if (parsed.batchNumber) {
      finalStatus = 'UNREGISTERED_BATCH';
      finalNotes = `Batch ${parsed.batchNumber} parsed successfully but is NOT in this facility’s registered inward batch inventory.`;
    }

    const record: QrScanRecord = {
      id: `scan-${Date.now()}`,
      businessId: currentBusiness?.id || 'biz-citycare-pharm',
      scannedAt: nowIso,
      rawPayload,
      format: parsed.format,
      status: finalStatus,
      gtin: parsed.gtin,
      batchNumber: parsed.batchNumber,
      expiryDate: parsed.expiryDate,
      serialNumber: parsed.serialNumber,
      notes: finalNotes,
      matchedBatch: matched,
    };

    setQrScans((prev) => [record, ...prev]);

    logAuditAction('TRACEABILITY_QR_SCAN', 'QrScanRecord', record.id, {
      rawPayload,
      batchNumber: record.batchNumber,
      status: record.status,
      matchedMedicine: matched?.medicineName,
    });

    return record;
  };

  // Incidents & Discrepancies
  const reportIncident = (data: {
    incidentType: IncidentType;
    batchNumber: string;
    medicineName?: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }): IncidentReport => {
    const incId = `inc-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newInc: IncidentReport = {
      id: incId,
      businessId: currentBusiness?.id || 'biz-citycare-pharm',
      reporterName: currentUser?.fullName || 'Duty Officer',
      reporterRole: currentUser?.role || 'RETAIL_PHARMACY',
      incidentType: data.incidentType,
      batchNumber: data.batchNumber.toUpperCase().trim(),
      medicineName: data.medicineName || 'Pharmaceutical Item',
      description: data.description,
      severity: data.severity,
      status: 'REPORTED',
      createdAt: nowIso,
    };

    setIncidents((prev) => [newInc, ...prev]);

    logAuditAction('INCIDENT_REPORTED', 'IncidentReport', incId, {
      incidentType: data.incidentType,
      batchNumber: data.batchNumber,
      severity: data.severity,
    });

    return newInc;
  };

  const resolveIncident = (
    incidentId: string,
    status: IncidentStatus,
    reviewerNotes: string
  ) => {
    const nowIso = new Date().toISOString();
    setIncidents((prev) =>
      prev.map((inc) =>
        inc.id === incidentId
          ? {
              ...inc,
              status,
              reviewerNotes,
              resolvedAt: status === 'RESOLVED' ? nowIso : undefined,
            }
          : inc
      )
    );

    logAuditAction('INCIDENT_STATUS_UPDATED', 'IncidentReport', incidentId, {
      newStatus: status,
      reviewerNotes,
      resolvedBy: currentUser?.fullName,
    });
  };

  const resetSandboxData = () => {
    localStorage.removeItem(STORAGE_PREFIX + 'users');
    localStorage.removeItem(STORAGE_PREFIX + 'businessAccounts');
    localStorage.removeItem(STORAGE_PREFIX + 'currentUser');
    sessionStorage.removeItem(STORAGE_PREFIX + 'currentUser');
    localStorage.removeItem(STORAGE_PREFIX + 'activeView');
    localStorage.removeItem(STORAGE_PREFIX + 'licences');
    localStorage.removeItem(STORAGE_PREFIX + 'verificationChecks');
    localStorage.removeItem(STORAGE_PREFIX + 'documents');
    localStorage.removeItem(STORAGE_PREFIX + 'lineItems');
    localStorage.removeItem(STORAGE_PREFIX + 'batches');
    localStorage.removeItem(STORAGE_PREFIX + 'qrScans');
    localStorage.removeItem(STORAGE_PREFIX + 'incidents');
    localStorage.removeItem(STORAGE_PREFIX + 'auditLogs');

    setUsers(INITIAL_USERS);
    setBusinessAccounts(INITIAL_BUSINESS_ACCOUNTS);
    setCurrentUser(null);
    setActiveView('login');
    setLicences(INITIAL_LICENCES);
    setVerificationChecks(INITIAL_VERIFICATION_CHECKS);
    setDocuments(INITIAL_DOCUMENTS);
    setLineItems(INITIAL_LINE_ITEMS);
    setBatches(INITIAL_BATCH_RECORDS);
    setQrScans(INITIAL_QR_SCANS);
    setIncidents(INITIAL_INCIDENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentBusiness,
        users,
        businessAccounts,
        licences,
        verificationChecks,
        documents,
        lineItems,
        batches,
        qrScans,
        incidents,
        auditLogs,
        activeView,
        setActiveView,
        login,
        logout,
        registerBusiness,
        verifyPhoneOtp,
        simulateGstCheck,
        simulateLicenceCheck,
        uploadSupplierInvoice,
        updateInvoiceLineItems,
        approveInvoice,
        flagInvoice,
        reviewBusinessLicence,
        processQrScan,
        reportIncident,
        resolveIncident,
        logAuditAction,
        resetSandboxData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
