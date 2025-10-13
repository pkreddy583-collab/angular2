import { Injectable, signal } from '@angular/core';

export interface HeatmapData {
  day: number; // 0=Sun, 1=Mon...
  hour: number; // 0-23
  value: number; // Incident count
}

export interface ThematicData {
  theme: string;
  count: number;
  trend: number; // Percentage change
}

export interface L1PulseMetric {
  label: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'same';
}

@Injectable({
  providedIn: 'root'
})
export class WhitegloveService {
  private _heatmapData = signal<HeatmapData[]>(
    // Generate some random heatmap data focusing on weekdays, business hours
    Array.from({ length: 7 * 24 }, (_, i) => {
      const day = Math.floor(i / 24);
      const hour = i % 24;
      let value = 0;
      if (day > 0 && day < 6) { // Weekdays
        if (hour > 8 && hour < 17) { // Business hours
          value = Math.floor(Math.random() * 20) + 5;
          if (hour === 14) value *= 1.5; // Spike at 2 PM
        } else {
          value = Math.floor(Math.random() * 5);
        }
      }
      return { day, hour, value };
    })
  );

  private _thematicAnalysis = signal<ThematicData[]>([
    { theme: 'Login & Authentication Issues', count: 142, trend: 15 },
    { theme: 'Application Performance Degradation', count: 98, trend: -5 },
    { theme: 'Data Sync Errors', count: 76, trend: 22 },
    { theme: 'Payment Processing Failures', count: 45, trend: -10 },
    { theme: 'UI Glitches', count: 31, trend: 8 },
  ]);

  private _l1Pulse = signal<L1PulseMetric[]>([
    { label: 'Avg. Handle Time', value: '8.2 min', trend: '-5%', trendDirection: 'down' },
    { label: 'First Contact Resolution', value: '85%', trend: '+2%', trendDirection: 'up' },
    { label: 'Agent Satisfaction (CSAT)', value: '4.8/5', trend: '+0.1', trendDirection: 'up' },
    { label: 'Escalation Rate', value: '12%', trend: '-3%', trendDirection: 'down' },
  ]);

  getHeatmapData() {
    return this._heatmapData.asReadonly();
  }

  getThematicAnalysis() {
    return this._thematicAnalysis.asReadonly();
  }

  getL1Pulse() {
    return this._l1Pulse.asReadonly();
  }
}
