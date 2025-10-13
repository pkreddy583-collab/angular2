import { Injectable, signal, computed, inject } from '@angular/core';
import { Problem } from '../models/problem.model';
import { IncidentService } from './incident.service';

@Injectable({
  providedIn: 'root',
})
export class ProblemService {
  private incidentService = inject(IncidentService);

  private _problems = signal<Problem[]>([
    {
      id: 'PRB-001',
      title: 'Recurring Database Connection Pool Exhaustion',
      status: 'Investigation',
      owner: 'Bob',
      linkedIncidents: ['INC-002'],
      createdDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      investigationNotes: [
        { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Initial analysis points to long-running queries from the reporting module during peak hours.' },
        { timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'DBA team has identified 3 specific queries. Working with reporting team to optimize.' },
      ]
    },
    {
      id: 'PRB-002',
      title: 'Intermittent High Latency on Login Service',
      status: 'Backlog',
      owner: 'Unassigned',
      linkedIncidents: ['INC-003', 'INC-112', 'INC-145'], // Assuming some old incidents
      createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'PRB-003',
      title: 'Repeated SSL Certificate Renewal Failures',
      status: 'Resolved',
      owner: 'Frank',
      linkedIncidents: ['INC-006'],
      createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      rcaSummary: 'The root cause was an expired API key in the automation vault used by the renewal script. The key has been updated and a monitoring check has been added to alert on key expiration 30 days in advance.'
    },
     {
      id: 'PRB-004',
      title: 'Production Server Unresponsiveness',
      status: 'Investigation',
      owner: 'Alice',
      linkedIncidents: ['INC-001'],
      createdDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      investigationNotes: [
        { timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000), note: 'Hardware diagnostics returned clean. Shifting investigation to software and kernel parameters.' },
      ]
    }
  ]);

  problems = this._problems.asReadonly();
  
  getProblemById(id: string) {
    return computed(() => this._problems().find(p => p.id === id));
  }

  getIncidentsForProblem(problem: Problem) {
      return problem.linkedIncidents.map(id => this.incidentService.getIncidentById(id)).filter(inc => !!inc);
  }

  updateRcaSummary(problemId: string, summary: string) {
    this._problems.update(problems => 
      problems.map(p => 
        p.id === problemId ? { ...p, rcaSummary: summary } : p
      )
    );
  }
}
