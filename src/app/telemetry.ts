import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NoctixStore } from './noctix-store';

@Component({
  selector: 'app-telemetry',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Lateral console for live logs tracking telemetry info -->
    <div class="bg-zinc-950/70 border border-zinc-900 rounded-[2rem] p-5 space-y-4 text-left backdrop-blur-sm relative overflow-hidden">
      
      <!-- Ambient background visual coordinates -->
      <div class="absolute -top-10 -left-10 w-32 h-32 bg-indigo-600/5 rounded-full blur-2xl pointer-events-none"></div>

      <!-- Header title and debugging features -->
      <div class="flex items-center justify-between border-b border-zinc-900/80 pb-2">
        <div class="flex items-center space-x-2">
          <span class="flex h-2 w-2 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <h3 class="text-xs font-mono font-bold tracking-wider text-zinc-350 uppercase select-none">
            TELEMETRÍA SECCIÓN ESCROW EN VIVO
          </h3>
        </div>
        
        <button 
          (click)="store.clearTelemetry()"
          title="Limpiar Consola"
          class="px-2 py-1 text-[10px] font-mono hover:text-white transition bg-zinc-900/40 hover:bg-zinc-800 border border-zinc-805 rounded-lg cursor-pointer flex items-center gap-1">
          <mat-icon class="text-xs h-3 w-3 flex items-center justify-center">delete_outline</mat-icon>
          <span>Limpiar</span>
        </button>
      </div>

      <!-- Scrollable log container -->
      <div 
        class="h-40 overflow-y-auto space-y-2 font-mono text-[9px] leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800"
        tabindex="0"
        aria-label="Registro de auditoría técnica">
        
        @for (log of store.telemetryLogs(); track log.id) {
          <div class="flex items-start space-x-2 animate-fade-in py-0.5">
            <!-- Label timestamp -->
            <span class="text-zinc-650 shrink-0 select-none">[{{ log.timestamp }}]</span>
            
            <!-- Type tag -->
            @if (log.level === 'success') {
              <span class="text-emerald-450 shrink-0 font-bold">[OK]</span>
            } @else if (log.level === 'warn') {
              <span class="text-amber-450 shrink-0 font-bold">[WARN]</span>
            } @else if (log.level === 'error') {
              <span class="text-rose-450 shrink-0 font-bold">[ERR]</span>
            } @else {
              <span class="text-sky-400 shrink-0 font-bold">[INFO]</span>
            }

            <p class="text-zinc-300 break-words flex-1">{{ log.message }}</p>
          </div>
        } @empty {
          <div class="h-full flex flex-col items-center justify-center text-zinc-600 text-center py-12 space-y-1 select-none">
            <mat-icon class="text-sm">settings_input_component</mat-icon>
            <p class="font-bold text-[10px]">SINFONÍA DE RED SILENCIOSA</p>
            <p class="text-[9px]">A la espera de transacciones o rotaciones criptográficas.</p>
          </div>
        }

      </div>
    </div>
  `
})
export class Telemetry {
  store = inject(NoctixStore);
}
