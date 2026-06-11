import { ChangeDetectionStrategy, Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
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
export class App implements OnInit, OnDestroy {
  // --- Inject Central Store Service & Router ---
  readonly store = inject(NoctixStore);
  private router = inject(Router);

  // --- Interactive FAQs & Newsletter ---
  expandedFaq = signal<number | null>(null);
  newsletterEmail = new FormControl('', [Validators.required, Validators.email]);

  // --- Carousel State & Properties for Featured Events ---
  activeCarouselIndex = signal<number>(0);
  private carouselIntervalId: any;

  featuredEvents = computed(() => {
    return this.store.eventsList().slice(0, 3);
  });

  nextFeatured() {
    const total = this.featuredEvents().length;
    if (total === 0) return;
    this.activeCarouselIndex.update(idx => (idx + 1) % total);
  }

  prevFeatured() {
    const total = this.featuredEvents().length;
    if (total === 0) return;
    this.activeCarouselIndex.update(idx => (idx - 1 + total) % total);
  }

  setCarouselIndex(index: number) {
    this.activeCarouselIndex.set(index);
    // Restart interval on manual interactions
    this.restartCarouselInterval();
  }

  private restartCarouselInterval() {
    if (this.carouselIntervalId) {
      clearInterval(this.carouselIntervalId);
    }
    this.carouselIntervalId = setInterval(() => {
      this.nextFeatured();
    }, 6000);
  }

  faqs = [
    {
      question: '¿Cómo puedo comprar mis entradas?',
      answer: 'Para comprar entradas oficiales, simplemente navegá por nuestra cartelera en "Explorar Eventos", seleccioná el show que te guste y hacé click en "COMPRAR ENTRADA OFICIAL". Podés pagar de forma segura con MercadoPago, Tarjeta de Crédito, o dinero en cuenta.'
    },
    {
      question: '¿Puedo devolver mis entradas si no puedo asistir?',
      answer: '¡Por supuesto! En Noctix, si no podés asistir a un evento, no tenés que preocuparte por pérdidas ni por revender en grupos sospechosos de redes sociales. Podés publicar tu entrada de forma segura en nuestro "Marketplace" de reventa regulada directamente desde tu billetera digital en segundos.'
    },
    {
      question: '¿Qué incluye la entrada VIP y Backstage?',
      answer: 'Los accesos VIP y Backstage te brindan prioridad de ingreso en taquilla sin filas, espacios exclusivos con vista privilegiada a la cabina del DJ o escenario principal, barra libre o consumiciones premium según el boliche y acceso a sanitarios preferenciales.'
    },
    {
      question: '¿Cómo accedo al evento con mi entrada digital?',
      answer: 'Al ingresar al boliche, abrí Noctix y andá a "Mis Entradas". Mostrá el QR dinámico de tu ticket en portería. El lector de taquilla del boliche validará tu firma encriptada viva, la cual rota de forma segura cada 15 segundos para evitar capturas de pantalla y estafas.'
    }
  ];

  toggleFaq(index: number) {
    if (this.expandedFaq() === index) {
      this.expandedFaq.set(null);
    } else {
      this.expandedFaq.set(index);
    }
  }

  onSubscribeNewsletter() {
    if (this.newsletterEmail.invalid) {
      this.store.triggerToast('Por favor, ingresá un formato de correo electrónico válido.');
      return;
    }
    const val = this.newsletterEmail.value;
    if (val) {
      this.store.addTelemetryLog('success', `📧 Newsletter: Nuevo suscriptor registrado para recibir preventas: ${val}`);
      this.store.triggerToast(`¡Excelente! Te suscribiste con éxito. Recibirás las preventas exclusivas en ${val}.`);
      this.newsletterEmail.reset();
    }
  }

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

    // 4. Initialize auto-run for the featured events carousel
    this.restartCarouselInterval();
  }

  ngOnDestroy() {
    if (this.carouselIntervalId) {
      clearInterval(this.carouselIntervalId);
    }
  }

  // --- Fast view transition helpers in alignment with strict user operations ---
  onViewEventDetail(eventId: string) {
    this.store.viewEventDetail(eventId);
  }

  onBuyOfficialEvent(event: Event) {
    this.store.openQuickCheckout(event);
  }
}
