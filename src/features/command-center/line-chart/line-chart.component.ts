import { Component, ChangeDetectionStrategy, Input, ElementRef, viewChild, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';

interface ChartDataset {
  label: string;
  data: number[];
  color: string;
}

export interface LineChartData {
  labels: string[];
  datasets: ChartDataset[];
}

@Component({
  selector: 'app-line-chart',
  standalone: true,
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineChartComponent implements OnChanges, AfterViewInit {
  @Input({ required: true }) data!: LineChartData;
  @Input() height: number = 300;

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
    if (container && this.data?.datasets.length > 0) {
      this.createChart(container.nativeElement, this.data);
    }
  }

  private createChart(element: HTMLElement, data: LineChartData): void {
    d3.select(element).select('svg').remove();

    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const width = element.clientWidth - margin.left - margin.right;
    const height = this.height - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    const x = d3.scalePoint<string>()
      .domain(data.labels)
      .range([0, width])
      .padding(0.5);
    
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
      .select(".domain").remove();

    const yMax = d3.max(data.datasets.flatMap(ds => ds.data)) ?? 0;
    const y = d3.scaleLinear().domain([0, yMax * 1.15]).range([height, 0]);
    
    svg.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .select(".domain").remove();

    svg.selectAll(".tick line")
       .attr("stroke", "#e5e7eb");

    // --- Draw Lines and Points ---
    data.datasets.forEach(dataset => {
      svg.append('path')
        .datum(dataset.data)
        .attr('fill', 'none')
        .attr('stroke', dataset.color)
        .attr('stroke-width', 2)
        .attr('d', d3.line<number>()
          .x((d, i) => x(data.labels[i])!)
          .y(d => y(d))
        );
      
      svg.selectAll(`circle.static-${dataset.label.replace(/\s/g, '-')}`)
        .data(dataset.data)
        .enter()
        .append('circle')
        .attr('class', `static-${dataset.label.replace(/\s/g, '-')}`)
        .attr('cx', (d, i) => x(data.labels[i])!)
        .attr('cy', d => y(d))
        .attr('r', 4)
        .attr('fill', dataset.color)
        .attr('stroke', 'white')
        .attr('stroke-width', 2);
    });

    // --- Interactivity ---
    const tooltip = d3.select(element.parentElement).select<HTMLDivElement>('.tooltip');

    const focus = svg.append("g")
      .attr("class", "focus")
      .style("display", "none");

    focus.append("line")
      .attr("class", "x-hover-line hover-line")
      .attr("y1", 0)
      .attr("y2", height);

    data.datasets.forEach((d) => {
      focus.append('circle').attr('r', 6).style('fill', d.color).style('stroke', 'white').style('stroke-width', 2);
    });

    svg.append("rect")
      .attr("class", "overlay")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", () => {
        focus.style("display", null);
        tooltip.style("opacity", 1);
      })
      .on("mouseout", () => {
        focus.style("display", "none");
        tooltip.style("opacity", 0);
      })
      .on("mousemove", mousemove);

    function mousemove(event: MouseEvent) {
      const xPos = d3.pointer(event, this)[0];
      const domain = x.domain();
      
      let closestIndex = 0;
      let minDistance = Infinity;
      domain.forEach((label, i) => {
        const distance = Math.abs(x(label)! - xPos);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      });

      const selectedLabel = data.labels[closestIndex];
      const selectedX = x(selectedLabel)!;

      focus.select(".x-hover-line").attr("transform", `translate(${selectedX},0)`);

      focus.selectAll("circle")
        .data(data.datasets)
        .attr("transform", d => `translate(${selectedX},${y(d.data[closestIndex])})`);

      let tooltipHtml = `<div class="font-bold text-sm mb-1">${selectedLabel}</div>`;
      data.datasets.forEach(d => {
        tooltipHtml += `
          <div class="flex items-center justify-between text-xs gap-2">
            <div class="flex items-center">
              <span class="w-2.5 h-2.5 rounded-sm mr-1.5" style="background-color: ${d.color}"></span>
              <span>${d.label}:</span>
            </div>
            <span class="font-semibold">${d.data[closestIndex].toLocaleString()}</span>
          </div>`;
      });
      
      tooltip.html(tooltipHtml);

      const tooltipEl = tooltip.node()!;
      const tooltipWidth = tooltipEl.offsetWidth;
      const tooltipHeight = tooltipEl.offsetHeight;

      let left = event.pageX + 15;
      if (left + tooltipWidth > window.innerWidth - 30) {
        left = event.pageX - 15 - tooltipWidth;
      }
      
      tooltip
        .style("left", `${left}px`)
        .style("top", `${event.pageY - tooltipHeight - 15}px`);
    }
  }
}
