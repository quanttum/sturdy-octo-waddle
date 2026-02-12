import { MappingDefinition } from '../core/types.js';

export const sageIntacctMappings: MappingDefinition[] = [
  {
    objectType: 'Vendor',
    toExternal: {
      id: 'RECORDNO',
      displayName: 'NAME',
      email: 'EMAIL1',
      status: 'STATUS'
    },
    toCanonical: {
      RECORDNO: 'id',
      NAME: 'displayName',
      EMAIL1: 'email',
      STATUS: 'status'
    }
  },
  {
    objectType: 'Invoice',
    toExternal: {
      id: 'RECORDNO',
      vendorId: 'VENDORID',
      invoiceNumber: 'RECORDID',
      invoiceDate: 'WHENCREATED',
      dueDate: 'WHENDUE',
      currency: 'CURRENCY',
      totalAmount: 'TOTALDUE'
    },
    toCanonical: {
      RECORDNO: 'id',
      VENDORID: 'vendorId',
      RECORDID: 'invoiceNumber',
      WHENCREATED: 'invoiceDate',
      WHENDUE: 'dueDate',
      CURRENCY: 'currency',
      TOTALDUE: 'totalAmount'
    }
  }
];
