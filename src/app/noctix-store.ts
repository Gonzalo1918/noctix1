import { Injectable, signal, computed, inject, OnDestroy, effect } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Event, Ticket, TelemetryLog } from './types';

@Injectable({
  providedIn: 'root'
})
/**
 * Doctoctix State & Operations Store.
 * Centralized service implementing modern Angular Signals to handle session states,
 * event lists, secure electronic ticket wallets, resale operations, and audit logs.
 */
export class NoctixStore implements OnDestroy {
  // --- Services Inject ---
  private router = inject(Router);

  // --- Session & Identity State Signals ---
  isLoggedIn = signal<boolean>(false);
  currentUserEmail = signal<string>('');
  currentUserNickname = signal<string>('');

  // --- Tab & Custom Navigation Signal ---
  activeTab = signal<'events' | 'my-tickets' | 'resale-market' | 'how-it-works' | 'admin' | 'policies' | 'login' | 'event-detail'>('events');
  authMode = signal<'login' | 'register' | 'recover'>('login');
  selectedCategory = signal<string>('Todos');
  selectedEventId = signal<string | null>(null);

  // --- Interaction & UI Modal Signals ---
  showQuickCheckout = signal<boolean>(false);
  checkoutEvent = signal<Event | null>(null);
  showSuccessToast = signal<boolean>(false);
  toastMessage = signal<string>('');
  isAdminOpen = signal<boolean>(false);

  // --- Dynamic Rotating Anti-Counterfeit Token Signals ---
  qrTimeLeft = signal<number>(15);
  globalQrToken = signal<string>('NX-88B9-9D2E');
  private qrIntervalId: any;

  // --- System Logs / Fraud Audit Signals ---
  telemetryLogs = signal<TelemetryLog[]>([]);

  // --- Reactive Primary Collections ---
  eventsList = signal<Event[]>([]);
  tickets = signal<Ticket[]>([]);

  // --- Reactive Form Groups ---
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  recoverForm!: FormGroup;
  adminEventForm!: FormGroup;
  checkoutForm!: FormGroup;

  // --- Computed Derived Subview Signals (Optimal Rendering) ---
  selectedEvent = computed(() => {
    const id = this.selectedEventId();
    if (!id) return null;
    return this.eventsList().find(e => e.id === id) || null;
  });

  similarEvents = computed(() => {
    const current = this.selectedEvent();
    if (!current) return [];
    return this.eventsList().filter(e => e.id !== current.id && e.category === current.category);
  });

  filteredEvents = computed(() => {
    const category = this.selectedCategory();
    const list = this.eventsList();
    if (category === 'Todos' || !category) {
      return list;
    }
    if (category === 'Reggaeton') {
      return list.filter(e => e.category === 'Reggaeton');
    }
    if (category === 'Electrónica') {
      return list.filter(e => e.category === 'Electrónica');
    }
    if (category === 'En Vivo') {
      return list.filter(e => e.category === 'En Vivo');
    }
    if (category === 'VIP') {
      return list.filter(e => e.id === 'evt-101' || e.id === 'evt-105');
    }
    if (category === 'Bares') {
      return list.filter(e => e.id === 'evt-104' || e.badge?.includes('BAR'));
    }
    return list.filter(e => e.category === category as any);
  });

  myTicketsList = computed(() => {
    const email = this.currentUserEmail();
    const all = this.tickets();
    return all.filter(t => t.ownerEmail === email);
  });

  resaleMarketList = computed(() => {
    return this.tickets().filter(t => t.status === 'reselling');
  });

  constructor() {
    // 1. Setup forms with custom clean rules
    this.initForms();

    // 2. Load data from local persistence or seed standard catalog
    this.loadInitialData();

    // 3. Start cryptographic rotation clock
    this.startSecureQrTimer();

    // 4. Trace navigation effects synchronously with the Router
    this.setupUrlSyncEffects();
  }

  ngOnDestroy() {
    if (this.qrIntervalId) {
      clearInterval(this.qrIntervalId);
    }
  }

  // --- Form Definitions ---
  private initForms() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });

    this.registerForm = new FormGroup({
      nickname: new FormControl('', [Validators.required, Validators.minLength(3)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      acceptTerms: new FormControl(false, [Validators.requiredTrue])
    });

    this.recoverForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email])
    });

    this.adminEventForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      artist: new FormControl('', [Validators.required]),
      category: new FormControl('Electrónica', [Validators.required]),
      location: new FormControl('', [Validators.required]),
      price: new FormControl(12000, [Validators.required, Validators.min(100)]),
      stock: new FormControl(200, [Validators.required, Validators.min(10)]),
      date: new FormControl('18 Julio 2026', [Validators.required]),
      time: new FormControl('23:00 - 06:00', [Validators.required]),
      description: new FormControl('La mejor fiesta de boliche nocturna de Córdoba.', [Validators.required])
    });

    this.checkoutForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      quantity: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(5)]),
      paymentMethod: new FormControl('MercadoPago', [Validators.required])
    });
  }

  // --- Seed Catalog & Local Persistence ---
  private loadInitialData() {
    // Event list loading or seeding
    const storedEvents = localStorage.getItem('noctix_events_v2');
    if (storedEvents) {
      try {
        this.eventsList.set(JSON.parse(storedEvents));
      } catch (e) {
        this.seedDefaultEvents();
      }
    } else {
      this.seedDefaultEvents();
    }

    // Ticket list loading
    const storedTickets = localStorage.getItem('noctix_tickets_v2');
    if (storedTickets) {
      try {
        this.tickets.set(JSON.parse(storedTickets));
      } catch (e) {
        this.tickets.set([]);
      }
    }

    // Active auth user session
    const activeUser = localStorage.getItem('noctix_user');
    if (activeUser) {
      try {
        const user = JSON.parse(activeUser);
        this.isLoggedIn.set(true);
        this.currentUserEmail.set(user.email);
        this.currentUserNickname.set(user.nickname);
        this.checkoutForm.patchValue({ email: user.email });
      } catch (e) {
        localStorage.removeItem('noctix_user');
      }
    }
  }

  private seedDefaultEvents() {
    const defaultEvents: Event[] = [
      {
        id: 'evt-101',
        title: 'La Fábrica - Open Air',
        description: 'La estación de música electrónica por excelencia en Córdoba. Presentación de DJs internacionales consagrados en un predio al aire libre imponente y tecnológico.',
        location: 'La Fábrica, Camino a La Calera, Córdoba',
        date: '24 Junio 2026',
        time: '23:30 - 07:00',
        price: 18000,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
        category: 'Electrónica',
        badge: 'SÚPER VIP',
        artist: 'Hernán Cattáneo'
      },
      {
        id: 'evt-102',
        title: 'Fiesta Bresh en Club Paraguay',
        description: 'La fiesta más linda del mundo aterriza en la mítica base cultural de Barrio Güemes. Glitter bar, grandes DJs, pop, reggaetón y sorpresas inolvidables.',
        location: 'Club Paraguay, Marcelo T. de Alvear 655, Güemes, Córdoba',
        date: '04 Julio 2026',
        time: '23:00 - 06:00',
        price: 15000,
        stock: 120,
        image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop',
        category: 'Reggaeton',
        badge: 'HOT TICKET',
        artist: 'Bresh DJ Crew'
      },
      {
        id: 'evt-103',
        title: 'La Estación - Winter Techno',
        description: 'Sincronización rítmica y sesiones crudas en una de las coordenadas más magnéticas para la cultura clubber en las sierras cordobesas.',
        location: 'La Estación, Comuna San Roque, Córdoba',
        date: '10 Julio 2026',
        time: '00:00 - 08:00',
        price: 16500,
        stock: 85,
        image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=600&auto=format&fit=crop',
        category: 'Electrónica',
        badge: 'FEEL THE GROOVE',
        artist: 'Charlotte de Witte'
      },
      {
        id: 'evt-104',
        title: 'Dada Mini - Cócteles & Vinilos',
        description: 'El bar bohemio de mayor encanto en Güemes. Un patio interno inigualable con las mejores selecciones de DJs locales, funk, afro-house y vermutería.',
        location: 'Dada Mini, Achával Rodríguez 250, Güemes, Córdoba',
        date: '17 Julio 2026',
        time: '20:00 - 03:00',
        price: 8000,
        stock: 160,
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
        category: 'Reggaeton',
        badge: 'BAR DESTACADO',
        artist: 'DJ Gringo & Pedro D\'Alessandro'
      },
      {
        id: 'evt-105',
        title: 'Margarita Disco - Noche de Cuarteto',
        description: 'Un templo icónico del ritmo tradicional cordobés por excelencia. Show en vivo de las bandas de cuarteto más convocantes y noche bailable tradicional.',
        location: 'Margarita Disco, Av. Costanera, Córdoba',
        date: '25 Julio 2026',
        time: '23:00 - 05:30',
        price: 11000,
        stock: 12,
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=600&auto=format&fit=crop',
        category: 'En Vivo',
        badge: 'CUARTETO EN VIVO',
        artist: 'La K\'onga & Damián Córdoba'
      }
    ];
    this.eventsList.set(defaultEvents);
    this.saveData('events');
  }

  saveData(type: 'events' | 'tickets') {
    if (type === 'events') {
      localStorage.setItem('noctix_events_v2', JSON.stringify(this.eventsList()));
    } else if (type === 'tickets') {
      localStorage.setItem('noctix_tickets_v2', JSON.stringify(this.tickets()));
    }
  }

  // --- Dynamic Cryptographic QR Tokens Rotation ---
  private startSecureQrTimer() {
    this.qrIntervalId = setInterval(() => {
      const left = this.qrTimeLeft() - 1;
      if (left <= 0) {
        this.qrTimeLeft.set(15);
        
        // Dynamic simulated QR base token pool rotation
        const codes = ['NX-3C0B-9EF2', 'NX-88B9-9D2E', 'NX-F032-113A', 'NX-55CE-DF31', 'NX-AC92-BF71', 'NX-EED4-13B8'];
        const randomCode = codes[Math.floor(Math.random() * codes.length)];
        this.globalQrToken.set(randomCode);

        // Standard rotation of raw dynamic hashes for active components
        const updated = this.tickets().map(t => {
          if (t.status === 'active') {
            return { ...t, qrHash: this.generateRandomHash(16) };
          }
          return t;
        });
        this.tickets.set(updated);
        this.saveData('tickets');

        this.addTelemetryLog('success', `🎫 Firma de Entradas: Sincronización criptográfica forzada. Códigos rotativos actualizados (token de sesión: ${randomCode}).`);
      } else {
        this.qrTimeLeft.set(left);
      }
    }, 1000);
  }

  generateRandomHash(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // --- System Logs / Fraud Prevention Audit System ---
  addTelemetryLog(level: 'info' | 'success' | 'warn' | 'error', message: string) {
    const time = new Date().toLocaleTimeString('es-AR', { hour12: false });
    const log: TelemetryLog = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: time,
      level,
      message
    };
    
    this.telemetryLogs.update(logs => [log, ...logs.slice(0, 19)]);
  }

  clearTelemetry() {
    this.telemetryLogs.set([]);
    this.addTelemetryLog('info', 'Historial de telemetría depurado por el operador de forma segura.');
  }

  // --- Auth Handlers ---
  onLoginSubmit() {
    if (this.loginForm.invalid) return;
    const { email } = this.loginForm.value;
    
    const atIdx = email.indexOf('@');
    const nickname = atIdx > 0 ? email.substring(0, atIdx) : 'noctix_dancer';
    
    const userData = { email, nickname };
    localStorage.setItem('noctix_user', JSON.stringify(userData));
    
    this.currentUserEmail.set(email);
    this.currentUserNickname.set(nickname);
    this.isLoggedIn.set(true);
    this.checkoutForm.patchValue({ email });

    this.activeTab.set('events');
    
    this.addTelemetryLog('success', `🔓 Acceso Concedido: Sesión iniciada con éxito para ${email}.`);
    this.triggerToast(`Sesión iniciada como @${nickname}. ¡Bienvenido a Noctix!`);
    this.loginForm.reset();
  }

  onRegisterSubmit() {
    if (this.registerForm.invalid) return;
    const { email, nickname } = this.registerForm.value;

    const userData = { email, nickname };
    localStorage.setItem('noctix_user', JSON.stringify(userData));
    
    this.currentUserEmail.set(email);
    this.currentUserNickname.set(nickname);
    this.isLoggedIn.set(true);
    this.checkoutForm.patchValue({ email });

    // Gift of general pass for register to support explore testing
    this.issueGiftTicket(email);

    this.activeTab.set('events');
    
    this.addTelemetryLog('success', `🆕 Cuenta Creada: ${nickname} (${email}) se sumó a la red de Noctix.`);
    this.triggerToast(`¡Bienvenido @${nickname}! Te regalamos un pase gratis para que pruebes el sistema.`);
    this.registerForm.reset();
  }

  onRecoverSubmit() {
    if (this.recoverForm.invalid) return;
    const { email } = this.recoverForm.value;
    
    this.addTelemetryLog('warn', `📨 Recuperación: Token de renovación despachado al correo ${email}. Validez: 15 minutos.`);
    this.triggerToast(`Si el correo ${email} existe, recibirás instrucciones telemétricas.`);
    this.recoverForm.reset();
    
    this.authMode.set('login');
  }

  issueGiftTicket(email: string) {
    const list = this.eventsList();
    const event = list[Math.floor(Math.random() * list.length)] || {
      id: 'evt-gift',
      title: 'Noctix Opening Night',
      location: 'Noctix Club Virtual',
      date: 'Fin de Semana de Registro',
      time: '00:00 - 06:00',
      price: 0
    };

    const newTicket: Ticket = {
      id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
      eventId: event.id,
      eventTitle: event.title + ' [Regalo Noctix]',
      eventLocation: event.location,
      eventDate: event.date,
      eventTime: event.time,
      eventPrice: 0,
      qrHash: this.generateRandomHash(16),
      ownerEmail: email,
      purchaseDate: new Date().toLocaleDateString('es-AR'),
      status: 'active'
    };

    this.tickets.update(all => [...all, newTicket]);
    this.saveData('tickets');
  }

  logout() {
    const prevNickname = this.currentUserNickname();
    const prevEmail = this.currentUserEmail();
    
    localStorage.removeItem('noctix_user');
    this.currentUserEmail.set('');
    this.currentUserNickname.set('');
    this.isLoggedIn.set(false);
    this.checkoutForm.patchValue({ email: '' });

    this.activeTab.set('events');
    this.addTelemetryLog('warn', `🔒 Cierre de Sesión: ${prevNickname} (${prevEmail}) cerró su consola segura.`);
    this.triggerToast('Sesión de Noctix cerrada con éxito.');
  }

  // --- Purchase Flow Handlers ---
  openQuickCheckout(event: Event) {
    this.checkoutEvent.set(event);
    if (this.isLoggedIn()) {
      this.checkoutForm.get('email')?.setValue(this.currentUserEmail());
    }
    this.showQuickCheckout.set(true);
    this.addTelemetryLog('info', `🛒 Checkout Abierto: Procesando compra para "${event.title}". Stock restante: ${event.stock}`);
  }

  closeQuickCheckout() {
    this.showQuickCheckout.set(false);
    this.checkoutEvent.set(null);
  }

  submitQuickCheckout() {
    if (this.checkoutForm.invalid || !this.checkoutEvent()) return;
    const event = this.checkoutEvent()!;
    const { email, quantity } = this.checkoutForm.value;

    if (event.stock < quantity) {
      this.addTelemetryLog('error', `🚫 Denegado: Stock insuficiente para "${event.title}". Solicitado: ${quantity}, Disponible: ${event.stock}`);
      this.triggerToast('No hay suficiente stock disponible para la cantidad solicitada.');
      return;
    }

    // Deduct stock
    const updatedEvents = this.eventsList().map(evt => {
      if (evt.id === event.id) {
        return { ...evt, stock: evt.stock - quantity };
      }
      return evt;
    });

    this.eventsList.set(updatedEvents);
    this.saveData('events');

    // Create tickets
    const purchaseDate = new Date().toLocaleDateString('es-AR');
    const newTickets: Ticket[] = [];
    for (let i = 0; i < quantity; i++) {
      newTickets.push({
        id: 'TX-' + Math.floor(100000 + Math.random() * 900000),
        eventId: event.id,
        eventTitle: event.title,
        eventLocation: event.location,
        eventDate: event.date,
        eventTime: event.time,
        eventPrice: event.price,
        qrHash: this.generateRandomHash(16),
        ownerEmail: email,
        purchaseDate,
        status: 'active'
      });
    }

    this.tickets.update(all => [...all, ...newTickets]);
    this.saveData('tickets');

    // Auto login if guest
    if (!this.isLoggedIn()) {
      const atIdx = email.indexOf('@');
      const nickname = atIdx > 0 ? email.substring(0, atIdx) : 'comprador_noctix';
      const userData = { email, nickname };
      
      localStorage.setItem('noctix_user', JSON.stringify(userData));
      this.currentUserEmail.set(email);
      this.currentUserNickname.set(nickname);
      this.isLoggedIn.set(true);
    }

    this.showQuickCheckout.set(false);
    this.checkoutEvent.set(null);
    this.activeTab.set('my-tickets'); // Direct view to owned entries

    this.addTelemetryLog('success', `💳 Transacción Verificada: ${quantity} entrada(s) creadas para ${email}. Canales de verificación en cola.`);
    this.triggerToast(`Compra exitosa. ¡${quantity} ticket(s) listo(s) en tu billetera!`);
  }

  // --- Resale Marketplace Handlers ---
  postTicketForResale(ticketId: string, price: number) {
    if (isNaN(price) || price <= 0) {
      this.triggerToast('Ingresa un precio de reventa válido (mayor a 0).');
      return;
    }

    const all = this.tickets();
    const ticket = all.find(t => t.id === ticketId);
    if (!ticket) return;

    if (ticket.ownerEmail !== this.currentUserEmail()) {
      this.triggerToast('No puedes publicar un ticket que no es de tu propiedad.');
      return;
    }

    // Limit resale inflation to 50% above face value to deter scalpers (Fair Resale Policy)
    const inflationLimit = ticket.eventPrice * 1.5;
    if (price > inflationLimit && ticket.eventPrice > 0) {
      this.triggerToast(`¡Límite de reventa honesta! El precio máximo para evitar sobreprecio es $${inflationLimit.toLocaleString('es-AR')}.`);
      return;
    }

    const updated = all.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: 'reselling' as const, resalePrice: price };
      }
      return t;
    });

    this.tickets.set(updated);
    this.saveData('tickets');

    this.addTelemetryLog('warn', `📈 Ticket Publicado: ID: ${ticket.id} (${ticket.eventTitle}) en reventa regulada a $${price.toLocaleString('es-AR')}.`);
    this.triggerToast('Entrada puesta en el mercado de reventa verificado.');
  }

  cancelResale(ticketId: string) {
    const all = this.tickets();
    const updated = all.map(t => {
      if (t.id === ticketId && t.status === 'reselling') {
        return { ...t, status: 'active' as const, resalePrice: undefined };
      }
      return t;
    });

    this.tickets.set(updated);
    this.saveData('tickets');

    this.addTelemetryLog('info', `📉 Reventa Cancelada: Se retiró el ticket ID:${ticketId} del mercado abierto.`);
    this.triggerToast('Publicación cancelada. El ticket volvió a tu billetera.');
  }

  buyTicketFromResale(ticket: Ticket) {
    if (!this.isLoggedIn()) {
      this.activeTab.set('login');
      this.authMode.set('login');
      this.triggerToast('Por favor, inicia sesión para adquirir pases del mercado.');
      return;
    }

    const buyerEmail = this.currentUserEmail();

    if (ticket.ownerEmail === buyerEmail) {
      this.triggerToast('No puedes auto-comprar tu propia publicación.');
      return;
    }

    const previousOwner = ticket.ownerEmail;
    const finalPrice = ticket.resalePrice || ticket.eventPrice;

    const all = this.tickets();
    const updated = all.map(t => {
      if (t.id === ticket.id) {
        return {
          ...t,
          ownerEmail: buyerEmail, // Transfer ownership immediately
          status: 'active' as const,
          purchaseDate: new Date().toLocaleDateString('es-AR'),
          resalePrice: undefined
        };
      }
      return t;
    });

    this.tickets.set(updated);
    this.saveData('tickets');

    this.activeTab.set('my-tickets'); // Redirect to see their new ticket

    this.addTelemetryLog('success', `🤝 Reventa Completada: Contrato transferido de ${previousOwner} a ${buyerEmail} por $${finalPrice.toLocaleString('es-AR')}. Hash de firma verificado.`);
    this.triggerToast(`¡Adquiriste la entrada ID: ${ticket.id}! Bien hecho, ya está en tus tickets.`);
  }

  // --- Admin Handlers ---
  addAdminEvent() {
    if (this.adminEventForm.invalid) return;
    const val = this.adminEventForm.value;

    const newEvent: Event = {
      id: 'evt-' + Math.floor(100 + Math.random() * 900),
      title: val.title,
      description: val.description,
      location: val.location,
      price: val.price,
      stock: val.stock,
      date: val.date || '18 Julio 2026',
      time: val.time || '23:00 - 06:00',
      image: val.category === 'Electrónica' ? 
        'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop' :
        val.category === 'Reggaeton' ? 
        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop' :
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop',
      category: val.category,
      badge: 'NUEVO',
      artist: val.artist || 'Artista Invitado'
    };

    this.eventsList.update(all => [...all, newEvent]);
    this.saveData('events');

    this.addTelemetryLog('warn', `🛠 Admin: Evento Registrado: "${newEvent.title}" para ${newEvent.date}. Lineup: ${newEvent.artist}.`);
    this.triggerToast(`Se creó el evento "${newEvent.title}" con éxito.`);

    // Reset fields
    this.adminEventForm.get('title')?.reset();
    this.adminEventForm.get('location')?.reset();
    this.isAdminOpen.set(false);
  }

  restockEvents() {
    const updated = this.eventsList().map(e => {
      if (e.stock < 20) {
        return { ...e, stock: e.stock + 50 };
      }
      return e;
    });
    this.eventsList.set(updated);
    this.saveData('events');
    this.addTelemetryLog('warn', '🛠 Admin: Reabastecimiento forzado. Stock reforzado para eventos con alta demanda.');
    this.triggerToast('Se sumaron 50 entradas extra a los eventos casi agotados.');
  }

  // --- Custom Alert Toast Trigger ---
  triggerToast(message: string) {
    this.toastMessage.set(message);
    this.showSuccessToast.set(true);
    setTimeout(() => {
      this.showSuccessToast.set(false);
    }, 4500);
  }

  // --- Router Synchronization Effects ---
  private setupUrlSyncEffects() {
    // Side effect tracking ActiveTab changes to write navigation URLs
    effect(() => {
      const tab = this.activeTab();
      const mode = this.authMode();
      const eventId = this.selectedEventId();
      
      const currentPath = this.router.url.split('?')[0].replace(/^\/|\/$/g, '');
      
      let targetPath = '';
      if (tab === 'login') {
        targetPath = mode === 'register' ? 'registro' : mode === 'recover' ? 'recuperar' : 'login';
      } else if (tab === 'event-detail') {
        targetPath = eventId ? `evento/${eventId}` : 'events';
      } else if (tab !== 'events') {
        targetPath = tab;
      }
      
      if (currentPath !== targetPath) {
        setTimeout(() => {
          this.router.navigateByUrl('/' + targetPath);
        });
      }
    });
  }

  syncTabWithUrl(url: string) {
    const path = url.split('?')[0].replace(/^\/|\/$/g, '');
    
    if (path.startsWith('evento/')) {
      const id = path.split('/')[1];
      if (id) {
        this.selectedEventId.set(id);
        this.activeTab.set('event-detail');
      } else {
        this.activeTab.set('events');
      }
    } else if (path === 'login') {
      if (this.activeTab() !== 'login' || this.authMode() !== 'login') {
        this.activeTab.set('login');
        this.authMode.set('login');
      }
    } else if (path === 'registro') {
      if (this.activeTab() !== 'login' || this.authMode() !== 'register') {
        this.activeTab.set('login');
        this.authMode.set('register');
      }
    } else if (path === 'recuperar') {
      if (this.activeTab() !== 'login' || this.authMode() !== 'recover') {
        this.activeTab.set('login');
        this.authMode.set('recover');
      }
    } else if (path === 'my-tickets') {
      if (this.activeTab() !== 'my-tickets') this.activeTab.set('my-tickets');
    } else if (path === 'resale-market') {
      if (this.activeTab() !== 'resale-market') this.activeTab.set('resale-market');
    } else if (path === 'how-it-works') {
      if (this.activeTab() !== 'how-it-works') this.activeTab.set('how-it-works');
    } else if (path === 'policies') {
      if (this.activeTab() !== 'policies') this.activeTab.set('policies');
    } else if (path === '' || path === 'events') {
      if (this.activeTab() !== 'events') this.activeTab.set('events');
    }
  }

  viewEventDetail(eventId: string) {
    this.selectedEventId.set(eventId);
    this.activeTab.set('event-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
