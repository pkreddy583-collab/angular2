import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ProblemService } from '../../services/problem.service';
import { GeminiService } from '../../services/gemini.service';
import { IncidentService } from '../../services/incident.service';
import { Problem } from '../../models/problem.model';
import { Incident } from '../../models/incident.model';

@Component({
  selector: 'app-problem-management',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './problem-management.component.html',
  styleUrls: ['./problem-management.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProblemManagementComponent {
  private problemService = inject(ProblemService);
  private incidentService = inject(IncidentService);
  private geminiService = inject(GeminiService);

  problems = this.problemService.problems;
  selectedProblem = signal<Problem | null>(null);
  
  isGeneratingRca = signal(false);

  backlogProblems = computed(() => this.problems().filter(p => p.status === 'Backlog').sort((a, b) => b.linkedIncidents.length - a.linkedIncidents.length));
  investigationProblems = computed(() => this.problems().filter(p => p.status === 'Investigation'));
  resolvedProblems = computed(() => this.problems().filter(p => p.status === 'Resolved'));

  selectedProblemIncidents = computed(() => {
    const problem = this.selectedProblem();
    if (!problem) return [];
    return this.problemService.getIncidentsForProblem(problem) as Incident[];
  });

  selectProblem(problem: Problem): void {
    this.selectedProblem.set(problem);
  }

  closeDetails(): void {
    this.selectedProblem.set(null);
  }

  async generateRcaSummary(): Promise<void> {
    const problem = this.selectedProblem();
    const incidents = this.selectedProblemIncidents();
    if (!problem || incidents.length === 0) return;

    this.isGeneratingRca.set(true);
    try {
      const summary = await this.geminiService.generateRcaSummary(problem, incidents);
      this.problemService.updateRcaSummary(problem.id, summary);
      // Refresh the selected problem to show the new summary
      this.selectedProblem.update(p => p ? {...p, rcaSummary: summary} : null);
    } catch (e) {
      console.error('Failed to generate RCA summary', e);
      // You could set an error signal here to show in the UI
    } finally {
      this.isGeneratingRca.set(false);
    }
  }
}
