import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';

import { ChangeManagementService, ChangeRequest } from '../../services/change-management.service';
import { GeminiService } from '../../services/gemini.service';

@Component({
  selector: 'app-change-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './change-management.component.html',
  styleUrls: ['./change-management.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeManagementComponent {
  private changeService = inject(ChangeManagementService);
  private geminiService = inject(GeminiService);

  kpis = this.changeService.getKpis();
  awaitingApproval = this.changeService.getChangesAwaitingApproval();
  upcomingChanges = this.changeService.getUpcomingChanges();

  // --- Timeline ---
  timelineDays = signal<Date[]>([]);
  selectedChange = signal<ChangeRequest | null>(null);
  
  // --- Knowledgebase ---
  kbSearchControl = new FormControl('');
  private kbSearchTerm = toSignal(this.kbSearchControl.valueChanges, { initialValue: '' });
  
  filteredHistory = computed(() => {
    const term = this.kbSearchTerm()?.toLowerCase() ?? '';
    const history = this.changeService.getChangeHistory()();
    if (!term) return history;
    return history.filter(c => 
      c.id.toLowerCase().includes(term) || 
      c.title.toLowerCase().includes(term) ||
      c.application.toLowerCase().includes(term)
    );
  });

  // --- Self-Service Modal ---
  isCreateModalOpen = signal(false);
  changeRequestForm: FormGroup;
  aiRiskAssessment = signal<{ risk: 'Low' | 'Medium' | 'High', summary: string, show: boolean }>({ risk: 'Low', summary: '', show: false });
  isSubmitting = signal(false);

  constructor() {
    this.generateTimelineDays();
    this.changeRequestForm = new FormGroup({
      application: new FormControl('', Validators.required),
      title: new FormControl('', Validators.required),
      description: new FormControl('', Validators.required),
      deploymentDate: new FormControl(this.getTomorrowDateString(), Validators.required),
    });
  }

  private getTomorrowDateString(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  private generateTimelineDays(): void {
    const days: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    this.timelineDays.set(days);
  }

  getChangesForDate(date: Date): ChangeRequest[] {
    return this.upcomingChanges().filter(c => {
      const changeDate = new Date(c.deploymentDate);
      changeDate.setHours(0, 0, 0, 0);
      return changeDate.getTime() === date.getTime();
    });
  }

  selectChange(change: ChangeRequest, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedChange.set(change);
  }

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
    this.aiRiskAssessment.set({ risk: 'Low', summary: '', show: false });
    this.changeRequestForm.reset({
        deploymentDate: this.getTomorrowDateString()
    });
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  async submitChangeRequest(): Promise<void> {
    if (this.changeRequestForm.invalid) return;

    this.isSubmitting.set(true);
    this.aiRiskAssessment.update(v => ({...v, show: false}));
    
    try {
      const result = await this.geminiService.generateChangeRiskAssessment(this.changeRequestForm.value);
      this.aiRiskAssessment.set({ ...result, show: true });
    } catch(e) {
      console.error(e);
      // Fallback in case of AI error
      this.aiRiskAssessment.set({ 
        risk: 'Medium', 
        summary: 'AI analysis could not be performed. Please assess risk manually. Defaulting to Medium.', 
        show: true 
      });
    } finally {
      this.isSubmitting.set(false);
    }
  }

  getRiskClass(risk: 'Low' | 'Medium' | 'High'): string {
    switch (risk) {
      case 'Low': return 'bg-green-100 text-green-800 border-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
    }
  }

  getTypeClass(type: 'Standard' | 'Normal' | 'Emergency'): string {
    switch (type) {
      case 'Standard': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Normal': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Emergency': return 'bg-red-100 text-red-800 border-red-300';
    }
  }

  getValidationStatusClass(status: 'passed' | 'failed' | 'skipped'): string {
    switch (status) {
      case 'passed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'skipped': return 'text-gray-400';
    }
  }
}