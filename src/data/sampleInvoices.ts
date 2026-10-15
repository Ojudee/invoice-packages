import { Invoice } from '../types';
import { DEFAULT_COMPANY, DEFAULT_TERMS, BANK_PRESETS } from './constants';

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-univision-001',
    invoiceNumber: 'INV-2026-001',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'draft',
    company: DEFAULT_COMPANY,
    client: {
      name: '',
      phone: '+220 ',
      email: '',
      address: '',
    },
    project: {
      projectName: 'Architectural & Engineering Design Project',
      projectAddress: 'Plot Site, The Gambia',
      cityProvince: 'West Coast Region',
      postalCode: 'WCR',
    },
    floors: [
      {
        id: 'floor-1',
        floorName: 'Ground Floor Design Scope',
        area: 150.0,
      },
    ],
    packageType: 'premium',
    packageRate: 100,
    additionalNotes: 'Official Univision Design and Construction Ltd. professional architectural & structural deliverables as agreed.',
    addons: [],
    currency: 'GMD',
    unit: 'm²',
    discountPercent: 0,
    taxPercent: 0,
    depositPercent: 50,
    depositPaidAmount: 0,
    terms: [...DEFAULT_TERMS],
    paymentDetails: {
      ...BANK_PRESETS[0],
      reference: 'INV-2026-001',
    },
    clientSignature: '',
    clientSignatureType: 'none',
    clientSignDate: '',
    contractorSigned: true,
    contractorSignDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
