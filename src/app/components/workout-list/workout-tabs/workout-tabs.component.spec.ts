import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutTabsComponent } from './workout-tabs.component';

describe('WorkoutTabsComponent', () => {
  let component: WorkoutTabsComponent;
  let fixture: ComponentFixture<WorkoutTabsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkoutTabsComponent]
    });
    fixture = TestBed.createComponent(WorkoutTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
