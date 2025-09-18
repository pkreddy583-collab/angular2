import { Injectable, signal, computed } from '@angular/core';

export interface Article {
  id: string;
  title: string;
  summary: string;
  associatedService: string; // Service Name
  tags: string[];
  lastUpdated: Date;
  content: string; // Markdown content
}

@Injectable({
  providedIn: 'root',
})
export class KnowledgeBaseService {
  private articles = signal<Article[]>([
    {
      id: 'kb-001',
      title: 'Runbook: Restarting the User Authentication Service',
      summary: 'Step-by-step guide for safely restarting the auth service pods in Kubernetes during a maintenance window.',
      associatedService: 'User Authentication',
      tags: ['runbook', 'kubernetes', 'restart'],
      lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      content: `
# Runbook: Restarting the User Authentication Service

## 1. Prerequisites
- **Permissions:** You must have \`kubectl\` access to the production cluster.
- **Timing:** This procedure should only be performed during a scheduled maintenance window.

## 2. Procedure
1.  **Check for active alerts:** Before proceeding, verify in the Observability Dashboard that there are no critical alerts for the User Authentication service.
2.  **Scale down deployments:** Perform a rolling restart by scaling the deployment down to 0 replicas, then back up.
    \`\`\`bash
    kubectl scale deployment/auth-service --replicas=0 -n production
    \`\`\`
3.  **Verify pods are terminated:** Wait for all pods to be terminated.
    \`\`\`bash
    kubectl get pods -n production -l app=auth-service
    \`\`\`
4.  **Scale up deployment:** Scale the service back to its original replica count (usually 3).
    \`\`\`bash
    kubectl scale deployment/auth-service --replicas=3 -n production
    \`\`\`
5.  **Monitor logs:** Watch the logs for the new pods to ensure they start up cleanly.
    \`\`\`bash
    kubectl logs -f -n production -l app=auth-service
    \`\`\`

## 3. Validation
- Perform a test login to the Enrollment Hub application.
- Check the service health in the Observability Dashboard.
`
    },
    {
      id: 'kb-002',
      title: 'SOP: Investigating Database High Latency',
      summary: 'Standard operating procedure for diagnosing high latency issues on production PostgreSQL databases.',
      associatedService: 'User Database',
      tags: ['sop', 'database', 'postgresql', 'performance'],
      lastUpdated: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      content: `
# SOP: Investigating Database High Latency

## 1. Initial Triage
- **Identify slow queries:** Use the monitoring tools to identify queries with high execution time.
- **Check for locks:** Look for long-running transactions that may be holding locks.
  \`\`\`sql
  SELECT pid, age(clock_timestamp(), query_start), usename, query
  FROM pg_stat_activity
  WHERE query != '<IDLE>' AND query NOT ILIKE '%pg_stat_activity%'
  ORDER BY query_start desc;
  \`\`\`

## 2. Analysis
- **Run EXPLAIN ANALYZE:** Get the query plan for the identified slow queries to understand how they are being executed.
- **Check index usage:** Ensure that appropriate indexes are being used.
- **Review resource utilization:** Check CPU, memory, and IOPS on the database server.

## 3. Escalation
- If the root cause is not immediately apparent, escalate to the **Database Team** with the collected information.
`
    }
  ]);

  getArticles() {
    return this.articles.asReadonly();
  }

  getArticleById(id: string) {
    return computed(() => this.articles().find(a => a.id === id));
  }
}