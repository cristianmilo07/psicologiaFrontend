import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationsService } from '../../services/notifications.service';
import { CitasService, Cita } from '../../services/citas.service';


@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss']
})
export class CalendarioComponent implements OnInit {
  user: any = null;
  currentDate: Date = new Date();
  appointments: Cita[] = [];
  showModal: boolean = false;
  selectedDateForModal: Date | null = null;
  newAppointment: { time: string; description: string; type: 'alumno' | 'acudiente' } = { time: '', description: '', type: 'alumno' };

  @Output() appointmentScheduled = new EventEmitter<{date: Date, hour: string}>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationsService: NotificationsService,
    private citasService: CitasService
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.loadAppointments();
  }

  getDaysInMonth(): Date[] {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add previous month's days to fill the first week
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    for (let d = new Date(startDate); d <= lastDay; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }

    return days;
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
  }

  selectDate(date: Date) {
    this.selectedDateForModal = date;
    this.newAppointment = { time: '', description: '', type: 'alumno' };
    this.showModal = true;
  }

  getAppointmentsForDate(date: Date): Cita[] {
    return this.appointments.filter(app => new Date(app.date).toDateString() === date.toDateString());
  }

  loadAppointments() {
    this.citasService.getCitas().subscribe({
      next: (citas) => {
        this.appointments = citas;
      },
      error: (error) => {
        console.error('Error loading appointments', error);
      }
    });
  }

  saveAppointment() {
    if (this.selectedDateForModal && this.newAppointment.time && this.newAppointment.description) {
      const cita = {
        date: this.selectedDateForModal,
        time: this.newAppointment.time,
        description: this.newAppointment.description,
        type: this.newAppointment.type
      };

      this.citasService.createCita(cita).subscribe({
        next: (newCita) => {
          this.appointments.push(newCita);
          this.showModal = false;
          this.appointmentScheduled.emit({date: this.selectedDateForModal!, hour: this.newAppointment.time});

          // Notification for future appointments
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const selected = new Date(this.selectedDateForModal!);
          selected.setHours(0, 0, 0, 0);
          if (selected > today) {
            const typeLabel = this.newAppointment.type === 'alumno' ? 'Alumno' : 'Acudiente';
            this.notificationsService.addNotification(`Tienes agendada una cita para ${typeLabel}: ${this.newAppointment.description}`);
          }
        },
        error: (error) => {
          console.error('Error saving appointment', error);
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentDate.getMonth();
  }

  logout() {
    this.authService.logout();
  }

  onSelectChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target.value === 'logout') {
      this.logout();
    }
  }
}