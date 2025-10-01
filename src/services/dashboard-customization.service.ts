import { Injectable, signal, effect } from '@angular/core';

export interface PinnedWidget {
  id: string; // e.g., 'top-kpis', 'ticket-trend-line-chart'
  title: string; // e.g., 'Top KPIs'
}

const STORAGE_KEY = 'my-dashboard-widgets';

@Injectable({
  providedIn: 'root',
})
export class DashboardCustomizationService {
  // Initialize from localStorage
  private getInitialState(): PinnedWidget[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return [];
    }
  }

  pinnedWidgets = signal<PinnedWidget[]>(this.getInitialState());

  constructor() {
    // Persist to localStorage on change
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.pinnedWidgets()));
      } catch (e) {
        console.error('Error writing to localStorage', e);
      }
    });
  }

  isPinned(widgetId: string): boolean {
    return this.pinnedWidgets().some(w => w.id === widgetId);
  }

  togglePin(widgetId: string, title: string): void {
    if (this.isPinned(widgetId)) {
      this.unpin(widgetId);
    } else {
      this.pinnedWidgets.update(widgets => [...widgets, { id: widgetId, title }]);
    }
  }

  unpin(widgetId: string): void {
    this.pinnedWidgets.update(widgets => widgets.filter(w => w.id !== widgetId));
  }
}
