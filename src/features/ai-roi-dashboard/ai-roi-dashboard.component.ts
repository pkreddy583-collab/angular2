import { Component, ChangeDetectionStrategy, inject, signal, OnInit, ElementRef, viewChild, AfterViewInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { GeminiService } from '../../services/gemini.service';
import { AiRoiSummary } from '../../models/ai-roi.model';
import { WhitegloveService } from '../../services/whiteglove.service';
import * as d3 from 'd3';

@Component({
  selector: 'app-ai-roi-dashboard',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './ai-roi-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiRoiDashboardComponent implements OnInit, AfterViewInit {
  private geminiService = inject(GeminiService);
  private whitegloveService = inject(WhitegloveService);

  summary = signal<AiRoiSummary | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Whiteglove data
  heatmapData = this.whitegloveService.getHeatmapData();
  thematicAnalysis = this.whitegloveService.getThematicAnalysis();
  l1Pulse = this.whitegloveService.getL1Pulse();
  
  private heatmapContainer = viewChild<ElementRef>('heatmap');

  async ngOnInit() {
    try {
      const result = await this.geminiService.getAiRoiSummary();
      this.summary.set(result);
    } catch (e) {
      console.error(e);
      this.error.set('Failed to load AI ROI data.');
    } finally {
      this.isLoading.set(false);
    }
  }

  ngAfterViewInit() {
    this.createHeatmap();
  }

  private createHeatmap(): void {
    const data = this.heatmapData();
    const element = this.heatmapContainer()?.nativeElement;
    if (!element || !data) return;

    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);

    const x = d3.scaleBand().range([0, width]).domain(hours).padding(0.05);
    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).tickValues(x.domain().filter((_,i) => !(i%3)))) // Show every 3rd hour
      .select('.domain').remove();

    const y = d3.scaleBand().range([height, 0]).domain(days).padding(0.05);
    svg.append('g').call(d3.axisLeft(y)).select('.domain').remove();

    const myColor = d3.scaleSequential(d3.interpolateBlues).domain([1, d3.max(data, d => d.value) || 1]);

    svg.selectAll()
      .data(data, (d: any) => d.day + ':' + d.hour)
      .enter()
      .append('rect')
      .attr('x', d => x(hours[d.hour])!)
      .attr('y', d => y(days[d.day])!)
      .attr('width', x.bandwidth())
      .attr('height', y.bandwidth())
      .style('fill', d => d.value > 0 ? myColor(d.value) : '#f3f4f6');
  }
}
