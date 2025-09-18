import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { KnowledgeBaseService } from '../../../services/knowledge-base.service';

@Component({
  selector: 'app-knowledge-base-article',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './knowledge-base-article.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgeBaseArticleComponent {
  private route = inject(ActivatedRoute);
  private kbService = inject(KnowledgeBaseService);

  private articleId = toSignal(this.route.paramMap.pipe(map(params => params.get('id'))));

  article = computed(() => {
    const id = this.articleId();
    if (!id) return undefined;
    return this.kbService.getArticleById(id)();
  });
}