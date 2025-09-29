import { Component, ChangeDetectionStrategy, input, signal } from '@angular/core';
import { DecimalPipe, PercentPipe } from '@angular/common';

@Component({
  selector: 'app-collapsible-section',
  standalone: true,
  imports: [DecimalPipe, PercentPipe],
  template: `
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <button
        (click)="toggle()"
        class="w-full flex justify-between items-center p-4 text-left"
        [attr.aria-expanded]="isOpen()"
      >
        <h2 class="text-xl font-bold text-gray-700">{{ title() }}</h2>
        <div class="flex items-center gap-4">
          @if (fteChange() !== undefined && fteChangeDirection()) {
            <span class="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full" [class]="fteChangeDirection() === 'up' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">
              @if (fteChangeDirection() === 'up') {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              } @else {
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              }
              {{ fteChange() | percent:'1.0-0' }}
            </span>
          }
          @if (totalFte() !== null) {
          <span class="font-bold text-blue-600 text-lg"
            >{{ totalFte() | number : "1.3-3" }} FTE</span
          >
          }
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-500 transition-transform"
            [class.rotate-180]="!isOpen()"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
      </button>
      @if (isOpen()) {
      <div class="px-4 pb-4">
        <ng-content></ng-content>
      </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollapsibleSectionComponent {
  title = input.required<string>();
  totalFte = input<number | null>(null);
  startOpen = input(true);
  fteChange = input<number | undefined>();
  fteChangeDirection = input<'up' | 'down' | undefined>();

  isOpen = signal(this.startOpen());

  toggle() {
    this.isOpen.update((v) => !v);
  }
}
