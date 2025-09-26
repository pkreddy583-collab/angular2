import { Injectable, signal } from '@angular/core';
import { MonthlyTrendData } from '../models/trend.model';

// Helper to generate a random fluctuation
const fluctuate = (value: number, percent: number = 0.1): number => {
  const fluctuation = value * percent * (Math.random() - 0.5) * 2;
  return value + fluctuation;
};

// Generates mock data for the last N months
const generateMockTrendData = (months: number): MonthlyTrendData[] => {
  const data: MonthlyTrendData[] = [];
  const today = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const month = date.toISOString().slice(0, 7);
    const monthDisplay = date.toLocaleString('default', { month: 'short' }) + " '" + date.getFullYear().toString().slice(-2);

    const ticketFte = fluctuate(8.5, 0.15);
    const responseFte = fluctuate(1.2, 0.2);
    const proactiveFte = fluctuate(1.8, 0.1);
    const ciFte = fluctuate(2.5, 0.1);
    const shiftLeftFte = fluctuate(1.0, 0.3);
    const governanceFte = fluctuate(0.5, 0.1);

    const requiredFte = ticketFte + responseFte + proactiveFte + ciFte + shiftLeftFte + governanceFte;
    const deployedFte = fluctuate(15.0, 0.05);

    data.push({
      month,
      monthDisplay,
      totalRequiredFte: requiredFte,
      actualDeployedFte: deployedFte,
      surplusDeficit: deployedFte - requiredFte,
      ticketDrivenFte: ticketFte,
      structuredFteBreakdown: {
        response: responseFte,
        proactive: proactiveFte,
        continuousImprovement: ciFte,
        shiftLeft: shiftLeftFte,
        governance: governanceFte,
      },
    });
  }

  return data;
};


@Injectable({
  providedIn: 'root',
})
export class TrendDataService {

  private readonly _deepDiveTrends = signal<MonthlyTrendData[]>(generateMockTrendData(6));

  getDeepDiveTrends() {
    return this._deepDiveTrends.asReadonly();
  }
}
