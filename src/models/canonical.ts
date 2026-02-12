export type APObjectType = 'Vendor' | 'Invoice' | 'Payment';

export type EntityScope = {
  entityId: string;
  ledgerId?: string;
};

export type CustomFields = Record<string, string | number | boolean | null>;

export interface CanonicalVendor {
  id: string;
  displayName: string;
  email?: string;
  currency?: string;
  taxId?: string;
  status: 'active' | 'inactive';
  entityScope: EntityScope;
  customFields?: CustomFields;
}

export interface CanonicalInvoice {
  id: string;
  vendorId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  currency: string;
  totalAmount: number;
  status: 'draft' | 'approved' | 'paid' | 'void';
  entityScope: EntityScope;
  customFields?: CustomFields;
}

export interface CanonicalPayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentDate: string;
  method: 'ach' | 'wire' | 'check' | 'card';
  referenceNumber?: string;
  entityScope: EntityScope;
  customFields?: CustomFields;
}

export type CanonicalRecord = CanonicalVendor | CanonicalInvoice | CanonicalPayment;

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export function validateCanonicalRecord(type: APObjectType, record: CanonicalRecord): string[] {
  const errors: string[] = [];
  if (!record.id) {
    errors.push('id is required');
  }

  if (!record.entityScope?.entityId) {
    errors.push('entityScope.entityId is required');
  }

  switch (type) {
    case 'Vendor': {
      const vendor = record as CanonicalVendor;
      if (!vendor.displayName) errors.push('displayName is required');
      if (!['active', 'inactive'].includes(vendor.status)) errors.push('status must be active|inactive');
      break;
    }
    case 'Invoice': {
      const invoice = record as CanonicalInvoice;
      if (!invoice.vendorId) errors.push('vendorId is required');
      if (!invoice.invoiceNumber) errors.push('invoiceNumber is required');
      if (!isoDateRegex.test(invoice.invoiceDate)) errors.push('invoiceDate must be YYYY-MM-DD');
      if (invoice.dueDate && !isoDateRegex.test(invoice.dueDate)) errors.push('dueDate must be YYYY-MM-DD');
      if (invoice.totalAmount <= 0) errors.push('totalAmount must be > 0');
      break;
    }
    case 'Payment': {
      const payment = record as CanonicalPayment;
      if (!payment.invoiceId) errors.push('invoiceId is required');
      if (payment.amount <= 0) errors.push('amount must be > 0');
      if (!isoDateRegex.test(payment.paymentDate)) errors.push('paymentDate must be YYYY-MM-DD');
      break;
    }
  }

  return errors;
}
