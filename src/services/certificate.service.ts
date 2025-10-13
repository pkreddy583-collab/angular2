import { Injectable, signal } from '@angular/core';
import { SSLCertificate } from '../models/certificate.model';

const now = new Date();
const addDays = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const MOCK_CERTIFICATES: SSLCertificate[] = [
  {
    id: 'cert-001',
    domainName: 'api.core.example.com',
    issuer: 'DigiCert',
    lineOfBusiness: 'Core Services',
    expiryDate: addDays(7),
    daysRemaining: 7,
    status: 'Expires Soon',
    associatedServices: ['Order Service', 'User Authentication'],
  },
  {
    id: 'cert-002',
    domainName: 'www.public.example.com',
    issuer: 'Sectigo',
    lineOfBusiness: 'Public Facing',
    expiryDate: addDays(-2),
    daysRemaining: -2,
    status: 'Expired',
    associatedServices: ['Public Website'],
  },
  {
    id: 'cert-003',
    domainName: 'hr.internal.example.com',
    issuer: 'Internal CA',
    lineOfBusiness: 'Finance & HR',
    expiryDate: addDays(25),
    daysRemaining: 25,
    status: 'Expires Soon',
    associatedServices: ['HR Portal'],
  },
  {
    id: 'cert-004',
    domainName: 'inventory.core.example.com',
    issuer: 'Let\'s Encrypt',
    lineOfBusiness: 'Core Services',
    expiryDate: addDays(85),
    daysRemaining: 85,
    status: 'Valid',
    associatedServices: ['Inventory Management'],
  },
  {
    id: 'cert-005',
    domainName: 'payments.core.example.com',
    issuer: 'DigiCert',
    lineOfBusiness: 'Core Services',
    expiryDate: addDays(15),
    daysRemaining: 15,
    status: 'Expires Soon',
    associatedServices: ['Payment Gateway'],
  },
   {
    id: 'cert-006',
    domainName: 'payroll.internal.example.com',
    issuer: 'Internal CA',
    lineOfBusiness: 'Finance & HR',
    expiryDate: addDays(120),
    daysRemaining: 120,
    status: 'Valid',
    associatedServices: ['Payroll Service'],
  },
];

@Injectable({
  providedIn: 'root',
})
export class CertificateService {
  private _certificates = signal<SSLCertificate[]>(MOCK_CERTIFICATES.sort((a,b) => a.daysRemaining - b.daysRemaining));

  getCertificates() {
    return this._certificates.asReadonly();
  }
}
