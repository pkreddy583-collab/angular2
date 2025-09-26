import { Injectable, signal } from '@angular/core';
import { SlowQuery } from '../models/dbre.model';

const MOCK_SLOW_QUERIES: SlowQuery[] = [
  {
    id: 'q1',
    query: "SELECT c.customer_name, o.order_date, p.product_name FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN products p ON o.product_id = p.product_id WHERE c.region = 'North America';",
    avgDurationMs: 4500,
    frequency: 120,
    explainPlan: [
      {
        operation: 'HASH JOIN', cost: 15000, rows: 100000, bytes: 5000000,
        children: [
          {
            operation: 'HASH JOIN', cost: 8000, rows: 100000, bytes: 2500000,
            children: [
              { operation: 'TABLE ACCESS (FULL)', objectName: 'PRODUCTS', cost: 100, rows: 1000, bytes: 50000 },
              { operation: 'TABLE ACCESS (FULL)', objectName: 'ORDERS', cost: 7800, rows: 1000000, bytes: 24000000 }
            ]
          },
          { operation: 'TABLE ACCESS (FULL)', objectName: 'CUSTOMERS', cost: 6000, rows: 500000, bytes: 20000000 }
        ]
      }
    ]
  },
  {
    id: 'q2',
    query: "SELECT * FROM event_logs WHERE log_message LIKE '%ERROR%';",
    avgDurationMs: 8200,
    frequency: 30,
    explainPlan: [
      {
        operation: 'TABLE ACCESS (FULL)',
        objectName: 'EVENT_LOGS',
        cost: 250000,
        rows: 50000000,
        bytes: 50000000000
      }
    ]
  }
];

@Injectable({
  providedIn: 'root'
})
export class DbreService {
  private _slowQueries = signal<SlowQuery[]>(MOCK_SLOW_QUERIES);

  getSlowQueries() {
    return this._slowQueries.asReadonly();
  }
}
