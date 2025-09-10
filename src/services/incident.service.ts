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
    },
    {
      id: 'INC-002',
      title: 'Database connection pool exhausted',
      priority: 'P1' as const,
      assignedTo: 'Bob',
      createdDate: new Date(this.now.getTime() - 5 * 60 * 60 * 1000), // 5 hours ago
      slaBreachDate: new Date(this.now.getTime() + 6 * 60 * 60 * 1000),  // 6 hours from now (Warning)
    },
    {
      id: 'INC-003',
      title: 'Login service experiencing high latency',
      priority: 'P2' as const,
      assignedTo: 'Charlie',
      createdDate: new Date(this.now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      slaBreachDate: new Date(this.now.getTime() + 18 * 60 * 60 * 1000), // 18 hours from now (Caution)
    },
    {
      id: 'INC-004',
      title: 'API gateway returning 503 errors sporadically',
      priority: 'P2' as const,
      assignedTo: 'Diana',
      createdDate: new Date(this.now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      slaBreachDate: new Date(this.now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now (Safe)
    },
    {
      id: 'INC-005',
      title: 'File upload service failing for large files',
      priority: 'P3' as const,
      assignedTo: 'Eve',
      createdDate: new Date(this.now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      slaBreachDate: new Date(this.now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now (Safe)
    },
    {
      id: 'INC-006',
      title: 'SSL certificate renewal failure',
      priority: 'P1' as const,
      assignedTo: 'Frank',
      createdDate: new Date(this.now.getTime() - 10 * 60 * 1000), // 10 minutes ago
      slaBreachDate: new Date(this.now.getTime() + 1 * 60 * 60 * 1000 + 15 * 60 * 1000), // 1 hour 15 minutes from now (Warning)
    }
  ].sort((a, b) => a.slaBreachDate.getTime() - b.slaBreachDate.getTime());

  private incidentsSignal = signal<Incident[]>(this.mockIncidents);
  
  getIncidents() {
    return this.incidentsSignal.asReadonly();
  }
  
  addIncident(incidentData: Omit<Incident, 'id' | 'createdDate'>) {
    const newIncident: Incident = {
      ...incidentData,
      id: `INC-${Date.now().toString().slice(-5)}`,
      createdDate: new Date(),
    };
    this.incidentsSignal.update(incidents => 
      [...incidents, newIncident].sort((a, b) => a.slaBreachDate.getTime() - b.slaBreachDate.getTime())
    );
  }

  updateIncident(updatedIncident: Incident) {
    this.incidentsSignal.update(incidents => {
      const index = incidents.findIndex(i => i.id === updatedIncident.id);
      if (index === -1) return incidents;
      const newIncidents = [...incidents];
      newIncidents[index] = updatedIncident;
      return newIncidents.sort((a, b) => a.slaBreachDate.getTime() - b.slaBreachDate.getTime());
    });
  }

  deleteIncident(id: string) {
    this.incidentsSignal.update(incidents => 
      incidents.filter(i => i.id !== id)
    );
  }
}