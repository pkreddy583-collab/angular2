import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { PostMortemService } from '../../../services/post-mortem.service';

@Component({
  selector: 'app-post-mortem-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './post-mortem-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostMortemDetailComponent {
  private route = inject(ActivatedRoute);
  private pmService = inject(PostMortemService);

  private pmId = toSignal(this.route.paramMap.pipe(map(params => params.get('id'))));

  postMortem = computed(() => {
    const id = this.pmId();
    if (!id) return undefined;
    return this.pmService.getPostMortemById(id)();
  });

  toggleActionItem(actionId: number, event: Event) {
    const id = this.pmId();
    const isChecked = (event.target as HTMLInputElement).checked;
    if (id) {
      this.pmService.updateActionItemStatus(id, actionId, isChecked);
    }
  }

  isOverdue(dueDate: Date) {
    return new Date(dueDate) < new Date() && !this.postMortem()?.actionItems.find(a => a.dueDate === dueDate)?.completed;
  }
}