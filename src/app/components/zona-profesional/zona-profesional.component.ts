import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HeaderComponent } from '../header/header.component';
import { NotificationsService } from '../../services/notifications.service';

@Component({
  selector: 'app-zona-profesional',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  templateUrl: './zona-profesional.component.html',
  styleUrls: ['./zona-profesional.component.scss']
})
export class ZonaProfesionalComponent implements OnInit {
  user: any = null;
  notifications: string[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationsService: NotificationsService
  ) {
    this.user = this.authService.getCurrentUser();
  }

  ngOnInit() {
    this.notificationsService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
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

  clearNotifications() {
    this.notificationsService.clearNotifications();
  }
}

