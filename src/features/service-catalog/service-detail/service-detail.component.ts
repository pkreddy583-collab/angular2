import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ServiceCatalogService, Service, ServiceStatus } from '../../../services/service-catalog.service';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './service-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceDetailComponent {
  private route = inject(ActivatedRoute);
  private serviceCatalog = inject(ServiceCatalogService);
  
  private serviceId = toSignal(this.route.paramMap.pipe(map(params => params.get('id'))));
  
  serviceData = computed(() => {
    const id = this.serviceId();
    if (!id) return { service: undefined, dependents: [] };
    const { service, dependents } = this.serviceCatalog.getServiceById(id);
    return { service: service(), dependents: dependents() };
  });

  dependenciesWithDetails = computed(() => {
    const service = this.serviceData().service;
    if (!service) return [];
    const allServices = this.serviceCatalog.getServices();
    // FIX: Call `allServices` as a function to get the signal's value before using `.find()`, resolving the "Property 'find' does not exist on type 'Signal'" error.
    return service.dependencies.map(depId => allServices().find(s => s.id === depId)).filter(s => s) as Service[];
  });

  getStatusClass(status: ServiceStatus) {
    switch (status) {
      case 'Operational': return { bg: 'bg-green-100', text: 'text-green-800' };
      case 'Degraded': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'Partial Outage': return { bg: 'bg-orange-100', text: 'text-orange-800' };
      case 'Major Outage': return { bg: 'bg-red-100', text: 'text-red-800' };
    }
  }
}