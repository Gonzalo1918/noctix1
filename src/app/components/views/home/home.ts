import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService, Event } from '../../../services/event.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
  eventService = inject(EventService);

  // Estados para modo edición inline
  editingEventId = signal<string | null>(null);
  editName = '';
  editDescription = '';

  // Iniciar edición de un evento
  startEdit(event: Event) {
    if (event.id) {
      this.editingEventId.set(event.id);
      this.editName = event.name;
      this.editDescription = event.description;
    }
  }

  // Cancelar la edición
  cancelEdit() {
    this.editingEventId.set(null);
  }

  // Guardar cambios usando el CRUD del servicio
  saveEdit(id: string) {
    if (!this.editName.trim() || !this.editDescription.trim()) return;

    // Ejecuta llamada API ficticia con fallback reactivo instantáneo en la lista
    this.eventService.updateEvent(id, { name: this.editName, description: this.editDescription }).subscribe({
      next: (updated) => {
        this.editingEventId.set(null);
      },
      error: () => {
        // Fallback local instantáneo si la API no está desplegada aún
        this.eventService.updateEventLocal(id, { name: this.editName, description: this.editDescription });
        this.editingEventId.set(null);
      }
    });
  }

  // Borrar evento mediante delete CRUD
  deleteEvent(id: string) {
    this.eventService.deleteEvent(id).subscribe({
      next: () => {
        // Eliminado con éxito vía API
      },
      error: () => {
        // Fallback local si la API no está levantada
        this.eventService.deleteEventLocal(id);
      }
    });
  }
}
