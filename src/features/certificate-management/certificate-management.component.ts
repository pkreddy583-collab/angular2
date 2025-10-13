import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CertificateService } from '../../services/certificate.service';
import { SSLCertificate } from '../../models/certificate.model';

@Component({
  selector: 'app-certificate-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './certificate-management.component.html',
  styleUrls: ['./certificate-management.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CertificateManagementComponent {
  private certificateService = inject(CertificateService);

  private allCertificates = this.certificateService.getCertificates();

  // --- Filtering ---
  searchControl = new FormControl('');
  lobFilterControl = new FormControl<'all' | 'Core Services' | 'Finance & HR' | 'Public Facing'>('all');
  statusFilterControl = new FormControl<'all' | 'Valid' | 'Expires Soon' | 'Expired'>('all');

  private searchTerm = toSignal(this.searchControl.valueChanges, { initialValue: '' });
  private lobFilter = toSignal(this.lobFilterControl.valueChanges, { initialValue: 'all' });
  private statusFilter = toSignal(this.statusFilterControl.valueChanges, { initialValue: 'all' });

  filteredCertificates = computed(() => {
    const certs = this.allCertificates();
    const term = this.searchTerm()?.toLowerCase() ?? '';
    const lob = this.lobFilter();
    const status = this.statusFilter();

    return certs.filter(cert => {
      const matchesTerm = term
        ? cert.domainName.toLowerCase().includes(term) || cert.associatedServices.some(s => s.toLowerCase().includes(term))
        : true;
      const matchesLob = lob !== 'all' ? cert.lineOfBusiness === lob : true;
      const matchesStatus = status !== 'all' ? cert.status === status : true;
      return matchesTerm && matchesLob && matchesStatus;
    });
  });

  // --- Summary KPIs ---
  totalMonitored = computed(() => this.allCertificates().length);
  expiringSoon = computed(() => this.allCertificates().filter(c => c.status === 'Expires Soon').length);
  expired = computed(() => this.allCertificates().filter(c => c.status === 'Expired').length);

  // --- UI Helpers ---
  getStatusClass(status: SSLCertificate['status']): { text: string; bg: string; border: string } {
    switch (status) {
      case 'Valid':
        return { text: 'text-green-800', bg: 'bg-green-100', border: 'border-green-300' };
      case 'Expires Soon':
        return { text: 'text-yellow-800', bg: 'bg-yellow-100', border: 'border-yellow-400' };
      case 'Expired':
        return { text: 'text-red-800', bg: 'bg-red-100', border: 'border-red-400' };
    }
  }
}
