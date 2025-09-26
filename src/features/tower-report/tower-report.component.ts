import { Component, ChangeDetectionStrategy, inject, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TowerReportService } from '../../services/tower-report.service';
import { AdminService } from '../../services/admin.service';
import { AnalyticsService } from '../../services/analytics.service';
import { MasterActivity } from '../../models/admin.model';
import { DoughnutChartComponent } from './doughnut-chart.component';
import { CollapsibleSectionComponent } from './collapsible-section.component';
import { SparklineChartComponent } from './sparkline-chart.component';
import { Frequency } from '../../models/tower-report.model';
import { AnalyticsModalComponent } from './analytics-modal.component';

@Component({
  selector: 'app-tower-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DoughnutChartComponent,
    CollapsibleSectionComponent,
    SparklineChartComponent,
    AnalyticsModalComponent,
  ],
  templateUrl: './tower-report.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TowerReportComponent implements OnInit, OnDestroy {
  private reportService = inject(TowerReportService);
  private adminService = inject(AdminService);
  private analyticsService = inject(AnalyticsService);
  private destroy$ = new Subject<void>();

  // Expose signals from services to the template
  reportData = this.reportService.reportData;
  availableFte = this.reportService.availableFte;
  ticketDrivenWork = this.reportService.ticketDrivenWorkCalculations;
  finalTicketDrivenFte = this.reportService.finalTicketDrivenFte;
  structuredActivities = this.reportService.structuredActivitiesCalculations;
  totalRequiredFte = this.reportService.totalRequiredFte;
  surplusFte = this.reportService.surplusFte;
  workloadComposition = this.reportService.workloadComposition;
  masterActivities = this.adminService.masterActivities;
  fteCalculationModel = this.adminService.fteCalculationModel;
  
  activitiesForm!: FormGroup;
  suggestionForm: FormGroup;
  
  isSuggestionModalOpen = signal(false);
  suggestionCategory = signal('');
  activitySearchState = signal<{ [key: string]: { term: string; open: boolean } }>({});

  // Analytics Modal State
  isAnalyticsModalOpen = signal(false);
  analyticsTitle = signal('');
  analyticsData = signal<any>(null);

  frequencies: Frequency[] = ['Ad-hoc', 'Weekly', 'Bi-Weekly', 'Monthly', 'Sprint'];

  // New computed signal for the column header
  estimatedTimeColumnHeader = computed(() => {
    const model = this.fteCalculationModel();
    switch (model) {
      case 'Median':
        return 'Median Time (m)';
      case 'P75':
        return 'P75 Time (m)';
      case 'P90':
        return 'P90 Time (m)';
      case 'Average':
      default:
        return 'Avg Time (m)';
    }
  });

  // Computes which master activities are available to be added to each category
  availableActivitiesByCategory = computed(() => {
    const allMaster = this.masterActivities();
    const currentCategories = this.structuredActivities();
    const result: { [key: string]: MasterActivity[] } = {};

    for (const category of currentCategories) {
      const activitiesInReport = category.items.map(i => i.activityName);
      
      result[category.name] = allMaster.filter(master => 
        master.category === category.name && !activitiesInReport.includes(master.name)
      );
    }
    return result;
  });

  filteredActivitiesByCategory = computed(() => {
    const searchState = this.activitySearchState();
    const availableActivities = this.availableActivitiesByCategory();
    const result: { [key: string]: MasterActivity[] } = {};

    for (const categoryName in availableActivities) {
        const state = searchState[categoryName];
        if (state && state.term.trim()) {
            const lowerCaseTerm = state.term.toLowerCase();
            result[categoryName] = availableActivities[categoryName].filter(activity =>
                activity.name.toLowerCase().includes(lowerCaseTerm)
            );
        } else {
            result[categoryName] = availableActivities[categoryName];
        }
    }
    return result;
  });

  constructor() {
    this.suggestionForm = new FormGroup({
      suggestedName: new FormControl('', Validators.required),
      justification: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.buildForm();
    this.initializeSearchState();
    this.listenToFormChanges();
  }
  
  private buildForm(): void {
    const categories = this.reportData().structuredActivities;
    const group: { [key: string]: FormArray } = {};

    categories.forEach(category => {
      const array = new FormArray(
        category.items.map(item => new FormGroup({
          id: new FormControl(item.id),
          instances: new FormControl(item.instances),
          hrsPerInstance: new FormControl(item.hrsPerInstance),
          frequency: new FormControl(item.frequency),
        }))
      );
      group[category.name] = array;
    });
    this.activitiesForm = new FormGroup(group);
  }

  private initializeSearchState(): void {
    const initialState: { [key: string]: { term: string; open: boolean } } = {};
    this.reportData().structuredActivities.forEach(category => {
      initialState[category.name] = { term: '', open: false };
    });
    this.activitySearchState.set(initialState);
  }
  
  private listenToFormChanges(): void {
    this.activitiesForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        takeUntil(this.destroy$)
      )
      .subscribe((formValue) => {
        const formObject = formValue as Record<string, any>;
        for (const categoryName in formObject) {
          const items = formObject[categoryName];
          items.forEach((item: { id: number; instances: number; hrsPerInstance: number; frequency: Frequency }) => {
            this.reportService.updateStructuredActivity(categoryName, item.id, {
              instances: Number(item.instances) || 0,
              hrsPerInstance: Number(item.hrsPerInstance) || 0,
              frequency: item.frequency,
            });
          });
        }
      });
  }

  onActivitySearch(categoryName: string, event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.activitySearchState.update(state => {
      if (state[categoryName]) {
        state[categoryName].term = term;
      }
      return { ...state };
    });
  }

  toggleActivityDropdown(categoryName: string, force?: boolean): void {
    this.activitySearchState.update(state => {
      if (state[categoryName]) {
        state[categoryName].open = force !== undefined ? force : !state[categoryName].open;
      }
      // Close all other dropdowns
      Object.keys(state).forEach(key => {
        if (key !== categoryName) {
          state[key].open = false;
        }
      });
      return { ...state };
    });
  }

  selectAndAddActivity(categoryName: string, activity: MasterActivity): void {
    this.reportService.addStructuredActivity(categoryName, activity);
    
    const categoryModel = this.reportData().structuredActivities.find(c => c.name === categoryName);
    const newItem = categoryModel?.items.find(i => i.activityName === activity.name);

    if (newItem) {
        const formArray = this.activitiesForm.get(categoryName) as FormArray;
        if (formArray) {
            formArray.push(new FormGroup({
                id: new FormControl(newItem.id),
                instances: new FormControl(newItem.instances),
                hrsPerInstance: new FormControl(newItem.hrsPerInstance),
                frequency: new FormControl(newItem.frequency),
            }));
        }
    }

    // Reset search state for this category
    this.activitySearchState.update(state => {
        if (state[categoryName]) {
            state[categoryName].term = '';
            state[categoryName].open = false;
        }
        return { ...state };
    });
  }

  openSuggestionModal(categoryName: string): void {
    this.suggestionCategory.set(categoryName);
    this.isSuggestionModalOpen.set(true);
  }

  closeSuggestionModal(): void {
    this.isSuggestionModalOpen.set(false);
    this.suggestionForm.reset();
  }

  submitSuggestion(): void {
    if (this.suggestionForm.valid) {
      const { suggestedName, justification } = this.suggestionForm.value;
      this.adminService.addActivitySuggestion({
        suggestedName,
        justification,
        category: this.suggestionCategory(),
        submittedBy: 'Tower Head' // Mock user
      });
      this.closeSuggestionModal();
    }
  }

  onManagerAdjustmentChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.reportService.updateManagerAdjustment(Number(value));
  }
  
  onTicketAdjustmentChange(event: Event, itemId: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value === '' ? null : Number(input.value);
    this.reportService.updateTicketItemAdjustment(itemId, value);
  }

  onStructuredAdjustmentChange(event: Event, categoryName: string, itemId: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value === '' ? null : Number(input.value);
    this.reportService.updateStructuredItemAdjustment(categoryName, itemId, value);
  }

  openAnalyticsModal(type: 'tickets' | 'structured'): void {
    if (type === 'tickets') {
      this.analyticsTitle.set('Ticket-Driven Work Analytics');
      this.analyticsData.set(this.ticketDrivenWork().items);
    }
    // Can add more types for structured activities later
    this.isAnalyticsModalOpen.set(true);
  }

  closeAnalyticsModal(): void {
    this.isAnalyticsModalOpen.set(false);
  }

  exportTicketDrivenWork(): void {
    const dataToExport = this.ticketDrivenWork().items.map(item => ({
      Category: item.category,
      Priority: item.priority,
      Count: item.count,
      [`Estimated_Time_(${this.fteCalculationModel()})`]: item.effectiveTime,
      Hours: item.hours,
      FTE: item.fte,
      MoM_FTE_Change: item.fteChange,
    }));
    this.analyticsService.exportToCsv(dataToExport, 'ticket_driven_work_report');
  }

  exportStructuredActivities(categoryName: string): void {
    const category = this.structuredActivities().find(c => c.name === categoryName);
    if (!category) return;
    
    const dataToExport = category.items.map(item => ({
      Activity_Name: item.activityName,
      Frequency: item.frequency,
      Instances: item.instances,
      Hours_Per_Instance: item.hrsPerInstance,
      Total_Hours: item.totalHours,
      Calculated_FTE: item.calculatedFte,
      MoM_FTE_Change: item.fteChange,
    }));
    const filename = `structured_activities_${categoryName.toLowerCase().replace(/ /g, '_')}`;
    this.analyticsService.exportToCsv(dataToExport, filename);
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}