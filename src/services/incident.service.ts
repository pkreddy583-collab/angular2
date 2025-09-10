import { Injectable, signal } from '@angular/core';
import { Incident } from '../models/incident.model';

@Injectable({
  providedIn: 'root',
})
export class IncidentService {
  private now = new Date();

  private mockIncidents: Incident[] = [
    {
      id: 'INC-001',
      title: 'Production server unresponsive',
      priority: 'P1' as const,
      assignedTo: 'Alice',
      createdDate: new Date(this.now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      slaBreachDate: new Date(this.now.getTime() + 30 * 60 * 1000),   // 30 minutes from now (Danger)
      description: 'The main production server is not responding to any requests. All services hosted on this server are down. This is a critical failure affecting all users.',
      affectedServices: ['All Production Services'],
      lastUpdate: 'On-call engineer paged. Initial investigation points to a possible hardware failure. Awaiting physical inspection.'
    },
    {
      id: 'INC-002',
      title: 'Database connection pool exhausted',
      priority: 'P1' as const,
      assignedTo: 'Bob',
      createdDate: new Date(this.now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
      slaBreachDate: new Date(this.now.getTime() + 6 * 60 * 60 * 1000),  // 6 hours from now (Warning)
      description: 'The primary database is rejecting new connections because the connection pool is full. This is causing intermittent failures across multiple services.',
      affectedServices: ['Order Service', 'User Authentication', 'Inventory Management'],
      lastUpdate: 'Database administrators are increasing the pool size and analyzing long-running queries that might be holding connections open.'
    },
    {
      id: 'INC-003',
      title: 'Login service experiencing high latency',
      priority: 'P2' as const,
      assignedTo: 'Charlie',
      createdDate: new Date(this.now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      slaBreachDate: new Date(this.now.getTime() + 18 * 60 * 60 * 1000), // 18 hours from now (Caution)
      description: 'Users are reporting that login attempts are taking up to 20 seconds to complete. No login failures have been reported, but the user experience is significantly degraded.',
      affectedServices: ['User Authentication'],
      lastUpdate: 'The service has been scaled up. Performance is being monitored.'
    },
    {
      id: 'INC-004',
      title: 'HR Portal Slow Performance',
      priority: 'P2' as const,
      assignedTo: 'Diana',
      createdDate: new Date(this.now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      slaBreachDate: new Date(this.now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now (Safe)
      description: 'Employees are reporting that the HR portal is extremely slow, especially when accessing payroll information. Page load times are exceeding 30 seconds. Initial investigation points to high memory utilization on the application server.',
      affectedServices: ['HR Portal', 'Payroll Service'],
      lastUpdate: 'System admins are scheduled to restart the application server during the next maintenance window.'
    },
    {
      id: 'INC-005',
      title: 'File upload service failing for large files',
      priority: 'P3' as const,
      assignedTo: 'Eve',
      createdDate: new Date(this.now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      slaBreachDate: new Date(this.now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now (Safe)
      description: 'The file upload service is returning an error for files larger than 50MB. This impacts users trying to upload large documents or media files.',
      affectedServices: ['File Storage Service'],
      lastUpdate: 'A misconfiguration in the load balancer has been identified as the root cause. A fix is being deployed.'
    },
    {
      id: 'INC-006',
      title: 'SSL certificate renewal failure',
      priority: 'P1' as const,
      assignedTo: 'Frank',
      createdDate: new Date(this.now.getTime() - 10 * 60 * 1000), // 10 minutes ago
      slaBreachDate: new Date(this.now.getTime() + 1 * 60 * 60 * 1000 + 15 * 60 * 1000), // 1 hour 15 minutes from now (Warning)
      description: 'The automated SSL certificate renewal process for the main website has failed. The current certificate will expire in less than 24 hours.',
      affectedServices: ['Public Website'],
      lastUpdate: 'The security team is manually renewing and deploying the certificate.'
    }
  ].sort((a, b) => a.slaBreachDate.getTime() - b.slaBreachDate.getTime());

  private incidentsSignal = signal<Incident[]>(this.mockIncidents);
  
  getIncidents() {
    return this.incidentsSignal.asReadonly();
  }

  getIncidentById(id: string): Incident | undefined {
    return this.incidentsSignal().find(incident => incident.id === id);
  }
}