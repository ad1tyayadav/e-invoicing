/* eslint-disable @typescript-eslint/no-explicit-any */
import { InvoiceData } from '@/types';

export interface RuleFinding {
  rule: string;
  ok: boolean;
  exampleLine?: number;
  expected?: number;
  got?: number;
  value?: string;
}

export function validateRules(data: InvoiceData[]): RuleFinding[] {
  const findings: RuleFinding[] = [];

  // Rule 1: TOTALS_BALANCE
  findings.push(validateTotalsBalance(data));

  // Rule 2: LINE_MATH
  findings.push(validateLineMath(data));

  // Rule 3: DATE_ISO
  findings.push(validateDateISO(data));

  // Rule 4: CURRENCY_ALLOWED
  findings.push(validateCurrencyAllowed(data));

  // Rule 5: TRN_PRESENT
  findings.push(validateTRNPresent(data));

  return findings;
}

function validateTotalsBalance(data: InvoiceData[]): RuleFinding {
  for (let i = 0; i < data.length; i++) {
    const invoice = data[i];
    const totalExclVat = getNumber(invoice, 'total_excl_vat', 'totalNet');
    const vatAmount = getNumber(invoice, 'vat_amount', 'vat');
    const totalInclVat = getNumber(invoice, 'total_incl_vat', 'grandTotal');

    if (totalExclVat !== null && vatAmount !== null && totalInclVat !== null) {
      const expected = totalExclVat + vatAmount;
      if (Math.abs(expected - totalInclVat) > 0.01) {
        return { 
          rule: 'TOTALS_BALANCE', 
          ok: false,
          expected: parseFloat(expected.toFixed(2)),
          got: totalInclVat
        };
      }
    }
  }
  return { rule: 'TOTALS_BALANCE', ok: true };
}

function validateLineMath(data: InvoiceData[]): RuleFinding {
  for (let i = 0; i < data.length; i++) {
    const invoice = data[i];
    const lines = invoice.lines || [invoice];
    
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      const qty = getNumber(line, 'qty', 'lineQty');
      const unitPrice = getNumber(line, 'unit_price', 'linePrice');
      const lineTotal = getNumber(line, 'line_total', 'lineTotal');

      if (qty !== null && unitPrice !== null && lineTotal !== null) {
        const expected = qty * unitPrice;
        if (Math.abs(expected - lineTotal) > 0.01) {
          return { 
            rule: 'LINE_MATH', 
            ok: false,
            exampleLine: j + 1,
            expected: parseFloat(expected.toFixed(2)),
            got: lineTotal
          };
        }
      }
    }
  }
  return { rule: 'LINE_MATH', ok: true };
}

function validateDateISO(data: InvoiceData[]): RuleFinding {
  for (let i = 0; i < data.length; i++) {
    const invoice = data[i];
    const dateStr = getString(invoice, 'issue_date', 'issued_on', 'date');
    
    if (dateStr && !isValidISODate(dateStr)) {
      return { 
        rule: 'DATE_ISO', 
        ok: false,
        value: dateStr
      };
    }
  }
  return { rule: 'DATE_ISO', ok: true };
}

function validateCurrencyAllowed(data: InvoiceData[]): RuleFinding {
  const allowedCurrencies = ['AED', 'SAR', 'MYR', 'USD'];
  
  for (let i = 0; i < data.length; i++) {
    const invoice = data[i];
    const currency = getString(invoice, 'currency', 'curr');
    
    if (currency && !allowedCurrencies.includes(currency.toUpperCase())) {
      return { 
        rule: 'CURRENCY_ALLOWED', 
        ok: false,
        value: currency
      };
    }
  }
  return { rule: 'CURRENCY_ALLOWED', ok: true };
}

function validateTRNPresent(data: InvoiceData[]): RuleFinding {
  for (let i = 0; i < data.length; i++) {
    const invoice = data[i];
    const sellerTRN = getString(invoice, 'seller_trn', 'sellerTax');
    const buyerTRN = getString(invoice, 'buyer_trn', 'buyerTax');
    
    if (!sellerTRN || !buyerTRN) {
      return { rule: 'TRN_PRESENT', ok: false };
    }
  }
  return { rule: 'TRN_PRESENT', ok: true };
}

// Helper functions
function getNumber(obj: any, ...fields: string[]): number | null {
  for (const field of fields) {
    const value = obj[field];
    if (value !== undefined && value !== null && !isNaN(Number(value))) {
      return parseFloat(Number(value).toFixed(2));
    }
  }
  return null;
}

function getString(obj: any, ...fields: string[]): string | null {
  for (const field of fields) {
    const value = obj[field];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return null;
}

function isValidISODate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date.toISOString().slice(0, 10) === dateString;
}