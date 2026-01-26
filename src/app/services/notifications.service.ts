import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private notificationsSubject = new BehaviorSubject<string[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  addNotification(message: string) {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, message]);
  }

  clearNotifications() {
    this.notificationsSubject.next([]);
  }
}