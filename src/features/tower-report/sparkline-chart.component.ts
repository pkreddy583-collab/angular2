import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sparkline-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (path) {
      <svg class="w-24 h-8" viewBox="0 0 100 20" preserveAspectRatio="none">
        <path [attr.d]="path" fill="none" [attr.stroke]="color" stroke-width="2"/>
      </svg>
    } @else {
      <div class="w-24 h-8 flex items-center justify-center">
        <span class="text-xs text-gray-400">-</span>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SparklineChartComponent {
  @Input() data: number[] | undefined;
  @Input() color: string = '#4f46e5';

  get path(): string {
    const data = this.data;
    if (!data || data.length < 2) {
      return '';
    }
    const width = 100;
    const height = 20;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min === 0 ? 1 : max - min;

    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      // Give 1px vertical padding
      const y = (height - 2) - (((d - min) / range) * (height - 2)) + 1;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });

    return `M ${points.join(' L ')}`;
  }
}
