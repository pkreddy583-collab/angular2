import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

type MenuKey = 'commandCenter' | 'handovers' | 'deepDive' | 'platform';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick()',
  },
})
export class AppComponent {
  currentDate = new Date();

  menuState = signal<Record<MenuKey, boolean>>({
    commandCenter: false,
    handovers: false,
    deepDive: false,
    platform: false,
  });

  toggleMenu(menu: MenuKey, event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.menuState.update(currentState => {
      const wasOpen = currentState[menu];
      const newState: Record<MenuKey, boolean> = {
        commandCenter: false,
        handovers: false,
        deepDive: false,
        platform: false,
      };
      newState[menu] = !wasOpen;
      return newState;
    });
  }

  onDocumentClick() {
    this.menuState.set({
      commandCenter: false,
      handovers: false,
      deepDive: false,
      platform: false,
    });
  }
}
