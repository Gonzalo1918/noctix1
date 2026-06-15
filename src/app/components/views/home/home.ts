import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService, Event } from '../../../services/event.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent {
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
}
