import { Component, ChangeDetectionStrategy, input, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Incident } from '../../../models/incident.model';

@Component({
  selector: 'app-incident-card',
  templateUrl: './incident-card.component.html',
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IncidentCardComponent implements OnDestroy {
  incident = input.required<Incident>();

  private currentTime = signal(new Date());
  private timer: number | undefined;

  private timeRemainingMs = computed(() => {
    const breachTime = this.incident().slaBreachDate.getTime();
    const now = this.currentTime().getTime();
    return Math.max(0, breachTime - now);
  });
  
  private timeRemainingHours = computed(() => this.timeRemainingMs() / (1000 * 60 * 60));

  constructor() {
    this.timer = window.setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  statusColorClass = computed(() => {
    const hours = this.timeRemainingHours();
    if (hours <= 0) return { border: 'border-gray-300', text: 'text-gray-500', bg: 'bg-gray-50' };
    if (hours < 1) return { border: 'border-red-400', text: 'text-red-600', bg: 'bg-red-50' };
    if (hours < 8) return { border: 'border-orange-400', text: 'text-orange-600', bg: 'bg-orange-50' };
    if (hours < 24) return { border: 'border-yellow-400', text: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { border: 'border-green-400', text: 'text-green-600', bg: 'bg-green-50' };
  });

  formattedTimeRemaining = computed(() => {
    const totalMs = this.timeRemainingMs();
    if (totalMs <= 0) return 'Breached';
    
    const totalSeconds = Math.floor(totalMs / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (days === 0 && hours === 0) parts.push(`${seconds}s`);

    return parts.join(' ') || '0s';
  });

  priorityClass = computed(() => {
    switch (this.incident().priority) {
      case 'P1': return 'bg-red-600 text-white';
      case 'P2': return 'bg-orange-500 text-white';
      case 'P3': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  });
}