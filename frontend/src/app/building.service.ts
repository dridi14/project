import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BuildingService {
  private selectedBuildingSubject = new BehaviorSubject<string>('Bâtiment A');
  selectedBuilding$: Observable<string> = this.selectedBuildingSubject.asObservable();

  constructor() {
    const storedBuilding = localStorage.getItem('selectedBuilding');
    if (storedBuilding) {
      this.selectedBuildingSubject.next(storedBuilding);
    }
  }

  getSelectedBuilding(): string {
    return this.selectedBuildingSubject.value;
  }

  changeBuilding(building: string) {
    this.selectedBuildingSubject.next(building);
    localStorage.setItem('selectedBuilding', building);
  }
}
