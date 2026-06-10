/**
 * Noctix Types & Interfaces
 * Core domain specifications for the secure ticket exchange web client.
 */

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  price: number;
  stock: number;
  image: string;
  category: 'Electrónica' | 'Reggaeton' | 'En Vivo';
  badge?: string;
  artist?: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventLocation: string;
  eventDate: string;
  eventTime: string;
  eventPrice: number;
  qrHash: string;
  ownerEmail: string;
  purchaseDate: string;
  status: 'active' | 'reselling' | 'sold';
  resalePrice?: number;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warn' | 'error';
  message: string;
}
