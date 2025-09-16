import { Injectable, signal, computed, inject } from '@angular/core';
import {
  ReportData,
  StructuredActivityItem,
  Frequency,
} from '../models/tower-report.model';
import { MasterActivity } from '../models/admin.model';
import { AdminService } from './admin.service';

const FTE_HOURS_PER_MONTH = 160;

@Injectable({
  providedIn: 'root',
})
export class TowerReportService {
  private adminService = inject(AdminService);

  private readonly _reportData = signal<ReportData>({
    floatingFte: {
      total: 10.0,
      deployed: 4.0,
    },
    computeTower: {
      name: 'Compute Tower Deep Dive',
      subName: 'Core Infra / Alpha',
      contractualFte: 16.0,
      staffingVsContract: -1.0,
    },
    ticketDrivenWork: {
      managerAdjustment: 0,
      items: [
        { id: 1, category: 'Incidents', priority: 'P1', count: 10, avgTime: 120, p50Time: 110, p75Time: 150, p90Time: 180, countHistory: [5, 8, 10], previousCount: 8, previousAvgTime: 125 },
        { id: 2, category: 'Incidents', priority: 'P2', count: 50, avgTime: 60, p50Time: 55, p75Time: 75, p90Time: 90, countHistory: [70, 60, 50], previousCount: 60, previousAvgTime: 55 },
        { id: 3, category: 'Incidents', priority: 'P3', count: 200, avgTime: 30, p50Time: 25, p75Time: 40, p90Time: 50, countHistory: [190, 210, 200], previousCount: 200, previousAvgTime: 30 },
        { id: 4, category: 'Changes', priority: 'Standard', count: 80, avgTime: 45, p50Time: 40, p75Time: 55, p90Time: 65, countHistory: [90, 100, 80], previousCount: 100, previousAvgTime: 45 },
        { id: 5, category: 'Tasks', priority: 'Standard', count: 150, avgTime: 15, p50Time: 12, p75Time: 20, p90Time: 25, countHistory: [110, 120, 150], previousCount: 120, previousAvgTime: 15 },
      ],
    },
    structuredActivities: [
      {
        name: 'Response',
        items: [
          { id: 1, activityName: 'Major Incident Command', frequency: 'Ad-hoc', instances: 2, hrsPerInstance: 8.0, previousInstances: 1, previousHrsPerInstance: 9.0 },
          { id: 2, activityName: 'One-shot manual fixes', frequency: 'Weekly', instances: 4, hrsPerInstance: 2.0, previousInstances: 4, previousHrsPerInstance: 2.5 },
        ],
      },
      {
        name: 'Proactive',
        items: [
          { id: 3, activityName: 'Healthcheck Scripting', frequency: 'Monthly', instances: 1, hrsPerInstance: 16.0, previousInstances: 1, previousHrsPerInstance: 16.0 },
          { id: 4, activityName: 'Production Turnover Analysis', frequency: 'Bi-Weekly', instances: 2, hrsPerInstance: 8.0, previousInstances: 2, previousHrsPerInstance: 8.0 },
        ],
      },
      {
        name: 'Continuous Improvement',
        items: [
          { id: 5, activityName: 'Automation for Toil', frequency: 'Sprint', instances: 2, hrsPerInstance: 20.0, previousInstances: 1, previousHrsPerInstance: 24.0 },
          { id: 6, activityName: 'Tech Debt Remediation', frequency: 'Sprint', instances: 1, hrsPerInstance: 40.0, previousInstances: 1, previousHrsPerInstance: 40.0 },
        ],
      },
      {
        name: 'Shift Left / Onboarding',
        items: [
          { id: 7, activityName: 'KT Session with L1', frequency: 'Monthly', instances: 2, hrsPerInstance: 4.0 },
          { id: 8, activityName: 'Self-service Tool Training', frequency: 'Ad-hoc', instances: 3, hrsPerInstance: 2.0 },
          { id: 9, activityName: 'Onboarding new team member', frequency: 'Ad-hoc', instances: 1, hrsPerInstance: 30.0 },
        ],
      },
      {
        name: 'Governance',
        items: [
          { id: 10, activityName: 'SME Declaration Meeting', frequency: 'Weekly', instances: 4, hrsPerInstance: 2.0 },
          { id: 11, activityName: 'Business Review Prep', frequency: 'Monthly', instances: 1, hrsPerInstance: 8.0 },
        ],
      },
    ],
    finalWorkload: {
      actualDeployedFte: 15.0,
    },
  });

  reportData = this._reportData.asReadonly();

  // Floating FTE calculations
  availableFte = computed(
    () => this.reportData().floatingFte.total - this.reportData().floatingFte.deployed
  );

  // Ticket-Driven Work calculations
  ticketDrivenWorkCalculations = computed(() => {
    const items = this.reportData().ticketDrivenWork.items;
    const model = this.adminService.fteCalculationModel();

    const calculatedItems = items.map((item) => {
      let effectiveTime = item.avgTime;
      switch(model) {
        case 'Median':
          effectiveTime = item.p50Time ?? item.avgTime;
          break;
        case 'P75':
          effectiveTime = item.p75Time ?? item.avgTime;
          break;
        case 'P90':
          effectiveTime = item.p90Time ?? item.avgTime;
          break;
      }

      const hours = (item.count * effectiveTime) / 60;
      const fte = hours / FTE_HOURS_PER_MONTH;
      
      let previousFte: number | undefined;
      let fteChange: number | undefined;
      let fteChangeDirection: 'up' | 'down' | undefined;

      if (item.previousCount !== undefined && item.previousAvgTime !== undefined) {
          const previousHours = (item.previousCount * item.previousAvgTime) / 60;
          previousFte = previousHours / FTE_HOURS_PER_MONTH;
          if (previousFte > 0.001) { // Avoid division by zero or near-zero
              fteChange = (fte - previousFte) / previousFte;
              if (Math.abs(fteChange) > 0.01) { // Only show significant changes
                  fteChangeDirection = fte > previousFte ? 'up' : 'down';
              }
          } else if (fte > 0) {
              fteChange = 1; // From 0 to something, treat as 100% increase
              fteChangeDirection = 'up';
          }
      }
      return { ...item, hours, fte, effectiveTime, previousFte, fteChange, fteChangeDirection };
    });

    const systemCalculatedHours = calculatedItems.reduce((sum, item) => sum + item.hours, 0);
    const systemCalculatedFte = calculatedItems.reduce((sum, item) => sum + item.fte, 0);
    
    return {
      items: calculatedItems,
      systemCalculatedHours,
      systemCalculatedFte,
    };
  });

  finalTicketDrivenFte = computed(() => {
      const baseFte = this.ticketDrivenWorkCalculations().systemCalculatedFte;
      const adjustment = this.reportData().ticketDrivenWork.managerAdjustment / 100;
      return baseFte * (1 + adjustment);
  });
  

  // Structured Activities calculations
  structuredActivitiesCalculations = computed(() => {
    return this.reportData().structuredActivities.map((category) => {
      const calculatedItems = category.items.map((item) => {
        const totalHours = item.instances * item.hrsPerInstance;
        const calculatedFte = totalHours / FTE_HOURS_PER_MONTH;

        let previousFte: number | undefined;
        let fteChange: number | undefined;
        let fteChangeDirection: 'up' | 'down' | undefined;

        if (item.previousInstances !== undefined && item.previousHrsPerInstance !== undefined) {
            const previousHours = (item.previousInstances * item.previousHrsPerInstance);
            previousFte = previousHours / FTE_HOURS_PER_MONTH;
             if (previousFte > 0.001) {
                fteChange = (calculatedFte - previousFte) / previousFte;
                if (Math.abs(fteChange) > 0.01) {
                    fteChangeDirection = calculatedFte > previousFte ? 'up' : 'down';
                }
            } else if (calculatedFte > 0) {
                fteChange = 1;
                fteChangeDirection = 'up';
            }
        }

        return { ...item, totalHours, calculatedFte, previousFte, fteChange, fteChangeDirection };
      });

      const totalFte = calculatedItems.reduce((sum, item) => sum + item.calculatedFte, 0);
      const previousTotalFte = calculatedItems.reduce((sum, item) => sum + (item.previousFte || 0), 0);

      let totalFteChange: number | undefined;
      let totalFteChangeDirection: 'up' | 'down' | undefined;

      if (previousTotalFte > 0.001) {
        totalFteChange = (totalFte - previousTotalFte) / previousTotalFte;
        if (Math.abs(totalFteChange) > 0.01) {
            totalFteChangeDirection = totalFte > previousTotalFte ? 'up' : 'down';
        }
      } else if (totalFte > 0) {
          totalFteChange = 1;
          totalFteChangeDirection = 'up';
      }

      return { ...category, items: calculatedItems, totalFte, totalFteChange, totalFteChangeDirection };
    });
  });

  // Final summary calculations
  calculatedTotalStructuredFte = computed(() =>
    this.structuredActivitiesCalculations().reduce((sum, cat) => sum + cat.totalFte, 0)
  );

  totalRequiredFte = computed(() => {
    return this.finalTicketDrivenFte() + this.calculatedTotalStructuredFte();
  });

  surplusFte = computed(() => {
    return this.reportData().finalWorkload.actualDeployedFte - this.totalRequiredFte();
  });
  
  // Workload Composition for Doughnut Chart
  workloadComposition = computed(() => {
     const ticketFte = this.finalTicketDrivenFte();
     const structuredFtes = this.structuredActivitiesCalculations();
     
     const responseFte = structuredFtes.find(c => c.name === 'Response')?.totalFte ?? 0;
     const proactiveFte = structuredFtes.find(c => c.name === 'Proactive')?.totalFte ?? 0;
     const continuousFte = structuredFtes.find(c => c.name === 'Continuous Improvement')?.totalFte ?? 0;
     const shiftLeftFte = structuredFtes.find(c => c.name === 'Shift Left / Onboarding')?.totalFte ?? 0;
     const governanceFte = structuredFtes.find(c => c.name === 'Governance')?.totalFte ?? 0;

     const total = ticketFte + responseFte + proactiveFte + continuousFte + shiftLeftFte + governanceFte;
     if (total === 0) return [];
     
     return [
        { name: 'Ticket-Driven Work', value: ticketFte, color: '#3b82f6' },
        { name: 'Response', value: responseFte, color: '#f97316' },
        { name: 'Proactive', value: proactiveFte, color: '#22c55e' },
        { name: 'Continuous Improvement', value: continuousFte, color: '#8b5cf6' },
        { name: 'Shift Left / Onboarding', value: shiftLeftFte, color: '#ec4899' },
        { name: 'Governance', value: governanceFte, color: '#6b7280' },
     ];
  });


  // --- Methods to update state ---
  updateManagerAdjustment(percentage: number) {
    this._reportData.update((data) => {
      data.ticketDrivenWork.managerAdjustment = percentage;
      return { ...data };
    });
  }

  updateStructuredActivity(
    categoryName: string,
    itemId: number,
    newValues: { instances: number; hrsPerInstance: number; frequency: Frequency }
  ) {
    this._reportData.update((data) => {
      const category = data.structuredActivities.find((c) => c.name === categoryName);
      if (category) {
        const item = category.items.find((i) => i.id === itemId);
        if (item) {
          item.instances = newValues.instances;
          item.hrsPerInstance = newValues.hrsPerInstance;
          item.frequency = newValues.frequency;
        }
      }
      return { ...data };
    });
  }
  
  addStructuredActivity(categoryName: string, activity: MasterActivity) {
    this._reportData.update(data => {
      const category = data.structuredActivities.find(c => c.name === categoryName);
      if (category) {
        // Prevent adding duplicates
        if (category.items.some(item => item.activityName === activity.name)) {
          return data; 
        }

        const allIds = data.structuredActivities.flatMap(c => c.items.map(i => i.id));
        const newId = Math.max(0, ...allIds) + 1;
        
        category.items.push({
          id: newId,
          activityName: activity.name,
          frequency: activity.defaultFrequency,
          instances: 1, // Default to 1 instance
          hrsPerInstance: activity.defaultHrsPerInstance,
        });
      }
      return {...data};
    })
  }
}