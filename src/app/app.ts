import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router } from '@angular/router';

// Core State Store & Interface Types
import { NoctixStore } from './noctix-store';
import { Event } from './types';

// Modular Reusable Components
import { Nav } from './nav';
import { Footer } from './footer';
import { Toast } from './toast';
import { Telemetry } from './telemetry';
import { EventCard } from './event-card';
import { TicketCard } from './ticket-card';
import { MarketCard } from './market-card';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    MatIconModule,
    // Add Reusable Subcomponents to the imports tree
    Nav,
    Footer,
    Toast,
    Telemetry,
    EventCard,
    TicketCard,
    MarketCard
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
/**
 * Main application frame.
 * Acts as the viewport shell, subscribing to active router parameters and directing
 * the active view state to respective panels accordingly.
 */
export class App implements OnInit {
  // --- Inject Central Store Service & Router ---
  readonly store = inject(NoctixStore);
  private router = inject(Router);

  ngOnInit() {
    // 1. Initial synchronization between the router path parameter and active navigation tab
    this.store.syncTabWithUrl(this.router.url);

    // 2. Track route change occurrences to preserve seamless SPA navigation matching
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.store.syncTabWithUrl(event.urlAfterRedirects);
      }
    });

    // 3. Log active security boot parameters inside the telemetries panel
    this.store.addTelemetryLog('info', '🛰️ Sistema de navegación satelital configurado. Escucha de tráficos de red activa.');
  }

  // --- Fast view transition helpers in alignment with strict user operations ---
  onViewEventDetail(eventId: string) {
    this.store.viewEventDetail(eventId);
  }

  onBuyOfficialEvent(event: Event) {
    this.store.openQuickCheckout(event);
  }
}
