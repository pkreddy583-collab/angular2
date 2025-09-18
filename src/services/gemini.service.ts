import { Injectable } from '@angular/core';
import { Incident } from '../models/incident.model';

@Injectable({
  providedIn: 'root',
})
export class GeminiService {
  // In a real application, you would import and use the @google/genai library here.
  // For this demo, we'll mock the responses with a delay to simulate an API call.

  constructor() {}

  async generateIncidentGist(incident: Incident): Promise<string> {
    console.log('Generating AI Gist for incident:', incident.id);
    await this.mockApiDelay();

    switch (incident.id) {
      case 'INC-001':
        return 'Critical hardware failure suspected. Recommend immediate on-site inspection of RAID controller.';
      case 'INC-002':
        return 'Recurring issue. Pool size increase is a temporary fix. Analyze long-running queries for root cause.';
      case 'INC-003':
        return 'High latency resolved after scaling up. Monitor Apdex score for the next 12 hours.';
      case 'INC-004':
        return 'High memory utilization confirmed. Awaiting scheduled restart. No immediate action needed.';
      case 'INC-005':
        return 'Load balancer misconfiguration identified. Fix is being deployed. No further action required.';
      case 'INC-006':
        return 'Security team is manually renewing certificate. Monitor public site availability post-deployment.';
      default:
        return 'Analyze logs for initial triage and identify affected downstream services.';
    }
  }

  async generateHandoverSummary(incidents: Incident[]): Promise<string> {
    console.log('Generating AI Handover Summary for incidents:', incidents.map(i => i.id));
    await this.mockApiDelay(1500);

    if (incidents.length === 0) {
      return 'All systems are nominal. No active high-priority incidents to hand over for this portfolio.';
    }

    const summaryPoints = incidents.map(incident => {
      return `- ${incident.id} (${incident.priority}): ${incident.title}. Status: ${incident.lastUpdate}. AI Suggestion: ${incident.aiGist}`;
    });

    return `Handover Summary:
The following high-priority incidents require monitoring:
${summaryPoints.join('\n')}

Overall portfolio health is at risk due to the active P1 incidents. Please prioritize accordingly.`;
  }


  private mockApiDelay(duration: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, duration));
  }
}