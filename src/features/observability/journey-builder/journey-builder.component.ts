import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { JourneyBuilderService } from '../../../services/journey-builder.service';

@Component({
  selector: 'app-journey-builder',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, CommonModule],
  templateUrl: './journey-builder.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneyBuilderComponent implements OnInit {
  private journeyBuilderService = inject(JourneyBuilderService);

  savedJourneys = this.journeyBuilderService.getSavedJourneys();
  journeyForm!: FormGroup;
  saveSuccess = signal(false);

  ngOnInit(): void {
    this.journeyForm = new FormGroup({
      name: new FormControl('', Validators.required),
      steps: new FormArray([this.createStep()]),
    });
  }

  get steps(): FormArray {
    return this.journeyForm.get('steps') as FormArray;
  }

  createStep(): FormGroup {
    return new FormGroup({
      stepName: new FormControl('', Validators.required),
      serviceName: new FormControl('', Validators.required),
      slaMs: new FormControl(1000, [Validators.required, Validators.min(1)]),
      errorRateThreshold: new FormControl(1, [
        Validators.required,
        Validators.min(0),
        Validators.max(100),
      ]),
    });
  }

  addStep(): void {
    this.steps.push(this.createStep());
  }

  removeStep(index: number): void {
    if (this.steps.length > 1) {
      this.steps.removeAt(index);
    }
  }

  saveJourney(): void {
    if (this.journeyForm.valid) {
      this.journeyBuilderService.saveJourney(this.journeyForm.value);
      this.journeyForm.reset({ name: '' });
      this.steps.clear();
      this.addStep();
      this.saveSuccess.set(true);
      setTimeout(() => this.saveSuccess.set(false), 3000);
    } else {
      this.journeyForm.markAllAsTouched();
    }
  }
}
