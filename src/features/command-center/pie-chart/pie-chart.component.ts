import { Component, ChangeDetectionStrategy, Input, ElementRef, viewChild, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import * as d3 from 'd3';

export interface PieChartData {
  name: string;
  value: number;
  color: string;
  label?: string; // e.g. "3150, 47%"
}

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './pie-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PieChartComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) data!: PieChartData[];
  @Input() height: number = 200;
  @Input() width: number = 200;

  private chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');
  private isViewInitialized = false;

  ngAfterViewInit(): void {
    this.isViewInitialized = true;
    this.createChartIfReady();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isViewInitialized && changes['data'] && !changes['data'].firstChange) {
      this.createChartIfReady();
    }
  }

  private createChartIfReady(): void {
    const container = this.chartContainer();
    if (container && this.data?.length > 0) {
      this.createChart(container.nativeElement, this.data);
    }
  }

  private createChart(element: HTMLElement, data: PieChartData[]): void {
    d3.select(element).select('svg').remove();

    const margin = { top: 30, right: 60, bottom: 30, left: 60 };
    const svgWidth = this.width + margin.left + margin.right;
    const svgHeight = this.height + margin.top + margin.bottom;
    
    // Adjust radius to pull the chart and labels inward
    const radius = Math.min(this.width, this.height) / 2;
    const labelRadius = radius * 0.8; 
    const pieRadius = radius * 0.7;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .append('g')
      .attr('transform', `translate(${svgWidth / 2}, ${svgHeight / 2})`);

    const pie = d3.pie<PieChartData>().value(d => d.value).sort(null);
    const data_ready = pie(data);

    const arc = d3.arc<any>().innerRadius(0).outerRadius(pieRadius);
    const outerArcForLabels = d3.arc<any>().innerRadius(labelRadius).outerRadius(labelRadius);

    // Draw slices
    svg.selectAll('path')
      .data(data_ready)
      .join('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', 'white')
      .style('stroke-width', '2px');

    // Lines for labels
    svg.selectAll('allPolylines')
      .data(data_ready)
      .join('polyline')
      .attr('stroke', 'black')
      .style('fill', 'none')
      .attr('stroke-width', 1)
      .attr('points', (d: any) => {
        const posA = arc.centroid(d);
        const posB = outerArcForLabels.centroid(d);
        const posC = outerArcForLabels.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        posC[0] = labelRadius * 1.1 * (midangle < Math.PI ? 1 : -1);
        return [posA, posB, posC];
      });

    // Text labels
    svg.selectAll('allLabels')
      .data(data_ready)
      .join('text')
      .text(d => d.data.label || d.data.name)
      .attr('transform', (d: any) => {
        const pos = outerArcForLabels.centroid(d);
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = labelRadius * 1.15 * (midangle < Math.PI ? 1 : -1);
        return `translate(${pos})`;
      })
      .style('text-anchor', (d: any) => {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return (midangle < Math.PI ? 'start' : 'end');
      })
      .style('font-size', '12px');
  }
}
