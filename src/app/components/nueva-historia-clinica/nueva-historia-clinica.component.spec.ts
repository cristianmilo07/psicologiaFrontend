import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevaHistoriaClinicaComponent } from './nueva-historia-clinica.component';

describe('NuevaHistoriaClinicaComponent', () => {
  let component: NuevaHistoriaClinicaComponent;
  let fixture: ComponentFixture<NuevaHistoriaClinicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevaHistoriaClinicaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevaHistoriaClinicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
