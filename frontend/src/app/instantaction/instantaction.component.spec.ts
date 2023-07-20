import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstantactionComponent } from './instantaction.component';

describe('InstantactionComponent', () => {
  let component: InstantactionComponent;
  let fixture: ComponentFixture<InstantactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstantactionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InstantactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
