import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerReporteEmocionalComponent } from './ver-reporte-emocional.component';

describe('VerReporteEmocionalComponent', () => {
  let component: VerReporteEmocionalComponent;
  let fixture: ComponentFixture<VerReporteEmocionalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerReporteEmocionalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerReporteEmocionalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
