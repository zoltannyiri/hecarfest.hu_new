import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRegisztracioComponent } from './admin-regisztracio.component';

describe('AdminRegisztracioComponent', () => {
  let component: AdminRegisztracioComponent;
  let fixture: ComponentFixture<AdminRegisztracioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminRegisztracioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRegisztracioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
