import { Component, ChangeDetectionStrategy, inject, afterNextRender, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AiRoiService } from '../../services/ai-roi.service';

declare const d3: any; // Use d3 from the global scope

@Component({
  selector: 'app-ai-roi-tracker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ai-roi-tracker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiRoiTrackerComponent {
  private roiService = inject(AiRoiService);

  kpis = this.roiService.getKpis();
  actionLog = this.roiService.getActionLog();
  
  private costSavingsHistory = this.roiService.getCostSavingsHistory();
  private featureContributions = this.roiService.getFeatureContributions();

  private savingsChartRef = viewChild<ElementRef>('savingsChart');
  private contributionChartRef = viewChild<ElementRef>('contributionChart');
  
  constructor() {
    afterNextRender(() => {
      this.initSavingsChart();
      this.initContributionChart();
    });
  }

  private initSavingsChart(): void {
    const chartRef = this.savingsChartRef();
    if (!chartRef) return;
    
    const data = this.costSavingsHistory();
    const element = chartRef.nativeElement;
    
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const parseTime = d3.timeParse('%Y-%m-%d');
    const x = d3.scaleTime()
      .domain(d3.extent(data, (d: any) => parseTime(d.date)))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: any) => d.savings)])
      .range([height, 0]);

    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#3b82f6')
      .attr('stroke-width', 2.5)
      .attr('d', d3.line()
        .x((d: any) => x(parseTime(d.date)))
        .y((d: any) => y(d.savings))
      );
  }

  private initContributionChart(): void {
    const chartRef = this.contributionChartRef();
    if (!chartRef) return;

    const data = this.featureContributions();
    const element = chartRef.nativeElement;

    const margin = { top: 20, right: 20, bottom: 70, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map((d: any) => d.feature))
      .padding(0.2);
      
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'translate(-10,0)rotate(-45)')
      .style('text-anchor', 'end');

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d: any) => d.actions)])
      .range([height, 0]);

    svg.append('g')
      .call(d3.axisLeft(y));

    svg.selectAll('mybar')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d: any) => x(d.feature))
      .attr('y', (d: any) => y(d.actions))
      .attr('width', x.bandwidth())
      .attr('height', (d: any) => height - y(d.actions))
      .attr('fill', '#6366f1');
  }
}