import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { SreService } from '../../services/sre.service';
import { GeminiService } from '../../services/gemini.service';
import { WebApp } from '../../models/sre.model';
import { SreChartComponent } from './sre-chart/sre-chart.component';

type SreSubView = 'dashboard' | 'error-budget' | 'deployments' | 'logs';

@Component({
  selector: 'app-sre-workbench',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, ReactiveFormsModule, SreChartComponent],
  templateUrl: './sre-workbench.component.html',
  styleUrls: ['./sre-workbench.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SreWorkbenchComponent {
  private sreService = inject(SreService);
  private geminiService = inject(GeminiService);

  // --- Main state ---
  allWebApps = this.sreService.getWebApps();
  selectedAppId = signal<string>(this.allWebApps()[0].id);
  activeSubView = signal<SreSubView>('dashboard');
  
  // --- Filtering ---
  tierFilter = signal<'all' | 'Tier 1' | 'Tier 2' | 'Tier 3'>('all');

  filteredWebApps = computed(() => {
    const apps = this.allWebApps();
    const filter = this.tierFilter();
    if (filter === 'all') return apps;
    return apps.filter(app => app.businessCriticality === filter);
  });


  // --- Modal & Form State ---
  isModalOpen = signal(false);
  onboardingForm: FormGroup;

  // --- Computed signals ---
  selectedApp = computed(() => {
    return this.allWebApps().find(app => app.id === this.selectedAppId())!;
  });

  aiInsight = signal<{ title: string; description: string } | null>(null);
  isLoadingInsight = signal(false);
  
  errorBudget = computed(() => {
    const app = this.selectedApp();
    if (!app) return null;
    const slo = app.slo.availability / 100;
    const totalMinutesInMonth = 30 * 24 * 60;
    const budgetMinutes = totalMinutesInMonth * (1 - slo);
    const consumedMinutes = (app.errorRate / 100) * totalMinutesInMonth * 0.1; // Simulate consumption
    const remainingMinutes = budgetMinutes - consumedMinutes;
    const consumedPercentage = (consumedMinutes / budgetMinutes) * 100;
    
    return {
      slo,
      totalMinutesInMonth,
      budgetMinutes,
      consumedMinutes,
      remainingMinutes,
      consumedPercentage
    };
  });

  constructor() {
    this.onboardingForm = new FormGroup({
      appName: new FormControl('', Validators.required),
      availabilitySlo: new FormControl(99.95, [Validators.required, Validators.min(90), Validators.max(100)]),
      latencySlo: new FormControl(500, [Validators.required, Validators.min(1)]),
    });
  }

  selectApp(id: string): void {
    this.selectedAppId.set(id);
    this.aiInsight.set(null); // Clear insight when app changes
  }
  
  setTierFilter(tier: 'all' | 'Tier 1' | 'Tier 2' | 'Tier 3'): void {
    this.tierFilter.set(tier);
  }

  selectSubView(view: SreSubView): void {
    this.activeSubView.set(view);
  }
  
  getHealthStatusClass(status: WebApp['healthStatus']) {
    switch (status) {
      case 'Healthy': return 'bg-green-500';
      case 'Warning': return 'bg-yellow-500';
      case 'Critical': return 'bg-red-500';
    }
  }

  openOnboardModal(): void {
    this.isModalOpen.set(true);
  }

  closeOnboardModal(): void {
    this.isModalOpen.set(false);
    this.onboardingForm.reset({
      availabilitySlo: 99.95,
      latencySlo: 500
    });
  }

  submitOnboardApp(): void {
    if (this.onboardingForm.valid) {
      const { appName, availabilitySlo, latencySlo } = this.onboardingForm.value;
      this.sreService.onboardWebApp(appName, availabilitySlo, latencySlo);
      this.closeOnboardModal();
    }
  }

  async getAiInsight(): Promise<void> {
    const app = this.selectedApp();
    if (!app || !this.geminiService) return;

    this.isLoadingInsight.set(true);
    // This is a mock implementation. In a real scenario, you'd call GeminiService.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let insight = { title: 'All Systems Nominal', description: 'Metrics are within expected parameters. No immediate action required.' };
    if (app.healthStatus === 'Warning') {
      insight = { title: 'Elevated P95 Latency', description: `The P95 latency is currently at ${app.p95Latency}ms, exceeding the ${app.slo.latency}ms SLO. This indicates a degraded experience for some users. Recommend investigating the 'payment-proxy' service which is showing increased response times.`};
    } else if (app.healthStatus === 'Critical') {
       insight = { title: 'High Error Rate & CPU Utilization', description: `The error rate is at ${app.errorRate}% and CPU is at ${app.cpuUtilization}%. This combination suggests a service is struggling under load or has a performance bug. The logs show multiple 'Database connection timed out' errors, pointing to a database issue.`};
    }

    this.aiInsight.set(insight);
    this.isLoadingInsight.set(false);
  }
}
