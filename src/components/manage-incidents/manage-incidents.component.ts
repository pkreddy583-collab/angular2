import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Incident } from '../../models/incident.model';
import { IncidentService } from '../../services/incident.service';

@Component({
  selector: 'app-manage-incidents',
  templateUrl: './manage-incidents.component.html',
  imports: [CommonModule, ReactiveFormsModule],
  // FIX: Explicitly provide FormBuilder to make it available for injection.
  providers: [DatePipe, FormBuilder],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageIncidentsComponent {
  private incidentService = inject(IncidentService);
  private fb = inject(FormBuilder);
  private datePipe = inject(DatePipe);

  incidents = this.incidentService.getIncidents();
  
  isModalOpen = signal(false);
  editingIncident = signal<Incident | null>(null);
  
  modalTitle = computed(() => this.editingIncident() ? 'Edit Incident' : 'Add New Incident');

  incidentForm = this.fb.group({
    title: ['', Validators.required],
    priority: ['P1' as Incident['priority'], Validators.required],
    assignedTo: ['', Validators.required],
    slaBreachDate: ['', Validators.required],
  });

  openAddModal() {
    this.editingIncident.set(null);
    this.incidentForm.reset({ 
      title: '', 
      priority: 'P1', 
      assignedTo: '', 
      slaBreachDate: '' 
    });
    this.isModalOpen.set(true);
  }

  openEditModal(incident: Incident) {
    this.editingIncident.set(incident);
    const formattedDate = this.datePipe.transform(incident.slaBreachDate, 'yyyy-MM-ddTHH:mm');
    this.incidentForm.setValue({
      title: incident.title,
      priority: incident.priority,
      assignedTo: incident.assignedTo,
      slaBreachDate: formattedDate || ''
    });
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  onDelete(id: string) {
    if (confirm('Are you sure you want to delete this incident?')) {
      this.incidentService.deleteIncident(id);
    }
  }

  onSubmit() {
    if (this.incidentForm.invalid) {
      return;
    }
    const formValue = this.incidentForm.value;
    const slaDate = new Date(formValue.slaBreachDate!);

    const editing = this.editingIncident();
    if (editing) {
      const updatedIncident: Incident = {
        ...editing,
        title: formValue.title!,
        priority: formValue.priority!,
        assignedTo: formValue.assignedTo!,
        slaBreachDate: slaDate,
      };
      this.incidentService.updateIncident(updatedIncident);
    } else {
      this.incidentService.addIncident({
        title: formValue.title!,
        priority: formValue.priority!,
        assignedTo: formValue.assignedTo!,
        slaBreachDate: slaDate,
      });
    }
    this.closeModal();
  }
}
