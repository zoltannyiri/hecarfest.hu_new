import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TesztComponent } from './teszt.component';

describe('TesztComponent', () => {
  let component: TesztComponent;
  let fixture: ComponentFixture<TesztComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TesztComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TesztComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
