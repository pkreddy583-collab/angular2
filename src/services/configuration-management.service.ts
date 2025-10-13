import { Injectable, signal } from '@angular/core';
import { ConfigurationItem } from '../models/configuration-item.model';

@Injectable({
  providedIn: 'root',
})
export class ConfigurationManagementService {
  private _ciItems = signal<ConfigurationItem[]>([
    // Applications
    {
      id: 'app-enrollment-hub',
      name: 'Enrollment Hub',
      type: 'Application',
      environment: 'Production',
      status: 'Warning',
      owner: 'AppDev Team A',
      properties: { 'Version': '2.5.1', 'Business Criticality': 'High' },
      relationships: [
        { targetId: 'srv-web-prod-01', type: 'Depends on' },
        { targetId: 'srv-web-prod-02', type: 'Depends on' },
        { targetId: 'db-user-prod', type: 'Depends on' },
      ],
      relatedChanges: ['CHG-005'],
      relatedIncidents: ['INC-003'],
    },
    {
      id: 'app-hr-portal',
      name: 'HR Portal',
      type: 'Application',
      environment: 'Production',
      status: 'Healthy',
      owner: 'HR Systems Team',
      properties: { 'Version': '4.1.0', 'Business Criticality': 'Medium' },
      relationships: [
        { targetId: 'srv-app-prod-01', type: 'Depends on' },
        { targetId: 'db-hr-prod', type: 'Depends on' },
      ],
      relatedChanges: [],
      relatedIncidents: ['INC-004'],
    },
    // Servers
    {
      id: 'srv-web-prod-01',
      name: 'prod-web-01.example.com',
      type: 'Server',
      environment: 'Production',
      status: 'Healthy',
      owner: 'SRE Team',
      properties: { 'OS': 'Ubuntu 22.04', 'IP Address': '10.0.1.10', 'CPU': '8 cores', 'RAM': '32 GB' },
      relationships: [
        { targetId: 'app-enrollment-hub', type: 'Used by' },
        { targetId: 'net-switch-prod-01', type: 'Depends on' },
      ],
      relatedChanges: ['CHG-003'],
      relatedIncidents: [],
    },
     {
      id: 'srv-web-prod-02',
      name: 'prod-web-02.example.com',
      type: 'Server',
      environment: 'Production',
      status: 'Critical',
      owner: 'SRE Team',
      properties: { 'OS': 'Ubuntu 22.04', 'IP Address': '10.0.1.11', 'CPU': '8 cores', 'RAM': '32 GB' },
      relationships: [
        { targetId: 'app-enrollment-hub', type: 'Used by' },
        { targetId: 'net-switch-prod-01', type: 'Depends on' },
      ],
      relatedChanges: [],
      relatedIncidents: ['INC-001'],
    },
    // Databases
    {
      id: 'db-user-prod',
      name: 'User Profiles DB',
      type: 'Database',
      environment: 'Production',
      status: 'Warning',
      owner: 'DBA Team',
      properties: { 'Engine': 'PostgreSQL 14', 'Host': 'db-cluster-01', 'Replicas': '2' },
      relationships: [
        { targetId: 'app-enrollment-hub', type: 'Used by' },
      ],
      relatedChanges: ['CHG-004'],
      relatedIncidents: ['INC-002'],
    },
     {
      id: 'db-hr-prod',
      name: 'HR Payroll DB',
      type: 'Database',
      environment: 'Production',
      status: 'Healthy',
      owner: 'DBA Team',
      properties: { 'Engine': 'Oracle 19c', 'Host': 'db-cluster-02', 'Replicas': '1' },
      relationships: [
        { targetId: 'app-hr-portal', type: 'Used by' },
      ],
      relatedChanges: [],
      relatedIncidents: [],
    },
    // Network
     {
      id: 'net-switch-prod-01',
      name: 'core-switch-01.dc1',
      type: 'Network Device',
      environment: 'Production',
      status: 'Healthy',
      owner: 'Network Ops',
      properties: { 'Model': 'Cisco Nexus 9000', 'Firmware': '9.3(5)' },
      relationships: [],
      relatedChanges: [],
      relatedIncidents: [],
    },
  ]);

  ciItems = this._ciItems.asReadonly();

  getCiById(id: string): ConfigurationItem | undefined {
    return this._ciItems().find(ci => ci.id === id);
  }
}
