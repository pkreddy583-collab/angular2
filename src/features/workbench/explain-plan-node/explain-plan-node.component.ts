import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ExplainPlanNode } from '../../../models/dbre.model';

@Component({
  selector: 'app-explain-plan-node',
  standalone: true,
  imports: [DecimalPipe, ExplainPlanNodeComponent],
  templateUrl: './explain-plan-node.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExplainPlanNodeComponent {
  node = input.required<ExplainPlanNode>();

  isExpensive(): boolean {
    const n = this.node();
    return n.operation.toLowerCase().includes('full') || n.cost > 10000;
  }
}
