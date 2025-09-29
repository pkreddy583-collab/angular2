import { Injectable, signal } from '@angular/core';
import { CustomJourney } from '../models/observability.model';

@Injectable({
  providedIn: 'root',
})
export class JourneyBuilderService {
  private _savedJourneys = signal<CustomJourney[]>([]);

  getSavedJourneys() {
    return this._savedJourneys.asReadonly();
  }

  saveJourney(journey: CustomJourney) {
    this._savedJourneys.update((journeys) => [...journeys, journey]);
  }
}
