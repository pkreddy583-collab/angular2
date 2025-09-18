import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostMortemService } from '../../../services/post-mortem.service';

@Component({
  selector: 'app-post-mortem-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './post-mortem-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostMortemListComponent {
  private pmService = inject(PostMortemService);
  postMortems = this.pmService.getPostMortems();

  postMortemsWithProgress = computed(() => {
    return this.postMortems().map(pm => {
      const totalItems = pm.actionItems.length;
      if (totalItems === 0) {
        return { ...pm, progress: 100 };
      }
      const completedItems = pm.actionItems.filter(a => a.completed).length;
      const progress = Math.round((completedItems / totalItems) * 100);
      return { ...pm, progress };
    });
  });
}