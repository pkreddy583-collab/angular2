import { Component, ChangeDetectionStrategy, Input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" (click)="onClose()">
        <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col" (click)="$event.stopPropagation()">
          <div class="flex justify-between items-center p-4 border-b">
            <h2 class="text-xl font-bold text-gray-800">{{ title }}</h2>
            <button (click)="onClose()" class="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6 overflow-y-auto">
            <p class="text-sm text-gray-600 mb-4">
              This is a deep dive view of the data. This area will be enhanced with visual charts and graphs.
            </p>
            <pre class="bg-gray-100 p-4 rounded-md text-xs text-gray-800 whitespace-pre-wrap">{{ prettyPrintJson(data) }}</pre>
          </div>
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalyticsModalComponent {
  @Input({ required: true }) isOpen!: boolean;
  @Input() title: string = '';
  @Input() data: any = null;
  closeModal = output<void>();

  prettyPrintJson(json: unknown): string {
    if (json === null || json === undefined) return '';
    return JSON.stringify(json, null, 2);
  }

  onClose() {
    this.closeModal.emit();
  }
}