import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Ticket } from './types';
import { NoctixStore } from './noctix-store';

@Component({
  selector: 'app-ticket-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-zinc-950/60 rounded-3xl border border-zinc-900 overflow-hidden flex flex-col md:flex-row shadow-lg">
      
      <!-- Main Left Column: Stub Face Data -->
      <div class="p-6 flex-1 flex flex-col justify-between text-left space-y-6">
        
        <!-- Stub Header & Status Indicator -->
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-bold font-mono tracking-wider text-violet-400 select-all">{{ ticket().id }}</span>
            <span class="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
            <span class="text-[10px] text-zinc-500 font-mono">ADMITIDO CON APODO</span>
          </div>

          <!-- Active / listing badge -->
          @if (ticket().status === 'active') {
            <span class="px-2.5 py-0.5 rounded text-[9px] font-bold font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/50">
              ✓ EN BILLETERA (ACTIVO)
            </span>
          } @else if (ticket().status === 'reselling') {
            <span class="px-2.5 py-0.5 rounded text-[9px] font-bold font-mono text-amber-400 bg-amber-950/30 border border-amber-900/50">
              ⇄ PUBLICADO EN MERCADO (REVENTA)
            </span>
          } @else {
            <span class="px-2.5 py-0.5 rounded text-[9px] font-bold font-mono text-zinc-500 bg-zinc-900">
              VENDIDO
            </span>
          }
        </div>

        <!-- Event Body Details -->
        <div class="space-y-1.5">
          <h3 class="text-xl font-display font-extrabold text-white leading-tight">{{ ticket().eventTitle }}</h3>
          <p class="text-xs text-zinc-400 font-medium flex items-center col-span-full">
            <mat-icon class="text-xs mr-1 text-zinc-500">pin_drop</mat-icon>
            {{ ticket().eventLocation }}
          </p>
          <p class="text-[11px] text-[#c084fc] font-mono leading-none font-bold">
            {{ ticket().eventDate }} • {{ ticket().eventTime }}
          </p>
        </div>

        <!-- Stub Footer metrics -->
        <div class="grid grid-cols-2 gap-4 border-t border-zinc-900/80 pt-4 text-[10px] font-mono text-zinc-500">
          <div>
            <p class="uppercase">Titular Validado</p>
            <p class="font-bold text-zinc-300 font-sans">&#64;{{ store.currentUserNickname() }}</p>
          </div>
          <div>
            <p class="uppercase">Fecha de Compra</p>
            <p class="font-bold text-zinc-300">{{ ticket().purchaseDate }}</p>
          </div>
        </div>

      </div>

      <!-- Ticket Notch styling -->
      <div class="relative hidden md:flex items-center justify-center w-6">
        <div class="absolute top-0 -translate-y-1/2 w-6 h-6 rounded-full bg-black border border-transparent"></div>
        <div class="h-full border-l border-dashed border-zinc-800"></div>
        <div class="absolute bottom-0 translate-y-1/2 w-6 h-6 rounded-full bg-black border border-transparent"></div>
      </div>

      <!-- Right Column: Security Verification or Resale actions -->
      <div class="p-6 bg-[#040406]/80 flex flex-col items-center justify-center min-w-[260px] border-t md:border-t-0 md:border-l border-zinc-900/60 space-y-4">
        
        @if (ticket().status === 'active') {
          <!-- Active verification dynamic QR with counting token -->
          <div class="flex flex-col items-center space-y-2">
            
            <div class="relative cursor-pointer w-36 h-36 bg-white p-3 rounded-2xl flex items-center justify-center shadow-lg transition duration-200">
              
              <div class="w-full h-full border border-zinc-105 flex flex-col justify-between p-1 bg-zinc-50 font-mono text-zinc-950 font-bold select-none text-center">
                <div class="flex justify-between">
                  <span class="text-xs">▰▰</span>
                  <span class="text-xs">▰▰</span>
                </div>
                <div class="text-[8px] font-mono leading-tight flex flex-col justify-center items-center">
                  <mat-icon class="text-zinc-900 text-lg">qr_code_2</mat-icon>
                  <span class="text-[7px]">TOKEN ACTIVO</span>
                  <span class="text-[9px] font-semibold text-violet-700 select-all">{{ store.globalQrToken() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-xs">▰▰</span>
                  <span class="text-xs font-bold text-violet-600">★</span>
                </div>
              </div>

              <!-- Realtime seconds countdown clock -->
              <div class="absolute -top-2 -right-2 w-7 h-7 bg-black border border-zinc-800 rounded-full text-[10px] font-mono font-bold text-violet-400 flex items-center justify-center shadow">
                {{ store.qrTimeLeft() }}s
              </div>
            </div>

            <span class="text-[9px] font-mono text-zinc-400 text-center leading-normal">
              Firma Segura Auxiliar:<br>
              <span class="font-bold text-violet-400 select-all">SHA-256: {{ ticket().qrHash.substring(0, 10).toUpperCase() }}...</span>
            </span>
          </div>

          <!-- Resale submission controls -->
          <div class="w-full space-y-2 border-t border-zinc-900/80 pt-3">
            <label class="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block text-center">Publicar reventa</label>
            <div class="flex space-x-1.5">
              <div class="relative flex-1">
                <span class="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-zinc-500">$</span>
                <input 
                  #resaleInput
                  type="number" 
                  placeholder="Precio"
                  class="w-full pl-6 pr-1.5 py-1.5 bg-zinc-900 text-white placeholder:text-zinc-650 font-mono text-xs font-bold rounded-lg border border-zinc-800 outline-none focus:border-zinc-700" />
              </div>
              <button 
                (click)="postResale(resaleInput)"
                class="px-3 bg-violet-650 hover:bg-violet-600 text-white text-xs font-bold font-mono rounded-lg transition cursor-pointer">
                REVENTAR
              </button>
            </div>
            <p class="text-[8px] font-mono text-zinc-500 text-center leading-tight">
              Límite permitido: \${{ (ticket().eventPrice * 1.5).toLocaleString('es-AR') }}
            </p>
          </div>

        } @else if (ticket().status === 'reselling') {
          
          <!-- State inside resale marketplace active listing -->
          <div class="w-full text-center py-6 space-y-4">
            <div class="w-10 h-10 rounded-full bg-amber-600/10 border border-amber-500/25 flex items-center justify-center mx-auto text-amber-400">
              <mat-icon class="text-sm">storefront</mat-icon>
            </div>
            
            <div class="space-y-1">
              <p class="text-xs font-bold text-zinc-300">Publicado para Reventa</p>
              <p class="text-lg font-display font-black text-amber-400">\${{ ticket().resalePrice?.toLocaleString('es-AR') }}</p>
              <p class="text-[9px] font-mono text-zinc-500">A la espera de un comprador en el mercado.</p>
            </div>

            <button 
              (click)="store.cancelResale(ticket().id)"
              class="w-full py-2 text-xs font-bold bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg transition cursor-pointer">
              Cancelar Publicación
            </button>
          </div>

        }
      </div>

    </div>
  `
})
export class TicketCard {
  ticket = input.required<Ticket>();
  
  store = inject(NoctixStore);

  postResale(inputElement: HTMLInputElement) {
    const price = parseInt(inputElement.value, 10);
    this.store.postTicketForResale(this.ticket().id, price);
  }
}
