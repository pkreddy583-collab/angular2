import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StarRatingComponent {
  rating = input<number>(0);
  readonly = input<boolean>(false);
  ratingChange = output<number>();

  hoveredRating = signal(0);
  stars = [1, 2, 3, 4, 5];

  onStarClick(star: number): void {
    if (this.readonly()) return;
    this.ratingChange.emit(star);
  }

  onStarEnter(star: number): void {
    if (this.readonly()) return;
    this.hoveredRating.set(star);
  }

  onStarLeave(): void {
    if (this.readonly()) return;
    this.hoveredRating.set(0);
  }
}
