export type Role =
  | 'RETAIL_PHARMACY'
  | 'WHOLESALE_DISTRIBUTOR'
  | 'MANUFACTURER'
  | 'HOSPITAL_PHARMACY'
  | 'COMPLIANCE_REVIEWER'
  | 'PLATFORM_ADMIN'
  | 'AUDITOR';

export type BusinessType =
  | 'Retail Pharmacy'
  | 'Wholesale Distributor'
  | 'Manufacturer'
  | 'Hospital / Institutional Pharmacy';

export type VerificationStatus =
  | 'Pending'
  | 'Verified'
  | 'Rejected'
  | 'Unable to Verify';

export type InvoiceDocumentStatus =
  | 'Uploaded'
  | 'Extracted'
  | 'Pending Review'
  | 'Approved'
  | 'Flagged'
  | 'Rejected';

export type BatchStockStatus =
  | 'In Stock'
  | 'Expiring Soon'
  | 'Expired'
  | 'Quarantined';

// 1. business_accounts
export interface BusinessAccount {
  id: string;
  legalName: string;
  tradeName: string;
  businessType: BusinessType;
  gstin: string;
  drugLicenceNumber: string;
  licenceType: string;
  issuingAuthority: string;
  licenceExpiryDate: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// 2. users
export interface UserAccount {
  id: string;
  businessId: string | null;
  fullName: string;
  email: string;
  phone: string;
  role: Role;
  isPhoneVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

// 3. business_licences
export interface BusinessLicence {
  id: string;
  businessId: string;
  licenceNumber: string;
  licenceType: string; // Form 20, Form 21, Form 20B, Form 21B, Form 25, Form 28
  issuingAuthority: string;
  validFrom: string;
  validTo: string;
  documentStorageUrl?: string;
  documentSha256?: string;
  status: VerificationStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  createdAt: string;
}

// 4. verification_checks
export interface VerificationCheck {
  id: string;
  businessId: string;
  checkType: 'GSTIN_PORTAL' | 'STATE_DRUG_REGISTRY' | 'PHYSICAL_INSPECTION';
  identifierChecked: string;
  status: VerificationStatus;
  authorityQueried: string;
  responseSummary: string;
  performedBy: string;
  checkedAt: string;
}

// 5. supplier_documents (Invoices & Challans)
export interface SupplierDocument {
  id: string;
  businessId: string; // The buyer's business account ID
  documentType: 'Tax Invoice' | 'Delivery Challan' | 'Credit Note';
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  fileSha256: string;
  malwareScanPassed: boolean;
  storageUrl: string;

  // Extracted Header Information
  supplierLegalName: string;
  supplierTradeName: string;
  supplierGstin: string;
  supplierDrugLicence: string;
  supplierIssuingAuthority: string;
  supplierAddress: string;

  invoiceNumber: string;
  invoiceDate: string;

  buyerName: string;
  buyerGstin: string;
  buyerAddress: string;

  // Calculated Financials
  taxableValue: number;
  taxAmount: number;
  invoiceTotal: number;
  isMathValid: boolean;

  // Review Status
  status: InvoiceDocumentStatus;
  discrepancies: string[];
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  uploadedAt: string;
}

// 6. invoice_line_items
export interface InvoiceLineItem {
  id: string;
  documentId: string;
  lineNumber: number;
  medicineName: string;
  strength: string;
  dosageForm: string;
  manufacturerName: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxableValue: number;
  gstRate: number; // e.g. 12 or 18
  taxAmount: number;
  totalAmount: number;
  isExpired: boolean;
}

// 7. medicine_batch_records (Traceability Association)
export interface MedicineBatchRecord {
  id: string;
  businessId: string;
  sourceDocumentId: string;
  sourceInvoiceNumber: string;
  medicineName: string;
  strength: string;
  dosageForm: string;
  manufacturerName: string;
  batchNumber: string;
  manufacturingDate: string;
  expiryDate: string;
  receivedQuantity: number;
  currentStockQuantity: number;
  supplierLegalName: string;
  supplierGstin: string;
  sourceStated: boolean; // True: extracted from source document
  independentlyVerified: boolean; // True: verified against manufacturer repository
  status: BatchStockStatus;
  createdAt: string;
}

// 8. document_reviews
export interface DocumentReview {
  id: string;
  documentId: string;
  reviewerId: string;
  reviewerName: string;
  previousStatus: InvoiceDocumentStatus;
  newStatus: InvoiceDocumentStatus;
  correctionsMade: {
    field: string;
    originalValue: any;
    correctedValue: any;
  }[];
  comments: string;
  reviewedAt: string;
}

// 9. audit_logs
export interface AuditLogEntry {
  id: string;
  businessId: string | null;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
  timestamp: string;
}

// 10. Traceability & QR Scanning
export type TraceabilityStatus =
  | 'INFORMATION_EXTRACTED'
  | 'BATCH_VERIFIED'
  | 'DISCREPANCY_DETECTED'
  | 'EXPIRED_BATCH'
  | 'UNREGISTERED_BATCH'
  | 'REVIEW_REQUIRED'
  | 'VERIFICATION_UNAVAILABLE';

export interface QrScanRecord {
  id: string;
  businessId?: string;
  scannedAt: string;
  rawPayload: string;
  format: string;
  status: TraceabilityStatus;
  gtin?: string;
  batchNumber?: string;
  expiryDate?: string;
  serialNumber?: string;
  notes: string;
  matchedBatch?: MedicineBatchRecord;
}

// 11. Incidents & Discrepancies
export type IncidentType =
  | 'BATCH_MISMATCH'
  | 'EXPIRY_VIOLATION'
  | 'SUSPECTED_PACKAGING_DEFECT'
  | 'UNAUTHORIZED_SUPPLIER'
  | 'DOCUMENTATION_DISCREPANCY';

export type IncidentStatus = 'REPORTED' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';

export interface IncidentReport {
  id: string;
  businessId: string;
  reporterName: string;
  reporterRole: string;
  incidentType: IncidentType;
  batchNumber: string;
  medicineName?: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: IncidentStatus;
  reviewerNotes?: string;
  resolvedAt?: string;
  createdAt: string;
}

export type LicenceReviewStatus = 'Approved' | 'Rejected' | 'Unable to Verify';
