import { Injectable, signal, computed, inject } from '@angular/core';
import { Portfolio, HandoverNotes, PortfolioHealth, HistoricalHandover } from '../models/handover.model';
import { IncidentService } from './incident.service';
import { Incident } from '../models/incident.model';

const initialHandoverData: { [key: string]: HandoverNotes } = {
  'portfolio-1': {
    onshoreToOffshore: `EOD Update for Core Services:
- Investigated high latency on the User Authentication service (INC-003). The service has been scaled up and performance is being monitored. No further issues reported in the last 4 hours.
- Deployed a fix for the file upload service (INC-005). The misconfiguration in the load balancer is resolved. Please monitor for any recurring issues.
- All other systems are nominal.`,
    offshoreToOnshore: ``,
    incidentGists: {
      'INC-002': 'Continuing to analyze long-running queries. Increased pool size has stabilized the service for now.',
      'INC-003': 'Monitoring performance after scaling up. Latency seems to have returned to normal levels.',
      'INC-005': 'Fix has been deployed. Closing ticket after monitoring period.'
    }
  },
  'portfolio-2': {
    onshoreToOffshore: `EOD Update for Finance & HR:
- The HR Portal performance issue (INC-004) is still pending server restart during the next maintenance window. We have communicated this to stakeholders.
- No new critical issues.`,
    offshoreToOnshore: `BOD Update:
- Acknowledged the pending restart for INC-004. We will monitor application server metrics.`,
    incidentGists: {
      'INC-004': 'Awaiting scheduled server restart. High memory utilization is confirmed as the likely cause.'
    }
  },
  'portfolio-3': {
    onshoreToOffshore: `EOD Update for Public Facing Services:
- The production server outage (INC-001) is the highest priority. On-call engineer is on-site for physical inspection. Awaiting update.
- SSL certificate renewal (INC-006) has been manually completed by the security team. The public website is no longer at risk.`,
    offshoreToOnshore: ``,
    incidentGists: {
      'INC-001': 'On-call engineer paged and investigating on-site. Potential hardware failure.',
      'INC-006': 'Manual certificate renewal was successful. Monitoring for 24 hours before closing.'
    }
  }
};

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

const initialHistory: HistoricalHandover[] = [
    {
        id: `portfolio-1-${yesterdayStr}`,
        date: yesterdayStr,
        portfolioId: 'portfolio-1',
        portfolioName: 'Core Services',
        portfolioHealth: 'Warning',
        notes: {
            onshoreToOffshore: 'Yesterday EOD: Rolled out patch for auth service. Keeping an eye on INC-002.',
            offshoreToOnshore: 'Yesterday BOD: Patch looks stable. No new alerts overnight.',
            incidentGists: { 'INC-002': 'Database performance remains a concern.' }
        },
        incidents: [], // In a real app, this would be a snapshot
        feedback: { rating: 4, comment: 'Good handover, clear notes on the auth service patch.' }
    },
    {
        id: `portfolio-3-${yesterdayStr}`,
        date: yesterdayStr,
        portfolioId: 'portfolio-3',
        portfolioName: 'Public Facing',
        portfolioHealth: 'Healthy',
        notes: {
            onshoreToOffshore: 'Site performance was stable all day.',
            offshoreToOnshore: '',
            incidentGists: {}
        },
        incidents: [],
        feedback: { rating: 0, comment: '' }
    }
];


@Injectable({
  providedIn: 'root',
})
export class HandoverService {
  private incidentService = inject(IncidentService);

  private portfolios = signal<Portfolio[]>([
    { id: 'portfolio-1', name: 'Core Services', services: ['Order Service', 'User Authentication', 'Inventory Management', 'File Storage Service'], health: 'Warning' },
    { id: 'portfolio-2', name: 'Finance & HR', services: ['HR Portal', 'Payroll Service'], health: 'Healthy' },
    { id: 'portfolio-3', name: 'Public Facing', services: ['All Production Services', 'Public Website'], health: 'Critical' },
  ]);

  private handoverData = signal<{ [portfolioId: string]: HandoverNotes }>(initialHandoverData);
  private handoverHistory = signal<HistoricalHandover[]>(initialHistory);

  activePortfolioId = signal<string>(this.portfolios()[0].id);

  activePortfolio = computed(() => this.portfolios().find(p => p.id === this.activePortfolioId()));

  activePortfolioIncidents = computed(() => {
    const portfolio = this.activePortfolio();
    if (!portfolio) return [];
    
    const allIncidents = this.incidentService.getIncidents()();
    // A service can belong to a portfolio if it's explicitly listed OR if the incident affects 'All Production Services'
    return allIncidents.filter(inc => 
      inc.affectedServices.some(s => portfolio.services.includes(s) || s === 'All Production Services')
    );
  });

  activePortfolioHandoverData = computed(() => {
    const portfolioId = this.activePortfolioId();
    const data = this.handoverData();
    return data[portfolioId] || { onshoreToOffshore: '', offshoreToOnshore: '', incidentGists: {} };
  });

  getPortfolios() {
    return this.portfolios.asReadonly();
  }
  
  selectPortfolio(portfolioId: string) {
    this.activePortfolioId.set(portfolioId);
  }
  
  updateNotes(portfolioId: string, notes: { onshoreToOffshore?: string; offshoreToOnshore?: string }) {
    this.handoverData.update(data => {
      const currentData = data[portfolioId] || { onshoreToOffshore: '', offshoreToOnshore: '', incidentGists: {} };
      data[portfolioId] = { ...currentData, ...notes };
      return { ...data };
    });
  }

  updateIncidentGist(portfolioId: string, incidentId: string, gist: string) {
    this.handoverData.update(data => {
      const currentData = data[portfolioId] || { onshoreToOffshore: '', offshoreToOnshore: '', incidentGists: {} };
      currentData.incidentGists[incidentId] = gist;
      data[portfolioId] = currentData;
      return { ...data };
    });
  }

  // --- History Methods ---

  getHistoryForDate(date: string) { // date in 'YYYY-MM-DD' format
    return this.handoverHistory().filter(h => h.date === date);
  }

  archiveCurrentHandovers() {
    const today = new Date().toISOString().split('T')[0];
    const allPortfolios = this.portfolios();
    const currentData = this.handoverData();
    const allIncidents = this.incidentService.getIncidents()();

    // Prevent duplicate archives for the same day
    if (this.handoverHistory().some(h => h.date === today)) {
      alert("Today's handover has already been archived.");
      return;
    }

    const newHistoryEntries: HistoricalHandover[] = [];

    for (const portfolio of allPortfolios) {
      const notes = currentData[portfolio.id];
      if (notes) { // Only archive if there's data
        const portfolioIncidents = allIncidents.filter(inc => 
          inc.affectedServices.some(s => portfolio.services.includes(s) || s === 'All Production Services')
        );

        newHistoryEntries.push({
          id: `${portfolio.id}-${today}`,
          date: today,
          portfolioId: portfolio.id,
          portfolioName: portfolio.name,
          portfolioHealth: portfolio.health,
          notes: JSON.parse(JSON.stringify(notes)), // Deep copy
          incidents: JSON.parse(JSON.stringify(portfolioIncidents)),
          feedback: { rating: 0, comment: '' }
        });
      }
    }
    
    this.handoverHistory.update(history => [...newHistoryEntries, ...history]);
  }

  updateManagerFeedback(historyId: string, rating: number, comment: string) {
    this.handoverHistory.update(history => {
      const entry = history.find(h => h.id === historyId);
      if (entry) {
        entry.feedback = { rating, comment };
      }
      return [...history];
    });
  }
}
