import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService, Event } from '../../../services/event.service';

@Component({
  selector: 'app-my-account',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-account.html',
  styleUrls: ['./my-account.css']
})
export class MyAccountComponent {
  eventService = inject(EventService);

  getTotalTickets(event: Event): number {
    if (!event.ticketTiers) return 0;
    return event.ticketTiers.reduce((total, tier) => {
      let tierTotal = 0;
      if (tier.packages) {
        tierTotal = tier.packages.reduce((pTot, p) => pTot + (p.quantity ? Number(p.quantity) : 0), 0);
      } else if ((tier as any).quantity) {
        tierTotal = Number((tier as any).quantity);
      }
      return total + tierTotal;
    }, 0);
  }

  deleteEvent(id: string) {
    if(confirm('¿Estás seguro que deseas eliminar este evento?')) {
      this.eventService.deleteEvent(id).subscribe({
        next: () => {},
        error: () => {
          this.eventService.deleteEventLocal(id);
        }
      });
    }
  }
}
