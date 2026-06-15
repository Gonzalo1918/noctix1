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
  editStartDate = '';
  editEndDate = '';
  editTicketTiers: any[] = [];

  // Iniciar edición de un evento
  startEdit(event: Event) {
    if (event.id) {
      this.editingEventId.set(event.id);
      this.editName = event.name;
      this.editDescription = event.description;
      this.editStartDate = event.startDate || '';
      this.editEndDate = event.endDate || '';
      this.editTicketTiers = event.ticketTiers ? JSON.parse(JSON.stringify(event.ticketTiers)) : [];
    }
  }

  // Cancelar la edición
  cancelEdit() {
    this.editingEventId.set(null);
  }

  addEditTicketTier() {
    this.editTicketTiers.push({ name: '', quantity: 1, startDate: '', endDate: '' });
  }

  removeEditTicketTier(index: number) {
    if (this.editTicketTiers.length > 1) {
      this.editTicketTiers.splice(index, 1);
    }
  }

  getEditTotalTickets(): number {
    return this.editTicketTiers.reduce((total, tier) => total + (tier.quantity ? Number(tier.quantity) : 0), 0);
  }

  getTotalTickets(event: Event): number {
    if (!event.ticketTiers) return 0;
    return event.ticketTiers.reduce((total, tier) => total + (tier.quantity ? Number(tier.quantity) : 0), 0);
  }

  // Guardar cambios usando el CRUD del servicio
  saveEdit(id: string) {
    if (!this.editName.trim() || !this.editDescription.trim() || !this.editStartDate || !this.editEndDate) return;

    const updatedEventData = { 
      name: this.editName, 
      description: this.editDescription,
      startDate: this.editStartDate,
      endDate: this.editEndDate,
      ticketTiers: this.editTicketTiers
    };

    // Ejecuta llamada API ficticia con fallback reactivo instantáneo en la lista
    this.eventService.updateEvent(id, updatedEventData).subscribe({
      next: (updated) => {
        this.editingEventId.set(null);
      },
      error: () => {
        // Fallback local instantáneo si la API no está desplegada aún
        this.eventService.updateEventLocal(id, updatedEventData);
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
