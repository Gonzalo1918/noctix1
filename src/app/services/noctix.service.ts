import { Injectable, signal } from '@angular/core';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  price: number;
  stock: number;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class NoctixService {
  isLoggedIn = signal<boolean>(false);
  events = signal<Event[]>([
    {
       id: '1', title: 'Ultra Buenos Aires', description: 'El mejor festival.', 
       location: 'Mandarine Park', date: '21/12/2026', time: '22:00', price: 25000, 
       stock: 100, category: 'Electrónica'
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
