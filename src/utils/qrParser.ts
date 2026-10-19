import { TraceabilityStatus } from '../types';

export interface ParsedQrResult {
  status: TraceabilityStatus;
  gtin?: string;
  batchNumber?: string;
  expiryDate?: string;
  manufacturingDate?: string;
  serialNumber?: string;
  medicineIdentifier?: string;
  parsedFields: { key: string; label: string; value: string }[];
  format: 'GS1_DATAMATRIX' | 'MEDLINK_URI' | 'GENERIC_BARCODE' | 'UNSUPPORTED';
  notes: string;
}

export function parsePharmaceuticalBarcode(rawPayload: string): ParsedQrResult {
  const raw = rawPayload.trim();
  const parsedFields: { key: string; label: string; value: string }[] = [];

  // 1. Standard GS1 DataMatrix (Application Identifiers format)
  // AI (01): 14-digit GTIN
  // AI (17): YYMMDD Expiration Date
  // AI (10): Variable length batch/lot number
  // AI (21): Variable length serial number
  if (raw.startsWith('01') && raw.length >= 16) {
    try {
      const gtin = raw.substring(2, 16);
      parsedFields.push({ key: '01', label: 'GTIN (Global Trade Item #)', value: gtin });

      let remainder = raw.substring(16);
      let expDate: string | undefined;
      let batchNumber: string | undefined;
      let serialNumber: string | undefined;

      if (remainder.startsWith('17') && remainder.length >= 8) {
        const rawYymmdd = remainder.substring(2, 8);
        const year = `20${rawYymmdd.substring(0, 2)}`;
        const month = rawYymmdd.substring(2, 4);
        const day = rawYymmdd.substring(4, 6);
        expDate = `${year}-${month}-${day}`;
        parsedFields.push({ key: '17', label: 'Expiration Date (AI 17)', value: `${expDate} (YYMMDD: ${rawYymmdd})` });
        remainder = remainder.substring(8);
      }

      if (remainder.startsWith('10')) {
        const serialIndex = remainder.indexOf('21');
        if (serialIndex !== -1) {
          batchNumber = remainder.substring(2, serialIndex);
          remainder = remainder.substring(serialIndex);
        } else {
          batchNumber = remainder.substring(2);
          remainder = '';
        }
        parsedFields.push({ key: '10', label: 'Batch / Lot Number (AI 10)', value: batchNumber });
      }

      if (remainder.startsWith('21')) {
        serialNumber = remainder.substring(2);
        parsedFields.push({ key: '21', label: 'Serial Number (AI 21)', value: serialNumber });
      }

      return {
        status: 'INFORMATION_EXTRACTED',
        gtin,
        batchNumber,
        expiryDate: expDate,
        serialNumber,
        medicineIdentifier: `GTIN: ${gtin}`,
        parsedFields,
        format: 'GS1_DATAMATRIX',
        notes: 'Standard GS1 DataMatrix format successfully parsed into component identifiers.',
      };
    } catch (e) {
      return {
        status: 'REVIEW_REQUIRED',
        parsedFields: [{ key: 'RAW', label: 'Raw GS1 String', value: raw }],
        format: 'GS1_DATAMATRIX',
        notes: 'GS1 payload detected but contained non-standard or truncated segments.',
      };
    }
  }

  // 2. MedLink URI Pattern (e.g., MEDLINK://BATCH/CRD2409?EXP=2026-02-28&MFG=2024-03-01)
  if (raw.toUpperCase().startsWith('MEDLINK://BATCH/')) {
    const afterScheme = raw.substring('MEDLINK://BATCH/'.length);
    const [batch, queryString] = afterScheme.split('?');
    const params = new URLSearchParams(queryString || '');
    const exp = params.get('EXP') || undefined;
    const mfg = params.get('MFG') || undefined;

    parsedFields.push({ key: 'BATCH', label: 'Batch Number', value: batch });
    if (exp) parsedFields.push({ key: 'EXP', label: 'Expiry Date', value: exp });
    if (mfg) parsedFields.push({ key: 'MFG', label: 'Mfg Date', value: mfg });

    return {
      status: 'INFORMATION_EXTRACTED',
      batchNumber: batch,
      expiryDate: exp,
      manufacturingDate: mfg,
      parsedFields,
      format: 'MEDLINK_URI',
      notes: 'MedLink Demonstration URI schema successfully parsed.',
    };
  }

  // 3. Simple Batch Code fallback (e.g. CRD2409, AMX2488)
  const isAlphaNumericBatch = /^[A-Z0-9\-_]{4,16}$/i.test(raw);
  if (isAlphaNumericBatch) {
    parsedFields.push({ key: 'MANUAL_BATCH', label: 'Direct Batch Code', value: raw });
    return {
      status: 'INFORMATION_EXTRACTED',
      batchNumber: raw.toUpperCase(),
      parsedFields,
      format: 'GENERIC_BARCODE',
      notes: 'Direct 1D linear barcode batch payload extracted.',
    };
  }

  // 4. Unsupported Format
  parsedFields.push({ key: 'RAW_PAYLOAD', label: 'Unstructured Raw Input', value: raw });
  return {
    status: 'VERIFICATION_UNAVAILABLE',
    parsedFields,
    format: 'UNSUPPORTED',
    notes: 'Unrecognized barcode/QR format. Recorded for manual review. This format cannot be parsed automatically, but does NOT assert counterfeit status.',
  };
}
