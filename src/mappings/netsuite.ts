import { MappingDefinition } from '../core/types.js';

export const netSuiteMappings: MappingDefinition[] = [
  {
    objectType: 'Vendor',
    toExternal: {
      id: 'id',
      displayName: 'companyName',
      email: 'email',
      status: 'isInactive'
    },
    toCanonical: {
      id: 'id',
      companyName: 'displayName',
      email: 'email',
      isInactive: 'status'
    }
  },
  {
    objectType: 'Invoice',
    toExternal: {
      id: 'id',
      vendorId: 'entity.id',
      invoiceNumber: 'tranId',
      invoiceDate: 'tranDate',
      dueDate: 'dueDate',
      currency: 'currency.code',
      totalAmount: 'total'
    },
    toCanonical: {
      id: 'id',
      'entity.id': 'vendorId',
      tranId: 'invoiceNumber',
      tranDate: 'invoiceDate',
      dueDate: 'dueDate',
      'currency.code': 'currency',
      total: 'totalAmount'
    }
  }
];
