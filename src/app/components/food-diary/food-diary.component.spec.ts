import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FoodDiaryComponent } from './food-diary.component';

describe('FoodDiaryComponent', () => {
  let component: FoodDiaryComponent;
  let fixture: ComponentFixture<FoodDiaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FoodDiaryComponent]
    });
    fixture = TestBed.createComponent(FoodDiaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
