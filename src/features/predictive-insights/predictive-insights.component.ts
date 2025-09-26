import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { PredictiveService } from '../../services/predictive.service';
import { GeminiService } from '../../services/gemini.service';
import { PredictionResult } from '../../models/predictive.model';

@Component({
  selector: 'app-predictive-insights',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './predictive-insights.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredictiveInsightsComponent {
  private predictiveService = inject(PredictiveService);
  private geminiService = inject(GeminiService);

  // --- State Signals ---
  models = this.predictiveService.getPredictiveModels();
  predictionResult = signal<PredictionResult | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // --- Form Controls ---
  selectedModelIdControl = new FormControl<string | null>(null);
  selectedInputControl = new FormControl<string | null>({ value: null, disabled: true });

  // --- Reactive Signals from Form Controls ---
  selectedModelId = toSignal(this.selectedModelIdControl.valueChanges, { initialValue: null });
  
  // --- Computed Signals for UI Logic ---
  selectedModel = computed(() => {
    const id = this.selectedModelId();
    return this.models().find(m => m.id === id) || null;
  });

  confidenceGauge = computed(() => {
    const result = this.predictionResult();
    if (!result) return { rotation: 0, colorClass: 'text-gray-400' };

    switch (result.confidence) {
      case 'High':
        return { rotation: 135, colorClass: 'text-green-500' }; // 75% of 180
      case 'Medium':
        return { rotation: 90, colorClass: 'text-yellow-500' }; // 50% of 180
      case 'Low':
        return { rotation: 45, colorClass: 'text-orange-500' }; // 25% of 180
      default:
        return { rotation: 0, colorClass: 'text-gray-400' };
    }
  });

  constructor() {
    // Effect to react to model changes and update the input control
    effect(() => {
      const model = this.selectedModel();
      
      this.predictionResult.set(null); // Clear previous results
      this.error.set(null);
      
      if (model && model.inputOptions.length > 0) {
        this.selectedInputControl.setValue(model.inputOptions[0]);
        this.selectedInputControl.enable();
      } else {
        this.selectedInputControl.reset({ value: null, disabled: true });
      }
    });
  }
  
  async generatePrediction(): Promise<void> {
    const model = this.selectedModel();
    const input = this.selectedInputControl.value;

    if (!model || !input) {
      this.error.set('Please select a model and an input parameter.');
      return;
    }

    this.isLoading.set(true);
    this.predictionResult.set(null);
    this.error.set(null);

    try {
      const result = await this.geminiService.generatePrediction(model.name, input);
      this.predictionResult.set(result);
    } catch (e) {
      console.error(e);
      this.error.set('An error occurred while generating the prediction. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }
}