import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
// FIX: Import FormGroup and FormControl instead of FormBuilder.
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { FteBalancingService } from '../../services/fte-balancing.service';
import { AnalyticsService } from '../../services/analytics.service';

@Component({
  selector: 'app-fte-balancing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fte-balancing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FteBalancingComponent {
  private fteService = inject(FteBalancingService);
  private analyticsService = inject(AnalyticsService);

  // Expose signals from service
  towers = this.fteService.towerStatusWithDelta;
  towersWithSurplus = this.fteService.towersWithSurplus;
  towersWithDeficit = this.fteService.towersWithDeficit;
  
  // State for filtering history
  currentMonth = signal(new Date().toISOString().slice(0, 7)); // YYYY-MM format

  filteredHistory = computed(() => {
    const selectedMonth = this.currentMonth();
    return this.fteService.movementHistory().filter(m => {
      return m.date.toISOString().slice(0, 7) === selectedMonth;
    });
  });

  // Form for moving FTE
  // FIX: Replaced FormBuilder with direct instantiation of FormGroup and FormControl to fix 'Property 'group' does not exist on type 'unknown'' error.
  balancingForm = new FormGroup({
    fromTower: new FormControl('', Validators.required),
    toTower: new FormControl('', Validators.required),
    fteAmount: new FormControl(0.5, [Validators.required, Validators.min(0.1)]),
  });

  onMonthChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.currentMonth.set(target.value);
  }

  getHeatmapBorderClass(status: 'surplus' | 'deficit' | 'balanced'): string {
    switch (status) {
      case 'surplus': return 'border-green-500';
      case 'deficit': return 'border-red-500';
      case 'balanced': return 'border-yellow-500';
    }
  }
  
  getHeatmapTextClass(status: 'surplus' | 'deficit' | 'balanced'): string {
    switch (status) {
      case 'surplus': return 'text-green-600';
      case 'deficit': return 'text-red-600';
      case 'balanced': return 'text-yellow-800';
    }
  }

  getStatusPillClass(status: 'surplus' | 'deficit' | 'balanced'): string {
    switch (status) {
      case 'surplus': return 'bg-green-100 text-green-800';
      case 'deficit': return 'bg-red-100 text-red-800';
      case 'balanced': return 'bg-yellow-100 text-yellow-800';
    }
  }

  commitMovement() {
    if (this.balancingForm.valid) {
      const { fromTower, toTower, fteAmount } = this.balancingForm.value;
      if (fromTower && toTower && fteAmount) {
        this.fteService.moveFte(fromTower, toTower, fteAmount);
        this.balancingForm.reset({ fteAmount: 0.5 });
      }
    }
  }

  exportTowerStatus(): void {
    const dataToExport = this.towers().map(t => ({
      Tower: t.name,
      Required_FTE: t.requiredFte,
      Deployed_FTE: t.deployedFte,
      Surplus_Deficit: t.delta,
      Status: t.status,
      Required_FTE_MoM_Change: t.requiredFteChange,
      Deployed_FTE_MoM_Change: t.deployedFteChange,
    }));
    this.analyticsService.exportToCsv(dataToExport, 'tower_fte_status');
  }

  exportMovementHistory(): void {
    const dataToExport = this.filteredHistory().map(m => ({
      Date: m.date.toISOString().split('T')[0],
      From_Tower: m.fromTower,
      To_Tower: m.toTower,
      FTE_Amount: m.fteAmount,
    }));
    this.analyticsService.exportToCsv(dataToExport, `fte_movement_history_${this.currentMonth()}`);
  }
}