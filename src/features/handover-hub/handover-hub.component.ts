import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HandoverService } from '../../services/handover.service';
import { PortfolioHealth, HistoricalHandover } from '../../models/handover.model';
import { IncidentHandoverCardComponent } from './incident-handover-card/incident-handover-card.component';
import { StarRatingComponent } from './star-rating/star-rating.component';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-handover-hub',
  standalone: true,
  imports: [CommonModule, IncidentHandoverCardComponent, StarRatingComponent],
  templateUrl: './handover-hub.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandoverHubComponent {
  private handoverService = inject(HandoverService);
  private geminiService = inject(GeminiService);

  // --- State for both views ---
  portfolios = this.handoverService.getPortfolios();
  activePortfolioId = this.handoverService.activePortfolioId;
  activeView = signal<'live' | 'history'>('live');

  // --- State for 'Live' view ---
  activePortfolio = this.handoverService.activePortfolio;
  activeIncidents = this.handoverService.activePortfolioIncidents;
  handoverData = this.handoverService.activePortfolioHandoverData;
  
  // AI Generation State
  isEodGenerating = signal(false);
  isBodGenerating = signal(false);

  // --- State for 'History' view ---
  selectedHistoryDate = signal(new Date().toISOString().split('T')[0]);
  historyForDate = computed(() => this.handoverService.getHistoryForDate(this.selectedHistoryDate()));

  // A signal to hold the pending feedback for the history view
  feedbackComments = signal<{ [historyId: string]: string }>({});


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
  onNotesChange(type: 'eod' | 'bod', event: Event) {
    const portfolioId = this.activePortfolioId();
    const value = (event.target as HTMLTextAreaElement).value;
    if (type === 'eod') {
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

  async generateSummary(type: 'eod' | 'bod') {
    const portfolioId = this.activePortfolioId();
    const incidents = this.activeIncidents();
    
    if (type === 'eod') {
      this.isEodGenerating.set(true);
    } else {
      this.isBodGenerating.set(true);
    }
    
    try {
      const summary = await this.geminiService.generateHandoverSummary(incidents);
      if (type === 'eod') {
        this.handoverService.updateNotes(portfolioId, { onshoreToOffshore: summary });
      } else {
        this.handoverService.updateNotes(portfolioId, { offshoreToOnshore: summary });
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      // Optionally show an error message to the user
    } finally {
      if (type === 'eod') {
        this.isEodGenerating.set(false);
      } else {
        this.isBodGenerating.set(false);
      }
    }
  }

  archiveHandovers() {
    this.handoverService.archiveCurrentHandovers();
    // Switch to history view to see the result
    this.selectedHistoryDate.set(new Date().toISOString().split('T')[0]);
    this.activeView.set('history');
  }

  // --- Methods for 'History' view ---
  onDateChange(event: Event) {
    const newDate = (event.target as HTMLInputElement).value;
    this.selectedHistoryDate.set(newDate);
    this.feedbackComments.set({}); // Clear pending comments when date changes
  }

  onRatingChange(historyId: string, newRating: number) {
    const entry = this.historyForDate().find(h => h.id === historyId);
    if (entry) {
      // We update immediately when the rating is clicked
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
    // Clear the pending comment for this item after submission
    this.feedbackComments.update(comments => {
        const newComments = { ...comments };
        delete newComments[historyEntry.id];
        return newComments;
    });
  }
}