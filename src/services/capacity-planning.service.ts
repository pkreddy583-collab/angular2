import { Injectable, signal, computed } from '@angular/core';

export interface CapacityMetric {
  name: 'CPU' | 'Memory' | 'Disk';
  unit: 'cores' | 'GB' | '%';
  limit: number;
  current: number;
  thresholds: { warning: number; critical: number; }; // in percentage
  history: number[]; // last 30 days
}

export interface CapacityData {
  serviceId: string;
  serviceName: string;
  metrics: CapacityMetric[];
}

@Injectable({
  providedIn: 'root',
})
export class CapacityPlanningService {
  private capacityData = signal<CapacityData[]>([
    {
      serviceId: 'order-service',
      serviceName: 'Order Service',
      metrics: [
        { name: 'CPU', unit: 'cores', limit: 80, current: 65, thresholds: { warning: 75, critical: 90 }, history: [40, 42, 45, 43, 50, 55, 58, 60, 62, 65, 68, 70, 72, 74, 73, 75, 76, 78, 77, 79, 80, 81, 80, 78, 75, 70, 68, 66, 65] },
        { name: 'Memory', unit: 'GB', limit: 128, current: 100, thresholds: { warning: 80, critical: 95 }, history: [80, 82, 85, 84, 88, 90, 92, 95, 98, 100, 102, 105, 110, 112, 115, 118, 120, 122, 120, 118, 115, 110, 105, 102, 100] },
        { name: 'Disk', unit: '%', limit: 100, current: 40, thresholds: { warning: 85, critical: 95 }, history: [30, 31, 31, 32, 32, 33, 33, 34, 34, 35, 35, 36, 36, 37, 37, 38, 38, 39, 39, 40] }
      ]
    },
    {
      serviceId: 'user-db',
      serviceName: 'User Database',
      metrics: [
        { name: 'CPU', unit: 'cores', limit: 64, current: 58, thresholds: { warning: 80, critical: 95 }, history: [50, 52, 51, 53, 55, 54, 56, 57, 58, 59, 60, 61, 60, 58, 57, 56, 58] },
        { name: 'Disk', unit: '%', limit: 100, current: 92, thresholds: { warning: 85, critical: 95 }, history: [70, 72, 74, 76, 78, 80, 82, 84, 85, 86, 87, 88, 89, 90, 91, 92] }
      ]
    },
     {
      serviceId: 'hr-portal',
      serviceName: 'HR Portal',
      metrics: [
        { name: 'Memory', unit: 'GB', limit: 64, current: 55, thresholds: { warning: 80, critical: 95 }, history: [20, 25, 30, 35, 40, 45, 50, 52, 55, 54, 53, 50, 48, 45, 40] },
      ]
    }
  ]);

  getCapacityData() {
    return this.capacityData.asReadonly();
  }

  getCapacityDataByServiceId(id: string) {
    return computed(() => this.capacityData().find(s => s.serviceId === id));
  }
}