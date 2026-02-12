import { MappingDefinition } from '../core/types.js';

export const fileConnectorMappings: MappingDefinition[] = [
  {
    objectType: 'Vendor',
    toExternal: {
      id: 'vendor_id',
      displayName: 'vendor_name',
      email: 'vendor_email',
      status: 'vendor_status'
    },
    toCanonical: {
      vendor_id: 'id',
      vendor_name: 'displayName',
      vendor_email: 'email',
      vendor_status: 'status'
    }
  },
  {
    objectType: 'Invoice',
    toExternal: {
      id: 'invoice_id',
      vendorId: 'vendor_id',
      invoiceNumber: 'invoice_number',
      invoiceDate: 'invoice_date',
      dueDate: 'due_date',
      currency: 'currency',
      totalAmount: 'total_amount'
    },
    toCanonical: {
      invoice_id: 'id',
      vendor_id: 'vendorId',
      invoice_number: 'invoiceNumber',
      invoice_date: 'invoiceDate',
      due_date: 'dueDate',
      currency: 'currency',
      total_amount: 'totalAmount'
    }
  }
];
