import { Injectable, signal } from '@angular/core';
import { BusinessService } from '../models/business-user.model';

@Injectable({ providedIn: 'root' })
export class BusinessUserService {
  private _userServices = signal<BusinessService[]>([
    {
      id: 'app-enrollment-hub',
      name: 'Enrollment Hub',
      status: 'Degraded',
      businessImpact: 'You may experience some slowness when enrolling new members. Our teams are actively working on a fix.'
    },
    {
      id: 'app-hr-portal',
      name: 'HR Portal',
      status: 'Healthy',
      businessImpact: null
    },
    {
      id: 'app-public-site',
      name: 'Public Website',
      status: 'Outage',
      businessImpact: 'The main public website is currently unavailable. We are treating this as a critical issue and working to restore service urgently.'
    },
    {
      id: 'reporting-service',
      name: 'Reporting Service',
      status: 'Healthy',
      businessImpact: null
    }
  ]);

  getUserServices() {
    return this._userServices.asReadonly();
  }
}
