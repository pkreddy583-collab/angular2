import { Component, ChangeDetectionStrategy, inject, signal, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OnCallRosterService } from '../../services/on-call-roster.service';

@Component({
  selector: 'app-on-call-roster',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './on-call-roster.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OnCallRosterComponent implements OnDestroy {
  private rosterService = inject(OnCallRosterService);
  rosters = this.rosterService.getRosters();

  currentTime = signal(new Date());
  private timer: number;

  constructor() {
    this.timer = window.setInterval(() => {
      this.currentTime.set(new Date());
    }, 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }
}
