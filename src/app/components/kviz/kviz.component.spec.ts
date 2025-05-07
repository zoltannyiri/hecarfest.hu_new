import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KvizComponent } from './kviz.component';

describe('KvizComponent', () => {
  let component: KvizComponent;
  let fixture: ComponentFixture<KvizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KvizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KvizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
