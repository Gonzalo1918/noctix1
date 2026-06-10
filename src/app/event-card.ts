import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Event } from './types';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article 
      (click)="detail.emit(event().id)"
      class="bg-zinc-950/40 border border-zinc-900 rounded-3xl overflow-hidden group hover:border-zinc-800 hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-violet-600/5 transition-all duration-300 flex flex-col cursor-pointer">
      
      <!-- Graphic Banner & Badge tags -->
      <div class="relative h-48 md:h-52 overflow-hidden bg-zinc-900 z-10">
        <img 
          [src]="event().image" 
          [alt]="event().title" 
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          loading="lazy" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/10 to-transparent"></div>
        
        <!-- Category Tag -->
        <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-semibold text-zinc-100 border border-zinc-800">
          {{ event().category }}
        </span>

        <!-- Dynamic Promo Badge -->
        @if (event().badge) {
          <span class="absolute top-4 right-4 px-2.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider uppercase bg-pink-600 text-white shadow-lg animate-pulse">
            {{ event().badge }}
          </span>
        }

        <!-- Face Price -->
        <div class="absolute bottom-4 left-4 text-left">
          <span class="text-xs text-zinc-400 font-mono block">Entrada General</span>
          <span class="text-xl font-display font-black text-white">\${{ event().price.toLocaleString('es-AR') }} ARS</span>
        </div>
      </div>

      <!-- Content text and metadata -->
      <div class="p-6 space-y-4 flex-1 flex flex-col justify-between text-left">
        <div class="space-y-2">
          <h3 class="text-lg font-display font-bold text-white group-hover:text-violet-400 transition-colors duration-150 leading-tight">
            {{ event().title }}
          </h3>
          
          @if (event().artist) {
            <div class="flex items-center space-x-1 py-0.5 px-2 bg-violet-950/40 border border-violet-900/40 text-[10px] font-mono font-semibold text-violet-300 w-fit rounded-lg shadow-sm">
              <mat-icon class="text-xs">music_note</mat-icon>
              <span>Lineup: {{ event().artist }}</span>
            </div>
          }
          
          <p class="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-normal">
            {{ event().description }}
          </p>
        </div>

        <div class="space-y-3 pt-2">
          <!-- Calendar details -->
          <div class="space-y-1 text-[11px] text-zinc-400 font-medium font-mono">
            <div class="flex items-center space-x-1.5">
              <mat-icon class="text-sm text-zinc-500">pin_drop</mat-icon>
              <span class="truncate">{{ event().location }}</span>
            </div>
            <div class="flex items-center space-x-1.5">
              <mat-icon class="text-sm text-zinc-500">calendar_today</mat-icon>
              <span>{{ event().date }} • {{ event().time }}</span>
            </div>
          </div>

          <!-- Live Stock Meter -->
          <div class="space-y-1">
            <div class="flex justify-between items-center text-[9px] font-mono">
              <span class="text-zinc-500 uppercase">Capacidad Disponible</span>
              <span [class]="event().stock < 15 ? 'text-red-400 font-bold' : 'text-zinc-400'">
                {{ event().stock }} de 200 entradas
              </span>
            </div>
            <div class="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                [style.width.%]="(event().stock / 200) * 100"
                [class]="event().stock < 15 ? 'bg-red-500' : 'bg-gradient-to-r from-violet-600 to-pink-500'"
                class="h-full rounded-full transition-all duration-300">
              </div>
            </div>
          </div>
        </div>

        <!-- Buy Official Entry -->
        @if (event().stock > 0) {
          <button 
            (click)="$event.stopPropagation(); buy.emit(event())"
            class="w-full py-2.5 text-xs font-bold bg-white text-zinc-950 hover:bg-zinc-200 rounded-xl transition duration-150 cursor-pointer flex items-center justify-center space-x-1 mt-4 shadow-sm z-20 focus:outline-none">
            <mat-icon class="text-sm">shopping_bag</mat-icon>
            <span>Comprar Oficial</span>
          </button>
        } @else {
          <button 
            disabled
            (click)="$event.stopPropagation()"
            class="w-full py-2.5 text-xs font-bold bg-zinc-900 text-zinc-600 rounded-xl cursor-not-allowed flex items-center justify-center space-x-1 mt-4 z-20">
            <mat-icon class="text-sm">block</mat-icon>
            <span>Agotado (Busca Reventas)</span>
          </button>
        }

      </div>
    </article>
  `
})
export class EventCard {
  event = input.required<Event>();
  
  detail = output<string>();
  buy = output<Event>();
}
