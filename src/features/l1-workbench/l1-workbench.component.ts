import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { GeminiService } from '../../services/gemini.service';
import { L1TriageResult, L1SuggestedAction } from '../../models/l1-workbench.model';

@Component({
  selector: 'app-l1-workbench',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './l1-workbench.component.html',
  styleUrls: ['./l1-workbench.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class L1WorkbenchComponent {
  private geminiService = inject(GeminiService);

  problemDescription = new FormControl('', Validators.required);
  
  isLoading = signal(false);
  error = signal<string | null>(null);
  triageResult = signal<L1TriageResult | null>(null);

  async analyzeProblem(): Promise<void> {
    if (this.problemDescription.invalid) return;

    this.isLoading.set(true);
    this.error.set(null);
    this.triageResult.set(null);

    try {
      const result = await this.geminiService.getL1Triage(this.problemDescription.value!);
      this.triageResult.set(result);
    } catch (e: any) {
      this.error.set(e.message || 'An unknown error occurred.');
    } finally {
      this.isLoading.set(false);
    }
  }
  
  toggleAction(actionToToggle: L1SuggestedAction): void {
    this.triageResult.update(res => {
      if (!res) return null;
      return {
        ...res,
        suggestedActions: res.suggestedActions.map(action => 
          action.text === actionToToggle.text 
            ? { ...action, done: !action.done }
            : action
        )
      };
    });
  }
  
  reset(): void {
    this.problemDescription.reset();
    this.triageResult.set(null);
    this.error.set(null);
    this.isLoading.set(false);
  }
}
