import { Component, ChangeDetectionStrategy, inject, signal, computed, ElementRef, viewChild, AfterViewInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import * as d3 from 'd3';

import { IncidentManagementService } from '../../services/incident-management.service';
// FIX: Import IncidentTrendData to resolve 'Cannot find name' error.
import { KnowledgebaseEntry, UnassessedIncident, IncidentTrendData } from '../../models/incident-management.model';

interface TriageState extends UnassessedIncident {
  impact: number;
  urgency: number;
  severity: number;
  category: string;
  assignee: string;
}

const SEVERITY_MATRIX: number[][] = [
  // Urgency ->
  // Impact v
  [1, 1, 2, 3], // Impact 1 (Extensive/Widespread)
  [1, 2, 3, 4], // Impact 2 (Significant/Large)
  [2, 3, 4, 5], // Impact 3 (Moderate/Limited)
  [3, 4, 5, 5], // Impact 4 (Minor/Localized)
];

@Component({
  selector: 'app-incident-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './incident-management.component.html',
  styleUrls: ['./incident-management.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentManagementComponent implements AfterViewInit {
  private incidentService = inject(IncidentManagementService);
  private chartContainer = viewChild<ElementRef>('trendChartContainer');

  // --- KPIs and Causal Analysis ---
  kpis = this.incidentService.getKpis();
  causalAnalysis = this.incidentService.getCausalAnalysis();

  // --- Knowledgebase ---
  kbSearchControl = new FormControl('');
  private kbSearchTerm = toSignal(this.kbSearchControl.valueChanges, { initialValue: '' });
  
  filteredKnowledgebase = computed(() => {
    const term = this.kbSearchTerm()?.toLowerCase() ?? '';
    if (!term) {
      return this.incidentService.getKnowledgebase()();
    }
    return this.incidentService.getKnowledgebase()().filter(entry =>
      entry.title.toLowerCase().includes(term) ||
      entry.cause.toLowerCase().includes(term) ||
      entry.resolution.toLowerCase().includes(term) ||
      entry.tags.some(tag => tag.toLowerCase().includes(term))
    );
  });

  // --- Triage Queue ---
  triageQueue = signal<TriageState[]>(
    this.incidentService.getUnassessedIncidents()().map(inc => ({
      ...inc,
      impact: inc.aiSuggestedImpact,
      urgency: inc.aiSuggestedUrgency,
      severity: this.calculateSeverity(inc.aiSuggestedImpact, inc.aiSuggestedUrgency),
      category: 'Uncategorized',
      assignee: 'Unassigned'
    }))
  );

  categories = ['Uncategorized', 'Database', 'Network', 'Application', 'Security'];
  assignees = ['Unassigned', 'SRE Team', 'DBA Team', 'Network Ops'];

  calculateSeverity(impact: number, urgency: number): number {
    return SEVERITY_MATRIX[impact - 1][urgency - 1];
  }

  onImpactChange(id: string, value: string) {
    this.triageQueue.update(queue => queue.map(item => {
      if (item.id === id) {
        const newImpact = parseInt(value, 10);
        return { ...item, impact: newImpact, severity: this.calculateSeverity(newImpact, item.urgency) };
      }
      return item;
    }));
  }

  onUrgencyChange(id: string, value: string) {
    this.triageQueue.update(queue => queue.map(item => {
      if (item.id === id) {
        const newUrgency = parseInt(value, 10);
        return { ...item, urgency: newUrgency, severity: this.calculateSeverity(item.impact, newUrgency) };
      }
      return item;
    }));
  }
  
  onFieldChange(id: string, field: 'category' | 'assignee', value: string) {
     this.triageQueue.update(queue => queue.map(item => item.id === id ? { ...item, [field]: value } : item));
  }

  getSeverityClass(severity: number): string {
    switch (severity) {
      case 1: return 'bg-red-600 text-white';
      case 2: return 'bg-orange-500 text-white';
      case 3: return 'bg-yellow-500 text-black';
      case 4: return 'bg-blue-500 text-white';
      case 5: return 'bg-gray-500 text-white';
      default: return 'bg-gray-200 text-black';
    }
  }

  // --- D3 Trend Chart ---
  ngAfterViewInit(): void {
    this.createTrendChart();
  }

  private createTrendChart(): void {
    const data = this.incidentService.getIncidentTrend()();
    const element = this.chartContainer()?.nativeElement;
    if (!element) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    const svg = d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.date)) as [Date, Date])
      .range([0, width]);
    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(7).tickFormat(d3.timeFormat("%b %d") as any));

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.count) as number])
      .range([height, 0]);
    svg.append('g').call(d3.axisLeft(y));

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2)
      .attr('d', d3.line<IncidentTrendData>()
        .x(d => x(new Date(d.date)))
        .y(d => y(d.count))
      );
  }
}