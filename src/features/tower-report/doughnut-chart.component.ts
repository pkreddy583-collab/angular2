import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center p-4 gap-6">
      <ng-container *ngIf="chartSegments.length > 0; else noData">
        <div class="relative w-40 h-40">
          <svg class="w-full h-full" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="15.9155"
              fill="none"
              class="stroke-gray-200"
              stroke-width="3"
            ></circle>
            <ng-container *ngFor="let segment of chartSegments; trackBy: trackByName">
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                [attr.stroke]="segment.color"
                stroke-width="3"
                [attr.stroke-dasharray]="segment.dashArray"
                [attr.stroke-dashoffset]="segment.offset"
                class="transform -rotate-90 origin-center"
              ></circle>
            </ng-container>
          </svg>
        </div>
        <div class="text-sm space-y-2">
          <div *ngFor="let item of data; trackBy: trackByName" class="flex items-center">
            <span
              class="w-3 h-3 rounded-full mr-2"
              [style.background-color]="item.color"
            ></span>
            <span class="text-gray-600">{{ item.name }}</span>
          </div>
        </div>
      </ng-container>
      <ng-template #noData>
        <div class="text-center text-gray-500">No data available</div>
      </ng-template>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoughnutChartComponent {
  @Input({ required: true }) data!: ChartData[];

  get chartSegments() {
    const chartData = this.data;
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return [];

    let accumulatedPercentage = 0;
    return chartData.map((item) => {
      const percentage = (item.value / total) * 100;
      const segment = {
        name: item.name,
        color: item.color,
        dashArray: `${percentage} ${100 - percentage}`,
        offset: 25 - accumulatedPercentage,
      };
      accumulatedPercentage += percentage;
      return segment;
    });
  }
  
  trackByName(index: number, item: { name: string }): string {
    return item.name;
  }
}
