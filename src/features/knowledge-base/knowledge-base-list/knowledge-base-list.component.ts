import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { KnowledgeBaseService } from '../../../services/knowledge-base.service';
import { ServiceCatalogService } from '../../../services/service-catalog.service';

@Component({
  selector: 'app-knowledge-base-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './knowledge-base-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgeBaseListComponent {
  private kbService = inject(KnowledgeBaseService);
  private serviceCatalog = inject(ServiceCatalogService);

  articles = this.kbService.getArticles();
  services = this.serviceCatalog.getServices();

  // Filter state
  searchTerm = signal('');
  selectedService = signal('All');
  
  uniqueTags = computed(() => {
    const allTags = this.articles().flatMap(a => a.tags);
    return [...new Set(allTags)].sort();
  });
  selectedTag = signal('All');

  filteredArticles = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const service = this.selectedService();
    const tag = this.selectedTag();
    
    return this.articles().filter(article => {
      const matchesTerm = article.title.toLowerCase().includes(term) ||
                          article.summary.toLowerCase().includes(term);
      const matchesService = service === 'All' || article.associatedService === service;
      const matchesTag = tag === 'All' || article.tags.includes(tag);
      
      return matchesTerm && matchesService && matchesTag;
    });
  });

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onServiceChange(event: Event) {
    this.selectedService.set((event.target as HTMLSelectElement).value);
  }

  onTagChange(event: Event) {
    this.selectedTag.set((event.target as HTMLSelectElement).value);
  }
}