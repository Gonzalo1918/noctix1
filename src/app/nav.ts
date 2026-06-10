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
      <nav class="hidden lg:flex items-center space-x-1 bg-zinc-900/40 p-1 rounded-xl border border-zinc-800/60">
        <button 
          (click)="store.activeTab.set('events')"
          [class]="store.activeTab() === 'events' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'"
          class="px-4 py-1.5 text-xs rounded-lg transition duration-150 cursor-pointer flex items-center space-x-1">
          <mat-icon class="text-sm">explore</mat-icon>
          <span>Explorar Eventos</span>
        </button>
        <button 
          (click)="store.activeTab.set('my-tickets')"
          [class]="store.activeTab() === 'my-tickets' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'"
          class="px-4 py-1.5 text-xs rounded-lg relative transition duration-150 cursor-pointer flex items-center space-x-1">
          <mat-icon class="text-sm">confirmation_number</mat-icon>
          <span>Mis Entradas</span>
          @if (store.myTicketsList().length > 0) {
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-violet-600 rounded-full text-[9px] flex items-center justify-center font-bold text-white scale-95 border border-black animate-pulse">
              {{ store.myTicketsList().length }}
            </span>
          }
        </button>
        <button 
          (click)="store.activeTab.set('resale-market')"
          [class]="store.activeTab() === 'resale-market' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'"
          class="px-4 py-1.5 text-xs rounded-lg relative transition duration-150 cursor-pointer flex items-center space-x-1">
          <mat-icon class="text-sm">storefront</mat-icon>
          <span>Marketplace</span>
          @if (store.resaleMarketList().length > 0) {
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-pink-600 rounded-full text-[9px] flex items-center justify-center font-bold text-white scale-95 border border-black">
              {{ store.resaleMarketList().length }}
            </span>
          }
        </button>
        <button 
          (click)="store.activeTab.set('how-it-works')"
          [class]="store.activeTab() === 'how-it-works' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'"
          class="px-4 py-1.5 text-xs rounded-lg transition duration-150 cursor-pointer flex items-center space-x-1">
          <mat-icon class="text-sm">menu_book</mat-icon>
          <span>¿Cómo Funciona?</span>
        </button>
        <button 
          (click)="store.activeTab.set('policies')"
          [class]="store.activeTab() === 'policies' ? 'bg-zinc-800 text-white font-bold' : 'text-zinc-400 hover:text-white'"
          class="px-4 py-1.5 text-xs rounded-lg transition duration-150 cursor-pointer flex items-center space-x-1">
          <mat-icon class="text-sm">info</mat-icon>
          <span>¿Qué es Noctix?</span>
        </button>
      </nav>

      <!-- Profile & Identity Status Indicators -->
      <div class="flex items-center space-x-3">
        
        <!-- Toggle Terminal Log Terminal overlay modal -->
        <button 
          (click)="store.isAdminOpen.set(!store.isAdminOpen())"
          title="Consola de Administración"
          class="w-9 h-9 rounded-xl border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-700 bg-zinc-900/30 transition cursor-pointer">
          <mat-icon class="text-lg">terminal</mat-icon>
        </button>

        @if (store.isLoggedIn()) {
          <!-- User Profile Details -->
          <div class="hidden sm:flex items-center space-x-2 text-right">
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
            class="p-2 text-xs font-bold border border-zinc-800 hover:border-red-900/50 hover:bg-red-950/20 text-zinc-400 hover:text-red-400 rounded-xl transition cursor-pointer flex items-center">
            <mat-icon class="text-base">logout</mat-icon>
            <span class="hidden md:inline ml-1 font-mono">Salir</span>
          </button>
        } @else {
          <!-- Access session button -->
          <button 
            (click)="store.activeTab.set('login'); store.authMode.set('login')"
            class="px-4 py-2 text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 hover:bg-zinc-800 rounded-xl transition cursor-pointer flex items-center space-x-1.5">
            <mat-icon class="text-sm">lock</mat-icon>
            <span>Acceder</span>
          </button>
        }
      </div>
    </header>

    <!-- Mobile Navigation Rail Bottom Bar -->
    <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#060608]/95 backdrop-blur-md border-t border-zinc-900/80 p-2 grid grid-cols-5 text-center">
      <button 
        (click)="store.activeTab.set('events')"
        [class.text-violet-400]="store.activeTab() === 'events'"
        [class.text-zinc-500]="store.activeTab() !== 'events'"
        class="py-1 transition-colors flex flex-col items-center justify-center focus:outline-none">
        <mat-icon class="text-lg">explore</mat-icon>
        <span class="text-[9px] font-medium tracking-tight">Eventos</span>
      </button>
      <button 
        (click)="store.activeTab.set('my-tickets')"
        [class.text-violet-400]="store.activeTab() === 'my-tickets'"
        [class.text-zinc-500]="store.activeTab() !== 'my-tickets'"
        class="py-1 transition-colors flex flex-col items-center justify-center relative focus:outline-none">
        <mat-icon class="text-lg">confirmation_number</mat-icon>
        <span class="text-[9px] font-medium tracking-tight">Mis Tickets</span>
        @if (store.myTicketsList().length > 0) {
          <span class="absolute top-1 right-3 w-3.5 h-3.5 bg-violet-600 rounded-full text-[8px] flex items-center justify-center font-bold text-white scale-90 border border-black animate-pulse">
            {{ store.myTicketsList().length }}
          </span>
        }
      </button>
      <button 
        (click)="store.activeTab.set('resale-market')"
        [class.text-violet-400]="store.activeTab() === 'resale-market'"
        [class.text-zinc-500]="store.activeTab() !== 'resale-market'"
        class="py-1 transition-colors flex flex-col items-center justify-center relative focus:outline-none">
        <mat-icon class="text-lg">storefront</mat-icon>
        <span class="text-[9px] font-medium tracking-tight">Marketplace</span>
        @if (store.resaleMarketList().length > 0) {
          <span class="absolute top-1 right-2 w-3.5 h-3.5 bg-pink-600 rounded-full text-[8px] flex items-center justify-center font-bold text-white scale-90 border border-black">
            {{ store.resaleMarketList().length }}
          </span>
        }
      </button>
      <button 
        (click)="store.activeTab.set('how-it-works')"
        [class.text-violet-400]="store.activeTab() === 'how-it-works'"
        [class.text-zinc-500]="store.activeTab() !== 'how-it-works'"
        class="py-1 transition-colors flex flex-col items-center justify-center focus:outline-none">
        <mat-icon class="text-lg">menu_book</mat-icon>
        <span class="text-[9px] font-medium tracking-tight">Manual</span>
      </button>
      <button 
        (click)="store.activeTab.set('policies')"
        [class.text-violet-400]="store.activeTab() === 'policies'"
        [class.text-zinc-500]="store.activeTab() !== 'policies'"
        class="py-1 transition-colors flex flex-col items-center justify-center focus:outline-none">
        <mat-icon class="text-lg">info</mat-icon>
        <span class="text-[9px] font-medium tracking-tight">Reglamento</span>
      </button>
    </nav>
  `
})
export class Nav {
  store = inject(NoctixStore);
}
