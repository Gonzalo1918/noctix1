import { Injectable, signal } from '@angular/core';

export interface Event {
  id: string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoctixService {
  isLoggedIn = signal<boolean>(false);
  events = signal<Event[]>([
    {
       id: '1', 
       name: 'Ultra Buenos Aires 2026', 
       description: 'El mejor festival de música electrónica del país.'
    }
  ]);

  login() {
    this.isLoggedIn.set(true);
  }

  logout() {
    this.isLoggedIn.set(false);
  }

  createEvent(event: Omit<Event, 'id'>) {
    const newEvent = { ...event, id: Math.random().toString() };
    this.events.update(e => [...e, newEvent]);
  }
}
