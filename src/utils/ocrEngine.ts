export interface OcrExtractedLineItem {
  id: string;
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
  gstRate: number;
  taxAmount: number;
  totalAmount: number;
  confidence: number;
  isExpired: boolean;
}

export interface OcrProcessingResult {
  engineName: string;
  isSimulated: boolean;
  sha256Checksum: string;
  supplierLegalName: { value: string; confidence: number };
  supplierTradeName: { value: string; confidence: number };
  supplierGstin: { value: string; confidence: number };
  supplierDrugLicence: { value: string; confidence: number };
  invoiceNumber: { value: string; confidence: number };
  invoiceDate: { value: string; confidence: number };
  receiverName: { value: string; confidence: number };
  receiverGstin: { value: string; confidence: number };
  taxableValue: number;
  taxAmount: number;
  invoiceTotal: number;
  isMathValid: boolean;
  items: OcrExtractedLineItem[];
  hasDiscrepancy: boolean;
  discrepancyReasons: string[];
}

export async function calculateSha256(content: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const msgUint8 = new TextEncoder().encode(content);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback
    }
  }
  // deterministic fallback hash for strings
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, 'a');
}

export async function processInvoiceWithOcr(
  fileName: string,
  contentSample: string
): Promise<OcrProcessingResult> {
  const sha256 = await calculateSha256(fileName + contentSample);
  const lowerName = fileName.toLowerCase();

  // Preset 1: Flagged / Mismatched invoice with expired batch
  if (lowerName.includes('flagged') || lowerName.includes('mismatch') || lowerName.includes('expired') || lowerName.includes('9902')) {
    return {
      engineName: 'CDSCO-Compliant Deterministic OCR Adapter v3.2',
      isSimulated: true,
      sha256Checksum: sha256,
      supplierLegalName: { value: 'Apex Healthcare Distributors Private Limited', confidence: 0.99 },
      supplierTradeName: { value: 'Apex Pharma Distribution', confidence: 0.98 },
      supplierGstin: { value: '27AAACA9999P1Z1', confidence: 0.99 },
      supplierDrugLicence: { value: 'MH-TZ1-20B-78910', confidence: 0.97 },
      invoiceNumber: { value: 'APX-2024-9902', confidence: 0.95 },
      invoiceDate: { value: '2024-06-20', confidence: 0.96 },
      receiverName: { value: 'CityCare Medical Stores & Chemists LLP', confidence: 0.97 },
      receiverGstin: { value: '27AABCC8888Q1Z3', confidence: 0.98 },
      taxableValue: 7750.0,
      taxAmount: 930.0,
      invoiceTotal: 8680.0,
      isMathValid: true,
      hasDiscrepancy: true,
      discrepancyReasons: [
        'Critical Quality Alert: Batch AMX2201 has expiry date 2023-12-31, which is in the past.',
        'Compliance Warning: Expired pharmaceutical stock cannot be received into active inventory.',
      ],
      items: [
        {
          id: 'ocr-line-expired-1',
          lineNumber: 1,
          medicineName: 'AmoxiClav 625 Forte',
          strength: '500 mg + 125 mg',
          dosageForm: 'Film-coated Tablet (Strip of 10)',
          manufacturerName: 'Zenith Lifesciences Ltd',
          batchNumber: 'AMX2201',
          manufacturingDate: '2022-01-01',
          expiryDate: '2023-12-31',
          quantity: 50,
          unitPrice: 155.0,
          discountPercent: 0,
          taxableValue: 7750.0,
          gstRate: 12,
          taxAmount: 930.0,
          totalAmount: 8680.0,
          confidence: 0.89,
          isExpired: true,
        },
      ],
    };
  }

  // Preset 2: Zenith Wholesale Inward
  if (lowerName.includes('zenith') || lowerName.includes('azithro') || lowerName.includes('1184')) {
    return {
      engineName: 'CDSCO-Compliant Deterministic OCR Adapter v3.2',
      isSimulated: true,
      sha256Checksum: sha256,
      supplierLegalName: { value: 'Zenith Lifesciences Distribution Hub', confidence: 0.99 },
      supplierTradeName: { value: 'Zenith Pharma Logistics', confidence: 0.98 },
      supplierGstin: { value: '24AABCZ6666S1Z7', confidence: 0.99 },
      supplierDrugLicence: { value: 'GJ-AHM-20B-55219', confidence: 0.98 },
      invoiceNumber: { value: 'ZNL-2024-1184', confidence: 0.98 },
      invoiceDate: { value: '2024-06-21', confidence: 0.97 },
      receiverName: { value: 'CityCare Medical Stores & Chemists LLP', confidence: 0.98 },
      receiverGstin: { value: '27AABCC8888Q1Z3', confidence: 0.99 },
      taxableValue: 17000.0,
      taxAmount: 2040.0,
      invoiceTotal: 19040.0,
      isMathValid: true,
      hasDiscrepancy: false,
      discrepancyReasons: [],
      items: [
        {
          id: 'ocr-line-azm-1',
          lineNumber: 1,
          medicineName: 'AzithroMed 500',
          strength: '500 mg',
          dosageForm: 'Tablet (Pack of 3)',
          manufacturerName: 'SunVeda Pharma Ltd',
          batchNumber: 'AZM2401',
          manufacturingDate: '2024-02-15',
          expiryDate: '2026-01-31',
          quantity: 200,
          unitPrice: 85.0,
          discountPercent: 0,
          taxableValue: 17000.0,
          gstRate: 12,
          taxAmount: 2040.0,
          totalAmount: 19040.0,
          confidence: 0.98,
          isExpired: false,
        },
      ],
    };
  }

  // Default Standard Valid Apex Inward (APX-2024-5502 or newly uploaded)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return {
    engineName: 'CDSCO-Compliant Deterministic OCR Adapter v3.2',
    isSimulated: true,
    sha256Checksum: sha256,
    supplierLegalName: { value: 'Apex Healthcare Distributors Private Limited', confidence: 0.99 },
    supplierTradeName: { value: 'Apex Pharma Distribution', confidence: 0.98 },
    supplierGstin: { value: '27AAACA9999P1Z1', confidence: 0.99 },
    supplierDrugLicence: { value: 'MH-TZ1-20B-78910', confidence: 0.97 },
    invoiceNumber: { value: lowerName.includes('5502') ? 'APX-2024-5502' : `APX-2024-${randomSuffix}`, confidence: 0.97 },
    invoiceDate: { value: '2024-06-18', confidence: 0.96 },
    receiverName: { value: 'CityCare Medical Stores & Chemists LLP', confidence: 0.98 },
    receiverGstin: { value: '27AABCC8888Q1Z3', confidence: 0.99 },
    taxableValue: 23175.0,
    taxAmount: 2781.0,
    invoiceTotal: 25956.0,
    isMathValid: true,
    hasDiscrepancy: false,
    discrepancyReasons: [],
    items: [
      {
        id: 'ocr-line-crd-1',
        lineNumber: 1,
        medicineName: 'Cardipril 5mg',
        strength: '5 mg',
        dosageForm: 'Oral Tablet (Strip of 10)',
        manufacturerName: 'BioHealth Labs India Ltd',
        batchNumber: 'CRD2409',
        manufacturingDate: '2024-03-01',
        expiryDate: '2026-02-28',
        quantity: 150,
        unitPrice: 102.5,
        discountPercent: 0,
        taxableValue: 15375.0,
        gstRate: 12,
        taxAmount: 1845.0,
        totalAmount: 17220.0,
        confidence: 0.97,
        isExpired: false,
      },
      {
        id: 'ocr-line-pnt-1',
        lineNumber: 2,
        medicineName: 'PantoMed 40 Gastro',
        strength: '40 mg',
        dosageForm: 'Enteric Coated Tablet (Strip of 15)',
        manufacturerName: 'Cipla Lifecare Labs',
        batchNumber: 'PNT2412',
        manufacturingDate: '2024-04-10',
        expiryDate: '2026-03-31',
        quantity: 100,
        unitPrice: 78.0,
        discountPercent: 0,
        taxableValue: 7800.0,
        gstRate: 12,
        taxAmount: 936.0,
        totalAmount: 8736.0,
        confidence: 0.95,
        isExpired: false,
      },
    ],
  };
}
