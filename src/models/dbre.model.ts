export interface ExplainPlanNode {
  operation: string;
  objectName?: string;
  cost: number;
  rows: number;
  bytes: number;
  children?: ExplainPlanNode[];
}

export interface SlowQuery {
  id: string;
  query: string;
  avgDurationMs: number;
  frequency: number; // per hour
  explainPlan: ExplainPlanNode[];
}
