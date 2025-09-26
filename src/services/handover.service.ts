import { Injectable, signal, computed, inject } from '@angular/core';
import { Portfolio, HandoverNotes, PortfolioHealth, HistoricalHandover, EmailTemplate } from '../models/handover.model';
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

const createHistoryEntry = (dateOffset: number, portfolioId: string, portfolioName: string, health: PortfolioHealth, notes: Partial<HandoverNotes>, feedback: {rating: number, comment: string}): HistoricalHandover => {
    const d = new Date();
    d.setDate(d.getDate() - dateOffset);
    const dateStr = d.toISOString().split('T')[0];
    return {
        id: `${portfolioId}-${dateStr}`,
        date: dateStr,
        portfolioId,
        portfolioName,
        portfolioHealth: health,
        notes: {
            onshoreToOffshore: '',
            offshoreToOnshore: '',
            incidentGists: {},
            ...notes
        },
        incidents: [], // In a real app, this would be a snapshot
        feedback
    };
};

const initialHistory: HistoricalHandover[] = [
    createHistoryEntry(1, 'portfolio-1', 'Core Services', 'Warning', 
      { onshoreToOffshore: 'EOD T-1: Rolled out patch for auth service. Keeping an eye on INC-002.', offshoreToOnshore: 'BOD T-1: Patch looks stable. No new alerts overnight.', incidentGists: { 'INC-002': 'Database performance remains a concern.' } },
      { rating: 4, comment: 'Good handover, clear notes on the auth service patch.' }
    ),
    createHistoryEntry(1, 'portfolio-3', 'Public Facing', 'Healthy', 
      { onshoreToOffshore: 'Site performance was stable all day.', offshoreToOnshore: '' },
      { rating: 5, comment: 'Quiet day, no issues.' }
    ),
     createHistoryEntry(2, 'portfolio-1', 'Core Services', 'Critical', 
      { onshoreToOffshore: 'EOD T-2: Major DB latency spike investigated. Root cause was a runaway query, now killed.', offshoreToOnshore: 'BOD T-2: DB performance is back to normal. Monitored overnight.', incidentGists: { 'INC-002': 'Runaway query killed, but need to find the source.' } },
      { rating: 3, comment: 'Handover was okay, but the initial alert for the DB spike was missed by 30 minutes.' }
    ),
    createHistoryEntry(2, 'portfolio-2', 'Finance & HR', 'Healthy', 
      { onshoreToOffshore: 'No incidents today. Completed planned maintenance on payroll service.', offshoreToOnshore: '' },
      { rating: 0, comment: '' }
    ),
    createHistoryEntry(3, 'portfolio-3', 'Public Facing', 'Critical', 
      { onshoreToOffshore: 'EOD T-3: Dealing with a DDoS attack. Mitigation steps are in place with Cloudflare.', offshoreToOnshore: 'BOD T-3: Attack has subsided. Traffic patterns are back to normal.' },
      { rating: 5, comment: 'Excellent communication and quick response during the DDoS event. Great work team.' }
    ),
];

const initialEmailTemplates: { [portfolioId: string]: EmailTemplate } = {
  'portfolio-1': {
    to: 'offshore-core@example.com',
    cc: 'onshore-core-leads@example.com;global-sre@example.com',
    subject: 'EOD Handover: {{portfolioName}} - {{date}}'
  },
  'portfolio-2': {
    to: 'offshore-finance@example.com',
    cc: 'onshore-finance-leads@example.com',
    subject: 'EOD Handover: {{portfolioName}} - {{date}}'
  },
  'portfolio-3': {
    to: 'offshore-public@example.com',
    cc: 'onshore-public-leads@example.com;security-oncall@example.com',
    subject: 'CRITICAL EOD Handover: {{portfolioName}} - {{date}}'
  }
};


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
  private emailTemplates = signal<{ [portfolioId: string]: EmailTemplate }>(initialEmailTemplates);

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

  getEmailTemplate(portfolioId: string): EmailTemplate | undefined {
    return this.emailTemplates()[portfolioId];
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
    
    this.handoverHistory.update(history => [...newHistoryEntries, ...history].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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
