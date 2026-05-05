import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionSummaryComponent } from './nutrition-summary.component';

describe('NutritionSummaryComponent', () => {
  let component: NutritionSummaryComponent;
  let fixture: ComponentFixture<NutritionSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutritionSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
