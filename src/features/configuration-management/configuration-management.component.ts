import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConfigurationManagementService } from '../../services/configuration-management.service';
import { GeminiService } from '../../services/gemini.service';
import { ConfigurationItem, CiType, CiEnvironment } from '../../models/configuration-item.model';

@Component({
  selector: 'app-configuration-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './configuration-management.component.html',
  styleUrls: ['./configuration-management.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigurationManagementComponent {
  private cmdbService = inject(ConfigurationManagementService);
  private geminiService = inject(GeminiService);

  // --- State ---
  selectedCi = signal<ConfigurationItem | null>(null);
  activeTab = signal<'overview' | 'relationships' | 'activity' | 'ai'>('overview');
  aiAnalysisResult = signal<string | null>(null);
  isGeneratingAnalysis = signal(false);

  // --- Filtering ---
  searchControl = new FormControl('');
  typeFilterControl = new FormControl<CiType | 'all'>('all');
  envFilterControl = new FormControl<CiEnvironment | 'all'>('all');

  private searchTerm = toSignal(this.searchControl.valueChanges, { initialValue: '' });
  private typeFilter = toSignal(this.typeFilterControl.valueChanges, { initialValue: 'all' });
  private envFilter = toSignal(this.envFilterControl.valueChanges, { initialValue: 'all' });
  
  ciTypes: CiType[] = ['Application', 'Server', 'Database', 'Network Device'];
  environments: CiEnvironment[] = ['Production', 'Staging', 'QA'];

  filteredCiItems = computed(() => {
    const allItems = this.cmdbService.ciItems();
    const term = this.searchTerm()?.toLowerCase() ?? '';
    const type = this.typeFilter();
    const env = this.envFilter();

    return allItems.filter(item => {
      const matchesTerm = term ? item.name.toLowerCase().includes(term) || item.id.toLowerCase().includes(term) : true;
      const matchesType = type !== 'all' ? item.type === type : true;
      const matchesEnv = env !== 'all' ? item.environment === env : true;
      return matchesTerm && matchesType && matchesEnv;
    });
  });

  // --- Computed properties for selected CI ---
  relatedCis = computed(() => {
    const ci = this.selectedCi();
    if (!ci) return [];
    return ci.relationships.map(rel => {
      const relatedItem = this.cmdbService.getCiById(rel.targetId);
      return { item: relatedItem, type: rel.type };
    }).filter(r => r.item) as { item: ConfigurationItem; type: string }[];
  });

  downstreamDependencies = computed(() => this.relatedCis().filter(r => r.type === 'Depends on'));
  upstreamDependents = computed(() => this.relatedCis().filter(r => r.type === 'Used by'));


  // --- Methods ---
  selectCi(ci: ConfigurationItem): void {
    this.selectedCi.set(ci);
    this.activeTab.set('overview');
    this.aiAnalysisResult.set(null); // Reset AI analysis on new selection
  }

  selectTab(tab: 'overview' | 'relationships' | 'activity' | 'ai'): void {
    this.activeTab.set(tab);
  }

  async runImpactAnalysis() {
    const ci = this.selectedCi();
    const rels = this.relatedCis();
    if (!ci) return;
    
    this.isGeneratingAnalysis.set(true);
    this.aiAnalysisResult.set(null);
    try {
      const result = await this.geminiService.generateCiImpactAnalysis(ci, rels);
      this.aiAnalysisResult.set(result);
    } catch (e) {
      this.aiAnalysisResult.set('An error occurred while generating the analysis.');
      console.error(e);
    } finally {
      this.isGeneratingAnalysis.set(false);
    }
  }

  getStatusClass(status: ConfigurationItem['status']): string {
    switch (status) {
      case 'Healthy': return 'bg-green-500';
      case 'Warning': return 'bg-yellow-500';
      case 'Critical': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }
}
