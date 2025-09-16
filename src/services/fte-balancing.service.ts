import { Injectable, signal, computed } from '@angular/core';
import { TowerFteStatus, FteMovement } from '../models/fte-balancing.model';

@Injectable({
  providedIn: 'root',
})
export class FteBalancingService {
  private _towerStatus = signal<TowerFteStatus[]>([
    { id: 'compute', name: 'Compute', requiredFte: 16.0, deployedFte: 15.0, previousRequiredFte: 15.5, previousDeployedFte: 15.0 },
    { id: 'storage', name: 'Storage', requiredFte: 12.0, deployedFte: 14.0, previousRequiredFte: 13.0, previousDeployedFte: 13.5 },
    { id: 'network', name: 'Network', requiredFte: 10.0, deployedFte: 10.0, previousRequiredFte: 10.0, previousDeployedFte: 11.0 },
    { id: 'database', name: 'Database', requiredFte: 8.0, deployedFte: 7.0, previousRequiredFte: 7.5, previousDeployedFte: 7.5 },
    { id: 'security', name: 'Security', requiredFte: 9.0, deployedFte: 9.5, previousRequiredFte: 9.2, previousDeployedFte: 9.0 },
    { id: 'apps', name: 'Applications', requiredFte: 20.0, deployedFte: 18.0, previousRequiredFte: 21.0, previousDeployedFte: 18.5 },
  ]);

  private _movementHistory = signal<FteMovement[]>([
    { id: 1, date: new Date('2025-06-15'), fromTower: 'Storage', toTower: 'Compute', fteAmount: 1.0 },
    { id: 2, date: new Date('2025-06-20'), fromTower: 'Security', toTower: 'Database', fteAmount: 0.5 },
    { id: 3, date: new Date('2025-07-05'), fromTower: 'Network', toTower: 'Applications', fteAmount: 1.0 },
  ]);
  
  towerStatus = this._towerStatus.asReadonly();
  movementHistory = this._movementHistory.asReadonly();

  // Compute surplus/deficit for each tower
  towerStatusWithDelta = computed(() => {
    return this.towerStatus().map(tower => {
      const delta = tower.deployedFte - tower.requiredFte;
      let status: 'surplus' | 'deficit' | 'balanced';
      if (delta > 0.1) status = 'surplus';
      else if (delta < -0.1) status = 'deficit';
      else status = 'balanced';

      let requiredFteChange: number | null = null;
      let requiredFteTrend: 'up' | 'down' | 'same' = 'same';
      if (tower.previousRequiredFte && tower.previousRequiredFte > 0) {
        requiredFteChange = (tower.requiredFte - tower.previousRequiredFte) / tower.previousRequiredFte;
        if (requiredFteChange > 0.01) requiredFteTrend = 'up';
        if (requiredFteChange < -0.01) requiredFteTrend = 'down';
      }

      let deployedFteChange: number | null = null;
      let deployedFteTrend: 'up' | 'down' | 'same' = 'same';
      if (tower.previousDeployedFte && tower.previousDeployedFte > 0) {
        deployedFteChange = (tower.deployedFte - tower.previousDeployedFte) / tower.previousDeployedFte;
        if (deployedFteChange > 0.01) deployedFteTrend = 'up';
        if (deployedFteChange < -0.01) deployedFteTrend = 'down';
      }

      return { 
        ...tower, 
        delta, 
        status,
        requiredFteChange,
        requiredFteTrend,
        deployedFteChange,
        deployedFteTrend
      };
    });
  });

  towersWithSurplus = computed(() => this.towerStatusWithDelta().filter(t => t.status === 'surplus'));
  towersWithDeficit = computed(() => this.towerStatusWithDelta().filter(t => t.status === 'deficit'));
  
  moveFte(fromTowerId: string, toTowerId: string, fteAmount: number) {
    if (fteAmount <= 0) return;

    this._towerStatus.update(towers => {
        const fromTower = towers.find(t => t.id === fromTowerId);
        const toTower = towers.find(t => t.id === toTowerId);

        if (fromTower && toTower && fromTower.deployedFte - fteAmount >= 0) {
            fromTower.deployedFte -= fteAmount;
            toTower.deployedFte += fteAmount;
        }
        return [...towers];
    });

    this._movementHistory.update(history => {
        const fromTower = this.towerStatus().find(t => t.id === fromTowerId);
        const toTower = this.towerStatus().find(t => t.id === toTowerId);

        if (fromTower && toTower) {
            const newMovement: FteMovement = {
                id: history.length + 1,
                date: new Date(),
                fromTower: fromTower.name,
                toTower: toTower.name,
                fteAmount: fteAmount,
            };
            return [newMovement, ...history];
        }
        return history;
    });
  }
}