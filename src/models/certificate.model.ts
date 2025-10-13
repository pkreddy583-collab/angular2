export interface SSLCertificate {
  id: string;
  domainName: string;
  issuer: string;
  lineOfBusiness: 'Core Services' | 'Finance & HR' | 'Public Facing';
  expiryDate: Date;
  daysRemaining: number;
  status: 'Valid' | 'Expires Soon' | 'Expired';
  associatedServices: string[];
}
