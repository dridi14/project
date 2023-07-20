import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutomationsTableComponent } from './automations-table.component';

describe('AutomationsTableComponent', () => {
  let component: AutomationsTableComponent;
  let fixture: ComponentFixture<AutomationsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutomationsTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutomationsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
