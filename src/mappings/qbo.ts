import { MappingDefinition } from '../core/types.js';

export const qboMappings: MappingDefinition[] = [
  {
    objectType: 'Vendor',
    toExternal: {
      id: 'Id',
      displayName: 'DisplayName',
      email: 'PrimaryEmailAddr.Address',
      status: 'Active'
    },
    toCanonical: {
      Id: 'id',
      DisplayName: 'displayName',
      'PrimaryEmailAddr.Address': 'email',
      Active: 'status'
    }
  },
  {
    objectType: 'Invoice',
    toExternal: {
      id: 'Id',
      vendorId: 'VendorRef.value',
      invoiceNumber: 'DocNumber',
      invoiceDate: 'TxnDate',
      dueDate: 'DueDate',
      currency: 'CurrencyRef.value',
      totalAmount: 'TotalAmt'
    },
    toCanonical: {
      Id: 'id',
      'VendorRef.value': 'vendorId',
      DocNumber: 'invoiceNumber',
      TxnDate: 'invoiceDate',
      DueDate: 'dueDate',
      'CurrencyRef.value': 'currency',
      TotalAmt: 'totalAmount'
    }
  }
];
