import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss']
})
export class CalendarioComponent {
  user: any = null;
  currentDate: Date = new Date();
  selectedDate: Date | null = null;
  selectedHour: string | null = null;
  availableHours: string[] = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  @Output() appointmentScheduled = new EventEmitter<{date: Date, hour: string}>();

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.user = this.authService.getCurrentUser();
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
    this.selectedDate = null;
    this.selectedHour = null;
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.selectedDate = null;
    this.selectedHour = null;
  }

  selectDate(date: Date) {
    this.selectedDate = date;
    this.selectedHour = null;
  }

  selectHour(hour: string) {
    this.selectedHour = hour;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  isSelected(date: Date): boolean {
    return this.selectedDate ? date.toDateString() === this.selectedDate.toDateString() : false;
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentDate.getMonth();
  }

  scheduleAppointment() {
    if (this.selectedDate && this.selectedHour) {
      this.appointmentScheduled.emit({date: this.selectedDate, hour: this.selectedHour});
    }
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