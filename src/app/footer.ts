import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NoctixStore } from './noctix-store';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="w-full border-t border-zinc-900/80 bg-[#09090b]/40 backdrop-blur-md mt-16 py-12 px-6 md:px-12 text-zinc-400 font-sans relative z-10 select-none pb-28 lg:pb-12">
      <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-9 gap-8 text-left">
        
        <!-- Brand Segment -->
        <div class="md:col-span-5 space-y-4">
          <div class="flex items-center space-x-2.5">
            <div class="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-zinc-900 p-1 border border-zinc-800">
              <img src="/noctix_logo.png" alt="Noctix Logo" class="w-full h-full object-contain" referrerpolicy="no-referrer" />
            </div>
            <span class="text-lg font-display font-bold text-white tracking-tight">Noctix Ticket Exchange</span>
          </div>
          <p class="text-xs text-zinc-500 max-w-sm leading-relaxed">
            Plataforma confiable de reventa controlada y verificación criptográfica para la vida nocturna cordobesa. Protegemos al espectador garantizando pases genuinos y transparentes, libres de manipulaciones de mercado.
          </p>
          <p class="text-[10px] font-mono text-zinc-600">
            © 2026 Noctix Inc. Córdoba, Argentina. Todos los derechos reservados.
          </p>
        </div>

        <!-- Directory link Columns -->
        <div class="md:col-span-2 space-y-3">
          <span class="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest block">Explorar Portal</span>
          <ul class="text-xs space-y-2 font-normal">
            <li>
              <button (click)="store.activeTab.set('events')" class="hover:text-white transition duration-150 cursor-pointer focus:outline-none">Cartelera Activa</button>
            </li>
            <li>
              <button (click)="store.activeTab.set('resale-market')" class="hover:text-white transition duration-150 cursor-pointer focus:outline-none">Mercado Reventa</button>
            </li>
            <li>
              <button (click)="store.activeTab.set('my-tickets')" class="hover:text-white transition duration-150 cursor-pointer focus:outline-none">Mis Boletos</button>
            </li>
          </ul>
        </div>

        <!-- Column 2 -->
        <div class="md:col-span-2 space-y-3">
          <span class="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Información</span>
          <ul class="text-xs space-y-2">
            <li>
              <button (click)="store.activeTab.set('how-it-works')" class="hover:text-white transition duration-150 cursor-pointer focus:outline-none">Manual Tecnológico</button>
            </li>
            <li>
              <button (click)="store.activeTab.set('policies')" class="hover:text-white transition duration-150 cursor-pointer focus:outline-none">Reglamento Noctix</button>
            </li>
            <li>
              <a href="mailto:soporte@noctix.exchange" class="hover:text-white transition duration-150">Soporte Escrow</a>
            </li>
          </ul>
        </div>

      </div>
    </footer>
  `
})
export class Footer {
  store = inject(NoctixStore);
}
