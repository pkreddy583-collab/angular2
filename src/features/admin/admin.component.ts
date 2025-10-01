import { Component, ChangeDetectionStrategy, inject, computed, OnInit, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, Validators, FormGroup, ValidatorFn, AbstractControl, ValidationErrors, FormControl, FormArray } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { AnalyticsService } from '../../services/analytics.service';
import { Frequency } from '../../models/tower-report.model';
import { FteCalculationModel, SlaConfig } from '../../models/admin.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DatePipe, DecimalPipe, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminComponent implements OnInit {
  private adminService = inject(AdminService);
  private analyticsService = inject(AnalyticsService);

  masterActivities = this.adminService.masterActivities;
  fteCalculationModel = this.adminService.fteCalculationModel;
  slaConfigs = this.adminService.slaConfigs;
  supportGroupConfigs = this.adminService.supportGroupConfigs;
  
  pendingSuggestions = computed(() => 
    this.adminService.activitySuggestions().filter(s => s.status === 'pending')
  );
  
  reviewedSuggestions = computed(() => 
    this.adminService.activitySuggestions().filter(s => s.status !== 'pending')
  );

  activityForm: FormGroup;
  slaForm!: FormGroup;
  slaSaveStatus = signal<'idle' | 'saving' | 'saved'>('idle');
  
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

  databricksQuery = `-- This query pulls all active, high-priority incidents for the Watchtower.
-- The backend service should execute this against your Databricks cluster.
-- Ensure date columns are returned as ISO 8601 strings.

SELECT 
    incident_id AS id,
    title,
    priority,
    assignee AS assignedTo,
    created_timestamp AS createdDate,
    sla_breach_timestamp AS slaBreachDate,
    description,
    affected_services AS affectedServices,
    last_update_message AS lastUpdate
FROM 
    your_ticketing_database.active_incidents
WHERE
    priority IN ('P1', 'P2') AND status != 'Resolved'
ORDER BY 
    sla_breach_timestamp ASC;`;
  
  copiedQuery = signal(false);

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
    this.activityForm = new FormGroup({
      name: new FormControl('', Validators.required),
      category: new FormControl(this.activityCategories[0], Validators.required),
      defaultFrequency: new FormControl(this.frequencies[0], Validators.required),
      defaultHrsPerInstance: new FormControl(1, [Validators.required, Validators.min(0.1)])
    }, {
      validators: this.duplicateActivityValidator()
    });
  }
  
  ngOnInit(): void {
    this.buildSlaForm();
  }

  private buildSlaForm(): void {
    const configs = this.slaConfigs();
    this.slaForm = new FormGroup({
      configs: new FormArray(
        configs.map(config => new FormGroup({
          priority: new FormControl(config.priority),
          value: new FormControl(config.value, [Validators.required, Validators.min(1)]),
          unit: new FormControl(config.unit, Validators.required),
          businessHoursOnly: new FormControl(config.businessHoursOnly),
          description: new FormControl(config.description, Validators.required)
        }))
      )
    });
  }

  get slaConfigsArray(): FormArray {
    return this.slaForm.get('configs') as FormArray;
  }

  saveSlaConfigs(): void {
    if (this.slaForm.invalid) {
      return;
    }
    this.slaSaveStatus.set('saving');
    this.adminService.updateSlaConfigs(this.slaForm.value.configs);
    setTimeout(() => {
      this.slaSaveStatus.set('saved');
      setTimeout(() => this.slaSaveStatus.set('idle'), 2000);
    }, 500);
  }
  
  copyDatabricksQuery(): void {
    navigator.clipboard.writeText(this.databricksQuery).then(() => {
      this.copiedQuery.set(true);
      setTimeout(() => this.copiedQuery.set(false), 2000);
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

  onSupportGroupChange(portfolioId: string, appId: string | null, level: 'l1' | 'l2' | 'l3', event: Event): void {
    const groupName = (event.target as HTMLInputElement).value;
    this.adminService.updateSupportGroup(portfolioId, appId, level, groupName);
  }
}