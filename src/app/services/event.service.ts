import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface TicketPackage {
  name: string;
  price: number;
  quantity: number;
}

export interface TicketTier {
  name: string;
  startDate?: string;
  endDate?: string;
  hasSpecificTime?: boolean;
  maxCapacity?: number;
  packages?: TicketPackage[];  // Optional for backward compatibility, but we will mostly use it.
}

export interface Event {
  id?: string;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
  maxCapacity?: number;
  hasSpecificTime?: boolean;
  ticketTiers?: TicketTier[];
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);
  private readonly API_URL = '/api/events';

  // Reactivamente guardamos el estado de los eventos para dar soporte local / UX interactiva.
  eventsList = signal<Event[]>([
    {
      id: '1',
      name: 'Ultra Buenos Aires 2026',
      description: 'El festival de música electrónica más grande del país en Mandarine Park.',
      startDate: '2026-10-31T20:00',
      endDate: '2026-11-01T06:00',
      ticketTiers: [
        { name: 'Early Bird', startDate: '2026-08-01T12:00', endDate: '2026-08-15T23:59', hasSpecificTime: true, packages: [{ name: 'General', price: 10000, quantity: 1500 }] },
        { name: 'Tier 1', startDate: '2026-08-16T00:00', endDate: '2026-09-30T23:59', packages: [{ name: 'General', price: 15000, quantity: 3000 }] },
        { name: 'Tier 2', startDate: '2026-10-01T00:00', endDate: '2026-10-31T19:59', packages: [{ name: 'General', price: 20000, quantity: 5000 }] }
      ]
    },
    {
      id: '2',
      name: 'Reggaeton Fest',
      description: 'La mejor fiesta de cachengue, pop y reggaeton para bailar toda la noche.',
      startDate: '2026-07-20T23:00',
      endDate: '2026-07-21T05:00',
      ticketTiers: [
        { name: 'Preventa', startDate: '2026-06-15T12:00', endDate: '2026-06-30T23:59', packages: [{ name: 'General', price: 5000, quantity: 500 }] },
        { name: 'General', startDate: '2026-07-01T00:00', endDate: '2026-07-20T22:59', packages: [{ name: 'General', price: 8000, quantity: 1500 }] },
        { name: 'VIP', startDate: '2026-06-15T12:00', endDate: '2026-07-20T22:59', packages: [{ name: 'VIP', price: 15000, quantity: 200 }] }
      ]
    },
    {
      id: '3',
      name: 'Rock en Vivo',
      description: 'Bandas en vivo tocando los clásicos del rock nacional e internacional.',
      startDate: '2026-09-12T19:00',
      endDate: '2026-09-12T23:30',
      ticketTiers: [
        { name: 'Fase 1', startDate: '2026-07-01T10:00', endDate: '2026-09-12T18:00', packages: [{ name: 'Campo', price: 10000, quantity: 4000 }, { name: 'Platea', price: 15000, quantity: 800 }] }
      ]
    }
  ]);

  /**
   * Obtiene todos los eventos de la API (Read - R)
   */
  getEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.API_URL).pipe(
      tap(events => {
        if (events && events.length > 0) {
          this.eventsList.set(events);
        }
      })
    );
  }

  /**
   * Obtiene un evento por su ID (Read - R)
   */
  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.API_URL}/${id}`);
  }

  /**
   * Crea un nuevo evento en la API (Create - C)
   */
  createEvent(event: Omit<Event, 'id'>): Observable<Event> {
    return this.http.post<Event>(this.API_URL, event).pipe(
      tap(newEvent => {
        if (newEvent) {
          this.eventsList.update(all => [...all, newEvent]);
        }
      })
    );
  }

  /**
   * Actualiza un evento existente en la API (Update - U)
   */
  updateEvent(id: string, event: Partial<Event>): Observable<Event> {
    return this.http.put<Event>(`${this.API_URL}/${id}`, event).pipe(
      tap(updated => {
        if (updated) {
          this.eventsList.update(all => all.map(e => e.id === id ? { ...e, ...updated } : e));
        }
      })
    );
  }

  /**
   * Elimina un evento de la API (Delete - D)
   */
  deleteEvent(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        this.eventsList.update(all => all.filter(e => e.id !== id));
      })
    );
  }

  // --- Métodos Locales de Soporte para Desarrollo / Fallback ---
  createEventLocal(event: Omit<Event, 'id'>): Event {
    const newEvent: Event = {
      ...event,
      id: 'evt-' + Math.floor(1000 + Math.random() * 9000).toString()
    };
    this.eventsList.update(all => [...all, newEvent]);
    return newEvent;
  }

  deleteEventLocal(id: string) {
    this.eventsList.update(all => all.filter(e => e.id !== id));
  }

  updateEventLocal(id: string, updatedData: Partial<Event>) {
    this.eventsList.update(all => all.map(e => e.id === id ? { ...e, ...updatedData } : e));
  }
}
