import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaReportesEmocionalesComponent } from './lista-reportes-emocionales.component';

describe('ListaReportesEmocionalesComponent', () => {
  let component: ListaReportesEmocionalesComponent;
  let fixture: ComponentFixture<ListaReportesEmocionalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaReportesEmocionalesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListaReportesEmocionalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
