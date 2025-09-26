import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from '../../../../services/gemini.service';
import { AiRoiSummary } from '../../../../models/ai-roi.model';

@Component({
  selector: 'app-ai-roi-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-roi-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiRoiSummaryComponent implements OnInit {
  private geminiService = inject(GeminiService);

  summary = signal<AiRoiSummary | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  async ngOnInit() {
    try {
      const result = await this.geminiService.getAiRoiSummary();
      this.summary.set(result);
    } catch (e) {
      console.error(e);
      this.error.set('Failed to load AI ROI data.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
