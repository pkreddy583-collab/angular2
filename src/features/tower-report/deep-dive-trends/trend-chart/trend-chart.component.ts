import { Component, ChangeDetectionStrategy, Input, ElementRef, viewChild, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

interface ChartDataset {
  label: string;
  data: number[];
  color: string;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

@Component({
  selector: 'app-trend-chart',
  standalone: true,
  imports: [],
  templateUrl: './trend-chart.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrendChartComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) data!: ChartData;
  @Input() chartType: 'line' | 'stackedBar' = 'line';
  @Input() height: number = 300;

  private chartContainer = viewChild<ElementRef<HTMLDivElement>>('chartContainer');
  private svg: any;
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
    if (container && this.data?.datasets.length > 0) {
      this.createChart(container.nativeElement, this.data);
    }
  }

  private createChart(element: HTMLElement, data: ChartData): void {
    d3.select(element).select('svg').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

    this.svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    const x = d3.scaleBand()
      .domain(data.labels)
      .range([0, width])
      .padding(0.2);
    
    this.svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x));

    if (this.chartType === 'line') {
      this.drawLineChart(data, x, height);
    } else {
      this.drawStackedBarChart(data, x, height);
    }
  }

  private drawLineChart(data: ChartData, x: d3.ScaleBand<string>, height: number): void {
    const yMax = d3.max(data.datasets.flatMap(ds => ds.data)) ?? 0;
    const y = d3.scaleLinear().domain([0, yMax * 1.1]).range([height, 0]);
    this.svg.append('g').call(d3.axisLeft(y));

    data.datasets.forEach(dataset => {
      this.svg.append('path')
        .datum(dataset.data)
        .attr('fill', 'none')
        .attr('stroke', dataset.color)
        .attr('stroke-width', 2.5)
        .attr('d', d3.line<number>()
          .x((d, i) => x(data.labels[i])! + x.bandwidth() / 2)
          .y(d => y(d))
        );
    });
  }
  
  private drawStackedBarChart(data: ChartData, x: d3.ScaleBand<string>, height: number): void {
      const keys = data.datasets.map(d => d.label);
      const colors = data.datasets.map(d => d.color);
      
      const transformedData = data.labels.map((label, i) => {
        const entry: { [key: string]: string | number } = { group: label };
        data.datasets.forEach(ds => {
          entry[ds.label] = ds.data[i];
        });
        return entry;
      });

      const stack = d3.stack().keys(keys);
      const series = stack(transformedData as any);

      const yMax = d3.max(series, d => d3.max(d, d => d[1])) ?? 0;
      const y = d3.scaleLinear().domain([0, yMax * 1.1]).range([height, 0]);
      this.svg.append("g").call(d3.axisLeft(y));

      const colorScale = d3.scaleOrdinal().domain(keys).range(colors);

      this.svg.append("g")
        .selectAll("g")
        .data(series)
        .enter().append("g")
          .attr("fill", d => colorScale(d.key) as string)
        .selectAll("rect")
        .data(d => d)
        .enter().append("rect")
          .attr("x", (d: any) => x(d.data.group)!)
          .attr("y", d => y(d[1]))
          .attr("height", d => y(d[0]) - y(d[1]))
          .attr("width", x.bandwidth());
  }
}