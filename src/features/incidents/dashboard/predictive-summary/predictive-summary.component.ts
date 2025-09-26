import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../../../services/gemini.service';
import { PredictionSummary } from '../../../../models/predictive.model';

@Component({
  selector: 'app-predictive-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './predictive-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredictiveSummaryComponent implements OnInit {
  private geminiService = inject(GeminiService);

  predictions = signal<PredictionSummary[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  async ngOnInit() {
    try {
      const result = await this.geminiService.getDashboardPredictions();
      this.predictions.set(result);
    } catch (e) {
      console.error(e);
      this.error.set('Failed to load predictive briefing.');
    } finally {
      this.isLoading.set(false);
    }
  }

  getConfidenceClass(confidence: 'High' | 'Medium' | 'Low') {
    switch (confidence) {
      case 'High': return 'text-green-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-orange-600';
    }
  }
}
