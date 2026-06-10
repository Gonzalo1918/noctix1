import { ChangeDetectionStrategy, Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Ticket } from './types';
import { NoctixStore } from './noctix-store';

@Component({
  selector: 'app-market-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-[#0b0b0e] border border-zinc-900 rounded-3xl overflow-hidden p-6 text-left flex flex-col justify-between space-y-4 hover:border-zinc-800 transition">
      
      <div class="flex justify-between items-start">
        <div class="space-y-1">
          <span class="px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider bg-violet-950/50 text-[#c084fc] border border-violet-900/30">
            REVENTA AUDITADA
          </span>
          <h3 class="text-base font-display font-bold text-white leading-tight mt-1">{{ ticket().eventTitle }}</h3>
          <p class="text-[11px] text-zinc-400 flex items-center">
            <mat-icon class="text-xs mr-1 text-zinc-500">pin_drop</mat-icon>
            {{ ticket().eventLocation }}
          </p>
        </div>

        <!-- Prices metadata block -->
        <div class="text-right font-mono">
          <span class="text-[9px] text-zinc-500 block uppercase">Precio Reventa</span>
          <span class="text-xl font-display font-black text-rose-400">\${{ ticket().resalePrice?.toLocaleString('es-AR') }}</span>
          <span class="text-[8px] text-zinc-500 block">Original: \${{ ticket().eventPrice.toLocaleString('es-AR') }}</span>
        </div>
      </div>

      <!-- Seller metadata metrics -->
      <div class="grid grid-cols-2 gap-4 border-t border-b border-zinc-900/80 py-3 text-[10px] font-mono text-zinc-500">
        <div>
          <p class="uppercase">Vendido por</p>
          <p class="font-bold text-zinc-300">&#64;{{ ticket().ownerEmail.split('&#64;')[0] }}</p>
        </div>
        <div>
          <p class="uppercase">Original original</p>
          <p class="font-bold text-zinc-350">ID: {{ ticket().id }}</p>
        </div>
      </div>

      <!-- Action purchase button -->
      <button 
        (click)="store.buyTicketFromResale(ticket())"
        class="w-full py-2.5 text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-md transition cursor-pointer flex items-center justify-center space-x-1 focus:outline-none">
        <mat-icon class="text-sm">add_shopping_cart</mat-icon>
        <span>Adquirir Ticket</span>
      </button>

    </div>
  `
})
export class MarketCard {
  ticket = input.required<Ticket>();
  
  store = inject(NoctixStore);
}
