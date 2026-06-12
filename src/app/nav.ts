import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NoctixStore } from './noctix-store';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Desktop Header Navigation Section -->
    <header class="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-md border-b border-zinc-900/90 py-4 px-6 md:px-12 flex items-center justify-between">
      
      <!-- Brand Logo & Slogan Title -->
      <div class="flex items-center space-x-3 cursor-pointer group" role="button" tabindex="0" (click)="store.activeTab.set('events')">
        <div class="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-zinc-950 p-1.5 border border-zinc-850 shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:scale-105 transition-transform duration-200">
          <img src="/noctix_logo.png" alt="Noctix Logo" class="w-full h-full object-contain" referrerpolicy="no-referrer" />
        </div>
        <div>
          <span class="text-2xl font-display font-bold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-tight">Noctix</span>
          <span class="text-[9px] font-mono block text-[#c084fc] tracking-widest uppercase">Compra y Venta de Tickets</span>
        </div>
      </div>

      <!-- Centered Desktop Navigation Track -->
      <nav class="hidden lg:flex items-center space-x-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-900">
        <button 
          (click)="store.activeTab.set('events')"
          [class]="store.activeTab() === 'events' ? 'bg-violet-950/50 text-violet-400 border border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.15)] font-bold' : 'text-zinc-400 hover:text-white border border-transparent'"
          class="px-4 py-1.5 text-xs rounded-lg transition duration-150 cursor-pointer flex items-center space-x-1 bg-transparent">
          <mat-icon class="text-sm">explore</mat-icon>
          <span>Explorar Eventos</span>
        </button>
        <button 
          (click)="store.activeTab.set('my-tickets')"
          [class]="store.activeTab() === 'my-tickets' ? 'bg-pink-950/50 text-pink-400 border border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.15)] font-bold' : 'text-zinc-400 hover:text-white border border-transparent'"
          class="px-4 py-1.5 text-xs rounded-lg relative transition duration-150 cursor-pointer flex items-center space-x-1 bg-transparent">
          <mat-icon class="text-sm">confirmation_number</mat-icon>
          <span>Mis Entradas</span>
          @if (store.myTicketsList().length > 0) {
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-pink-600 rounded-full text-[9px] flex items-center justify-center font-bold text-white scale-95 border border-black animate-pulse">
              {{ store.myTicketsList().length }}
            </span>
          }
        </button>
        <button 
          (click)="store.activeTab.set('resale-market')"
          [class]="store.activeTab() === 'resale-market' ? 'bg-rose-950/50 text-rose-450 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)] font-bold' : 'text-zinc-400 hover:text-white border border-transparent'"
          class="px-4 py-1.5 text-xs rounded-lg relative transition duration-150 cursor-pointer flex items-center space-x-1 bg-transparent">
          <mat-icon class="text-sm">storefront</mat-icon>
          <span>Marketplace</span>
          @if (store.resaleMarketList().length > 0) {
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 rounded-full text-[9px] flex items-center justify-center font-bold text-white scale-95 border border-black">
              {{ store.resaleMarketList().length }}
            </span>
          }
        </button>
        <button 
          (click)="store.activeTab.set('how-it-works')"
          [class]="store.activeTab() === 'how-it-works' ? 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-bold' : 'text-zinc-400 hover:text-white border border-transparent'"
          class="px-4 py-1.5 text-xs rounded-lg transition duration-150 cursor-pointer flex items-center space-x-1 bg-transparent">
          <mat-icon class="text-sm">menu_book</mat-icon>
          <span>¿Cómo Funciona?</span>
        </button>
        <button 
          (click)="store.activeTab.set('policies')"
          [class]="store.activeTab() === 'policies' ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)] font-bold' : 'text-zinc-400 hover:text-white border border-transparent'"
          class="px-4 py-1.5 text-xs rounded-lg transition duration-150 cursor-pointer flex items-center space-x-1 bg-transparent">
          <mat-icon class="text-sm">info</mat-icon>
          <span>¿Qué es Noctix?</span>
        </button>
      </nav>

      <!-- Profile & Identity Status Indicators -->
      <div class="flex items-center space-x-2 md:space-x-4 ml-auto lg:ml-8">
        
        <!-- Crear Evento CTA Button -->
        <button 
          (click)="store.isLoggedIn() ? store.activeTab.set('create-event') : store.activeTab.set('login')"
          [class]="store.activeTab() === 'create-event' ? 'bg-amber-600 font-bold border-transparent text-white shadow-[0_0_12px_rgba(245,158,11,0.25)]' : 'bg-zinc-900 border-amber-700/50 text-amber-500 hover:bg-amber-950/40 hover:border-amber-500 hover:text-amber-400'"
          class="hidden sm:flex px-4 py-2 text-xs font-bold border rounded-xl transition cursor-pointer items-center space-x-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500">
          <mat-icon class="text-sm">add_circle</mat-icon>
          <span>Crear Evento</span>
        </button>

        <button 
          (click)="store.isLoggedIn() ? store.activeTab.set('create-event') : store.activeTab.set('login')"
          [class]="store.activeTab() === 'create-event' ? 'bg-amber-600 text-white border-transparent shadow-[0_0_12px_rgba(245,158,11,0.25)]' : 'bg-zinc-900 border-amber-700/50 text-amber-500 hover:bg-amber-950/40 hover:border-amber-500'"
          class="sm:hidden p-2 text-xs font-bold border rounded-xl transition cursor-pointer flex items-center focus:outline-none focus:ring-1 focus:ring-amber-500">
          <mat-icon class="text-base">add_circle</mat-icon>
        </button>

        @if (store.isLoggedIn()) {
          <!-- User Profile Details -->
          <div class="hidden sm:flex items-center space-x-2 text-right mr-2">
            <div class="text-xs">
              <p class="font-bold text-zinc-100 font-display">&#64;{{ store.currentUserNickname() }}</p>
              <p class="text-[9px] font-mono text-zinc-400 select-all">{{ store.currentUserEmail() }}</p>
            </div>
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white font-mono shadow-md">
              {{ store.currentUserNickname().substring(0, 2).toUpperCase() }}
            </div>
          </div>

          <button 
            (click)="store.logout()"
            title="Cerrar Consola Noctix"
            class="p-2 text-xs font-bold border border-zinc-800 hover:border-red-900/50 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 rounded-xl transition cursor-pointer flex items-center ml-2">
            <mat-icon class="text-base">logout</mat-icon>
            <span class="hidden md:inline ml-1 font-mono">Salir</span>
          </button>
        } @else {
          <!-- Access session button -->
          <button 
            (click)="store.activeTab.set('login'); store.authMode.set('login')"
            class="px-4 py-2 text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 rounded-xl transition cursor-pointer flex items-center space-x-1.5 focus:outline-none focus:ring-1 focus:ring-violet-500">
            <mat-icon class="text-sm">lock</mat-icon>
            <span>Acceder</span>
          </button>
        }
      </div>
    </header>

    <!-- Mobile Navigation Rail Bottom Bar -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060608]/95 backdrop-blur-md border-t border-zinc-900/80 p-2.5 grid grid-cols-4 text-center">
      <button 
        (click)="store.activeTab.set('events')"
        [class]="'py-2 transition-all duration-200 flex flex-col items-center justify-center focus:outline-none rounded-xl ' + (store.activeTab() === 'events' ? 'text-violet-400 bg-violet-950/25' : 'text-zinc-500')">
        <mat-icon class="text-xl mb-0.5">explore</mat-icon>
        <span class="text-[11px] font-semibold tracking-tight">Eventos</span>
      </button>
      <button 
        (click)="store.activeTab.set('my-tickets')"
        [class]="'py-2 transition-all duration-200 flex flex-col items-center justify-center relative focus:outline-none rounded-xl ' + (store.activeTab() === 'my-tickets' ? 'text-pink-400 bg-pink-950/25' : 'text-zinc-500')">
        <mat-icon class="text-xl mb-0.5">confirmation_number</mat-icon>
        <span class="text-[11px] font-semibold tracking-tight">Mis Tickets</span>
        @if (store.myTicketsList().length > 0) {
          <span class="absolute top-1.5 right-3.5 w-3.5 h-3.5 bg-pink-600 rounded-full text-[8px] flex items-center justify-center font-bold text-white scale-90 border border-black animate-pulse">
            {{ store.myTicketsList().length }}
          </span>
        }
      </button>
      <button 
        (click)="store.activeTab.set('resale-market')"
        [class]="'py-2 transition-all duration-200 flex flex-col items-center justify-center relative focus:outline-none rounded-xl ' + (store.activeTab() === 'resale-market' ? 'text-rose-450 bg-rose-950/25' : 'text-zinc-500')">
        <mat-icon class="text-xl mb-0.5">storefront</mat-icon>
        <span class="text-[11px] font-semibold tracking-tight">Marketplace</span>
        @if (store.resaleMarketList().length > 0) {
          <span class="absolute top-1.5 right-2.5 w-3.5 h-3.5 bg-rose-600 rounded-full text-[8px] flex items-center justify-center font-bold text-white scale-90 border border-black">
            {{ store.resaleMarketList().length }}
          </span>
        }
      </button>
      <button 
        (click)="store.activeTab.set('how-it-works')"
        [class]="'py-2 transition-all duration-200 flex flex-col items-center justify-center focus:outline-none rounded-xl ' + (store.activeTab() === 'how-it-works' ? 'text-cyan-400 bg-cyan-950/25' : 'text-zinc-500')">
        <mat-icon class="text-xl mb-0.5">menu_book</mat-icon>
        <span class="text-[11px] font-semibold tracking-tight">Manual</span>
      </button>
    </nav>
  `
})
export class Nav {
  store = inject(NoctixStore);
}
