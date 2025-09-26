import { Injectable, signal } from '@angular/core';

interface IncidentStub {
  id: string;
  title: string;
}

const MOCK_INCIDENTS: IncidentStub[] = [
  { id: 'INC-001', title: 'Production server unresponsive' },
  { id: 'INC-002', title: 'Database connection pool exhausted' },
  { id: 'INC-006', title: 'SSL certificate renewal failure' }
];

@Injectable({
  providedIn: 'root'
})
export class PostmortemService {
  private _incidents = signal<IncidentStub[]>(MOCK_INCIDENTS);
  
  getIncidentsForPostmortem() {
    return this._incidents.asReadonly();
  }
}
