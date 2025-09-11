import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataConfigService } from '../../services/data-config.service';

@Component({
  selector: 'app-data-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-config.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataConfigComponent {
  private dataConfigService = inject(DataConfigService);
  configs = this.dataConfigService.getConfigs();

  copied = signal<string | null>(null);

  copyQuery(key: string, query: string) {
    navigator.clipboard.writeText(query).then(() => {
      this.copied.set(key);
      setTimeout(() => this.copied.set(null), 2000);
    });
  }
}