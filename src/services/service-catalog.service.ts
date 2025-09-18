import { Injectable, signal, computed } from '@angular/core';

export type ServiceTier = 1 | 2 | 3 | 4;
export type ServiceStatus = 'Operational' | 'Degraded' | 'Partial Outage' | 'Major Outage';

export interface Service {
  id: string;
  name: string;
  description: string;
  owner: string; // Team name
  tier: ServiceTier;
  status: ServiceStatus;
  dependencies: string[]; // List of service IDs this service depends on
}

@Injectable({
  providedIn: 'root',
})
export class ServiceCatalogService {
  private services = signal<Service[]>([
    {
      id: 'auth-service',
      name: 'User Authentication',
      description: 'Handles user login, session management, and JWT token generation.',
      owner: 'Auth Service Team',
      tier: 1,
      status: 'Operational',
      dependencies: ['user-db'],
    },
    {
      id: 'order-service',
      name: 'Order Service',
      description: 'Manages the creation and processing of customer orders.',
      owner: 'E-commerce Team',
      tier: 1,
      status: 'Operational',
      dependencies: ['auth-service', 'inventory-db', 'payment-gateway'],
    },
    {
      id: 'hr-portal',
      name: 'HR Portal',
      description: 'Internal portal for employee information, payroll, and benefits.',
      owner: 'HR Tech Team',
      tier: 2,
      status: 'Degraded',
      dependencies: ['auth-service', 'payroll-service', 'user-db'],
    },
    {
      id: 'payroll-service',
      name: 'Payroll Service',
      description: 'Processes monthly payroll and generates payslips.',
      owner: 'Finance Tech Team',
      tier: 2,
      status: 'Operational',
      dependencies: ['hr-db'],
    },
    {
      id: 'payment-gateway',
      name: 'Payment Gateway',
      description: 'Third-party integration for processing credit card payments.',
      owner: 'E-commerce Team',
      tier: 1,
      status: 'Major Outage',
      dependencies: [],
    },
    {
      id: 'user-db',
      name: 'User Database',
      description: 'Primary database for user accounts and profiles.',
      owner: 'Database Team',
      tier: 1,
      status: 'Operational',
      dependencies: [],
    },
    {
      id: 'inventory-db',
      name: 'Inventory Database',
      description: 'Database tracking product stock levels.',
      owner: 'Database Team',
      tier: 1,
      status: 'Operational',
      dependencies: [],
    },
     {
      id: 'hr-db',
      name: 'HR Database',
      description: 'Database for employee records.',
      owner: 'Database Team',
      tier: 2,
      status: 'Operational',
      dependencies: [],
    }
  ]);

  getServices() {
    return this.services.asReadonly();
  }

  getServiceById(id: string) {
    const service = computed(() => this.services().find(s => s.id === id));
    
    // Compute dependents (which services rely on this one)
    const dependents = computed(() => {
      const allServices = this.services();
      return allServices.filter(s => s.dependencies.includes(id));
    });

    return { service, dependents };
  }
}