export interface MonthlyTrendData {
  month: string; // Format: 'YYYY-MM'
  monthDisplay: string; // Format: 'MMM ''YY'
  totalRequiredFte: number;
  actualDeployedFte: number;
  surplusDeficit: number;
  ticketDrivenFte: number;
  // A breakdown of the structured FTE for stacked charts
  structuredFteBreakdown: {
    response: number;
    proactive: number;
    continuousImprovement: number;
    shiftLeft: number;
    governance: number;
  };
}
