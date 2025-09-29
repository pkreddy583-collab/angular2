import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
// FIX: Import FormControl and remove FormBuilder.
import { ReactiveFormsModule, Validators, FormGroup, ValidatorFn, AbstractControl, ValidationErrors, FormControl } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Frequency } from '../../models/tower-report.model';
import { FteCalculationModel } from '../../models/admin.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent {
  private adminService = inject(AdminService);
  private analyticsService = inject(AnalyticsService);

  masterActivities = this.adminService.masterActivities;
  fteCalculationModel = this.adminService.fteCalculationModel;
  
  pendingSuggestions = computed(() => 
    this.adminService.activitySuggestions().filter(s => s.status === 'pending')
  );
  
  reviewedSuggestions = computed(() => 
    this.adminService.activitySuggestions().filter(s => s.status !== 'pending')
  );

  activityForm: FormGroup;
  
  // In a real app, this might come from a shared config
  activityCategories = [
    'Response', 
    'Proactive', 
    'Continuous Improvement', 
    'Shift Left / Onboarding', 
    'Governance'
  ];

  frequencies: Frequency[] = ['Ad-hoc', 'Weekly', 'Bi-Weekly', 'Monthly', 'Sprint'];
  fteModels: FteCalculationModel[] = ['Average', 'Median', 'P75', 'P90'];

  modelDescription = computed(() => {
    switch (this.fteCalculationModel()) {
      case 'Average':
        return 'Calculates FTE based on the mathematical average time to resolve tickets.';
      case 'Median':
        return 'Calculates FTE based on the median (50th percentile) time. This is a robust measure that is not affected by extreme outliers.';
      case 'P75':
        return 'Calculates FTE based on the 75th percentile, ignoring the top 25% of longest-running tickets to reduce the impact of outliers.';
      case 'P90':
        return 'Calculates FTE based on the 90th percentile, providing a more conservative estimate that accounts for most complex tickets.';
      default:
        return '';
    }
  });

  constructor() {
    // FIX: Replaced FormBuilder with direct instantiation of FormGroup and FormControl to fix 'Property 'group' does not exist on type 'unknown'' error.
    this.activityForm = new FormGroup({
      name: new FormControl('', Validators.required),
      category: new FormControl(this.activityCategories[0], Validators.required),
      defaultFrequency: new FormControl(this.frequencies[0], Validators.required),
      defaultHrsPerInstance: new FormControl(1, [Validators.required, Validators.min(0.1)])
    }, {
      validators: this.duplicateActivityValidator()
    });
  }

  private duplicateActivityValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup;
      // Don't run validation if the child controls aren't there yet
      if (!formGroup.get('name') || !formGroup.get('category')) {
        return null;
      }

      const name = formGroup.get('name')?.value;
      const category = formGroup.get('category')?.value;

      if (!name || !category) {
        return null; // Let required validator handle empty fields
      }

      const trimmedName = name.trim().toLowerCase();
      
      const isDuplicate = this.masterActivities().some(activity => 
        activity.name.trim().toLowerCase() === trimmedName && 
        activity.category === category
      );

      return isDuplicate ? { duplicateActivity: true } : null;
    };
  }

  addMasterActivity() {
    if (this.activityForm.valid) {
      this.adminService.addMasterActivity(this.activityForm.value);
      this.activityForm.reset({
        name: '',
        category: this.activityCategories[0],
        defaultFrequency: this.frequencies[0],
        defaultHrsPerInstance: 1
      });
    }
  }

  onFteModelChange(event: Event) {
    const model = (event.target as HTMLSelectElement).value as FteCalculationModel;
    this.adminService.setFteCalculationModel(model);
  }

  approve(id: number) {
    this.adminService.approveSuggestion(id);
  }

  reject(id: number) {
    this.adminService.rejectSuggestion(id);
  }

  getStatusClass(status: 'pending' | 'approved' | 'rejected') {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
    }
  }

  exportMasterActivities(): void {
    const dataToExport = this.masterActivities().map(a => ({
      ID: a.id,
      Activity_Name: a.name,
      Category: a.category,
      Default_Frequency: a.defaultFrequency,
      Default_Hours_Per_Instance: a.defaultHrsPerInstance,
    }));
    this.analyticsService.exportToCsv(dataToExport, 'master_activity_list');
  }
}
