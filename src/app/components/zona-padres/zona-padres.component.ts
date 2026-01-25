import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CalendarioComponent } from '../calendario/calendario.component';

@Component({
  selector: 'app-zona-padres',
  standalone: true,
  imports: [CommonModule, RouterLink, CalendarioComponent],
  templateUrl: './zona-padres.component.html',
  styleUrls: ['./zona-padres.component.scss']
})
export class ZonaPadresComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
  }

  onSelectChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value === 'logout') {
      this.logout();
    }
  }

  onAppointmentScheduled(appointment: {date: Date, hour: string}) {
    alert(`Cita agendada para ${appointment.date.toLocaleDateString()} a las ${appointment.hour}`);
    // Here you could send to backend
  }
}

