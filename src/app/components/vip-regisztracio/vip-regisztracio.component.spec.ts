import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VipRegisztracioComponent } from './vip-regisztracio.component';

describe('VipRegisztracioComponent', () => {
  let component: VipRegisztracioComponent;
  let fixture: ComponentFixture<VipRegisztracioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VipRegisztracioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VipRegisztracioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
