import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface TicketTier {
  name: string;
  quantity: number;
  startDate?: string;
  endDate?: string;
}

export interface Event {
  id?: string;
  name: string;
  description: string;
  startDate?: string;
  endDate?: string;
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
      description: 'El festival de música electrónica más grande del país en Mandarine Park.'
    },
    {
      id: '2',
      name: 'Reggaeton Fest',
      description: 'La mejor fiesta de cachengue, pop y reggaeton para bailar toda la noche.'
    },
    {
      id: '3',
      name: 'Rock en Vivo',
      description: 'Bandas en vivo tocando los clásicos del rock nacional e internacional.'
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
