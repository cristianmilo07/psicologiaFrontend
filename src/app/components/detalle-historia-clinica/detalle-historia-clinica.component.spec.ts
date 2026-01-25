import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleHistoriaClinicaComponent } from './detalle-historia-clinica.component';

describe('DetalleHistoriaClinicaComponent', () => {
  let component: DetalleHistoriaClinicaComponent;
  let fixture: ComponentFixture<DetalleHistoriaClinicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleHistoriaClinicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalleHistoriaClinicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});