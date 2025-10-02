import { Component, ChangeDetectionStrategy, Input, ElementRef, viewChild, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { MetricDataPoint } from '../../../models/sre.model';

@Component({
  selector: 'app-sre-chart',
  standalone: true,
  templateUrl: './sre-chart.component.html',
})
export class SreChartComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) data!: MetricDataPoint[];
  @Input() color: string = '#3b82f6';
  @Input() height: number = 100;

  private chartContainer = viewChild<ElementRef<HTMLDivElement>>('chart');
  private isViewInitialized = false;

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isViewInitialized && changes['data'] && !changes['data'].firstChange) {
      this.createChart();
    }
  }

  private createChart(): void {
    const element = this.chartContainer()?.nativeElement;
    if (!element || !this.data || this.data.length === 0) return;

    d3.select(element).select('svg').remove();

    const margin = { top: 5, right: 5, bottom: 20, left: 40 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

    const svg = d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
      .domain(d3.extent(this.data, d => new Date(d.timestamp)) as [Date, Date])
      .range([0, width]);

    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(0).tickPadding(10))
      .select('.domain').remove();

    const yMax = d3.max(this.data, d => d.value) ?? 0;
    const y = d3.scaleLinear()
      .domain([0, yMax * 1.2])
      .range([height, 0]);

    svg.append('g')
      .call(d3.axisLeft(y).ticks(3).tickSize(0).tickPadding(5))
      .select('.domain').remove();
      
    svg.selectAll(".tick line").attr("stroke", "#e5e7eb");

    const area = d3.area<MetricDataPoint>()
      .x(d => x(new Date(d.timestamp)))
      .y0(height)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(this.data)
      .attr('fill', this.color)
      .attr('fill-opacity', 0.1)
      .attr('d', area);

    const line = d3.line<MetricDataPoint>()
      .x(d => x(new Date(d.timestamp)))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', this.color)
      .attr('stroke-width', 2)
      .attr('d', line);
  }
}