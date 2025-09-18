import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface OnCallSchedule {
  team: string;
  primary: { name: string; until: Date };
  secondary: { name: string; until: Date };
  manager: string;
}

@Component({
  selector: 'app-on-call-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './on-call-dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnCallDashboardComponent {

  schedules = signal<OnCallSchedule[]>([
    { 
      team: 'Core Services', 
      primary: { name: 'Alice', until: this.getTomorrow(9) },
      secondary: { name: 'Bob', until: this.getTomorrow(9) },
      manager: 'Manager A' 
    },
    { 
      team: 'Database', 
      primary: { name: 'Charlie', until: this.getToday(17) },
      secondary: { name: 'Diana', until: this.getToday(17) },
      manager: 'Manager B' 
    },
    { 
      team: 'Infrastructure', 
      primary: { name: 'Eve', until: this.getTomorrow(9) },
      secondary: { name: 'Frank', until: this.getTomorrow(9) },
      manager: 'Manager C' 
    },
    { 
      team: 'Applications', 
      primary: { name: 'Grace', until: this.getToday(18) },
      secondary: { name: 'Heidi', until: this.getToday(18) },
      manager: 'Manager D' 
    },
    { 
      team: 'Security', 
      primary: { name: 'Ivan', until: this.getInThreeDays(9) },
      secondary: { name: 'Judy', until: this.getInThreeDays(9) },
      manager: 'Manager E' 
    },
  ]);

  private getToday(hour: number): Date {
    const d = new Date();
    d.setHours(hour, 0, 0, 0);
    return d;
  }

  private getTomorrow(hour: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(hour, 0, 0, 0);
    return d;
  }
  
  private getInThreeDays(hour: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    d.setHours(hour, 0, 0, 0);
    return d;
  }
}
