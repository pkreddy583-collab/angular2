import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

// Mock data types
type ChangeStatus = 'Awaiting Approval' | 'Scheduled' | 'In Progress' | 'Completed';

interface ChangeRequest {
  id: string;
  title: string;
  risk: 'Low' | 'Medium' | 'High';
  status: ChangeStatus;
  service: string;
  scheduledFor: Date;
  assignedTo: string;
  dependencies?: string[];
}

@Component({
  selector: 'app-change-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './change-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeDashboardComponent {
  
  changeRequests = signal<ChangeRequest[]>([
    { id: 'CHG-001', title: 'Deploy new version of Payment Gateway API', risk: 'High', status: 'Scheduled', service: 'Payment Gateway', scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), assignedTo: 'Alice', dependencies: ['CHG-005'] },
    { id: 'CHG-002', title: 'Upgrade production database server OS', risk: 'High', status: 'In Progress', service: 'DB Server Health', scheduledFor: new Date(), assignedTo: 'Bob', dependencies: ['CHG-003'] },
    { id: 'CHG-003', title: 'Update SSL certificate for HR Portal', risk: 'Low', status: 'Completed', service: 'HR Portal', scheduledFor: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), assignedTo: 'Charlie' },
    { id: 'CHG-004', title: 'Add new indexes to user database', risk: 'Medium', status: 'Awaiting Approval', service: 'DB Server Health', scheduledFor: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), assignedTo: 'Diana' },
    { id: 'CHG-005', title: 'Increase memory for Medicare Service instances', risk: 'Low', status: 'Scheduled', service: 'Medicare Service', scheduledFor: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), assignedTo: 'Eve' },
    { id: 'CHG-006', title: 'Content update for public website', risk: 'Low', status: 'Completed', service: 'Public Website', scheduledFor: new Date(Date.now() - 2 * 60 * 60 * 1000), assignedTo: 'Frank' },
    { id: 'CHG-007', title: 'Deploy schema changes for user database', risk: 'Medium', status: 'Awaiting Approval', service: 'DB Server Health', scheduledFor: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), assignedTo: 'Alice', dependencies: ['CHG-004'] }
  ]);

  boardColumns: ChangeStatus[] = ['Awaiting Approval', 'Scheduled', 'In Progress', 'Completed'];

  // State for drag and drop
  draggedChangeId = signal<string | null>(null);
  dragOverColumn = signal<ChangeStatus | null>(null);
  errorMessage = signal<string | null>(null);

  getChangesByStatus(status: string) {
    return this.changeRequests().filter(cr => cr.status === status);
  }

  getRiskClass(risk: 'Low' | 'Medium' | 'High') {
    switch(risk) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
    }
  }

  getDependencyStatus(depId: string): ChangeStatus | 'Not Found' {
    const dep = this.changeRequests().find(c => c.id === depId);
    return dep ? dep.status : 'Not Found';
  }

  // --- Drag and Drop Handlers ---

  onDragStart(event: DragEvent, change: ChangeRequest) {
    this.draggedChangeId.set(change.id);
    this.errorMessage.set(null); // Clear previous errors
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', change.id);
    }
  }

  onDragOver(event: DragEvent, status: ChangeStatus) {
    event.preventDefault(); // This is necessary to allow dropping
    this.dragOverColumn.set(status);
  }

  onDragLeave() {
    this.dragOverColumn.set(null);
  }

  onDrop(event: DragEvent, newStatus: ChangeStatus) {
    event.preventDefault();
    const changeId = this.draggedChangeId();
    if (!changeId) {
      this.cleanupDragState();
      return;
    }

    const change = this.changeRequests().find(c => c.id === changeId);
    if (!change || change.status === newStatus) {
      this.cleanupDragState();
      return;
    }

    // --- Dependency Validation Logic ---
    if ((newStatus === 'Scheduled' || newStatus === 'In Progress') && change.dependencies?.length) {
      const unmetDependencies = change.dependencies.filter(depId => {
        const dependency = this.changeRequests().find(c => c.id === depId);
        return dependency?.status !== 'Completed';
      });

      if (unmetDependencies.length > 0) {
        this.errorMessage.set(`Cannot move "${change.title}". Dependencies (${unmetDependencies.join(', ')}) must be 'Completed'.`);
        setTimeout(() => this.errorMessage.set(null), 5000); // Auto-hide error
        this.cleanupDragState();
        return;
      }
    }

    // Update the status of the dropped change request
    this.changeRequests.update(requests => 
      requests.map(req => 
        req.id === changeId ? { ...req, status: newStatus } : req
      )
    );

    this.cleanupDragState();
  }

  private cleanupDragState() {
    this.draggedChangeId.set(null);
    this.dragOverColumn.set(null);
  }
}
