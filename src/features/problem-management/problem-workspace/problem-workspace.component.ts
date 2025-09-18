import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ProblemRecord {
  id: string;
  title: string;
  status: 'Root Cause Analysis' | 'Fix In Progress' | 'Monitoring' | 'Resolved';
  created: Date;
  linkedIncidents: string[];
  owner: string;
}

@Component({
  selector: 'app-problem-workspace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './problem-workspace.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProblemWorkspaceComponent {
  problems = signal<ProblemRecord[]>([
    { id: 'PRB-001', title: 'Recurring database connection pool exhaustion', status: 'Root Cause Analysis', created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), linkedIncidents: ['INC-002', 'INC-078', 'INC-112'], owner: 'Database Team' },
    { id: 'PRB-002', title: 'Intermittent high latency on login service', status: 'Fix In Progress', created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), linkedIncidents: ['INC-003', 'INC-065'], owner: 'Auth Service Team' },
    { id: 'PRB-003', title: 'File uploads fail for files over 50MB', status: 'Resolved', created: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), linkedIncidents: ['INC-005'], owner: 'Infrastructure Team' },
    { id: 'PRB-004', title: 'HR Portal performance degradation under load', status: 'Monitoring', created: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), linkedIncidents: ['INC-004', 'INC-091'], owner: 'Apps Team' },
  ]);

  getStatusClass(status: ProblemRecord['status']) {
    switch (status) {
      case 'Root Cause Analysis': return 'bg-yellow-100 text-yellow-800';
      case 'Fix In Progress': return 'bg-blue-100 text-blue-800';
      case 'Monitoring': return 'bg-indigo-100 text-indigo-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
    }
  }
}
