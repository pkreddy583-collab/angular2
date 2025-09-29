import { Injectable, signal } from '@angular/core';
import { MasterActivity, ActivitySuggestion, FteCalculationModel, SlaConfig } from '../models/admin.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private _fteCalculationModel = signal<FteCalculationModel>('Average');

  private _masterActivities = signal<MasterActivity[]>([
    // Response
    { id: 1, name: 'Major Incident Command', category: 'Response', defaultFrequency: 'Ad-hoc', defaultHrsPerInstance: 8.0 },
    { id: 2, name: 'One-shot manual fixes', category: 'Response', defaultFrequency: 'Weekly', defaultHrsPerInstance: 2.0 },
    // Proactive
    { id: 3, name: 'Healthcheck Scripting', category: 'Proactive', defaultFrequency: 'Monthly', defaultHrsPerInstance: 16.0 },
    { id: 4, name: 'Production Turnover Analysis', category: 'Proactive', defaultFrequency: 'Bi-Weekly', defaultHrsPerInstance: 8.0 },
    // Continuous Improvement
    { id: 5, name: 'Automation for Toil', category: 'Continuous Improvement', defaultFrequency: 'Sprint', defaultHrsPerInstance: 20.0 },
    { id: 6, name: 'Tech Debt Remediation', category: 'Continuous Improvement', defaultFrequency: 'Sprint', defaultHrsPerInstance: 40.0 },
    // Shift Left
    { id: 7, name: 'KT Session with L1', category: 'Shift Left / Onboarding', defaultFrequency: 'Monthly', defaultHrsPerInstance: 4.0 },
    { id: 8, name: 'Self-service Tool Training', category: 'Shift Left / Onboarding', defaultFrequency: 'Ad-hoc', defaultHrsPerInstance: 2.0 },
    { id: 9, name: 'Onboarding new team member', category: 'Shift Left / Onboarding', defaultFrequency: 'Ad-hoc', defaultHrsPerInstance: 30.0 },
    // Governance
    { id: 10, name: 'SME Declaration Meeting', category: 'Governance', defaultFrequency: 'Weekly', defaultHrsPerInstance: 2.0 },
    { id: 11, name: 'Business Review Prep', category: 'Governance', defaultFrequency: 'Monthly', defaultHrsPerInstance: 8.0 },
  ]);

  private _activitySuggestions = signal<ActivitySuggestion[]>([
    { id: 1, suggestedName: 'Post-Incident Review Meeting', category: 'Response', justification: 'We need to track time spent on RCA and follow-ups.', status: 'pending', submittedBy: 'Charlie (Tower Head)', dateSubmitted: new Date() },
    { id: 2, suggestedName: 'Capacity Planning Analysis', category: 'Proactive', justification: 'This is a quarterly activity that takes significant time and should be accounted for.', status: 'rejected', submittedBy: 'Diana (Tower Head)', dateSubmitted: new Date(Date.now() - 86400000 * 5) },
  ]);
  
  private _slaConfigs = signal<SlaConfig[]>([
    { priority: 'P1', value: 8, unit: 'hours', businessHoursOnly: true, description: 'Critical incident with major business impact. Requires immediate attention.' },
    { priority: 'P2', value: 24, unit: 'hours', businessHoursOnly: true, description: 'High impact incident affecting a large number of users or critical functions.' },
    { priority: 'P3', value: 3, unit: 'days', businessHoursOnly: false, description: 'Medium impact incident affecting a limited number of users or non-critical functions.' },
    { priority: 'P4', value: 2, unit: 'days', businessHoursOnly: true, description: 'Low impact incident with minimal business effect.' },
  ]);

  masterActivities = this._masterActivities.asReadonly();
  activitySuggestions = this._activitySuggestions.asReadonly();
  fteCalculationModel = this._fteCalculationModel.asReadonly();
  slaConfigs = this._slaConfigs.asReadonly();

  setFteCalculationModel(model: FteCalculationModel) {
    this._fteCalculationModel.set(model);
  }

  updateSlaConfigs(configs: SlaConfig[]) {
    this._slaConfigs.set(configs);
  }

  addMasterActivity(activity: Omit<MasterActivity, 'id'>) {
    this._masterActivities.update(activities => {
      const newId = Math.max(0, ...activities.map(a => a.id)) + 1;
      return [...activities, { ...activity, id: newId }];
    });
  }

  addActivitySuggestion(suggestion: Omit<ActivitySuggestion, 'id' | 'status' | 'dateSubmitted'>) {
    this._activitySuggestions.update(suggestions => {
      const newId = Math.max(0, ...suggestions.map(s => s.id)) + 1;
      const newSuggestion: ActivitySuggestion = {
        ...suggestion,
        id: newId,
        status: 'pending',
        dateSubmitted: new Date()
      };
      return [newSuggestion, ...suggestions];
    });
  }

  approveSuggestion(id: number) {
    this._activitySuggestions.update(suggestions => {
      const suggestion = suggestions.find(s => s.id === id);
      if (suggestion) {
        suggestion.status = 'approved';
        // Add to master list if it's not already there
        if (!this._masterActivities().some(a => a.name === suggestion.suggestedName && a.category === suggestion.category)) {
          this.addMasterActivity({
            name: suggestion.suggestedName,
            category: suggestion.category,
            defaultFrequency: 'Ad-hoc', // Admins can refine this later
            defaultHrsPerInstance: 1 
          });
        }
      }
      return [...suggestions];
    });
  }

  rejectSuggestion(id: number) {
    this._activitySuggestions.update(suggestions => {
      const suggestion = suggestions.find(s => s.id === id);
      if (suggestion) {
        suggestion.status = 'rejected';
      }
      return [...suggestions];
    });
  }
}