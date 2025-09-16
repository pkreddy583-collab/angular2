export interface TowerFteStatus {
  id: string;
  name: string;
  requiredFte: number;
  deployedFte: number;
  previousRequiredFte?: number;
  previousDeployedFte?: number;
}

export interface FteMovement {
  id: number;
  date: Date;
  fromTower: string;
  toTower: string;
  fteAmount: number;
}