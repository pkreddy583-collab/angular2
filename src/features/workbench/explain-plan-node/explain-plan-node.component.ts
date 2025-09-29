import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExplainPlanNode } from '../../../models/dbre.model';

@Component({
  selector: 'app-explain-plan-node',
  standalone: true,
  imports: [CommonModule, ExplainPlanNodeComponent],
  templateUrl: './explain-plan-node.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplainPlanNodeComponent {
  @Input({ required: true }) node!: ExplainPlanNode;

  isExpensive(): boolean {
    const n = this.node;
    return n.operation.toLowerCase().includes('full') || n.cost > 10000;
  }
  
  trackByOperation(index: number, node: ExplainPlanNode): string {
    return node.operation + index;
  }
}
