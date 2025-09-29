import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HandoverService } from '../../services/handover.service';
import { ComplianceService } from '../../services/compliance.service';
import { PortfolioHealth, HistoricalHandover, EmailTemplate } from '../../models/handover.model';
import { IncidentHandoverCardComponent } from './incident-handover-card/incident-handover-card.component';
import { StarRatingComponent } from './star-rating/star-rating.component';
import { GeminiService } from '../../services/gemini.service';
import { Incident } from '../../models/incident.model';

@Component({
  selector: 'app-handover-hub',
  standalone: true,
  imports: [ReactiveFormsModule, IncidentHandoverCardComponent, StarRatingComponent],
  templateUrl: './handover-hub.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandoverHubComponent implements OnInit {
  private handoverService = inject(HandoverService);
  private geminiService = inject(GeminiService);
  private complianceService = inject(ComplianceService);

  // --- State for both views ---
  portfolios = this.handoverService.getPortfolios();
  activePortfolioId = this.handoverService.activePortfolioId;
  activeView = signal<'live' | 'history'>('live');

  // --- State for 'Live' view ---
  activePortfolio = this.handoverService.activePortfolio;
  activeIncidents = this.handoverService.activePortfolioIncidents;
  handoverData = this.handoverService.activePortfolioHandoverData;
  generatingGistFor = signal<string | null>(null);
  isGeneratingEodNotes = signal(false);
  isEmailModalOpen = signal(false);
  emailForm!: FormGroup;
  
  // --- State for 'History' view ---
  private getYesterdayDateString(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }

  selectedHistoryDate = signal(this.getYesterdayDateString());
  historyForDate = computed(() => this.handoverService.getHistoryForDate(this.selectedHistoryDate()));
  feedbackComments = signal<{ [historyId: string]: string }>({});

  ngOnInit() {
    this.emailForm = new FormGroup({
      to: new FormControl('', Validators.required),
      cc: new FormControl(''),
      subject: new FormControl('', Validators.required),
      body: new FormControl('', Validators.required),
    });
  }

  selectPortfolio(id: string): void {
    this.handoverService.selectPortfolio(id);
  }

  getHealthClass(health: PortfolioHealth): string {
    switch (health) {
      case 'Healthy':
        return 'bg-green-500';
      case 'Warning':
        return 'bg-yellow-500';
      case 'Critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  }

  // --- Methods for 'Live' view ---
  onNotesChange(type: 'onshore' | 'offshore', event: Event) {
    const portfolioId = this.activePortfolioId();
    const value = (event.target as HTMLTextAreaElement).value;
    if (type === 'onshore') {
      this.handoverService.updateNotes(portfolioId, { onshoreToOffshore: value });
    } else {
      this.handoverService.updateNotes(portfolioId, { offshoreToOnshore: value });
    }
  }

  onGistChange(incidentId: string, event: Event) {
    const portfolioId = this.activePortfolioId();
    const value = (event.target as HTMLTextAreaElement).value;
    this.handoverService.updateIncidentGist(portfolioId, incidentId, value);
  }

  async generateGist(incident: Incident) {
    this.generatingGistFor.set(incident.id);
    try {
      const gist = await this.geminiService.generateIncidentGist(incident);
      this.handoverService.updateIncidentGist(this.activePortfolioId(), incident.id, gist);
    } finally {
      this.generatingGistFor.set(null);
    }
  }

  async generateEodNotes() {
    this.isGeneratingEodNotes.set(true);
    try {
      const incidents = this.activeIncidents();
      const gists = this.handoverData().incidentGists;
      const summary = await this.geminiService.generateEodSummary(incidents, gists);
      this.handoverService.updateNotes(this.activePortfolioId(), { onshoreToOffshore: summary });
    } finally {
      this.isGeneratingEodNotes.set(false);
    }
  }

  archiveHandovers() {
    this.handoverService.archiveCurrentHandovers();
    this.selectedHistoryDate.set(new Date().toISOString().split('T')[0]);
    this.activeView.set('history');
  }

  private processTemplate(template: EmailTemplate, portfolioName: string): EmailTemplate {
    const today = new Date().toISOString().split('T')[0];
    return {
      to: template.to,
      cc: template.cc,
      subject: template.subject
        .replace('{{portfolioName}}', portfolioName)
        .replace('{{date}}', today),
    };
  }

  openEmailModal() {
    const portfolio = this.activePortfolio();
    if (!portfolio) return;

    const template = this.handoverService.getEmailTemplate(portfolio.id);
    if (!template) {
      alert(`No email template found for portfolio: ${portfolio.name}`);
      return;
    }
    
    const processedTemplate = this.processTemplate(template, portfolio.name);
    const body = this.generateEmailBody();

    this.emailForm.patchValue({ ...processedTemplate, body });
    this.isEmailModalOpen.set(true);
  }

  generateEmailBody(): string {
    const portfolio = this.activePortfolio();
    if (!portfolio) return '';

    const notes = this.handoverData();
    const incidents = this.activeIncidents();

    let body = `**Onshore to Offshore (EOD) Summary:**\n${notes.onshoreToOffshore}\n\n`;
    body += `**Active Incidents Overview:**\n`;

    if (incidents.length > 0) {
      incidents.forEach(inc => {
        body += `- **${inc.id} (${inc.priority}): ${inc.title}**\n`;
        body += `  - Gist: ${notes.incidentGists[inc.id] || 'No gist provided.'}\n`;
      });
    } else {
      body += `- No active incidents for this portfolio.\n`;
    }

    return body;
  }

  sendEmail() {
    if (this.emailForm.invalid) return;
    const portfolio = this.activePortfolio();
    if (!portfolio) return;

    const formValue = this.emailForm.value;

    // In a real app, this would call an email API. Here, we just log it for compliance.
    this.complianceService.logEmail({
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
      type: 'EOD',
      recipients: formValue.to,
      subject: formValue.subject,
    });
    
    this.isEmailModalOpen.set(false);
  }

  // --- Methods for 'History' view ---
  onDateChange(event: Event) {
    const newDate = (event.target as HTMLInputElement).value;
    this.selectedHistoryDate.set(newDate);
    this.feedbackComments.set({});
  }

  onRatingChange(historyId: string, newRating: number) {
    const entry = this.historyForDate().find(h => h.id === historyId);
    if (entry) {
      const comment = this.feedbackComments()[historyId] ?? entry.feedback.comment;
      this.handoverService.updateManagerFeedback(historyId, newRating, comment);
    }
  }
  
  onFeedbackCommentInput(historyId: string, event: Event) {
    const comment = (event.target as HTMLTextAreaElement).value;
    this.feedbackComments.update(comments => ({ ...comments, [historyId]: comment }));
  }

  submitFeedback(historyEntry: HistoricalHandover) {
    const newComment = this.feedbackComments()[historyEntry.id] ?? historyEntry.feedback.comment;
    this.handoverService.updateManagerFeedback(historyEntry.id, historyEntry.feedback.rating, newComment);
    this.feedbackComments.update(comments => {
        const newComments = { ...comments };
        delete newComments[historyEntry.id];
        return newComments;
    });
  }
}
