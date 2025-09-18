import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ServiceCatalogService, ServiceStatus, ServiceTier } from '../../../services/service-catalog.service';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceListComponent {
  private serviceCatalog = inject(ServiceCatalogService);
  
  services = this.serviceCatalog.getServices();

  // Filter state
  searchTerm = signal('');
  selectedTier = signal<ServiceTier | 0>(0); // 0 for all
  selectedStatus = signal<ServiceStatus | 'All'>('All');

  // Available filter options
  tiers: ServiceTier[] = [1, 2, 3, 4];
  statuses: ServiceStatus[] = ['Operational', 'Degraded', 'Partial Outage', 'Major Outage'];

  filteredServices = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const tier = this.selectedTier();
    const status = this.selectedStatus();

    return this.services().filter(service => {
      const matchesTerm = service.name.toLowerCase().includes(term) ||
                          service.description.toLowerCase().includes(term) ||
                          service.owner.toLowerCase().includes(term);
      const matchesTier = tier === 0 || service.tier === tier;
      const matchesStatus = status === 'All' || service.status === status;

      return matchesTerm && matchesTier && matchesStatus;
    });
  });

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  onTierChange(event: Event) {
    this.selectedTier.set(Number((event.target as HTMLSelectElement).value) as ServiceTier | 0);
  }

  onStatusChange(event: Event) {
    this.selectedStatus.set((event.target as HTMLSelectElement).value as ServiceStatus | 'All');
  }

  getStatusClass(status: ServiceStatus) {
    switch (status) {
      case 'Operational': return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-500' };
      case 'Degraded': return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-500' };
      case 'Partial Outage': return { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-500' };
      case 'Major Outage': return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-500' };
    }
  }
}