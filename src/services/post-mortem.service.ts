import { Injectable, signal, computed } from '@angular/core';

export interface ActionItem {
  id: number;
  description: string;
  owner: string;
  dueDate: Date;
  completed: boolean;
}

export interface PostMortem {
  id: string;
  incidentId: string;
  incidentTitle: string;
  date: Date;
  summary: string;
  timeline: { time: string; event: string }[];
  rootCause: string;
  lessonsLearned: string[];
  actionItems: ActionItem[];
}

@Injectable({
  providedIn: 'root',
})
export class PostMortemService {
  private postMortems = signal<PostMortem[]>([
    {
      id: 'pm-001',
      incidentId: 'INC-001',
      incidentTitle: 'Production server unresponsive',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      summary: 'A critical hardware failure on the main production hypervisor led to a complete outage of all hosted services. The incident was resolved by migrating VMs to a standby hypervisor.',
      timeline: [
        { time: '14:30 UTC', event: 'First alerts received for services being down.' },
        { time: '14:35 UTC', event: 'On-call engineer paged.' },
        { time: '15:00 UTC', event: 'Hardware failure on hypervisor confirmed.' },
        { time: '15:15 UTC', event: 'Decision made to migrate to standby hardware.' },
        { time: '16:30 UTC', event: 'All services restored on new hardware.' },
      ],
      rootCause: 'The RAID controller on the primary hypervisor failed, causing disk I/O to cease and making the server unresponsive.',
      lessonsLearned: [
        'Automated failover for critical hypervisors needs to be implemented.',
        'Monitoring for RAID controller health was insufficient.',
        'Communication to stakeholders was delayed in the first 30 minutes.',
      ],
      actionItems: [
        { id: 1, description: 'Implement automated hypervisor failover process.', owner: 'Infrastructure Team', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), completed: false },
        { id: 2, description: 'Add specific monitoring checks for RAID controller health.', owner: 'Monitoring Team', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), completed: true },
        { id: 3, description: 'Update incident communication plan with pre-approved templates.', owner: 'NOC', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), completed: false },
      ]
    },
    {
      id: 'pm-002',
      incidentId: 'INC-005',
      incidentTitle: 'File upload service failing for large files',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      summary: 'A misconfiguration in the load balancer was preventing files larger than 50MB from being uploaded successfully. The issue was resolved by correcting the request body size limit.',
      timeline: [
        { time: '09:00 UTC', event: 'Ticket raised by user about failing uploads.' },
        { time: '10:30 UTC', event: 'Issue replicated by L2 support.' },
        { time: '11:00 UTC', event: 'Infrastructure team begins investigation.' },
        { time: '11:45 UTC', event: 'Load balancer configuration identified as the cause.' },
        { time: '12:00 UTC', event: 'Configuration fix deployed and validated.' },
      ],
      rootCause: 'The `client_max_body_size` directive in the Nginx configuration on the load balancer was set to a default of 50MB during a recent security patching update.',
      lessonsLearned: [
        'Configuration changes, even during routine patching, need to be validated against a checklist of critical parameters.',
        'End-to-end testing for file uploads was not part of the post-patch validation plan.',
      ],
      actionItems: [
        { id: 4, description: 'Incorporate critical configuration parameters into a Git repository for versioning and review.', owner: 'Infrastructure Team', dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), completed: false },
        { id: 5, description: 'Add large file upload test to the standard post-patch validation checklist.', owner: 'QA Team', dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), completed: true },
      ]
    }
  ]);

  getPostMortems() {
    return this.postMortems.asReadonly();
  }

  getPostMortemById(id: string) {
    return computed(() => this.postMortems().find(pm => pm.id === id));
  }

  updateActionItemStatus(pmId: string, actionId: number, completed: boolean) {
    this.postMortems.update(pms => {
      const pm = pms.find(p => p.id === pmId);
      if (pm) {
        const actionItem = pm.actionItems.find(a => a.id === actionId);
        if (actionItem) {
          actionItem.completed = completed;
        }
      }
      return [...pms];
    });
  }
}