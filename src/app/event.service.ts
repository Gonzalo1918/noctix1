import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateEventPayload {
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  time: string;
  price: number;
  stock: number;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private http = inject(HttpClient);

  // URL base para la API de eventos
  private readonly API_URL = '/api/events';

  /**
   * Envía los datos del formulario para crear un nuevo evento usando el método POST.
   * @param payload Los detalles del evento.
   */
  createEvent(payload: CreateEventPayload): Observable<any> {
    return this.http.post(this.API_URL, payload);
  }
}
